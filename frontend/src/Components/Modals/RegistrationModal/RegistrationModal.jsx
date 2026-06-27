import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../Hooks/UseAuth.ts';
import useInterests from '../../../Hooks/UseInterests';

// ── Validators ──
const validate = ({
  email,
  password,
  name,
  phoneNumber,
  dateOfBirth,
  gender,
  city,
}) => {
  const errors = {};

  if (!email) errors.email = 'Email is required.';

  // Password: min 6 chars, 1 number, 1 uppercase, 1 special char
  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 6) {
    errors.password = 'Must be at least 6 characters.';
  } else if (!/[0-9]/.test(password)) {
    errors.password = 'Must include at least one number.';
  } else if (!/[A-Z]/.test(password)) {
    errors.password = 'Must include at least one uppercase letter.';
  } else if (!/[!@#$%^&*()_+\-\\[\]{};':"|,.<>/?]/.test(password)) {
    errors.password = 'Must include at least one special character.';
  }

  // Full name: letters and spaces only
  if (!name) {
    errors.name = 'Full name is required.';
  } else if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
    errors.name = 'Name must contain letters only.';
  }

  // Phone: country code + 10 digits e.g. +11234567890
  if (!phoneNumber) {
    errors.phoneNumber = 'Phone number is required.';
  } else if (!/^\+\d{1,4}\d{10}$/.test(phoneNumber.replace(/[\s\-()]/g, ''))) {
    errors.phoneNumber = 'Use format: +[country code] followed by 10 digits.';
  }

  // DOB: must be at least 18 years ago, not in the future
  if (!dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required.';
  } else {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    const eighteenYearsAgo = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );
    if (dob > today) {
      errors.dateOfBirth = 'Date of birth cannot be in the future.';
    } else if (dob > eighteenYearsAgo) {
      errors.dateOfBirth = 'You must be at least 18 years old.';
    }
  }

  if (!gender) errors.gender = 'Please select a gender.';
  if (!city) errors.city = 'City is required.';

  return errors;
};

// Best-effort city -> coordinates lookup (OpenStreetMap Nominatim). Returns
// { latitude, longitude } or null; never throws so it can't block signup.
async function geocodeCity(city) {
  try {
    const params = new URLSearchParams({
      q: city,
      format: 'json',
      limit: '1',
    });
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data[0]?.lat && data[0]?.lon) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
  } catch {
    // ignore — signup proceeds without a location
  }
  return null;
}

// Shared field classes
const fieldCls =
  'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[8px] py-[0.7rem] px-[0.9rem] text-[0.9rem] text-white outline-none w-full box-border transition-[border-color,box-shadow] duration-200 placeholder:text-[rgba(255,255,255,0.2)] focus:border-[#7c3aed] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.2)]';
const fieldErrCls = '!border-[#f87171] !shadow-[0_0_0_3px_rgba(248,113,113,0.15)]';

export default function RegistrationModal({
  isOpen,
  onClose,
  onSwitchToSignIn,
}) {
  const {
    interests,
    loading: interestsLoading,
    searchInterests,
    createInterest,
  } = useInterests();
  const [searchResults, setSearchResults] = useState([]);
  const [creatingInterest, setCreatingInterest] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [city, setCity] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [interestSearch, setInterestSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const multiselectRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        if (dropdownOpen) setDropdownOpen(false);
        else onClose();
      }
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose, dropdownOpen]);

  React.useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e) => {
      if (
        multiselectRef.current &&
        !multiselectRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  React.useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleDropdown = useCallback(() => {
    if (interestsLoading) return;
    if (!dropdownOpen && multiselectRef.current) {
      const rect = multiselectRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
    setDropdownOpen((o) => !o);
  }, [interestsLoading, dropdownOpen]);

  // Debounced server-side typeahead so users can find interests beyond the
  // initially loaded list. (Hook must stay above the early return below.)
  React.useEffect(() => {
    const q = interestSearch.trim();
    if (!q) {
      // Keep the same array reference when already empty so this effect can't
      // trigger a re-render loop (searchInterests identity may change).
      setSearchResults((prev) => (prev.length ? [] : prev));
      return;
    }
    const t = setTimeout(async () => {
      const results = await searchInterests(q);
      setSearchResults(results);
    }, 250);
    return () => clearTimeout(t);
  }, [interestSearch, searchInterests]);

  if (!isOpen) return null;

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const removeInterest = (interest) => {
    setSelectedInterests((prev) => prev.filter((i) => i !== interest));
  };

  // Show search results when searching, else the loaded base list.
  const displayedInterests = interestSearch.trim() ? searchResults : interests;
  const trimmedSearch = interestSearch.trim();
  const hasExactMatch = displayedInterests.some(
    (i) => i.name.toLowerCase() === trimmedSearch.toLowerCase()
  );

  // Create (or dedupe to) a user-suggested interest and select it.
  const handleCreateInterest = async () => {
    const name = trimmedSearch;
    if (!name || creatingInterest) return;
    setCreatingInterest(true);
    try {
      const created = await createInterest(name);
      const interestName = created?.name || name;
      setSelectedInterests((prev) =>
        prev.includes(interestName) ? prev : [...prev, interestName]
      );
      setInterestSearch('');
      setSearchResults([]);
    } catch {
      // Silently ignore — the user can retry; not a blocker for signup.
    } finally {
      setCreatingInterest(false);
    }
  };

  // Clear individual field error on change
  const clearError = (field) => {
    if (errors[field])
      setErrors((prev) => {
        const e = { ...prev };
        delete e[field];
        return e;
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const validationErrors = validate({
      email,
      password,
      name,
      phoneNumber,
      dateOfBirth,
      gender,
      city,
    });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    try {
      // Geocode the city so the new user gets a location point for the
      // location-bounded feed. Non-blocking: sign up proceeds even if it fails.
      const location = await geocodeCity(city);
      await register({
        name,
        phoneNumber,
        gender,
        dateOfBirth,
        city,
        email,
        password,
        interests: selectedInterests,
        ...(location ? { location } : {}),
      });
      onClose();
      navigate('/home');
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong');
    }
  };

  return (
    <div
      data-testid="rmodal-overlay"
      className="fixed inset-0 z-[2000] bg-[rgba(0,0,0,0.65)] backdrop-blur-[4px] flex items-center justify-center p-4 [animation:roverlay-in_0.2s_ease] max-[560px]:items-end max-[560px]:p-0"
      onClick={onClose}>
      <div
        className="relative bg-[#111111] border border-[rgba(255,255,255,0.1)] rounded-[16px] py-10 px-9 w-full max-w-[560px] max-h-[90vh] overflow-y-auto shadow-[0_24px_60px_rgba(0,0,0,0.5)] [animation:rcard-in_0.25s_cubic-bezier(0.16,1,0.3,1)] [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent] max-[560px]:max-w-full max-[560px]:rounded-t-[20px] max-[560px]:rounded-b-none max-[560px]:py-6 max-[560px]:px-5 max-[560px]:pb-8 max-[560px]:max-h-[92dvh] max-[560px]:[animation:rcard-slide-up_0.3s_cubic-bezier(0.16,1,0.3,1)]"
        onClick={(e) => e.stopPropagation()}>
        <button
          className="absolute top-4 right-4 bg-[rgba(255,255,255,0.06)] border-none text-[rgba(255,255,255,0.5)] w-[30px] h-[30px] min-w-[30px] p-0 rounded-full text-[0.75rem] cursor-pointer flex items-center justify-center flex-shrink-0 transition-[background,color] duration-200 hover:bg-[rgba(255,255,255,0.12)] hover:text-white"
          onClick={onClose}
          aria-label="Close">
          ✕
        </button>
        <h2 className="m-0 mb-1 text-[1.5rem] font-bold text-white font-[Consolas,monospace]">
          Create account
        </h2>
        <p className="m-0 mb-7 text-[0.875rem] text-[rgba(255,255,255,0.4)]">
          Join Findr today
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {/* ── Row 1: Email + Password ── */}
          <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
            <div className="flex flex-col gap-[0.4rem]">
              <label
                htmlFor="reg-email"
                className="text-[0.8rem] font-semibold text-[rgba(255,255,255,0.6)] tracking-[0.05em] uppercase">
                Email <span className="text-[#f87171]">*</span>
              </label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError('email');
                }}
                placeholder="you@example.com"
                className={`${fieldCls} ${errors.email ? fieldErrCls : ''}`}
              />
              {errors.email && (
                <span className="text-[0.75rem] text-[#f87171] mt-[0.15rem]">
                  {errors.email}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-[0.4rem]">
              <label
                htmlFor="reg-password"
                className="text-[0.8rem] font-semibold text-[rgba(255,255,255,0.6)] tracking-[0.05em] uppercase">
                Password <span className="text-[#f87171]">*</span>
              </label>
              <input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError('password');
                }}
                placeholder="••••••••"
                className={`${fieldCls} ${errors.password ? fieldErrCls : ''}`}
              />
              {errors.password && (
                <span className="text-[0.75rem] text-[#f87171] mt-[0.15rem]">
                  {errors.password}
                </span>
              )}
            </div>
          </div>

          {/* ── Row 2: Name + Phone ── */}
          <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
            <div className="flex flex-col gap-[0.4rem]">
              <label
                htmlFor="reg-name"
                className="text-[0.8rem] font-semibold text-[rgba(255,255,255,0.6)] tracking-[0.05em] uppercase">
                Full Name <span className="text-[#f87171]">*</span>
              </label>
              <input
                id="reg-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearError('name');
                }}
                placeholder="Your name"
                className={`${fieldCls} ${errors.name ? fieldErrCls : ''}`}
              />
              {errors.name && (
                <span className="text-[0.75rem] text-[#f87171] mt-[0.15rem]">
                  {errors.name}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-[0.4rem]">
              <label
                htmlFor="reg-phone"
                className="text-[0.8rem] font-semibold text-[rgba(255,255,255,0.6)] tracking-[0.05em] uppercase">
                Phone Number <span className="text-[#f87171]">*</span>
              </label>
              <input
                id="reg-phone"
                type="tel"
                autoComplete="tel"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  clearError('phoneNumber');
                }}
                placeholder="+1 2345678900"
                className={`${fieldCls} ${errors.phoneNumber ? fieldErrCls : ''}`}
              />
              {errors.phoneNumber && (
                <span className="text-[0.75rem] text-[#f87171] mt-[0.15rem]">
                  {errors.phoneNumber}
                </span>
              )}
            </div>
          </div>

          {/* ── Row 3: DOB + Gender ── */}
          <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
            <div className="flex flex-col gap-[0.4rem]">
              <label
                htmlFor="reg-dob"
                className="text-[0.8rem] font-semibold text-[rgba(255,255,255,0.6)] tracking-[0.05em] uppercase">
                Date of Birth <span className="text-[#f87171]">*</span>
              </label>
              <input
                id="reg-dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => {
                  setDateOfBirth(e.target.value);
                  clearError('dateOfBirth');
                }}
                className={`${fieldCls} [color-scheme:dark] ${errors.dateOfBirth ? fieldErrCls : ''}`}
              />
              {errors.dateOfBirth && (
                <span className="text-[0.75rem] text-[#f87171] mt-[0.15rem]">
                  {errors.dateOfBirth}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-[0.4rem]">
              <label
                htmlFor="reg-gender"
                className="text-[0.8rem] font-semibold text-[rgba(255,255,255,0.6)] tracking-[0.05em] uppercase">
                Gender <span className="text-[#f87171]">*</span>
              </label>
              <div className="relative">
                <select
                  id="reg-gender"
                  value={gender}
                  onChange={(e) => {
                    setGender(e.target.value);
                    clearError('gender');
                  }}
                  className={`${fieldCls} appearance-none pr-8 cursor-pointer [&_option]:bg-[#1a1a1a] [&_option]:text-white ${errors.gender ? fieldErrCls : ''}`}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                  <option value="Other">Other</option>
                </select>
                <span className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[0.65rem] text-[rgba(255,255,255,0.4)] pointer-events-none">
                  ▼
                </span>
              </div>
              {errors.gender && (
                <span className="text-[0.75rem] text-[#f87171] mt-[0.15rem]">
                  {errors.gender}
                </span>
              )}
            </div>
          </div>

          {/* ── Row 4: City ── */}
          <div className="flex flex-col gap-[0.4rem]">
            <label
              htmlFor="reg-city"
              className="text-[0.8rem] font-semibold text-[rgba(255,255,255,0.6)] tracking-[0.05em] uppercase">
              City <span className="text-[#f87171]">*</span>
            </label>
            <input
              id="reg-city"
              type="text"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                clearError('city');
              }}
              placeholder="Your city"
              className={`${fieldCls} ${errors.city ? fieldErrCls : ''}`}
            />
            {errors.city && (
              <span className="text-[0.75rem] text-[#f87171] mt-[0.15rem]">
                {errors.city}
              </span>
            )}
          </div>

          {/* ── Interests multiselect ── */}
          <div className="flex flex-col gap-[0.4rem]">
            <label className="text-[0.8rem] font-semibold text-[rgba(255,255,255,0.6)] tracking-[0.05em] uppercase">
              Interests
            </label>
            <div className="relative" ref={multiselectRef}>
              <button
                type="button"
                className="flex items-center justify-between w-full text-left font-[inherit] text-[inherit] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[8px] py-[0.7rem] px-[0.9rem] cursor-pointer transition-[border-color] duration-200 hover:border-[rgba(255,255,255,0.25)]"
                onClick={toggleDropdown}
                aria-expanded={dropdownOpen}
                aria-haspopup="listbox"
                disabled={interestsLoading}
                style={{
                  opacity: interestsLoading ? 0.5 : 1,
                  cursor: interestsLoading ? 'not-allowed' : 'pointer',
                }}>
                {interestsLoading ? (
                  <span className="text-[rgba(255,255,255,0.2)] text-[0.9rem]">
                    Loading interests...
                  </span>
                ) : selectedInterests.length === 0 ? (
                  <span className="text-[rgba(255,255,255,0.2)] text-[0.9rem]">
                    Select interests...
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-[0.4rem] flex-1">
                    {selectedInterests.map((i) => (
                      <span
                        key={i}
                        className="flex items-center gap-[0.3rem] bg-[rgba(124,58,237,0.25)] border border-[rgba(124,58,237,0.5)] text-[#a78bfa] text-[0.78rem] font-semibold py-[0.2rem] px-[0.5rem] rounded-[20px]">
                        {i}
                        <button
                          type="button"
                          className="bg-none border-none text-[#a78bfa] cursor-pointer text-[0.65rem] p-0 leading-none opacity-70 transition-opacity duration-150 hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeInterest(i);
                          }}>
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <span className="text-[rgba(255,255,255,0.4)] text-[0.65rem] ml-2 flex-shrink-0">
                  ▼
                </span>
              </button>

              {dropdownOpen && !interestsLoading && (
                <div
                  className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.12)] rounded-[10px] z-[9999] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
                  style={dropdownStyle}>
                  <input
                    className="w-full bg-[rgba(255,255,255,0.05)] border-none border-b border-b-[rgba(255,255,255,0.08)] rounded-none py-[0.7rem] px-[0.9rem] text-[0.85rem] text-white box-border outline-none"
                    type="text"
                    placeholder="Search..."
                    value={interestSearch}
                    onChange={(e) => setInterestSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <ul className="list-none m-0 py-[0.4rem] px-0 max-h-[180px] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]">
                    {displayedInterests.map((interest) => (
                      <li
                        key={interest._id || interest.name}
                        className={`flex items-center gap-[0.6rem] py-[0.55rem] px-[0.9rem] text-[0.875rem] cursor-pointer transition-[background,color] duration-150 hover:bg-[rgba(255,255,255,0.06)] hover:text-white ${
                          selectedInterests.includes(interest.name)
                            ? 'text-[#a78bfa]'
                            : 'text-[rgba(255,255,255,0.7)]'
                        }`}
                        onClick={() => toggleInterest(interest.name)}>
                        <span className="w-[14px] text-[0.75rem] text-[#7c3aed] font-bold">
                          {selectedInterests.includes(interest.name) ? '✓' : ''}
                        </span>
                        {interest.name}
                      </li>
                    ))}
                    {trimmedSearch && !hasExactMatch && (
                      <li
                        className="flex items-center gap-[0.6rem] py-[0.55rem] px-[0.9rem] text-[0.875rem] cursor-pointer text-[#a78bfa] font-semibold transition-[background,color] duration-150 hover:bg-[rgba(255,255,255,0.06)]"
                        onClick={handleCreateInterest}>
                        <span className="w-[14px] text-[0.75rem] text-[#7c3aed] font-bold">
                          ＋
                        </span>
                        {creatingInterest
                          ? `Adding "${trimmedSearch}"…`
                          : `Add "${trimmedSearch}"`}
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {submitError && (
            <p className="m-0 text-[0.85rem] text-[#f87171]">{submitError}</p>
          )}

          <button
            type="submit"
            className="mt-2 bg-[#7c3aed] border-none text-white py-3 px-0 rounded-[8px] text-[0.95rem] font-bold cursor-pointer transition-[background,transform,box-shadow] duration-200 tracking-[0.03em] hover:not-disabled:bg-[#6d28d9] hover:not-disabled:-translate-y-[1px] hover:not-disabled:shadow-[0_6px_20px_rgba(124,58,237,0.35)] disabled:opacity-50 disabled:cursor-not-allowed max-[560px]:py-[0.85rem] max-[560px]:text-[1rem]"
            disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-5 text-center text-[0.85rem] text-[rgba(255,255,255,0.35)]">
          Already have an account?{' '}
          <button
            type="button"
            className="bg-none border-none text-[#a78bfa] font-semibold text-[0.85rem] cursor-pointer p-0 no-underline hover:underline"
            onClick={onSwitchToSignIn}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
