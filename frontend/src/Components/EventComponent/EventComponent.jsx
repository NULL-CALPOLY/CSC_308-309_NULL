import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EventComponent.css';
import TagComponent from '../InterestTag/InterestTag.jsx';

export default function EventComponent(props) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const hasExtra = Boolean(props.description || props.attendees || props.host);

  const tags = props.interest
    ? props.interest.split(',').map((t) => t.trim())
    : ['General'];

  const goToEventDetails = () => {
    navigate(`/events/${props.eventId}`);
  };

  return (
    <div className="Event-Container">
      <div className="Event-Title">{props.eventName}</div>
      <hr className="Event-Divider" />

      <div className="Event-Time">Time: {props.eventTime}</div>

      <div className="Event-Address">
        Address:{' '}
        {props.eventAddress ? (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              props.eventAddress
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
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

      {!expanded && hasExtra && (
        <div className="Event-Footer">
          <button
            className="SeeToggle"
            type="button"
            onClick={() => setExpanded(true)}
          >
            See more
          </button>

          {/* 👇 NEW BUTTON */}
          <button
            className="ViewEventBtn"
            type="button"
            onClick={goToEventDetails}
          >
            View Event
          </button>
        </div>
      )}

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

            <button
              className="SeeToggle"
              type="button"
              onClick={() => setExpanded(false)}
            >
              See less
            </button>

            {/* 👇 ALSO AVAILABLE WHEN EXPANDED */}
            <button
              className="ViewEventBtn"
              type="button"
              onClick={goToEventDetails}
            >
              View Event
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
