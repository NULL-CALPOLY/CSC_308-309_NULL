import React, { useState } from 'react';
import './EventComponent.css';
import TagComponent from '../InterestTag/InterestTag.jsx';

export default function EventComponent(props) {
  const [expanded, setExpanded] = useState(false);
  const hasExtra = Boolean(props.description || props.attendees || props.host);
  const tag = props.interest;
  console.log(tag);
  console.log(props);

  return (
    <div className="Event-Container">
      <div className="Event-Title">{props.eventName}</div>
      <hr className="Event-Divider" />

      <div className="Event-Time">Time: {props.eventTime}</div>
      <div className="Event-Address">Address: {props.eventAddress}</div>

      {/* Only show Tag at top when not expanded */}
      {!expanded && <TagComponent Interest={tag} />}

      {!expanded && hasExtra && (
        <div className="Event-Footer">
          <button
            className="SeeToggle"
            type="button"
            onClick={() => setExpanded(true)}
          >
            See more
          </button>
        </div>
      )}

      {expanded && (
        <div className="Event-Extra">
          {props.description && (
            <div className="Event-Description">
              Description : {props.description}
            </div>
          )}
          {props.attendees && (
            <div className="Event-Attendees">Attendees : {props.attendees}</div>
          )}
          {props.host && <div className="Event-Host">Host : {props.host}</div>}

          {/* When expanded, move Tag to bottom */}
          <div className="Event-Footer Expanded-Footer">
            <TagComponent Interest={tag} />
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
