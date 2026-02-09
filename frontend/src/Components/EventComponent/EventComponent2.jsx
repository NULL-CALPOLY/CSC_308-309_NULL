import React, { useState } from 'react';
import './EventComponent.css';
import TagComponent from '../InterestTag/InterestTag.jsx';
import { useAuth } from '../../Hooks/useAuth.js';

export default function EventComponent(props) {


  // Mock user object
  const { user } = useAuth();

  const [expanded, setExpanded] = useState(false);
  const hasExtra = Boolean(props.description || props.attendees || props.host);

  const tags = props.interest
    ? props.interest.split(',').map((t) => t.trim())
    : ['General'];

  // Check if logged-in user is the host
  const isHost = user && props.host === user.id;

  const handleJoin = () => {
    console.log(`User ${user?.id} joining event ${props.eventId}`);
    alert(`Joined event "${props.eventName}"!`);
    // call your join event API here
    // to go to event info page, need to click read more 
  };

  const handleEdit = () => {
    console.log(`Navigating to edit event ${props.eventId}`);
    alert(`Editing event "${props.eventName}"!`);
    // navigate to edit page or open modal
  };

  // const handleDelete = () => {
  //   try {
  //       const res = fetch(`http://localhost:3000/events/${props.eventId}`, {
  //         method: 'DELETE',
  //         credentials: 'include',
  //       });
  // };

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
            rel="noopener noreferrer"
          >
            {props.eventAddress}
          </a>
        ) : (
          'No address'
        )}
      </div>

      {/* Only show tags at top when not expanded */}
      {!expanded && (
        <div className="Tag-List">
          {tags.map((tag, idx) => (
            <TagComponent key={idx} Interest={tag} />
          ))}
        </div>
      )}

      {/* Footer buttons */}
      {!expanded && (
        <div className="Event-Footer">
          {isHost ? (
            <button className="ActionButton" onClick={handleEdit}>
              Edit Event
            </button>
          ) : (
            <button className="ActionButton" onClick={handleJoin}>
              Join Event
            </button>
          )}

          {hasExtra && (
            <button
              className="SeeToggle"
              type="button"
              onClick={() => setExpanded(true)}
            >
              See more
            </button>
          )}
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
              Attendees: {props.attendees.join(', ')}
            </div>
          )}
          {props.host && <div className="Event-Host">Host: {props.host}</div>}

          {/* When expanded, move tags to bottom */}
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
              <button className="ActionButton" onClick={handleJoin}>
                Join Event
              </button>
            )}

            <button
              className="SeeToggle"
              type="button"
              onClick={() => setExpanded(false)}
            >
              See less
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
