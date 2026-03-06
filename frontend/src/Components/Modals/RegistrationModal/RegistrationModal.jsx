import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../Hooks/useAuth';
import useInterests from '../../../Hooks/useInterests';
import './RegistrationModal.css';

// ── Validators ──
const validate = ({ email, password, name, phoneNumber, dateOfBirth, gender, city }) => {
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
    const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
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

export default function RegistrationModal({ isOpen, onClose, onSwitchToSignIn }) {
  const { interests, loading: interestsLoading } = useInterests();
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
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  React.useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleInterest = (interest) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const removeInterest = (interest) => {
    setSelectedInterests(prev => prev.filter(i => i !== interest));
  };

  const filteredInterests = interests.filter(i =>
    i.name.toLowerCase().includes(interestSearch.toLowerCase())
  );

  // Clear individual field error on change
  const clearError = (field) => {
    if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const validationErrors = validate({ email, password, name, phoneNumber, dateOfBirth, gender, city });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    try {
      await register({
        name, phoneNumber, gender, dateOfBirth,
        city, email, password,
        interests: selectedInterests,
      });
      onClose();
      navigate('/home');
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="rmodal__overlay" onClick={onClose}>
      <div className="rmodal__card" onClick={(e) => e.stopPropagation()}>

        <button className="rmodal__close" onClick={onClose} aria-label="Close">✕</button>
        <h2 className="rmodal__title">Create account</h2>
        <p className="rmodal__subtitle">Join Findr today</p>

        <form onSubmit={handleSubmit} className="rmodal__form" noValidate>

          {/* ── Row 1: Email + Password ── */}
          <div className="rmodal__grid">
            <div className="rmodal__field">
              <label htmlFor="reg-email">Email <span className="rmodal__required">*</span></label>
              <input
                id="reg-email" type="email" autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                placeholder="you@example.com"
                className={errors.email ? 'input--error' : ''}
              />
              {errors.email && <span className="rmodal__field-error">{errors.email}</span>}
            </div>
            <div className="rmodal__field">
              <label htmlFor="reg-password">Password <span className="rmodal__required">*</span></label>
              <input
                id="reg-password" type="password" autoComplete="new-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                placeholder="••••••••"
                className={errors.password ? 'input--error' : ''}
              />
              {errors.password && <span className="rmodal__field-error">{errors.password}</span>}
            </div>
          </div>

          {/* ── Row 2: Name + Phone ── */}
          <div className="rmodal__grid">
            <div className="rmodal__field">
              <label htmlFor="reg-name">Full Name <span className="rmodal__required">*</span></label>
              <input
                id="reg-name" type="text" autoComplete="name"
                value={name}
                onChange={(e) => { setName(e.target.value); clearError('name'); }}
                placeholder="Your name"
                className={errors.name ? 'input--error' : ''}
              />
              {errors.name && <span className="rmodal__field-error">{errors.name}</span>}
            </div>
            <div className="rmodal__field">
              <label htmlFor="reg-phone">Phone Number <span className="rmodal__required">*</span></label>
              <input
                id="reg-phone" type="tel" autoComplete="tel"
                value={phoneNumber}
                onChange={(e) => { setPhoneNumber(e.target.value); clearError('phoneNumber'); }}
                placeholder="+1 2345678900"
                className={errors.phoneNumber ? 'input--error' : ''}
              />
              {errors.phoneNumber && <span className="rmodal__field-error">{errors.phoneNumber}</span>}
            </div>
          </div>

          {/* ── Row 3: DOB + Gender ── */}
          <div className="rmodal__grid">
            <div className="rmodal__field">
              <label htmlFor="reg-dob">Date of Birth <span className="rmodal__required">*</span></label>
              <input
                id="reg-dob" type="date"
                value={dateOfBirth}
                onChange={(e) => { setDateOfBirth(e.target.value); clearError('dateOfBirth'); }}
                className={errors.dateOfBirth ? 'input--error' : ''}
              />
              {errors.dateOfBirth && <span className="rmodal__field-error">{errors.dateOfBirth}</span>}
            </div>
            <div className="rmodal__field">
              <label htmlFor="reg-gender">Gender <span className="rmodal__required">*</span></label>
              <div className="rmodal__select-wrapper">
                <select
                  id="reg-gender" value={gender}
                  onChange={(e) => { setGender(e.target.value); clearError('gender'); }}
                  className={errors.gender ? 'input--error' : ''}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                  <option value="Other">Other</option>
                </select>
                <span className="rmodal__chevron">▼</span>
              </div>
              {errors.gender && <span className="rmodal__field-error">{errors.gender}</span>}
            </div>
          </div>

          {/* ── Row 4: City ── */}
          <div className="rmodal__field">
            <label htmlFor="reg-city">City <span className="rmodal__required">*</span></label>
            <input
              id="reg-city" type="text"
              value={city}
              onChange={(e) => { setCity(e.target.value); clearError('city'); }}
              placeholder="Your city"
              className={errors.city ? 'input--error' : ''}
            />
            {errors.city && <span className="rmodal__field-error">{errors.city}</span>}
          </div>

          {/* ── Interests multiselect ── */}
          <div className="rmodal__field">
            <label>Interests</label>
            <div className="rmodal__multiselect">
              <div
                className="rmodal__multiselect-trigger"
                onClick={() => !interestsLoading && setDropdownOpen(o => !o)}
                style={{
                  opacity: interestsLoading ? 0.5 : 1,
                  cursor: interestsLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {interestsLoading ? (
                  <span className="rmodal__placeholder">Loading interests...</span>
                ) : selectedInterests.length === 0 ? (
                  <span className="rmodal__placeholder">Select interests...</span>
                ) : (
                  <div className="rmodal__tags">
                    {selectedInterests.map(i => (
                      <span key={i} className="rmodal__tag">
                        {i}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeInterest(i); }}
                        >✕</button>
                      </span>
                    ))}
                  </div>
                )}
                <span className="rmodal__chevron">▼</span>
              </div>

              {dropdownOpen && !interestsLoading && (
                <div className="rmodal__dropdown">
                  <input
                    className="rmodal__dropdown-search"
                    type="text"
                    placeholder="Search..."
                    value={interestSearch}
                    onChange={(e) => setInterestSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <ul>
                    {filteredInterests.map(interest => (
                      <li
                        key={interest._id}
                        className={selectedInterests.includes(interest.name) ? 'selected' : ''}
                        onClick={() => toggleInterest(interest.name)}
                        >
                        <span className="rmodal__check">{selectedInterests.includes(interest.name) ? '✓' : ''}</span>
                        {interest.name}
                        </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {submitError && <p className="rmodal__error">{submitError}</p>}

          <button type="submit" className="rmodal__submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="rmodal__footer">
          Already have an account?{' '}
          <button type="button" className="rmodal__switch" onClick={onSwitchToSignIn}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}