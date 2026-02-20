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

  const isHost = event?.host === user?.id;
  const isAttending = event?.attendees?.includes(user?.id);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}events/${id}`);
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
      `${import.meta.env.VITE_API_BASE_URL}events/${id}/attendees/${route}/${user.id}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    setEvent((prev) => ({
      ...prev,
      attendees: isAttending
        ? prev.attendees.filter((u) => u !== user.id)
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
        time: {
          start: event.time.start,
          end: event.time.end,
        },
      };

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to update event');
      }

      // Update local state with saved data
      setEvent((prev) => ({ ...prev, ...payload }));
      setIsEditing(false);
    } catch (err) {
      console.error('Update failed:', err);
      alert(err.message);
    }
  };

  if (authLoading || loading)
    return <div className="event-container">Loading event…</div>;
  if (errorMsg) return <div className="event-container error">{errorMsg}</div>;
  if (!event) return null;

  return (
    <div className="container">
      <Navbar page="/home" />

      <div className="event-container">
        <form className="event-card" onSubmit={handleUpdate}>
          <div className="event-header">
            <div className="event-avatar">
              {(event.name?.charAt(0) || '?').toUpperCase()}
            </div>

            <div>
              {isEditing ? (
                <input
                  value={event.name}
                  onChange={(e) => setEvent({ ...event, name: e.target.value })}
                />
              ) : (
                <div className="event-name">
                  <h2>{event.name}</h2>
                </div>
              )}
              <p className="event-sub">
                {new Date(event.time.start).toLocaleString()} –{' '}
                {new Date(event.time.end).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="event-grid">
            <div className="event-field full">
              <label>Description</label>
              {isEditing ? (
                <textarea
                  value={event.description}
                  onChange={(e) =>
                    setEvent({ ...event, description: e.target.value })
                  }
                />
              ) : (
                <span>{event.description}</span>
              )}
            </div>

            <div className="event-field">
              <label>Address</label>
              {isEditing ? (
                <input
                  value={event.address}
                  onChange={(e) =>
                    setEvent({ ...event, address: e.target.value })
                  }
                />
              ) : (
                <span>{event.address}</span>
              )}
            </div>

            <div className="event-field">
              <label>Attendees</label>
              <span>{event.attendees.length}</span>
            </div>

            <div className="event-field full">
              <label>Interests</label>
              {isEditing ? (
                <input
                  value={event.interests.join(', ')}
                  onChange={(e) =>
                    setEvent({
                      ...event,
                      interests: e.target.value.split(',').map((i) => i.trim()),
                    })
                  }
                />
              ) : (
                <span>{event.interests.join(', ')}</span>
              )}
            </div>
          </div>

          {/* Only show join/leave if logged in and not the host */}
          {isAuthenticated && !isHost && (
            <button
              type="button"
              className="event-action-btn"
              onClick={handleAttend}>
              {isAttending ? 'Leave Event' : 'Join Event'}
            </button>
          )}

          {/* Only show edit if logged in and is the host */}
          {isAuthenticated && isHost && (
            <button
              type={isEditing ? 'submit' : 'button'}
              className="event-action-btn"
              onClick={(e) => {
                if (!isEditing) {
                  e.preventDefault();
                  setIsEditing(true);
                }
              }}>
              {isEditing ? 'Save Changes' : 'Edit Event'}
            </button>
          )}

          <div className="event-comments">
            <h3>Comments</h3>
            {event.comment.length === 0 ? (
              <p className="muted">No comments yet</p>
            ) : (
              event.comment.map((c, i) => (
                <div key={i} className="comment">
                  {c}
                </div>
              ))
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
