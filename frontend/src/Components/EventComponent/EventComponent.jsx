import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './EventComponent.css';
import TagComponent from '../InterestTag/InterestTag.jsx';
import { useAuth } from '../../Hooks/UseAuth.ts';
import { useModal } from '../ModalContext.jsx';

export default function EventComponent(props) {
  const { user, isAuthenticated } = useAuth();
  const [attendees, setAttendees] = useState(props.attendees || []);
  const { openSignIn } = useModal();
  const navigate = useNavigate();
  const cardRef = useRef(null);

  // Scroll into view when this card becomes the selected one (map -> list sync).
  useEffect(() => {
    if (props.selected && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [props.selected]);

  const tags = props.interest
    ? props.interest.split(',').map((t) => t.trim())
    : ['General'];

  // Check if logged-in user is the host
  const hostId = typeof props.host === 'object' ? props.host?._id : props.host;
  const isHost = user && hostId === user.id;

  const [hostName, setHostName] = useState(
    typeof props.host === 'object' ? props.host?.name : null
  );

  useEffect(() => {
    if (hostName || !hostId) return;
    fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${hostId}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data?.name) {
          setHostName(result.data.name);
        }
      })
      .catch(() => {});
  }, [hostId, hostName]);

  const isAttending = attendees?.some(
    (a) => (typeof a === 'object' ? a._id : a) === user?.id
  );

  const handleAttend = async () => {
    if (!isAuthenticated || !user?.id) return;

    const route = isAttending ? 'remove' : 'add';

    await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/events/${props.eventId}/attendees/${route}/${user.id}`,
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
    <div
      ref={cardRef}
      className={`Event-Container${props.selected ? ' Event-Container--selected' : ''}`}
      onClick={() => props.onSelect?.(props.eventId)}>
      <div className="Event-Title">{props.eventName}</div>
      <hr className="Event-Divider" />

      <div className="Event-DateTime">
        <span>📅 {props.eventDate}</span>
        <span>🕒 {props.eventTime}</span>
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

      <div className="Tag-List">
        {tags.slice(0, 3).map((tag, idx) => (
          <TagComponent key={idx} Interest={tag} />
        ))}
      </div>

      <div className="Event-Footer">
        {!isAuthenticated ? (
          <button className="SignInPromptBtn" onClick={openSignIn}>
            Sign in to join
          </button>
        ) : isHost ? (
          <button className="ActionButton EditButton" onClick={handleEdit}>
            Edit Event
          </button>
        ) : (
          <button
            className={`ActionButton ${isAttending ? 'LeaveButton' : 'JoinButton'}`}
            onClick={handleAttend}>
            {isAttending ? 'Leave Event' : 'Join Event'}
          </button>
        )}

        {isAuthenticated && (
          <button
            className="ViewEventBtn"
            type="button"
            onClick={goToEventDetails}>
            View Event
          </button>
        )}
      </div>
    </div>
  );
}
