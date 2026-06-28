import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const [attendBusy, setAttendBusy] = useState(false);
  const [attendError, setAttendError] = useState('');

  const isAttending = attendees?.some(
    (a) => (typeof a === 'object' ? a._id : a) === user?.id
  );

  const handleAttend = async () => {
    if (!isAuthenticated || !user?.id || attendBusy) return;

    const wasAttending = isAttending;
    const route = wasAttending ? 'remove' : 'add';

    setAttendBusy(true);
    setAttendees((prev) =>
      wasAttending
        ? prev.filter((a) => (typeof a === 'object' ? a._id : a) !== user.id)
        : [...prev, user.id]
    );

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/events/${props.eventId}/attendees/${route}/${user.id}`,
        { method: 'PUT', headers: { Authorization: `Bearer ${user.token}` } }
      );
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || 'Failed to update attendance');
      }
    } catch (err) {
      // Roll back optimistic update
      setAttendees((prev) =>
        wasAttending ? [...prev, user.id] : prev.filter((a) => (typeof a === 'object' ? a._id : a) !== user.id)
      );
      setAttendError(err.message || 'Could not update attendance.');
    } finally {
      setAttendBusy(false);
    }
  };

  const handleEdit = () => navigate(`/events/${props.eventId}`);
  const goToEventDetails = () => navigate(`/events/${props.eventId}`);

  return (
    <div
      ref={cardRef}
      role="article"
      tabIndex={props.onSelect ? 0 : undefined}
      className={`bg-[rgba(255,255,255,0.04)] text-[#f8fafc] rounded-[14px] px-[18px] py-4 w-full box-border border transition-[transform,box-shadow,border-color] duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)] ${
        props.selected
          ? 'border-[rgba(124,58,237,0.55)] shadow-[0_6px_22px_rgba(124,58,237,0.2)]'
          : 'border-[rgba(255,255,255,0.07)] shadow-[0_2px_12px_rgba(0,0,0,0.2)] hover:border-[rgba(124,58,237,0.3)]'
      }`}
      onClick={() => props.onSelect?.(props.eventId)}
      onKeyDown={(e) => {
        if (props.onSelect && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          props.onSelect(props.eventId);
        }
      }}>
      <div className="font-bold text-[15px] leading-snug text-[#f8fafc] mb-2 tracking-[0.1px] whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
        {props.eventName}
      </div>
      <hr className="border-0 border-t border-[rgba(255,255,255,0.07)] my-1.5 mb-2.5" />

      <div className="flex flex-col gap-0.5 text-xs text-[#a78bfa] font-semibold mb-1 tracking-[0.2px]">
        <span>📅 {props.eventDate}</span>
        <span>🕒 {props.eventTime}</span>
      </div>

      <div className="text-[12.5px] leading-relaxed text-[rgba(248,250,252,0.55)] mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
        Address:{' '}
        {props.eventAddress ? (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(props.eventAddress)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[rgba(248,250,252,0.55)] no-underline border-b border-dashed border-[rgba(167,139,250,0.3)] transition-colors duration-200 hover:text-[#a78bfa] hover:border-[#a78bfa]">
            {props.eventAddress}
          </a>
        ) : (
          'No address'
        )}
      </div>

      {hostName && (
        <div className="mt-1.5 mb-0.5 text-[0.82rem] text-[rgba(248,250,252,0.45)] whitespace-nowrap overflow-hidden text-ellipsis">
          Hosted by{' '}
          <button
            type="button"
            className="bg-none border-none p-0 cursor-pointer text-[#a78bfa] text-[0.82rem] font-semibold no-underline hover:underline hover:text-[#c4b5fd] transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              if (hostId) navigate(`/users/${hostId}`);
            }}>
            {hostName}
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-[5px] mt-2">
        {tags.slice(0, 3).map((tag, idx) => (
          <TagComponent key={idx} Interest={tag} />
        ))}
      </div>

      {attendError && (
        <p className="text-[0.78rem] text-[#f87171] mt-1.5 mb-0.5 leading-snug" role="alert">
          {attendError}
        </p>
      )}

      <div className="flex justify-end items-center gap-2 mt-2.5">
        {!isAuthenticated ? (
          <button
            className="px-3.5 py-1.5 rounded-[7px] border border-dashed border-[rgba(124,58,237,0.4)] bg-transparent text-[#7c3aed] font-semibold text-xs cursor-pointer tracking-[0.2px] transition-[background,border-color] duration-200 hover:bg-[rgba(124,58,237,0.08)] hover:border-[#7c3aed]"
            onClick={openSignIn}>
            Sign in to join
          </button>
        ) : isHost ? (
          <button
            className="px-3.5 py-1.5 rounded-[7px] border-none bg-[#7b1fa2] text-white font-semibold text-xs cursor-pointer tracking-[0.2px] transition-[background,box-shadow] duration-200 hover:bg-[#4a148c] hover:shadow-[0_0_12px_rgba(123,31,162,0.55)]"
            onClick={handleEdit}>
            Edit Event
          </button>
        ) : (
          <button
            className={`px-3.5 py-1.5 rounded-[7px] border-none text-white font-semibold text-xs cursor-pointer tracking-[0.2px] transition-[background,box-shadow] duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
              isAttending
                ? 'bg-[#c62828] hover:bg-[#8e1a1a] hover:shadow-[0_0_12px_rgba(198,40,40,0.55)]'
                : 'bg-[#2e7d32] hover:bg-[#1b5e20] hover:shadow-[0_0_12px_rgba(46,125,50,0.55)]'
            }`}
            onClick={handleAttend}
            disabled={attendBusy}>
            {attendBusy ? '…' : isAttending ? 'Leave Event' : 'Join Event'}
          </button>
        )}

        {isAuthenticated && (
          <button
            className="px-3.5 py-1.5 rounded-[7px] border-none bg-[#7c3aed] text-white font-bold text-xs cursor-pointer tracking-[0.2px] transition-[background,box-shadow] duration-200 hover:bg-[#6d28d9] hover:shadow-[0_4px_14px_rgba(124,58,237,0.35)]"
            type="button"
            onClick={goToEventDetails}>
            View Event
          </button>
        )}
      </div>
    </div>
  );
}
