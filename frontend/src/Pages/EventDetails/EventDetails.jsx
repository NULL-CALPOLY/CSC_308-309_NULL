import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './EventDetails.css';
import Navbar from '../../Components/Navbar/Navbar';
import { useAuth } from '../../Hooks/useAuth';

export default function EventDetails() {
  const { id } = useParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const isHost = event?.host?._id
    ? event.host._id === user?.id
    : event?.host === user?.id;

  const isAttending = event?.attendees?.some(
    (a) => (typeof a === 'object' ? a._id : a) === user?.id
  );

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/events/${id}`
        );
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Event not found');
        }
        setEvent(json.data);
      } catch (err) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleAttend = async () => {
    if (!isAuthenticated || !user?.id) return;
    const route = isAttending ? 'remove' : 'add';
    await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/events/${id}/attendees/${route}/${user.id}`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user.token}` },
      }
    );
    setEvent((prev) => ({
      ...prev,
      attendees: isAttending
        ? prev.attendees.filter(
            (a) => (typeof a === 'object' ? a._id : a) !== user.id
          )
        : [...prev.attendees, user.id],
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!user?.token) return;
    try {
      const payload = {
        name: event.name,
        description: event.description,
        address: event.address,
        interests: event.interests,
        time: { start: event.time.start, end: event.time.end },
      };
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/events/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to update event');
      }
      setEvent((prev) => ({ ...prev, ...payload }));
      setIsEditing(false);
    } catch (err) {
      console.error('Update failed:', err);
      alert(err.message);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'TBD';
    return new Date(isoString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="ed-page">
        <div className="ed-loading">Loading event...</div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="ed-page">
        <div className="ed-error">{errorMsg}</div>
      </div>
    );
  }

  if (!event) return null;

  const renderAddress = () => {
    if (isEditing) {
      return (
        <input
          className="ed-input"
          value={event.address}
          onChange={(e) => setEvent({ ...event, address: e.target.value })}
        />
      );
    }
    const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(event.address);
    return (
      <a className="ed-link" href={mapsUrl} target="_blank" rel="noopener noreferrer">
        {event.address}
      </a>
    );
  };

  return (
    <div className="ed-page">
      <Navbar page="/home" />
      <div className="ed-wrapper">
        <form className="ed-card" onSubmit={handleUpdate}>
          <div className="ed-header">
            <div className="ed-avatar">
              {(event.name?.charAt(0) || '?').toUpperCase()}
            </div>
            <div className="ed-header-text">
              {isEditing ? (
                <input
                  className="ed-input"
                  value={event.name}
                  onChange={(e) => setEvent({ ...event, name: e.target.value })}
                />
              ) : (
                <h1 className="ed-title">{event.name}</h1>
              )}
              <p className="ed-time">
                {formatDate(event.time.start)} - {formatDate(event.time.end)}
              </p>
            </div>
          </div>
          <div className="ed-grid">
            <div className="ed-field ed-full">
              <label className="ed-label">About this event</label>
              {isEditing ? (
                <textarea
                  className="ed-textarea"
                  value={event.description}
                  onChange={(e) => setEvent({ ...event, description: e.target.value })}
                />
              ) : (
                <p className="ed-text">{event.description}</p>
              )}
            </div>
            <div className="ed-field">
              <label className="ed-label">Location</label>
              {renderAddress()}
            </div>
            <div className="ed-field">
              <label className="ed-label">Attendees</label>
              <p className="ed-text">{event.attendees.length} going</p>
            </div>
            <div className="ed-field ed-full">
              <label className="ed-label">Interests</label>
              {isEditing ? (
                <input
                  className="ed-input"
                  value={event.interests.join(', ')}
                  onChange={(e) =>
                    setEvent({
                      ...event,
                      interests: e.target.value.split(',').map((i) => i.trim()),
                    })
                  }
                />
              ) : (
                <div className="ed-tags">
                  {event.interests.map((tag, i) => (
                    <span key={i} className="ed-tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="ed-actions">
            {isAuthenticated && !isHost && (
              <button
                type="button"
                className={`ed-btn ${isAttending ? 'ed-btn--leave' : 'ed-btn--join'}`}
                onClick={handleAttend}
              >
                {isAttending ? 'Leave Event' : 'Join Event'}
              </button>
            )}
            {isAuthenticated && isHost && (
              <button
                type={isEditing ? 'submit' : 'button'}
                className="ed-btn ed-btn--edit"
                onClick={(e) => {
                  if (!isEditing) {
                    e.preventDefault();
                    setIsEditing(true);
                  }
                }}
              >
                {isEditing ? 'Save Changes' : 'Edit Event'}
              </button>
            )}
            {isEditing && (
              <button
                type="button"
                className="ed-btn ed-btn--cancel"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            )}
          </div>
          <div className="ed-comments">
            <h3 className="ed-comments-title">Comments</h3>
            {event.comment.length === 0 ? (
              <p className="ed-muted">No comments yet</p>
            ) : (
              event.comment.map((c, i) => (
                <div key={i} className="ed-comment">{c}</div>
              ))
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
