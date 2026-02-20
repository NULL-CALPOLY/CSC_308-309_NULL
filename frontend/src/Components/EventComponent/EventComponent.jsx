import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EventComponent.css';
import TagComponent from '../InterestTag/InterestTag.jsx';
import { useAuth } from '../../Hooks/useAuth.js';

export default function EventComponent(props) {
  const { user, isAuthenticated } = useAuth();
  const [attendees, setAttendees] = useState(props.attendees || []);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const tags = props.interest
    ? props.interest.split(',').map((t) => t.trim())
    : ['General'];

  // Check if logged-in user is the host
  const isHost = user && props.host === user.id;

  const isAttending = attendees?.some(
    (a) => (typeof a === 'object' ? a._id : a) === user?.id
  );

  const handleAttend = async () => {
    if (!isAuthenticated || !user?.id) return;

    const route = isAttending ? 'remove' : 'add';

    await fetch(
      `${import.meta.env.VITE_API_BASE_URL}events/${props.eventId}/attendees/${route}/${user.id}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    setAttendees((prev) =>
      isAttending
        ? prev.filter((a) => (typeof a === 'object' ? a._id : a) !== user.id)
        : [...prev, user.id]
    );
  };

  const handleEdit = () => {
    navigate(`/events/${props.eventId}`);
  };

  const goToEventDetails = () => {
    navigate(`/events/${props.eventId}`);
  };

  return (
    <div className="Event-Container">
      <div className="Event-Title">{props.eventName}</div>
      <hr className="Event-Divider" />

      <div className="Event-DateTime">
        Date: {props.eventDate} | Time: {props.eventTime}
      </div>
      <div className="Event-Address">
        Address:{' '}
        {props.eventAddress ? (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              props.eventAddress
            )}`}
            target="_blank"
            rel="noopener noreferrer">
            {props.eventAddress}
          </a>
        ) : (
          'No address'
        )}
      </div>

      {!expanded && (
        <div className="Tag-List">
          {tags.map((tag, idx) => (
            <TagComponent key={idx} Interest={tag} />
          ))}
        </div>
      )}

      {!expanded && (
        <div className="Event-Footer">
          {isHost ? (
            <button className="ActionButton" onClick={handleEdit}>
              Edit Event
            </button>
          ) : (
            <button className="ActionButton" onClick={handleAttend}>
              {isAttending ? 'Leave Event' : 'Join Event'}
            </button>
          )}

          <button
            className="ViewEventBtn"
            type="button"
            onClick={goToEventDetails}>
            View Event
          </button>
        </div>
      )}

      {/* Expanded section */}
      {expanded && (
        <div className="Event-Extra">
          {props.description && (
            <div className="Event-Description">
              Description: {props.description}
            </div>
          )}

          {props.attendees && (
            <div className="Event-Attendees">
              Attendees: {props.attendees.length}
            </div>
          )}

          {props.host && <div className="Event-Host">Host: {props.host}</div>}

          <div className="Event-Footer Expanded-Footer">
            <div className="Tag-List">
              {tags.map((tag, idx) => (
                <TagComponent key={idx} Interest={tag} />
              ))}
            </div>

            {isHost ? (
              <button className="ActionButton" onClick={handleEdit}>
                Edit Event
              </button>
            ) : (
              <button className="ActionButton" onClick={handleAttend}>
                {isAttending ? 'Leave Event' : 'Join Event'}
              </button>
            )}

            <button
              className="SeeToggle"
              type="button"
              onClick={() => setExpanded(false)}>
              See less
            </button>

            {/* 👇 ALSO AVAILABLE WHEN EXPANDED */}
            <button
              className="ViewEventBtn"
              type="button"
              onClick={goToEventDetails}>
              View Event
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
