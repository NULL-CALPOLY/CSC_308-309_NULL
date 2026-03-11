import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EventDetails.css';
import Navbar from '../../Components/Navbar/Navbar';
import { useAuth } from '../../Hooks/UseAuth.ts';
import { useEventId } from '../../Hooks/UseEvents';
import useInterests from '../../Hooks/UseInterests';
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

// Deterministic fallback color when no profile image is available
const AVATAR_COLORS = [
  '#5B8DEF',
  '#E0756B',
  '#6BBFA0',
  '#C97DD4',
  '#E0A76B',
  '#6B9ED4',
  '#85C26B',
  '#D46B8A',
];
function avatarColor(id) {
  if (!id) return AVATAR_COLORS[0];
  const hash = [...String(id)].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

// Renders a single avatar: real photo if available, otherwise colored initials
function Avatar({ id, name, profileImage, size = 'sm', style = {} }) {
  const sizeClass = `attendee-avatar--${size}`;
  const w = style.width || '100%';
  const h = style.height || '100%';

  if (profileImage) {
    return (
      <span
        className={`attendee-avatar ${sizeClass}`}
        style={{
          background: 'transparent',
          overflow: 'hidden',
          padding: 0,
          flexShrink: 0,
          ...style,
        }}
        title={name || id}>
        <img
          src={profileImage}
          alt={name || 'attendee'}
          style={{
            width: w,
            height: h,
            borderRadius: '50%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </span>
    );
  }
  return (
    <span
      className={`attendee-avatar ${sizeClass}`}
      style={{ background: avatarColor(id), ...style }}
      title={name || id}>
      {getInitials(name)}
    </span>
  );
}

// ─── Avatar Stack ─────────────────────────────────────────────────────────────

function AttendeeAvatarStack({ attendees, resolvedUsers, total, onClick }) {
  const preview = attendees.slice(0, 4);
  const overflow = total - preview.length;

  return (
    <button
      type="button"
      className="attendee-stack"
      onClick={onClick}
      aria-label={`View all ${total} attendees`}>
      <div className="attendee-stack__avatars">
        {preview.map((a, i) => {
          const id = typeof a === 'object' ? a._id : a;
          const user = resolvedUsers[id] || {};
          return (
            <Avatar
              key={id || i}
              id={id}
              name={user.name}
              profileImage={user.profileImage}
              size="sm"
              style={{
                zIndex: preview.length - i,
                marginLeft: i === 0 ? 0 : '-8px',
              }}
            />
          );
        })}
        {overflow > 0 && (
          <span
            className="attendee-avatar attendee-avatar--sm attendee-avatar--overflow"
            style={{ marginLeft: '-8px' }}>
            +{overflow}
          </span>
        )}
      </div>
      <span className="attendee-stack__label">
        {total === 0
          ? 'No attendees yet'
          : `${total} ${total === 1 ? 'person' : 'people'} going →`}
      </span>
    </button>
  );
}

// ─── Attendees Modal ──────────────────────────────────────────────────────────

function AttendeesModal({ attendees, resolvedUsers, loading, onClose }) {
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="attendees-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Attendees list">
      <div className="attendees-modal" onClick={(e) => e.stopPropagation()}>
        <div className="attendees-modal__header">
          <h3>
            Attendees
            <span className="attendees-modal__count">{attendees.length}</span>
          </h3>
          <button
            type="button"
            className="attendees-modal__close"
            onClick={onClose}
            aria-label="Close">
            ✕
          </button>
        </div>

        <div className="attendees-modal__list">
          {loading ? (
            <div className="attendees-modal__loading">
              <span className="attendees-spinner" />
              Loading attendees…
            </div>
          ) : attendees.length === 0 ? (
            <p className="attendees-modal__empty">
              No one has joined yet. Be the first!
            </p>
          ) : (
            attendees.map((a, i) => {
              const id = typeof a === 'object' ? a._id : a;
              const user = resolvedUsers[id];
              return (
                <div key={id || i} className="attendee-row">
                  <Avatar
                    id={id}
                    name={user?.name}
                    profileImage={user?.profileImage}
                    size="md"
                  />
                  <span className="attendee-row__name">
                    {user?.name || (
                      <span className="attendee-row__loading-name">
                        Loading…
                      </span>
                    )}
                  </span>
                </div>
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

  const [event, setEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editErrors, setEditErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);

  // Attendees modal state
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [resolvedUsers, setResolvedUsers] = useState({}); // { userId: { name, profileImage } }
  const [attendeeNamesLoading, setAttendeeNamesLoading] = useState(false);

  // Comments state
  const [comments, setComments] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [currentUserName, setCurrentUserName] = useState(null);

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

  // ── Fetch all attendee profiles as soon as the event loads ─────────────
  useEffect(() => {
    if (!event?.attendees?.length) return;

    const idsToFetch = event.attendees
      .map((a) => (typeof a === 'object' ? a._id : a))
      .filter(Boolean);

    if (!idsToFetch.length) return;

    setAttendeeNamesLoading(true);
    Promise.all(
      idsToFetch.map((uid) =>
        fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${uid}`)
          .then((r) => r.json())
          .then((json) => ({
            id: uid,
            name: json.success ? json.data?.name || 'Unknown' : 'Unknown',
            profileImage: json.success ? json.data?.profileImage || null : null,
          }))
          .catch(() => ({ id: uid, name: 'Unknown', profileImage: null }))
      )
    )
      .then((results) => {
        setResolvedUsers((prev) => {
          const next = { ...prev };
          results.forEach(({ id, name, profileImage }) => {
            next[id] = { name, profileImage };
          });
          return next;
        });
      })
      .finally(() => setAttendeeNamesLoading(false));
  }, [event?.attendees]);

  const handleOpenAttendees = () => setShowAttendeesModal(true);

  // ── Fetch comments ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchComments = async () => {
      setCommentsLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/comments/event/${id}`
        );
        const json = await res.json();

        if (!res.ok || !json.success) {
          await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/comments/event/${id}`,
            { method: 'POST' }
          );
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

  // ── Fetch current user's name ─────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/users/${user.id}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        const json = await res.json();
        if (res.ok && json.success) {
          setCurrentUserName(json.data.name || '');
        }
      } catch (err) {
        console.error('Failed to fetch user name:', err);
      }
    };

    fetchUser();
  }, [isAuthenticated, user]);

  if (loading) return <div className="ed-loading">Loading event…</div>;
  if (fetchError)
    return <div className="ed-loading ed-error">{fetchError}</div>;
  if (!event) return null;

  const isHost = event?.host?._id === user?.id || event?.host === user?.id;
  const isAttending = event?.attendees?.some(
    (a) => (typeof a === 'object' ? a._id : a) === user?.id
  );

  const interestOptions = allInterests.map((i) => ({
    label: i.name,
    value: i.name,
  }));

  const validateEdit = () => {
    const errors = {};
    const now = new Date();

    if (!event.name?.trim()) {
      errors.name = 'Title is required.';
    } else if (event.name.length > MAX_TITLE_LENGTH) {
      errors.name = `Title cannot exceed ${MAX_TITLE_LENGTH} characters.`;
    }

    if (!event.description?.trim())
      errors.description = 'Description is required.';

    if (!event.time?.start) {
      errors.startTime = 'Start time is required.';
    } else if (new Date(event.time.start) <= now) {
      errors.startTime = 'Start time must be in the future.';
    }

    if (!event.time?.end) {
      errors.endTime = 'End time is required.';
    } else if (new Date(event.time.end) <= new Date(event.time.start)) {
      errors.endTime = 'End time must be after start time.';
    }

    if (selectedInterests.length === 0)
      errors.interests = 'Select at least one interest.';

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAttend = async () => {
    if (!isAuthenticated || !user?.id) return;
    const route = isAttending ? 'remove' : 'add';
    await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/events/${id}/attendees/${route}/${user.id}`,
      { method: 'PUT', headers: { Authorization: `Bearer ${user.token}` } }
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
    if (!validateEdit()) return;

    try {
      const payload = {
        name: event.name,
        description: event.description,
        address: event.address,
        interests: selectedInterests.map((o) => o.value),
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
      if (!res.ok || !json.success)
        throw new Error(json.message || 'Failed to update');

      setEvent((prev) => ({ ...prev, ...payload }));
      setIsEditing(false);
      setEditErrors({});
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/events/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || 'Failed to delete');
      navigate('/home');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !user) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/comments/event/${id}/message`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: currentUserName || 'Anonymous',
            message: commentText,
            createdAt: new Date().toISOString(),
          }),
        }
      );

      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || 'Failed to post comment');

      setComments(json.data);
      setCommentText('');
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const toInputValue = (iso) => (iso ? iso.slice(0, 16) : '');
  const interests = event.interests || [];
  const attendees = event.attendees || [];

  return (
    <div className="ed-page">
      <Navbar page="/" />

      <div className="ed-wrapper">
        <button className="ed-back" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <form className="ed-card" onSubmit={handleUpdate} noValidate>
          {/* ── Header ── */}
          <div className="ed-header">
            <div className="ed-avatar">
              {(event.name?.charAt(0) || '?').toUpperCase()}
            </div>
            <div className="ed-header-info">
              {isEditing ? (
                <div className="ed-field">
                  <input
                    className={`ed-input ${editErrors.name ? 'ed-input--error' : ''}`}
                    value={event.name}
                    maxLength={MAX_TITLE_LENGTH}
                    onChange={(e) =>
                      setEvent({ ...event, name: e.target.value })
                    }
                  />
                  <div className="ed-char-count">
                    {event.name?.length || 0}/{MAX_TITLE_LENGTH}
                  </div>
                  {editErrors.name && (
                    <span className="ed-error-text">{editErrors.name}</span>
                  )}
                </div>
              ) : (
                <h2 className="ed-title">{event.name}</h2>
              )}
              <p className="ed-sub">
                {new Date(event.time.start).toLocaleString()} –{' '}
                {new Date(event.time.end).toLocaleString()}
              </p>
            </div>
          </div>

          {/* ── Grid ── */}
          <div className="ed-grid">
            {/* Description */}
            <div className="ed-field full">
              <label>Description</label>
              {isEditing ? (
                <>
                  <textarea
                    className={`ed-textarea ${editErrors.description ? 'ed-input--error' : ''}`}
                    value={event.description}
                    onChange={(e) =>
                      setEvent({ ...event, description: e.target.value })
                    }
                  />
                  {editErrors.description && (
                    <span className="ed-error-text">
                      {editErrors.description}
                    </span>
                  )}
                </>
              ) : (
                <p className="ed-value">{event.description}</p>
              )}
            </div>

            {/* Address */}
            <div className="ed-field full">
              <label>Address</label>
              {isEditing ? (
                <input
                  className="ed-input"
                  value={event.address}
                  onChange={(e) =>
                    setEvent({ ...event, address: e.target.value })
                  }
                />
              ) : (
                <a
                  className="ed-address-link"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}`}
                  target="_blank"
                  rel="noopener noreferrer">
                  {event.address}
                </a>
              )}
            </div>

            {/* Start Time */}
            {isEditing && (
              <div className="ed-field">
                <label>Start Time</label>
                <input
                  type="datetime-local"
                  className={`ed-input ${editErrors.startTime ? 'ed-input--error' : ''}`}
                  value={toInputValue(event.time.start)}
                  onChange={(e) =>
                    setEvent({
                      ...event,
                      time: { ...event.time, start: e.target.value },
                    })
                  }
                />
                {editErrors.startTime && (
                  <span className="ed-error-text">{editErrors.startTime}</span>
                )}
              </div>
            )}

            {/* End Time */}
            {isEditing && (
              <div className="ed-field">
                <label>End Time</label>
                <input
                  type="datetime-local"
                  className={`ed-input ${editErrors.endTime ? 'ed-input--error' : ''}`}
                  value={toInputValue(event.time.end)}
                  onChange={(e) =>
                    setEvent({
                      ...event,
                      time: { ...event.time, end: e.target.value },
                    })
                  }
                />
                {editErrors.endTime && (
                  <span className="ed-error-text">{editErrors.endTime}</span>
                )}
              </div>
            )}

            {/* ── Attendees — avatar stack + modal trigger ── */}
            <div className="ed-field full">
              <label>Attendees</label>
              <AttendeeAvatarStack
                attendees={attendees}
                resolvedUsers={resolvedUsers}
                total={attendees.length}
                onClick={handleOpenAttendees}
              />
            </div>

            {/* Interests */}
            <div className="ed-field full">
              <label>Interests</label>
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
                  {editErrors.interests && (
                    <span className="ed-error-text">
                      {editErrors.interests}
                    </span>
                  )}
                </>
              ) : (
                <div className="ed-tags">
                  {interests.map((i, idx) => (
                    <span key={idx} className="ed-tag">
                      {typeof i === 'object' ? i.name : i}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="ed-actions">
            {isAuthenticated && !isHost && (
              <button
                type="button"
                className="ed-btn ed-btn--primary"
                onClick={handleAttend}>
                {isAttending ? 'Leave Event' : 'Join Event'}
              </button>
            )}

            {isAuthenticated && isHost && (
              <>
                <button
                  type={isEditing ? 'submit' : 'button'}
                  className="ed-btn ed-btn--primary"
                  onClick={(e) => {
                    if (!isEditing) {
                      e.preventDefault();
                      setIsEditing(true);
                    }
                  }}>
                  {isEditing ? 'Save Changes' : 'Edit Event'}
                </button>

                {isEditing && (
                  <button
                    type="button"
                    className="ed-btn ed-btn--ghost"
                    onClick={() => {
                      setIsEditing(false);
                      setEditErrors({});
                      setEvent(rawEvent);
                    }}>
                    Cancel
                  </button>
                )}

                <button
                  type="button"
                  className="ed-btn ed-btn--danger"
                  onClick={() => setShowDeleteConfirm(true)}>
                  Delete Event
                </button>
              </>
            )}
          </div>

          {/* ── Comments ── */}
          {isAuthenticated && (isHost || isAttending) ? (
            <div className="ed-comments">
              <div className="ed-comments__header">
                <h3>Comments</h3>
                {comments?.messages?.length > 0 && (
                  <span className="ed-comments__count">
                    {comments.messages.length}
                  </span>
                )}
              </div>

              {commentsLoading ? (
                <p className="ed-muted">Loading comments…</p>
              ) : !comments?.messages?.length ? (
                <div className="ed-comments__empty">
                  <span className="ed-comments__empty-icon">💬</span>
                  <p>No comments yet. Be the first!</p>
                </div>
              ) : (
                <div className="ed-comments__list">
                  {comments.messages.map((msg, i) => {
                    // Match commenter name against resolved attendees/host
                    const commenterUser = Object.values(resolvedUsers).find(
                      (u) => u.name === msg.name
                    );
                    return (
                      <div key={i} className="ed-comment">
                        <Avatar
                          id={msg.name}
                          name={msg.name}
                          profileImage={commenterUser?.profileImage || null}
                          size="sm"
                          style={{
                            width: 34,
                            height: 34,
                            fontSize: '0.75rem',
                            marginTop: '1px',
                            border: 'none',
                          }}
                        />
                        <div className="ed-comment__body">
                          <div className="ed-comment__meta">
                            <strong className="ed-comment__name">
                              {msg.name}
                            </strong>
                            <span className="ed-comment__time">
                              {msg.createdAt &&
                                new Date(msg.createdAt).toLocaleString(
                                  undefined,
                                  {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )}
                            </span>
                          </div>
                          <p className="ed-comment__text">{msg.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="ed-comment-compose">
                <Avatar
                  id={user?.id}
                  name={currentUserName || user?.name}
                  profileImage={resolvedUsers[user?.id]?.profileImage || null}
                  size="sm"
                  style={{
                    width: 34,
                    height: 34,
                    fontSize: '0.75rem',
                    border: 'none',
                    flexShrink: 0,
                  }}
                />
                <div className="ed-comment-compose__input-wrap">
                  <input
                    className="ed-comment-compose__input"
                    placeholder="Write a comment…"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="ed-comment-compose__btn"
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                    aria-label="Post comment">
                    ↑
                  </button>
                </div>
              </div>
            </div>
          ) : isAuthenticated ? (
            <div className="ed-comments__locked">
              <span className="ed-comments__locked-icon">🔒</span>
              <p>Join the event to see and post comments.</p>
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
        />
      )}

      {/* ── Delete Confirmation ── */}
      {showDeleteConfirm && (
        <div
          className="ed-confirm-backdrop"
          onClick={() => setShowDeleteConfirm(false)}>
          <div className="ed-confirm-card" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Event</h3>
            <p>
              Are you sure you want to delete <strong>{event.name}</strong>?
              This cannot be undone.
            </p>
            <div className="ed-confirm-actions">
              <button
                className="ed-btn ed-btn--ghost"
                onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="ed-btn ed-btn--danger" onClick={handleDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
