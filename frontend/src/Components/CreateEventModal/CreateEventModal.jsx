import { useState, useEffect } from 'react';
import './CreateEventModal.css';
import Multiselect from '@cloudscape-design/components/multiselect';
import Input from '@cloudscape-design/components/input';
import Textarea from '@cloudscape-design/components/textarea';
import TempAddressComponent from '../TempAddressInputComponent/TempAddressComponent';
import { useAuth } from '../../Hooks/useAuth.ts';
import useInterests from '../../Hooks/useInterests.jsx';

const MAX_TITLE_LENGTH = 75;

export default function CreateEventModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const { interests, loading: interestsLoading } = useInterests();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    roomDetail: '',
    interests: [],
    location: '',
    startTime: '',
    endTime: '',
  });

  const [selectedOptions, setSelectedOptions] = useState([]);
  const [errorMessage, setErrorMessage] = useState({});

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

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required.';
    } else if (new Date(formData.startTime) <= now) {
      newErrors.startTime = 'Start time must be in the future.';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required.';
    } else if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      newErrors.endTime = 'End time must be after start time.';
    }

    if (selectedOptions.length === 0)
      newErrors.interests = 'Select at least one interest.';

    setErrorMessage(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

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
          start: formData.startTime,
          end: formData.endTime,
        },
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/events/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
      onSuccess();
    } catch (err) {
      console.error('Failed to create event:', err);
      alert('Failed to create event. Check console for details.');
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

        <form className="event-form" onSubmit={handleSubmit} noValidate>
          {/* ── Title ── */}
          <div className="form-group">
            <label>
              Event Title <span className="required">*</span>
              <span className="char-count">
                {formData.name.length}/{MAX_TITLE_LENGTH}
              </span>
            </label>
            <Input
              value={formData.name}
              onChange={({ detail }) => {
                if (detail.value.length <= MAX_TITLE_LENGTH) {
                  setFormData({ ...formData, name: detail.value });
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
          <div className="form-group">
            <label>
              Description <span className="required">*</span>
            </label>
            <Textarea
              value={formData.description}
              onChange={({ detail }) => {
                setFormData({ ...formData, description: detail.value });
                setErrorMessage({ ...errorMessage, description: null });
              }}
              placeholder="Describe your event"
            />
            {errorMessage.description && (
              <p className="error-text">{errorMessage.description}</p>
            )}
          </div>

          {/* ── Address ── */}
          <div className="form-group">
            <label>
              Location <span className="required">*</span>
            </label>
            <TempAddressComponent
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
            />
            {errorMessage.address && (
              <p className="error-text">{errorMessage.address}</p>
            )}
          </div>

          {/* ── Room / Location Detail ── */}
          <div className="form-group">
            <label>Room / Location Detail</label>
            <Input
              value={formData.roomDetail}
              onChange={({ detail }) =>
                setFormData({ ...formData, roomDetail: detail.value })
              }
              placeholder="e.g. Room 204, Floor 3, Gate B"
            />
          </div>

          {/* ── Interests ── */}
          <div className="form-group">
            <label>
              Interests <span className="required">*</span>
            </label>
            <Multiselect
              placeholder="Select interests"
              options={interestOptions}
              selectedOptions={selectedOptions}
              onChange={({ detail }) => {
                const unique = detail.selectedOptions.filter(
                  (o, i, self) =>
                    i === self.findIndex((x) => x.value === o.value)
                );
                setSelectedOptions(unique);
                setFormData({
                  ...formData,
                  interests: unique.map((o) => o.value),
                });
                setErrorMessage({ ...errorMessage, interests: null });
              }}
              filteringType="auto"
              keepOpen={true}
              statusType={interestsLoading ? 'loading' : 'finished'}
              loadingText="Loading interests..."
            />
            {errorMessage.interests && (
              <p className="error-text">{errorMessage.interests}</p>
            )}
          </div>

          {/* ── Date & Time ── */}
          <div className="datetime-grid">
            <div className="form-group">
              <label>
                Start Time <span className="required">*</span>
              </label>
              <Input
                type="datetime-local"
                value={formData.startTime}
                onChange={({ detail }) => {
                  setFormData({ ...formData, startTime: detail.value });
                  setErrorMessage({ ...errorMessage, startTime: null });
                }}
              />
              {errorMessage.startTime && (
                <p className="error-text">{errorMessage.startTime}</p>
              )}
            </div>

            <div className="form-group">
              <label>
                End Time <span className="required">*</span>
              </label>
              <Input
                type="datetime-local"
                value={formData.endTime}
                onChange={({ detail }) => {
                  setFormData({ ...formData, endTime: detail.value });
                  setErrorMessage({ ...errorMessage, endTime: null });
                }}
              />
              {errorMessage.endTime && (
                <p className="error-text">{errorMessage.endTime}</p>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary">
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
