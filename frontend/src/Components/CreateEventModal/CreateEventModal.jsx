import React, { useState, useEffect } from 'react';
import './CreateEventModal.css';
import Multiselect from '@cloudscape-design/components/multiselect';
import Input from '@cloudscape-design/components/input';
import Textarea from '@cloudscape-design/components/textarea';
import TempAddressComponent from '../TempAddressInputComponent/TempAddressComponent';

export default function CreateEventModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    interests: [],
    location: '',
    startTime: '',
    endTime: '',
  });

  const [interestOptions, setInterestOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [errorMessage, setErrorMessage] = useState({});

  /* 🔹 Fetch interests from API */
  useEffect(() => {
    fetch('http://localhost:3000/interests/all')
      .then((res) => res.json())
      .then((data) => {
        const mappedOptions = data.map((interest) => ({
          label: interest.name,
          value: interest.name,
        }));
        setInterestOptions(mappedOptions);
      })
      .catch((err) => console.error('Failed to load interests:', err));
  }, []);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};
    const now = new Date();

    if (!formData.name.trim()) newErrors.name = 'Event title is required';

    if (!formData.description.trim())
      newErrors.description = 'Description is required';

    if (!formData.address) newErrors.address = 'Location is required';

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
      // Format payload according to your EventSchema
      const payload = {
        name: formData.name,
        description: formData.description,
        mapComponent: formData.address,
        address: formData.address,
        host: '64c9f0d2b5e8f3a1c2d4e567', // Replace with actual host ID dynamically
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

      const response = await fetch('http://localhost:3000/events/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

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
            <TempAddressComponent
              onSelect={({ address, lat, lng }) => {
                {
                  setFormData((prev) => ({
                    ...prev,
                    address, // formatted address string
                    location: {
                      type: 'Point',
                      coordinates: [lng, lat], // GeoJSON [longitude, latitude]
                    },
                  }));
                  setErrorMessage({ ...errorMessage, address: null });
                }
              }}
            />
            {errorMessage.address && (
              <p className="error-text">{errorMessage.address}</p>
            )}
          </div>

          {/* Interests */}
          <div className="form-group">
            <label>Interests</label>
            <Multiselect
              placeholder="Select interests"
              options={interestOptions}
              selectedOptions={selectedOptions}
              onChange={({ detail }) => {
                setSelectedOptions(detail.selectedOptions);
                setFormData({
                  ...formData,
                  interests: detail.selectedOptions.map((o) => o.value),
                });
                setErrorMessage({ ...errorMessage, interests: null });
              }}
            />
            {errorMessage.interests && (
              <p className="error-text">{errorMessage.interests}</p>
            )}
          </div>

          {/* Date & Time */}
          <div className="datetime-grid">
            <div className="form-group">
              <label htmlFor="startTime">Start Time</label>
              <div className="awsui_input-container">
                <Input
                  ariaLabel="Start Time"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={({ detail }) => {
                    setFormData({ ...formData, startTime: detail.value });
                    setErrorMessage({ ...errorMessage, startTime: null });
                  }}
                />
              </div>
              {errorMessage.startTime && (
                <p className="error-text">{errorMessage.startTime}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="endTime">End Time</label>
              <div className="awsui_input-container">
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
              </div>
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
