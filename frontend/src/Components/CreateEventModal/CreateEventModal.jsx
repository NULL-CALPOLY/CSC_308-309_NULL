import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import AddressSearchBar from '../AddressSearchBar/AddressSearchBar';
import { useAuth } from '../../Hooks/UseAuth.ts';
import useInterests from '../../Hooks/UseInterests.jsx';

const MAX_TITLE_LENGTH = 75;

// Shared field classes matching the modal dark theme
const fieldCls =
  'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.09)] rounded-[10px] py-[0.7rem] px-[0.9rem] text-[0.875rem] text-[#eeeef5] outline-none w-full box-border min-h-[44px] font-[inherit] transition-[background,border-color,box-shadow] duration-200 placeholder:text-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.18)] focus:border-[#7c3aed] focus:bg-[rgba(255,255,255,0.07)] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.22)]';

const labelCls =
  'flex justify-between items-center text-[0.7rem] font-semibold text-[rgba(167,139,250,0.65)] tracking-[0.08em] uppercase';

export default function CreateEventModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const { interests } = useInterests();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    roomDetail: '',
    interests: [],
    location: '',
    startDate: '',
    startTimeOnly: '09:00',
    endDate: '',
    endTimeOnly: '10:00',
  });

  const [selectedOptions, setSelectedOptions] = useState([]);
  const [interestSearch, setInterestSearch] = useState('');
  const [interestDropOpen, setInterestDropOpen] = useState(false);
  const interestRef = useRef(null);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
  const [errorMessage, setErrorMessage] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Close interest dropdown on outside click (portal-aware)
  useEffect(() => {
    if (!interestDropOpen) return;
    const handle = (e) => {
      if (
        interestRef.current &&
        !interestRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setInterestDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [interestDropOpen]);

  // Close on scroll or resize so portal stays in sync
  useEffect(() => {
    if (!interestDropOpen) return;
    const handleScroll = (e) => {
      // Keep dropdown open when scrolling inside its own list.
      if (dropdownRef.current && dropdownRef.current.contains(e.target)) return;
      setInterestDropOpen(false);
    };
    const handleResize = () => setInterestDropOpen(false);

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [interestDropOpen]);

  // Lock scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const interestOptions = interests.map((i) => ({
    label: i.name,
    value: i.name,
  }));

  const now = new Date();

  const getStartISO = () =>
    formData.startDate && formData.startTimeOnly
      ? `${formData.startDate}T${formData.startTimeOnly}`
      : '';

  const getEndISO = () =>
    formData.endDate && formData.endTimeOnly
      ? `${formData.endDate}T${formData.endTimeOnly}`
      : '';

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Event title is required.';
    } else if (formData.name.length > MAX_TITLE_LENGTH) {
      newErrors.name = `Title cannot exceed ${MAX_TITLE_LENGTH} characters.`;
    }

    if (!formData.description.trim())
      newErrors.description = 'Description is required.';

    if (!formData.address) newErrors.address = 'Location is required.';

    const startISO = getStartISO();
    if (!startISO) {
      newErrors.startTime = 'Start date and time are required.';
    } else if (new Date(startISO) <= now) {
      newErrors.startTime = 'Start time must be in the future.';
    }

    const endISO = getEndISO();
    if (!endISO) {
      newErrors.endTime = 'End date and time are required.';
    } else if (startISO && new Date(endISO) <= new Date(startISO)) {
      newErrors.endTime = 'End time must be after start time.';
    }

    if (selectedOptions.length === 0)
      newErrors.interests = 'Select at least one interest.';

    setErrorMessage(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', address: '', roomDetail: '', interests: [], location: '', startDate: '', startTimeOnly: '09:00', endDate: '', endTimeOnly: '10:00' });
    setSelectedOptions([]);
    setInterestSearch('');
    setErrorMessage({});
    setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        mapComponent: formData.address,
        address: formData.roomDetail
          ? `${formData.address}, ${formData.roomDetail}`
          : formData.address,
        host: user.id,
        attendees: [],
        blockedUsers: [],
        comment: [],
        location: formData.location,
        interests: selectedOptions.map((o) => o.value),
        time: {
          start: getStartISO(),
          end: getEndISO(),
        },
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/events/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.message || 'Failed to create event');
      resetForm();
      onSuccess();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal fixed inset-0 bg-[rgba(0,0,0,0.78)] backdrop-blur-[10px] z-[4000] flex justify-center items-center [animation:backdrop-in_0.2s_ease] max-[520px]:items-end max-[520px]:p-0"
      onClick={onClose}>
      <div
        className="relative flex flex-col bg-[#0c0c10] border border-[rgba(124,58,237,0.22)] border-t-[rgba(167,139,250,0.35)] w-[520px] max-w-[96vw] max-h-[90vh] overflow-hidden rounded-[18px] shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset,0_32px_80px_rgba(0,0,0,0.7),0_0_80px_rgba(124,58,237,0.08)] [animation:modal-in_0.28s_cubic-bezier(0.16,1,0.3,1)] max-[520px]:w-full max-[520px]:max-w-full max-[520px]:max-h-[92dvh] max-[520px]:rounded-t-[20px] max-[520px]:rounded-b-none max-[520px]:[animation:modal-slide-up_0.3s_cubic-bezier(0.16,1,0.3,1)]"
        onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="flex justify-between items-center px-7 pt-[1.4rem] pb-5 flex-shrink-0 border-b border-[rgba(255,255,255,0.06)] bg-gradient-to-b from-[rgba(124,58,237,0.07)] to-transparent max-[520px]:px-5 max-[520px]:pt-4 max-[520px]:pb-[0.9rem]">
          <div>
            <h2
              className="m-0 text-[1.2rem] font-bold tracking-[0.25px] font-[inherit]"
              style={{
                background: 'linear-gradient(120deg, #ede9fe 0%, #a78bfa 60%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
              Create Event
            </h2>
          </div>
          <button
            className="w-[30px] h-[30px] min-w-[30px] p-0 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-full text-[rgba(255,255,255,0.45)] text-[0.75rem] cursor-pointer flex items-center justify-center flex-shrink-0 transition-[background,color,border-color] duration-200 hover:bg-[rgba(239,68,68,0.14)] hover:border-[rgba(239,68,68,0.3)] hover:text-[#fca5a5]"
            onClick={onClose}>
            ✕
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div
          className="flex-1 overflow-y-auto px-7 py-[1.4rem] max-[520px]:px-5 max-[520px]:py-[1.1rem]"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(124,58,237,0.18) transparent' }}>
          <form
            id="cem-form"
            className="flex flex-col gap-[1.1rem]"
            onSubmit={handleSubmit}
            noValidate>

            {/* ── Title ── */}
            <div className="flex flex-col gap-[0.4rem]">
              <label className={labelCls}>
                <span>Event Title <span className="text-[#f87171]">*</span></span>
                <span className="text-[0.68rem] text-[rgba(255,255,255,0.22)] font-normal tracking-normal normal-case ml-auto">
                  {formData.name.length}/{MAX_TITLE_LENGTH}
                </span>
              </label>
              <input
                className={fieldCls}
                value={formData.name}
                maxLength={MAX_TITLE_LENGTH}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_TITLE_LENGTH) {
                    setFormData({ ...formData, name: e.target.value });
                    setErrorMessage({ ...errorMessage, name: null });
                  }
                }}
                placeholder="Enter event title"
              />
              {errorMessage.name && (
                <p className="text-[#f87171] text-[0.72rem] m-0 tracking-[0.01em]">{errorMessage.name}</p>
              )}
            </div>

            {/* ── Description ── */}
            <div className="flex flex-col gap-[0.4rem]">
              <label className={labelCls}>
                Description <span className="text-[#f87171]">*</span>
              </label>
              <textarea
                className={`${fieldCls} resize-y min-h-[110px] leading-[1.55]`}
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  setErrorMessage({ ...errorMessage, description: null });
                }}
                placeholder="Describe your event"
              />
              {errorMessage.description && (
                <p className="text-[#f87171] text-[0.72rem] m-0 tracking-[0.01em]">{errorMessage.description}</p>
              )}
            </div>

            {/* ── Address with Geocoding Search Bar ── */}
            <div className="flex flex-col gap-[0.4rem]">
              <label className={labelCls}>
                Location <span className="text-[#f87171]">*</span>
              </label>
              <AddressSearchBar
                className="cem-address-search"
                placeholder="Search for an address…"
                onSelect={({ address, lat, lng }) => {
                  setFormData((prev) => ({
                    ...prev,
                    address,
                    location: {
                      type: 'Point',
                      coordinates: [lng, lat],
                    },
                  }));
                  setErrorMessage({ ...errorMessage, address: null });
                }}
                error={errorMessage.address}
              />
            </div>

            {/* ── Room / Location Detail ── */}
            <div className="flex flex-col gap-[0.4rem]">
              <label className={labelCls}>Room / Location Detail</label>
              <input
                className={fieldCls}
                value={formData.roomDetail}
                onChange={(e) =>
                  setFormData({ ...formData, roomDetail: e.target.value })
                }
                placeholder="e.g. Room 204, Floor 3, Gate B"
              />
            </div>

            {/* ── Interests ── */}
            <div className="flex flex-col gap-[0.4rem]">
              <label className={labelCls}>
                Interests <span className="text-[#f87171]">*</span>
              </label>
              <div className="relative w-full" ref={interestRef}>
                <button
                  ref={triggerRef}
                  type="button"
                  className={`cem-ms__trigger w-full min-h-[44px] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.09)] rounded-[10px] flex items-center px-3 gap-2 cursor-pointer text-left text-[#eeeef5] text-[0.9rem] transition-[background,border-color,box-shadow] duration-200 hover:bg-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.18)] aria-expanded:border-[#7c3aed] aria-expanded:bg-[rgba(255,255,255,0.07)] aria-expanded:shadow-[0_0_0_3px_rgba(124,58,237,0.22)]`}
                  onClick={() => {
                    if (!interestDropOpen && triggerRef.current) {
                      const r = triggerRef.current.getBoundingClientRect();
                      setDropPos({
                        top: r.bottom + 4,
                        left: r.left,
                        width: r.width,
                      });
                    }
                    setInterestDropOpen((o) => !o);
                  }}
                  aria-expanded={interestDropOpen}>
                  <span className="flex-1 min-w-0 flex items-center">
                    {selectedOptions.length === 0 ? (
                      <span className="text-[rgba(255,255,255,0.2)]">
                        Select interests
                      </span>
                    ) : (
                      <span className="flex flex-wrap gap-[0.3rem] py-[0.3rem]">
                        {selectedOptions.map((opt) => (
                          <span key={opt.value} className="inline-flex items-center gap-[0.25rem] bg-[rgba(124,58,237,0.2)] border border-[rgba(124,58,237,0.45)] text-[#c4b5fd] rounded-full py-[0.15rem] pl-[0.6rem] pr-[0.5rem] text-[0.78rem] leading-[1.4]">
                            {opt.label}
                            <button
                              type="button"
                              className="cem-ms__chip-remove bg-none border-none text-inherit cursor-pointer p-0 leading-none text-[1rem] opacity-65 transition-opacity duration-150 hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                const updated = selectedOptions.filter(
                                  (o) => o.value !== opt.value
                                );
                                setSelectedOptions(updated);
                                setFormData({
                                  ...formData,
                                  interests: updated.map((o) => o.value),
                                });
                              }}>
                              ×
                            </button>
                          </span>
                        ))}
                      </span>
                    )}
                  </span>
                  <svg
                    className={`cem-ms__chevron flex-shrink-0 text-[#a855f7] transition-transform duration-150 ${interestDropOpen ? 'rotate-180' : ''}`}
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none">
                    <path
                      d="M2 4l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {interestDropOpen &&
                  createPortal(
                    <div
                      ref={dropdownRef}
                      className="fixed bg-[#1a1a1a] border border-[rgba(255,255,255,0.12)] rounded-[10px] z-[9999] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
                      style={{
                        top: dropPos.top,
                        left: dropPos.left,
                        width: dropPos.width,
                      }}>
                      <div className="flex items-center gap-2 px-3 py-2 border-b border-[rgba(255,255,255,0.08)]">
                        <svg
                          className="flex-shrink-0 text-[rgba(255,255,255,0.35)]"
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none">
                          <circle
                            cx="6"
                            cy="6"
                            r="4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M9.5 9.5L12 12"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        <input
                          className="flex-1 bg-transparent border-none outline-none text-white text-[0.85rem] placeholder:text-[rgba(255,255,255,0.3)]"
                          placeholder="Search interests..."
                          value={interestSearch}
                          onChange={(e) => setInterestSearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      </div>
                      <ul
                        className="list-none m-0 py-[0.3rem] px-0 max-h-[180px] overflow-y-auto"
                        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                        {interestOptions
                          .filter((o) =>
                            o.label
                              .toLowerCase()
                              .includes(interestSearch.toLowerCase())
                          )
                          .map((opt) => {
                            const chosen = selectedOptions.some(
                              (s) => s.value === opt.value
                            );
                            return (
                              <li
                                key={opt.value}
                                className={`flex items-center gap-2 py-[0.45rem] px-3 cursor-pointer text-[0.875rem] transition-[background] duration-[120ms] hover:bg-[rgba(255,255,255,0.05)] ${
                                  chosen ? 'text-[#c4b5fd] hover:bg-[rgba(124,58,237,0.12)]' : 'text-[rgba(255,255,255,0.8)]'
                                }`}
                                onClick={() => {
                                  const updated = chosen
                                    ? selectedOptions.filter(
                                        (o) => o.value !== opt.value
                                      )
                                    : [...selectedOptions, opt];
                                  setSelectedOptions(updated);
                                  setFormData({
                                    ...formData,
                                    interests: updated.map((o) => o.value),
                                  });
                                  setErrorMessage({
                                    ...errorMessage,
                                    interests: null,
                                  });
                                }}>
                                <span className={`w-4 h-4 border rounded-[4px] flex items-center justify-center text-[0.7rem] text-[#a855f7] flex-shrink-0 ${chosen ? 'border-[#a855f7] bg-[rgba(124,58,237,0.25)]' : 'border-[rgba(255,255,255,0.2)]'}`}>
                                  {chosen ? '✓' : ''}
                                </span>
                                {opt.label}
                              </li>
                            );
                          })}
                      </ul>
                    </div>,
                    document.body
                  )}
              </div>
              {errorMessage.interests && (
                <p className="text-[#f87171] text-[0.72rem] m-0 tracking-[0.01em]">{errorMessage.interests}</p>
              )}
            </div>

            {/* ── Start Date & Time ── */}
            <div className="flex flex-col gap-[0.4rem]">
              <label className={labelCls}>
                Start <span className="text-[#f87171]">*</span>
              </label>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <input
                  className={`${fieldCls} [color-scheme:dark]`}
                  type="date"
                  value={formData.startDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFormData((p) => ({
                      ...p,
                      startDate: v,
                      endDate: p.endDate < v ? v : p.endDate,
                    }));
                    setErrorMessage({ ...errorMessage, startTime: null });
                  }}
                />
                <input
                  className={`${fieldCls} w-[110px] [color-scheme:dark]`}
                  type="time"
                  value={formData.startTimeOnly}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, startTimeOnly: e.target.value }));
                    setErrorMessage({ ...errorMessage, startTime: null });
                  }}
                />
              </div>
              {errorMessage.startTime && (
                <p className="text-[#f87171] text-[0.72rem] m-0 tracking-[0.01em]">{errorMessage.startTime}</p>
              )}
            </div>

            {/* ── End Date & Time ── */}
            <div className="flex flex-col gap-[0.4rem]">
              <label className={labelCls}>
                End <span className="text-[#f87171]">*</span>
              </label>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <input
                  className={`${fieldCls} [color-scheme:dark]`}
                  type="date"
                  value={formData.endDate}
                  min={formData.startDate || new Date().toISOString().slice(0, 10)}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, endDate: e.target.value }));
                    setErrorMessage({ ...errorMessage, endTime: null });
                  }}
                />
                <input
                  className={`${fieldCls} w-[110px] [color-scheme:dark]`}
                  type="time"
                  value={formData.endTimeOnly}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, endTimeOnly: e.target.value }));
                    setErrorMessage({ ...errorMessage, endTime: null });
                  }}
                />
              </div>
              {errorMessage.endTime && (
                <p className="text-[#f87171] text-[0.72rem] m-0 tracking-[0.01em]">{errorMessage.endTime}</p>
              )}
            </div>
          </form>
        </div>

        {/* ── Footer / Actions ── */}
        <div className="flex justify-end items-center gap-3 px-7 py-[1.1rem] flex-shrink-0 border-t border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.18)] max-[520px]:px-5 max-[520px]:py-[0.9rem] max-[520px]:pb-5 max-[520px]:flex-col-reverse max-[520px]:gap-[0.6rem]">
          {submitError && (
            <p className="text-[#f87171] text-[0.82rem] m-0 mr-auto max-[520px]:mr-0 max-[520px]:text-center">{submitError}</p>
          )}
          <button
            type="button"
            className="bg-transparent border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.5)] py-[0.62rem] px-5 rounded-[9px] text-[0.875rem] font-semibold cursor-pointer transition-[border-color,color,background] duration-200 hover:border-[rgba(255,255,255,0.28)] hover:text-[rgba(255,255,255,0.82)] hover:bg-[rgba(255,255,255,0.04)] max-[520px]:w-full max-[520px]:py-3 max-[520px]:text-[0.95rem]"
            onClick={onClose}
            disabled={submitting}>
            Cancel
          </button>
          <button
            type="submit"
            form="cem-form"
            className="bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] text-white border-none py-[0.62rem] px-[1.35rem] rounded-[9px] text-[0.875rem] font-bold cursor-pointer tracking-[0.04em] shadow-[0_2px_14px_rgba(124,58,237,0.3)] transition-[filter,transform,box-shadow] duration-200 hover:brightness-[1.14] hover:-translate-y-px hover:shadow-[0_8px_28px_rgba(124,58,237,0.45)] active:brightness-[0.95] active:translate-y-0 max-[520px]:w-full max-[520px]:py-3 max-[520px]:text-[0.95rem]"
            disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Event'}
          </button>
        </div>
      </div>
    </div>
  );
}
