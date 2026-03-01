import React, { useState, useEffect } from 'react';
import './CreateEventModal.css';
import Multiselect from '@cloudscape-design/components/multiselect';
import Input from '@cloudscape-design/components/input';
import Textarea from '@cloudscape-design/components/textarea';
import AddressAutocomplete from '../AddressAutocomplete/AddressAutocomplete';
import { useAuth } from '../../Hooks/useAuth.ts';

export default function CreateEventModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    interests: [],
    location: null,
    startTime: '',
    endTime: '',
  });

  const [interestOptions, setInterestOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [errorMessage, setErrorMessage] = useState({});
  const [isLoadingInterests, setIsLoadingInterests] = useState(false);

  useEffect(() => {
    setIsLoadingInterests(true);
    fetch(`${import.meta.env.VITE_API_BASE_URL}/interests/all`)
      .then((res) => res.json())
      .then((data) => {
        const uniqueInterests = data.filter(
          (interest, index, self) =>
            index === self.findIndex((i) => i.name === interest.name)
        );
        const mappedOptions = uniqueInterests.map((interest) => ({
          label: interest.name,
          value: interest.name,
        }));
        setInterestOptions(mappedOptions);
      })
      .catch((err) => console.error('Failed to load interests:', err))
      .finally(() => setIsLoadingInterests(false));
  }, []);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};
    const now = new Date();

    if (!formData.name.trim()) newErrors.name = 'Event title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.address || !formData.location)
      newErrors.address = 'Please select an address from the suggestions';

    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    else if (new Date(formData.startTime) < now)
      newErrors.startTime = 'Start time cannot be in the past';

    if (!formData.endTime) newErrors.endTime = 'End time is required';
    else if (new Date(formData.endTime) <= new Date(formData.startTime))
      newErrors.endTime = 'End time must be after start time';

    if (selectedOptions.length === 0)
      newErrors.interests = 'Select at least one interest';

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
        address: formData.address,
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

      const result = await response.json();
      console.log('Event created successfully:', result);
      onClose();
    } catch (err) {
      console.error('Failed to create event:', err);
      alert('Failed to create event. Check console for details.');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <header className="modal-header">
          <h2>Create Event</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </header>

        <form className="event-form" onSubmit={handleSubmit}>
          {/* Event Title */}
          <div className="form-group">
            <label>Event Title</label>
            <Input
              value={formData.name}
              onChange={({ detail }) => {
                setFormData({ ...formData, name: detail.value });
                setErrorMessage({ ...errorMessage, name: null });
              }}
              placeholder="Enter event title"
            />
            {errorMessage.name && (
              <p className="error-text">{errorMessage.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
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

          {/* Address */}
          <div className="form-group">
            <label>Location</label>
            <AddressAutocomplete
              placeholder="Search for a location…"
              error={errorMessage.address}
              onSelect={({ address, lat, lng }) => {
                if (!address) {
                  setFormData((prev) => ({
                    ...prev,
                    address: '',
                    location: null,
                  }));
                  return;
                }
                setFormData((prev) => ({
                  ...prev,
                  address,
                  location: {
                    type: 'Point',
                    coordinates: [lng, lat],
                  },
                }));
                setErrorMessage((prev) => ({ ...prev, address: null }));
              }}
            />
          </div>

          {/* Interests */}
          <div className="form-group">
            <label>Interests</label>
            <Multiselect
              placeholder="Select interests"
              options={interestOptions}
              selectedOptions={selectedOptions}
              onChange={({ detail }) => {
                const uniqueSelected = detail.selectedOptions.filter(
                  (option, index, self) =>
                    index === self.findIndex((o) => o.value === option.value)
                );
                setSelectedOptions(uniqueSelected);
                setFormData({
                  ...formData,
                  interests: uniqueSelected.map((o) => o.value),
                });
                setErrorMessage({ ...errorMessage, interests: null });
              }}
              filteringType="auto"
              keepOpen={false}
              loading={isLoadingInterests}
              disabled={isLoadingInterests}
            />
            {errorMessage.interests && (
              <p className="error-text">{errorMessage.interests}</p>
            )}
          </div>

          {/* Date & Time */}
          <div className="datetime-grid">
            <div className="form-group">
              <label htmlFor="startTime">Start Time</label>
              <Input
                ariaLabel="Start Time"
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
              <label htmlFor="endTime">End Time</label>
              <Input
                ariaLabel="End Time"
                type="datetime-local"
                min={formData.startTime}
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