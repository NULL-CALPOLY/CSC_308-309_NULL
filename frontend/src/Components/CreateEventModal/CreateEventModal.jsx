import React, { useState, useEffect } from 'react';
import './CreateEventModal.css';
import Multiselect from "@cloudscape-design/components/multiselect";
import Input from "@cloudscape-design/components/input";
import Textarea from "@cloudscape-design/components/textarea";
import TempAddressComponent from '../TempAddressInputCompnent/TempAddressComponent';

export default function CreateEventModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    interests: [],
    startTime: '',
    endTime: '',
  });

  const [interestOptions, setInterestOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        // Format payload according to your EventSchema
        const payload = {
        name: formData.name,
        description: formData.description,
        mapComponent: formData.address,
        address: formData.address,
        host: "64c9f0d2b5e8f3a1c2d4e567", // Replace with actual host ID dynamically
        attendees: [], // optional, empty by default
        blockedUsers: [], // optional
        comment: [], // optional
        location: formData.location, // { type: 'Point', coordinates: [lng, lat] }
        interests: selectedOptions.map((o) => o.value),
        time: {
            start: formData.startTime,
            end: formData.endTime,
        },
        };
        console.log("Final formData before submit:", formData);

        // Send POST request
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

        // Close modal after successful submission
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
          <button className="close-btn" onClick={onClose}>×</button>
        </header>

        <form className="event-form" onSubmit={handleSubmit}>
          {/* Event Title */}
          <div className="form-group">
            <label>Event Title</label>
            <Input
              value={formData.name}
              onChange={({ detail }) =>
                setFormData({ ...formData, name: detail.value })
              }
              placeholder="Enter event title"
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <Textarea
              value={formData.description}
              onChange={({ detail }) =>
                setFormData({ ...formData, description: detail.value })
              }
              placeholder="Describe your event"
            />
          </div>

          {/* Address */}
        <div className="form-group">
            <label>Location</label>
            <TempAddressComponent
                onSelect={({ address, lat, lng }) => {
                setFormData((prev) => ({
                    ...prev,
                    address, // formatted address string
                    location: {
                    type: 'Point',
                    coordinates: [lng, lat], // GeoJSON [longitude, latitude]
                    },
                }));
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
                setSelectedOptions(detail.selectedOptions);
                setFormData({
                  ...formData,
                  interests: detail.selectedOptions.map(o => o.value),
                });
              }}
            />
          </div>

          {/* Date & Time */}
          <div className="datetime-grid">
            <div className="form-group">
              <label>Start Time</label>
              <Input
                type="datetime-local"
                value={formData.startTime}
                onChange={({ detail }) =>
                  setFormData({ ...formData, startTime: detail.value })
                }
              />
            </div>

            <div className="form-group">
              <label>End Time</label>
              <Input
                type="datetime-local"
                min={formData.startTime}
                value={formData.endTime}
                onChange={({ detail }) =>
                  setFormData({ ...formData, endTime: detail.value })
                }
              />
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
