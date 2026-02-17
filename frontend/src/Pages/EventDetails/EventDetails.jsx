import React, { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import './EventDetails.css';

export default function EventDetails() {
  const { id } = useParams(); // event id from route
  const USER_ID = '695ea916d421330d6bd92a4b'; // replace with auth later

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const isHost = event?.host === USER_ID;
  const isAttending = event?.attendees?.includes(USER_ID);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/events/${id}`);
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
    const route = isAttending ? 'remove' : 'add';

    await fetch(
      `http://localhost:3000/events/${id}/attendees/${route}/${USER_ID}`,
      { method: 'PUT' }
    );

    setEvent((prev) => ({
      ...prev,
      attendees: isAttending
        ? prev.attendees.filter((u) => u !== USER_ID)
        : [...prev.attendees, USER_ID],
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const res = await fetch(`http://localhost:3000/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });

    const json = await res.json();
    if (json.success) setIsEditing(false);
  };

  if (loading) return <div className="event-container">Loading event…</div>;
  if (errorMsg) return <div className="event-container error">{errorMsg}</div>;

  return (
    <div className="container">
      <div className="event-nav">
        <NavLink to="/home" className="back-btn">
          ← Back
        </NavLink>
      </div>

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
                  onChange={(e) =>
                    setEvent({ ...event, name: e.target.value })
                  }
                />
              ) : (
                <h2>{event.name}</h2>
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
                      interests: e.target.value
                        .split(',')
                        .map((i) => i.trim()),
                    })
                  }
                />
              ) : (
                <span>{event.interests.join(', ')}</span>
              )}
            </div>
          </div>

          {!isHost && (
            <button
              type="button"
              className="event-action-btn"
              onClick={handleAttend}
            >
              {isAttending ? 'Leave Event' : 'Join Event'}
            </button>
          )}

          {isHost && (
            <button
              className="event-action-btn"
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
