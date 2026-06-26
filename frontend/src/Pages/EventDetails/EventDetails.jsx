import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar/Navbar';
import { useAuth } from '../../Hooks/UseAuth.ts';
import { useEventId } from '../../Hooks/UseEvents';
import useInterests from '../../Hooks/UseInterests';
import { useToast } from '../../Components/Toast/ToastContext.jsx';
import Multiselect from '@cloudscape-design/components/multiselect';

const MAX_TITLE_LENGTH = 75;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const AVATAR_COLORS = [
  '#5B8DEF', '#E0756B', '#6BBFA0', '#C97DD4',
  '#E0A76B', '#6B9ED4', '#85C26B', '#D46B8A',
];
function avatarColor(id) {
  if (!id) return AVATAR_COLORS[0];
  const hash = [...String(id)].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function Avatar({ id, name, profileImage, size = 'sm', style = {} }) {
  const sizeStyle = size === 'sm'
    ? { width: 30, height: 30, fontSize: 10 }
    : { width: 38, height: 38, fontSize: 13 };

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    fontWeight: 700,
    color: '#fff',
    border: '2px solid #111111',
    flexShrink: 0,
    userSelect: 'none',
    fontFamily: "'Consolas', monospace",
    transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
    ...sizeStyle,
    ...style,
  };

  if (profileImage) {
    return (
      <span style={{ ...base, background: 'transparent', overflow: 'hidden', padding: 0 }} title={name || id}>
        <img
          src={profileImage}
          alt={name || 'attendee'}
          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
        />
      </span>
    );
  }
  return (
    <span style={{ ...base, background: avatarColor(id) }} title={name || id}>
      {getInitials(name)}
    </span>
  );
}

function getUserAvatar(userLike) {
  return userLike?.avatar || userLike?.profileImage || null;
}

// ─── Avatar Stack ─────────────────────────────────────────────────────────────

function AttendeeAvatarStack({ attendees, resolvedUsers, total, onClick }) {
  const preview = attendees.slice(0, 4);
  const overflow = total - preview.length;

  return (
    <button
      type="button"
      className="attendee-stack inline-flex items-center gap-3 bg-transparent border-none p-0 cursor-pointer rounded-full appearance-none text-left shadow-none hover:bg-transparent focus:bg-transparent active:bg-transparent focus-visible:outline-none"
      style={{ gap: total === 0 ? 0 : undefined }}
      onClick={onClick}
      aria-label={`View all ${total} attendees`}>
      {total > 0 && (
        <div className="attendee-stack__avatars flex items-center py-[2px] transition-transform duration-200">
          {preview.map((a, i) => {
            const id = typeof a === 'object' ? a._id : a;
            const user = resolvedUsers[id] || {};
            return (
              <Avatar
                key={id || i}
                id={id}
                name={user.name}
                profileImage={getUserAvatar(user)}
                size="sm"
                style={{ zIndex: preview.length - i, marginLeft: i === 0 ? 0 : '-8px' }}
              />
            );
          })}
          {overflow > 0 && (
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 30, height: 30, borderRadius: '50%', fontWeight: 700, color: 'rgba(255,255,255,0.55)',
                border: '2px solid rgba(255,255,255,0.12)', fontFamily: "'Consolas', monospace",
                fontSize: 10, background: 'rgba(255,255,255,0.08)', marginLeft: '-8px', flexShrink: 0,
              }}>
              +{overflow}
            </span>
          )}
        </div>
      )}
      <span className="attendee-stack__label inline-flex items-center gap-[0.35rem] text-[0.875rem] text-[#a78bfa] font-semibold transition-[color,transform] duration-200">
        {total === 0
          ? 'No attendees yet'
          : `${total} ${total === 1 ? 'person' : 'people'} going →`}
      </span>
    </button>
  );
}

// ─── Attendees Modal ──────────────────────────────────────────────────────────

function AttendeesModal({ attendees, resolvedUsers, loading, onClose, onNavigate }) {
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-[rgba(0,0,0,0.75)] flex items-center justify-center z-[5000] backdrop-blur-[4px] [animation:backdrop-in_0.15s_ease]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Attendees list">
      <div
        className="bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-[18px] w-[min(420px,90vw)] max-h-[70vh] flex flex-col shadow-[0_24px_60px_rgba(0,0,0,0.6)] overflow-hidden [animation:modal-in_0.2s_cubic-bezier(0.16,1,0.3,1)]"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-[18px] pb-[14px] border-b border-[rgba(255,255,255,0.06)]">
          <h3 className="m-0 text-[1rem] font-bold text-white font-[Consolas,monospace] flex items-center gap-2">
            Attendees
            <span className="bg-[rgba(124,58,237,0.18)] border border-[rgba(124,58,237,0.35)] text-[#a78bfa] text-[0.7rem] font-bold px-2 py-[2px] rounded-[20px] tracking-[0.03em] font-[Consolas,monospace]">
              {attendees.length}
            </span>
          </h3>
          <button
            type="button"
            className="bg-none border-[1.5px] border-[rgba(255,255,255,0.15)] text-[rgba(255,255,255,0.45)] text-[0.78rem] cursor-pointer py-1 px-[9px] rounded-[6px] leading-[1.4] transition-[border-color,color] duration-200 hover:border-[rgba(255,255,255,0.4)] hover:text-white"
            onClick={onClose}
            aria-label="Close">
            ✕
          </button>
        </div>

        <div
          className="overflow-y-auto p-2 flex-1"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(124,58,237,0.3) transparent' }}>
          {loading ? (
            <div className="text-center py-8 px-4 text-[rgba(255,255,255,0.3)] text-[0.875rem] flex flex-col items-center gap-3 font-[Consolas,monospace]">
              <span className="inline-block w-[22px] h-[22px] border-2 border-[rgba(124,58,237,0.2)] border-t-[#7c3aed] rounded-full [animation:spin_0.7s_linear_infinite]" />
              Loading attendees…
            </div>
          ) : attendees.length === 0 ? (
            <p className="text-center py-8 px-4 text-[rgba(255,255,255,0.3)] text-[0.875rem] font-[Consolas,monospace] m-0">
              No one has joined yet. Be the first!
            </p>
          ) : (
            attendees.map((a, i) => {
              const id = typeof a === 'object' ? a._id : a;
              const user = resolvedUsers[id];
              return (
                <button
                  key={id || i}
                  type="button"
                  className="flex items-center gap-3 py-2 px-3 rounded-[10px] transition-[background] duration-150 w-full bg-none border-none cursor-pointer text-left font-[inherit] hover:bg-[rgba(124,58,237,0.08)]"
                  onClick={() => id && onNavigate(`/users/${id}`)}>
                  <Avatar id={id} name={user?.name} profileImage={getUserAvatar(user)} size="md" />
                  <span className="text-[0.9rem] font-medium text-[rgba(255,255,255,0.85)] flex-1">
                    {user?.name || (
                      <span className="text-[rgba(255,255,255,0.25)] italic font-[Consolas,monospace] text-[0.8rem]">Loading…</span>
                    )}
                  </span>
                  <span className="attendee-row__arrow text-[rgba(167,139,250,0.4)] text-[0.85rem] ml-auto transition-[color,transform] duration-150">→</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { event: rawEvent, loading, error: fetchError } = useEventId(id);
  const { interests: allInterests } = useInterests();
  const toast = useToast();

  const [event, setEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editErrors, setEditErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [currentUserName, setCurrentUserName] = useState('');

  const [attendBusy, setAttendBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [resolvedUsers, setResolvedUsers] = useState({});
  const [attendeeNamesLoading, setAttendeeNamesLoading] = useState(false);

  const [comments, setComments] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [hostName, setHostName] = useState('');

  React.useEffect(() => {
    if (rawEvent) {
      setEvent(rawEvent);
      setSelectedInterests(
        (rawEvent.interests || []).map((i) => ({
          label: typeof i === 'object' ? i.name : i,
          value: typeof i === 'object' ? i.name : i,
        }))
      );
    }
  }, [rawEvent]);

  useEffect(() => {
    const attendeeIds = (event?.attendees || [])
      .map((a) => (typeof a === 'object' ? a._id : a))
      .filter(Boolean);
    const commenterIds = (comments?.messages || [])
      .map((m) => typeof m.userId === 'object' ? m.userId?._id || null : m.userId)
      .filter(Boolean);
    const idsToFetch = [...new Set([...attendeeIds, ...commenterIds])];
    if (!idsToFetch.length) return;

    setAttendeeNamesLoading(true);
    Promise.all(
      idsToFetch.map((uid) =>
        fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${uid}`)
          .then((r) => r.json())
          .then((json) => ({ id: uid, name: json.success ? json.data?.name || 'Unknown' : 'Unknown', avatar: json.success ? getUserAvatar(json.data) : null }))
          .catch(() => ({ id: uid, name: 'Unknown', avatar: null }))
      )
    )
      .then((results) => {
        setResolvedUsers((prev) => {
          const next = { ...prev };
          results.forEach(({ id, name, avatar }) => { next[id] = { name, avatar }; });
          return next;
        });
      })
      .finally(() => setAttendeeNamesLoading(false));
  }, [event?.attendees, comments?.messages]);

  const handleOpenAttendees = () => setShowAttendeesModal(true);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setShowDeleteConfirm(false); };
    if (showDeleteConfirm) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showDeleteConfirm]);

  useEffect(() => {
    const fetchComments = async () => {
      setCommentsLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/comments/event/${id}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
          await fetch(`${import.meta.env.VITE_API_BASE_URL}/comments/event/${id}`, { method: 'POST' });
          setComments({ messages: [] });
        } else {
          setComments(json.data);
        }
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        setCommentsLoading(false);
      }
    };
    fetchComments();
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    const fetchUser = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${user.id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const json = await res.json();
        if (res.ok && json.success) setCurrentUserName(json.data.name || '');
      } catch (err) {
        console.error('Failed to fetch user name:', err);
      }
    };
    fetchUser();
  }, [isAuthenticated, user]);

  useEffect(() => {
    const host = event?.host;
    if (!host) return;
    if (typeof host === 'object' && host.name) { setHostName(host.name); return; }
    const hostId = typeof host === 'object' ? host._id : host;
    if (!hostId) return;
    fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${hostId}`)
      .then((res) => res.json())
      .then((json) => { if (json.success && json.data?.name) setHostName(json.data.name); })
      .catch(() => {});
  }, [event?.host]);

  if (loading) return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center text-[rgba(255,255,255,0.5)] font-[Consolas,monospace]">
      Loading event…
    </div>
  );
  if (fetchError) return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center text-[#f87171] font-[Consolas,monospace]">
      {fetchError}
    </div>
  );
  if (!event) return null;

  const isHost = event?.host?._id === user?.id || event?.host === user?.id;
  const isAttending = event?.attendees?.some((a) => (typeof a === 'object' ? a._id : a) === user?.id);
  const interestOptions = allInterests.map((i) => ({ label: i.name, value: i.name }));

  const validateEdit = () => {
    const errors = {};
    const now = new Date();
    if (!event.name?.trim()) errors.name = 'Title is required.';
    else if (event.name.length > MAX_TITLE_LENGTH) errors.name = `Title cannot exceed ${MAX_TITLE_LENGTH} characters.`;
    if (!event.description?.trim()) errors.description = 'Description is required.';
    if (!event.time?.start) errors.startTime = 'Start time is required.';
    else if (new Date(event.time.start) <= now) errors.startTime = 'Start time must be in the future.';
    if (!event.time?.end) errors.endTime = 'End time is required.';
    else if (new Date(event.time.end) <= new Date(event.time.start)) errors.endTime = 'End time must be after start time.';
    if (selectedInterests.length === 0) errors.interests = 'Select at least one interest.';
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAttend = async () => {
    if (!isAuthenticated || !user?.id || attendBusy) return;
    const wasAttending = isAttending;
    const route = wasAttending ? 'remove' : 'add';
    setAttendBusy(true);
    setEvent((prev) => ({
      ...prev,
      attendees: wasAttending
        ? (prev.attendees || []).filter((a) => (typeof a === 'object' ? a._id : a) !== user.id)
        : [...(prev.attendees || []), user.id],
    }));
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/events/${id}/attendees/${route}/${user.id}`,
        { method: 'PUT', headers: { Authorization: `Bearer ${user.token}` } }
      );
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || 'Failed to update attendance');
      }
    } catch (err) {
      setEvent((prev) => ({
        ...prev,
        attendees: wasAttending
          ? [...(prev.attendees || []), user.id]
          : (prev.attendees || []).filter((a) => (typeof a === 'object' ? a._id : a) !== user.id),
      }));
      setActionError(err.message || 'Could not update attendance. Try again.');
    } finally {
      setAttendBusy(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateEdit()) return;
    try {
      const payload = {
        name: event.name,
        description: event.description,
        address: event.address,
        interests: selectedInterests.map((o) => o.value),
        time: { start: event.time.start, end: event.time.end },
      };
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to update');
      setEvent((prev) => ({ ...prev, ...payload }));
      setIsEditing(false);
      setEditErrors({});
      setActionError('');
    } catch (err) {
      setActionError(err.message || 'Could not save changes. Try again.');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to delete');
      toast.success('Event deleted successfully.');
      navigate('/home');
    } catch (err) {
      toast.error(err.message || 'Failed to delete event.');
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !user) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/comments/event/${id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({
          name: user.name || currentUserName || 'Anonymous',
          avatar: user.avatar || null,
          message: commentText,
          userId: user.id || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to post comment');
      setComments(json.data);
      setCommentText('');
      setActionError('');
    } catch (err) {
      setActionError(err.message || 'Could not post comment. Try again.');
    }
  };

  const toInputValue = (iso) => (iso ? iso.slice(0, 16) : '');
  const interests = event.interests || [];
  const attendees = event.attendees || [];

  const inputCls = "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-[10px] py-3 px-4 text-[0.9rem] text-white outline-none w-full box-border transition-[border-color,box-shadow] duration-200 font-[inherit] focus:border-[#7c3aed] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.18)]";
  const inputErrCls = "!border-[#f87171] !shadow-[0_0_0_3px_rgba(248,113,113,0.15)]";
  const btnPrimary = "py-[0.6rem] px-[1.4rem] rounded-[10px] text-[0.88rem] font-bold cursor-pointer border-none bg-[#7c3aed] text-white shadow-[0_4px_14px_rgba(124,58,237,0.3)] transition-all duration-200 ease-[ease] tracking-[0.03em] font-[inherit] disabled:opacity-35 disabled:cursor-not-allowed hover:not(:disabled):bg-[#6d28d9] hover:not(:disabled):-translate-y-px hover:not(:disabled):shadow-[0_6px_20px_rgba(124,58,237,0.45)]";
  const btnGhost = "py-[0.6rem] px-[1.4rem] rounded-[10px] text-[0.88rem] font-bold cursor-pointer bg-transparent border-[1.5px] border-[rgba(255,255,255,0.15)] text-[rgba(255,255,255,0.65)] transition-all duration-200 ease-[ease] tracking-[0.03em] font-[inherit] hover:border-[rgba(255,255,255,0.4)] hover:text-white hover:bg-[rgba(255,255,255,0.04)]";
  const btnDanger = "py-[0.6rem] px-[1.4rem] rounded-[10px] text-[0.88rem] font-bold cursor-pointer bg-transparent border-[1.5px] border-[rgba(248,113,113,0.35)] text-[#f87171] transition-all duration-200 ease-[ease] tracking-[0.03em] font-[inherit] hover:bg-[rgba(248,113,113,0.08)] hover:border-[#f87171]";

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <Navbar page="/" />

      <div className="max-w-[820px] mx-auto px-6 pt-[calc(var(--nav-h,72px)+28px)] pb-20 max-[680px]:px-4 max-[680px]:pt-[calc(var(--nav-h,72px)+20px)] max-[680px]:pb-16 max-[400px]:px-3">
        <button
          className="bg-none border-none text-[rgba(255,255,255,0.62)] text-[0.82rem] cursor-pointer p-0 mb-7 transition-colors duration-200 font-[Consolas,monospace] tracking-[0.04em] inline-flex items-center gap-[6px] hover:text-[#a78bfa]"
          onClick={() => navigate(-1)}>
          ← Back
        </button>

        <form
          className="bg-[#111111] border border-[rgba(255,255,255,0.07)] rounded-[24px] overflow-hidden shadow-[0_0_0_1px_rgba(124,58,237,0.06),0_32px_80px_rgba(0,0,0,0.6)]"
          onSubmit={handleUpdate}
          noValidate>
          {/* ── Header band ── */}
          <div className="ed-header bg-gradient-to-br from-[#1a0533] via-[#0f0f1a] to-[#120528] border-b border-[rgba(124,58,237,0.15)] px-10 py-8 flex items-start gap-6 relative overflow-hidden max-[680px]:px-5 max-[680px]:py-6 max-[680px]:gap-4 max-[400px]:flex-col max-[400px]:gap-3">
            <div className="w-[68px] h-[68px] min-w-[68px] rounded-[16px] bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] flex items-center justify-center text-[1.8rem] font-extrabold text-white font-[Consolas,monospace] shadow-[0_8px_24px_rgba(124,58,237,0.35)] flex-shrink-0 max-[680px]:w-[52px] max-[680px]:h-[52px] max-[680px]:min-w-[52px] max-[680px]:text-[1.4rem] max-[680px]:rounded-[12px] max-[400px]:w-11 max-[400px]:h-11 max-[400px]:min-w-11 max-[400px]:text-[1.2rem]">
              {(event.name?.charAt(0) || '?').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="flex flex-col gap-1">
                  <input
                    className={`${inputCls} ${editErrors.name ? inputErrCls : ''}`}
                    value={event.name}
                    maxLength={MAX_TITLE_LENGTH}
                    onChange={(e) => setEvent({ ...event, name: e.target.value })}
                  />
                  <div className="text-[0.7rem] text-[rgba(255,255,255,0.42)] text-right font-[Consolas,monospace]">
                    {event.name?.length || 0}/{MAX_TITLE_LENGTH}
                  </div>
                  {editErrors.name && <span className="text-[0.74rem] text-[#f87171] font-[Consolas,monospace]">{editErrors.name}</span>}
                </div>
              ) : (
                <h2 className="m-0 mb-2 text-[1.65rem] font-extrabold text-white font-[Consolas,monospace] leading-[1.25] tracking-[-0.01em] max-[680px]:text-[1.35rem] max-[400px]:text-[1.2rem]">
                  {event.name}
                </h2>
              )}
              <p className="ed-sub text-[#a78bfa] text-[0.85rem] m-0 mb-[0.4rem] font-[Consolas,monospace] flex items-center gap-[6px]">
                {new Date(event.time.start).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}{' '}
                –{' '}
                {new Date(event.time.end).toLocaleString(undefined, { hour: 'numeric', minute: '2-digit' })}
              </p>
              {hostName && (() => {
                const hostId = typeof event.host === 'object' ? event.host?._id : event.host;
                return (
                  <p className="m-0 mt-[0.3rem] text-[0.84rem] text-[rgba(255,255,255,0.65)]">
                    Hosted by{' '}
                    <button
                      type="button"
                      className="bg-none border-none p-0 cursor-pointer text-[rgba(167,139,250,0.8)] font-semibold text-[0.84rem] transition-colors duration-200 hover:text-[#a78bfa] hover:underline"
                      onClick={() => hostId && navigate(`/users/${hostId}`)}>
                      {hostName}
                    </button>
                  </p>
                );
              })()}
            </div>
          </div>

          {/* ── Body ── */}
          <div className="px-10 py-8 max-[680px]:px-5 max-[680px]:py-6 max-[400px]:px-4 max-[400px]:py-4">
            <div className="grid grid-cols-2 gap-7 mb-8 max-[680px]:grid-cols-1 max-[680px]:gap-5">

              {/* Description */}
              <div className="col-span-2 max-[680px]:col-span-1 flex flex-col gap-2">
                <label className="text-[0.68rem] uppercase tracking-[0.1em] text-[rgba(255,255,255,0.55)] font-bold font-[Consolas,monospace]">Description</label>
                {isEditing ? (
                  <>
                    <textarea
                      className={`${inputCls} resize-y min-h-[110px] leading-[1.6] ${editErrors.description ? inputErrCls : ''}`}
                      value={event.description}
                      onChange={(e) => setEvent({ ...event, description: e.target.value })}
                    />
                    {editErrors.description && <span className="text-[0.74rem] text-[#f87171] font-[Consolas,monospace]">{editErrors.description}</span>}
                  </>
                ) : (
                  <p className="text-[rgba(255,255,255,0.82)] text-[0.95rem] m-0 leading-[1.65]">{event.description}</p>
                )}
              </div>

              {/* Address */}
              <div className="col-span-2 max-[680px]:col-span-1 flex flex-col gap-2">
                <label className="text-[0.68rem] uppercase tracking-[0.1em] text-[rgba(255,255,255,0.55)] font-bold font-[Consolas,monospace]">Location</label>
                {isEditing ? (
                  <input
                    className={inputCls}
                    value={event.address}
                    onChange={(e) => setEvent({ ...event, address: e.target.value })}
                  />
                ) : (
                  <a
                    className="ed-address-link text-[#a78bfa] text-[0.9rem] no-underline inline-flex items-center gap-[6px] transition-colors duration-200 border-b border-dashed border-[rgba(124,58,237,0.35)] w-fit pb-px hover:text-white hover:border-[#7c3aed]"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}`}
                    target="_blank"
                    rel="noopener noreferrer">
                    {event.address}
                  </a>
                )}
              </div>

              {/* Start Time */}
              {isEditing && (
                <div className="flex flex-col gap-2">
                  <label className="text-[0.68rem] uppercase tracking-[0.1em] text-[rgba(255,255,255,0.55)] font-bold font-[Consolas,monospace]">Start</label>
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <input
                      type="date"
                      className={`${inputCls} [color-scheme:dark] ${editErrors.startTime ? inputErrCls : ''}`}
                      value={toInputValue(event.time.start).slice(0, 10)}
                      onChange={(e) => setEvent({ ...event, time: { ...event.time, start: `${e.target.value}T${toInputValue(event.time.start).slice(11) || '09:00'}` } })}
                    />
                    <input
                      type="time"
                      className={`${inputCls} w-[110px] [color-scheme:dark] ${editErrors.startTime ? inputErrCls : ''}`}
                      value={toInputValue(event.time.start).slice(11, 16)}
                      onChange={(e) => setEvent({ ...event, time: { ...event.time, start: `${toInputValue(event.time.start).slice(0, 10)}T${e.target.value}` } })}
                    />
                  </div>
                  {editErrors.startTime && <span className="text-[0.74rem] text-[#f87171] font-[Consolas,monospace]">{editErrors.startTime}</span>}
                </div>
              )}

              {/* End Time */}
              {isEditing && (
                <div className="flex flex-col gap-2">
                  <label className="text-[0.68rem] uppercase tracking-[0.1em] text-[rgba(255,255,255,0.55)] font-bold font-[Consolas,monospace]">End</label>
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <input
                      type="date"
                      className={`${inputCls} [color-scheme:dark] ${editErrors.endTime ? inputErrCls : ''}`}
                      value={toInputValue(event.time.end).slice(0, 10)}
                      onChange={(e) => setEvent({ ...event, time: { ...event.time, end: `${e.target.value}T${toInputValue(event.time.end).slice(11) || '10:00'}` } })}
                    />
                    <input
                      type="time"
                      className={`${inputCls} w-[110px] [color-scheme:dark] ${editErrors.endTime ? inputErrCls : ''}`}
                      value={toInputValue(event.time.end).slice(11, 16)}
                      onChange={(e) => setEvent({ ...event, time: { ...event.time, end: `${toInputValue(event.time.end).slice(0, 10)}T${e.target.value}` } })}
                    />
                  </div>
                  {editErrors.endTime && <span className="text-[0.74rem] text-[#f87171] font-[Consolas,monospace]">{editErrors.endTime}</span>}
                </div>
              )}

              {/* Attendees */}
              <div className="col-span-2 max-[680px]:col-span-1 flex flex-col gap-2">
                <label className="text-[0.68rem] uppercase tracking-[0.1em] text-[rgba(255,255,255,0.55)] font-bold font-[Consolas,monospace]">Attendees</label>
                <AttendeeAvatarStack
                  attendees={attendees}
                  resolvedUsers={resolvedUsers}
                  total={attendees.length}
                  onClick={handleOpenAttendees}
                />
              </div>

              {/* Interests */}
              <div className="col-span-2 max-[680px]:col-span-1 flex flex-col gap-2">
                <label className="text-[0.68rem] uppercase tracking-[0.1em] text-[rgba(255,255,255,0.55)] font-bold font-[Consolas,monospace]">Interests</label>
                {isEditing ? (
                  <>
                    <Multiselect
                      selectedOptions={selectedInterests}
                      onChange={({ detail }) => {
                        setSelectedInterests(detail.selectedOptions);
                        setEditErrors((prev) => ({ ...prev, interests: null }));
                      }}
                      options={interestOptions}
                      filteringType="auto"
                      placeholder="Select interests"
                    />
                    {editErrors.interests && <span className="text-[0.74rem] text-[#f87171] font-[Consolas,monospace]">{editErrors.interests}</span>}
                  </>
                ) : (
                  <div className="flex flex-wrap gap-[7px]">
                    {interests.map((i, idx) => (
                      <span key={idx} className="bg-[rgba(124,58,237,0.15)] border border-[rgba(124,58,237,0.35)] text-[#c4b5fd] text-[0.76rem] font-semibold py-[0.28rem] px-[0.7rem] rounded-[20px] font-[Consolas,monospace] tracking-[0.03em]">
                        {typeof i === 'object' ? i.name : i}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Inline error banner ── */}
          {actionError && (
            <div
              className="flex items-center justify-between gap-3 bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.3)] text-[#fca5a5] rounded-[10px] py-[0.65rem] px-4 mx-10 text-[0.875rem] leading-[1.4] max-[680px]:mx-5 max-[400px]:mx-4"
              role="alert">
              {actionError}
              <button
                type="button"
                className="bg-none border-none text-[#fca5a5] text-[1.1rem] leading-none cursor-pointer py-0 px-[0.2rem] flex-shrink-0 opacity-70 transition-opacity duration-150 hover:opacity-100"
                onClick={() => setActionError('')}
                aria-label="Dismiss error">
                ×
              </button>
            </div>
          )}

          {/* ── Actions ── */}
          <div className="flex gap-3 flex-wrap px-10 py-6 border-t border-[rgba(255,255,255,0.06)] max-[680px]:px-5 max-[680px]:py-5 max-[400px]:px-4 max-[400px]:py-4">
            {isAuthenticated && !isHost && (
              <button type="button" className={btnPrimary} onClick={handleAttend} disabled={attendBusy}>
                {attendBusy ? '…' : isAttending ? 'Leave Event' : 'Join Event'}
              </button>
            )}

            {isAuthenticated && isHost && (
              <>
                <button
                  type={isEditing ? 'submit' : 'button'}
                  className={btnPrimary}
                  onClick={(e) => { if (!isEditing) { e.preventDefault(); setIsEditing(true); } }}>
                  {isEditing ? 'Save Changes' : 'Edit Event'}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    className={btnGhost}
                    onClick={() => { setIsEditing(false); setEditErrors({}); setEvent(rawEvent); }}>
                    Cancel
                  </button>
                )}
                <button type="button" className={btnDanger} onClick={() => setShowDeleteConfirm(true)}>
                  Delete Event
                </button>
              </>
            )}
          </div>

          {/* ── Comments ── */}
          {isAuthenticated && (isHost || isAttending) ? (
            <div className="px-10 pb-8 border-t border-[rgba(255,255,255,0.06)] pt-7 max-[680px]:px-5 max-[680px]:pb-6 max-[400px]:px-4 max-[400px]:py-4">
              <div className="flex items-center gap-[0.6rem] mb-6">
                <h3 className="text-[0.95rem] font-bold text-white m-0 font-[Consolas,monospace] tracking-[0.04em]">Comments</h3>
                {comments?.messages?.length > 0 && (
                  <span className="bg-[rgba(124,58,237,0.18)] border border-[rgba(124,58,237,0.35)] text-[#a78bfa] text-[0.66rem] font-bold px-[7px] py-[1px] rounded-[20px] tracking-[0.03em] font-[Consolas,monospace]">
                    {comments.messages.length}
                  </span>
                )}
              </div>

              {commentsLoading ? (
                <p className="text-[rgba(255,255,255,0.5)] text-[0.875rem] text-center py-6">Loading comments…</p>
              ) : !comments?.messages?.length ? (
                <p className="text-[rgba(255,255,255,0.5)] text-[0.875rem] text-center py-6">No comments yet. Be the first!</p>
              ) : (
                <div className="flex flex-col gap-[2px] mb-5">
                  {comments.messages.map((msg, i) => {
                    const commentUserId = typeof msg.userId === 'object' ? msg.userId?._id || null : msg.userId;
                    const commenterUser =
                      (typeof msg.userId === 'object' ? msg.userId : null) ||
                      (commentUserId && resolvedUsers[commentUserId]) ||
                      Object.values(resolvedUsers).find((u) => u.name === msg.name);
                    return (
                      <div key={i} className="flex gap-3 py-3 px-[0.6rem] rounded-[12px] transition-[background] duration-150 hover:bg-[rgba(255,255,255,0.03)]">
                        <Avatar
                          id={msg.name}
                          name={msg.name}
                          profileImage={getUserAvatar(commenterUser)}
                          size="sm"
                          style={{ width: 34, height: 34, fontSize: '0.75rem', marginTop: '1px', border: 'none' }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-3 mb-[0.3rem] w-full">
                            <button
                              type="button"
                              className="bg-none border-none p-0 text-[0.84rem] font-bold text-white font-[Consolas,monospace] min-w-0 cursor-pointer transition-colors duration-150 text-left hover:text-[#a78bfa] hover:underline"
                              onClick={() => commentUserId && navigate(`/users/${commentUserId}`)}>
                              {msg.name}
                            </button>
                            <span className="text-[0.7rem] text-[rgba(255,255,255,0.42)] font-[Consolas,monospace] flex-shrink-0 ml-auto pr-1 text-right whitespace-nowrap">
                              {msg.createdAt && new Date(msg.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="m-0 text-[0.9rem] text-[rgba(255,255,255,0.7)] leading-[1.55] break-words">{msg.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-3 items-center pt-4 border-t border-[rgba(255,255,255,0.05)] mt-1">
                <Avatar
                  id={user?.id}
                  name={currentUserName || user?.name}
                  profileImage={getUserAvatar(resolvedUsers[user?.id]) || user?.avatar || null}
                  size="sm"
                  style={{ width: 34, height: 34, fontSize: '0.75rem', border: 'none', flexShrink: 0 }}
                />
                <div className="flex-1 flex items-center bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.09)] rounded-[24px] px-[14px] pr-[6px] gap-[6px] transition-[border-color,box-shadow] duration-200 focus-within:border-[rgba(124,58,237,0.45)] focus-within:shadow-[0_0_0_3px_rgba(124,58,237,0.08)]">
                  <input
                    className="flex-1 bg-none border-none outline-none py-[0.65rem] text-[0.875rem] text-[rgba(255,255,255,0.85)] font-[inherit] placeholder:text-[rgba(255,255,255,0.2)]"
                    placeholder="Write a comment…"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
                  />
                  <button
                    type="button"
                    className="w-8 h-8 min-w-8 aspect-square rounded-full p-0 box-border bg-[#7c3aed] border-none text-white text-[1rem] leading-none cursor-pointer flex items-center justify-center transition-[background,transform] duration-200 flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed hover:not(:disabled):bg-[#6d28d9] hover:not(:disabled):scale-[1.08]"
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                    aria-label="Post comment">
                    ↑
                  </button>
                </div>
              </div>
            </div>
          ) : isAuthenticated ? (
            <div className="flex flex-col items-center gap-2 py-6 text-[rgba(255,255,255,0.5)] text-[0.875rem] font-[Consolas,monospace] border-t border-[rgba(255,255,255,0.06)] mx-10 max-[680px]:mx-5 max-[400px]:mx-4">
              <span className="text-[1.4rem] opacity-35">🔒</span>
              <p className="text-[rgba(255,255,255,0.55)] m-0">Join the event to see and post comments.</p>
            </div>
          ) : null}
        </form>
      </div>

      {/* ── Attendees Modal ── */}
      {showAttendeesModal && (
        <AttendeesModal
          attendees={attendees}
          resolvedUsers={resolvedUsers}
          loading={attendeeNamesLoading}
          onClose={() => setShowAttendeesModal(false)}
          onNavigate={navigate}
        />
      )}

      {/* ── Delete Confirmation ── */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.75)] backdrop-blur-[4px] z-[5000] flex items-center justify-center [animation:backdrop-in_0.15s_ease]"
          onClick={() => setShowDeleteConfirm(false)}>
          <div
            className="bg-[#141414] border border-[rgba(255,255,255,0.1)] rounded-[18px] p-8 w-full max-w-[420px] shadow-[0_24px_60px_rgba(0,0,0,0.6)] [animation:modal-in_0.2s_cubic-bezier(0.16,1,0.3,1)] max-[400px]:p-6 max-[400px]:mx-3"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="m-0 mb-3 text-[1.1rem] font-bold text-white font-[Consolas,monospace]">Delete Event</h3>
            <p className="m-0 mb-6 text-[rgba(255,255,255,0.55)] text-[0.9rem] leading-[1.6]">
              Are you sure you want to delete <strong>{event.name}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3 items-center">
              <button className={btnGhost} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className={btnDanger} onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
