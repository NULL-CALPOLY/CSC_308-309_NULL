import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './CreateEventModal.css';
import AddressSearchBar from '../AddressSearchBar/AddressSearchBar';
import { useAuth } from '../../Hooks/UseAuth.ts';
import useInterests from '../../Hooks/UseInterests.jsx';

const MAX_TITLE_LENGTH = 75;

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
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Create Event</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <form
            id="cem-form"
            className="event-form"
            onSubmit={handleSubmit}
            noValidate>
            {/* ── Title ── */}
            <div className="form-group form-group--title">
              <label>
                Event Title <span className="required">*</span>
                <span className="char-count">
                  {formData.name.length}/{MAX_TITLE_LENGTH}
                </span>
              </label>
              <input
                className="cem-native-input cem-title"
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
                <p className="error-text">{errorMessage.name}</p>
              )}
            </div>

            {/* ── Description ── */}
            <div className="form-group form-group--description">
              <label>
                Description <span className="required">*</span>
              </label>
              <textarea
                className="cem-native-textarea cem-description"
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  setErrorMessage({ ...errorMessage, description: null });
                }}
                placeholder="Describe your event"
              />
              {errorMessage.description && (
                <p className="error-text">{errorMessage.description}</p>
              )}
            </div>

            {/* ── Address with Geocoding Search Bar ── */}
            <div className="form-group form-group--location">
              <label>
                Location <span className="required">*</span>
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
            <div className="form-group form-group--room">
              <label>Room / Location Detail</label>
              <input
                className="cem-native-input cem-room"
                value={formData.roomDetail}
                onChange={(e) =>
                  setFormData({ ...formData, roomDetail: e.target.value })
                }
                placeholder="e.g. Room 204, Floor 3, Gate B"
              />
            </div>

            {/* ── Interests ── */}
            <div className="form-group form-group--interests">
              <label>
                Interests <span className="required">*</span>
              </label>
              <div className="cem-ms" ref={interestRef}>
                <button
                  ref={triggerRef}
                  type="button"
                  className="cem-ms__trigger"
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
                  <span className="cem-ms__display">
                    {selectedOptions.length === 0 ? (
                      <span className="cem-ms__placeholder">
                        Select interests
                      </span>
                    ) : (
                      <span className="cem-ms__chips">
                        {selectedOptions.map((opt) => (
                          <span key={opt.value} className="cem-ms__chip">
                            {opt.label}
                            <button
                              type="button"
                              className="cem-ms__chip-remove"
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
                    className="cem-ms__chevron"
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
                      className="cem-ms__dropdown"
                      style={{
                        top: dropPos.top,
                        left: dropPos.left,
                        width: dropPos.width,
                      }}>
                      <div className="cem-ms__search-wrap">
                        <svg
                          className="cem-ms__search-icon"
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
                          className="cem-ms__search"
                          placeholder="Search interests..."
                          value={interestSearch}
                          onChange={(e) => setInterestSearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      </div>
                      <ul className="cem-ms__list">
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
                                className={`cem-ms__option${
                                  chosen ? ' cem-ms__option--selected' : ''
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
                                <span className="cem-ms__check">
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
                <p className="error-text">{errorMessage.interests}</p>
              )}
            </div>

            {/* ── Date & Time ── */}
            <div className="form-group">
              <label>
                Start <span className="required">*</span>
              </label>
              <div className="cem-dt-row">
                <input
                  className="cem-native-input cem-dt-date"
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
                  className="cem-native-input cem-dt-time"
                  type="time"
                  value={formData.startTimeOnly}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, startTimeOnly: e.target.value }));
                    setErrorMessage({ ...errorMessage, startTime: null });
                  }}
                />
              </div>
              {errorMessage.startTime && (
                <p className="error-text">{errorMessage.startTime}</p>
              )}
            </div>

            <div className="form-group">
              <label>
                End <span className="required">*</span>
              </label>
              <div className="cem-dt-row">
                <input
                  className="cem-native-input cem-dt-date"
                  type="date"
                  value={formData.endDate}
                  min={formData.startDate || new Date().toISOString().slice(0, 10)}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, endDate: e.target.value }));
                    setErrorMessage({ ...errorMessage, endTime: null });
                  }}
                />
                <input
                  className="cem-native-input cem-dt-time"
                  type="time"
                  value={formData.endTimeOnly}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, endTimeOnly: e.target.value }));
                    setErrorMessage({ ...errorMessage, endTime: null });
                  }}
                />
              </div>
              {errorMessage.endTime && (
                <p className="error-text">{errorMessage.endTime}</p>
              )}
            </div>
          </form>
        </div>
        <div className="modal-actions">
          {submitError && <p className="error-text cem-submit-error">{submitError}</p>}
          <button type="button" className="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" form="cem-form" className="primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Event'}
          </button>
        </div>
      </div>
    </div>
  );
}
