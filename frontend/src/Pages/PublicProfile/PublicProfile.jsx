import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PublicProfile.css';
import Navbar from '../../Components/Navbar/Navbar';
import EventComponent from '../../Components/EventComponent/EventComponent';
import { useAuth } from '../../Hooks/UseAuth.ts';
import VerifiedBadge from '../../Components/VerifiedBadge/VerifiedBadge';

export default function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [hostedEvents, setHostedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockBusy, setBlockBusy] = useState(false);
  const [blockError, setBlockError] = useState('');

  const isOwnProfile = user?.id === id;

  // If the viewer lands on their own public profile, send them to the editable one.
  useEffect(() => {
    if (user?.id && id === user.id) navigate('/profile', { replace: true });
  }, [id, user, navigate]);

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/users/${id}`,
          user?.token
            ? { headers: { Authorization: `Bearer ${user.token}` } }
            : undefined
        );
        const json = await res.json();
        if (!res.ok || !json.success)
          throw new Error(json.message || 'User not found');
        if (!cancelled) setProfile(json.data);
      } catch (err) {
        if (!cancelled) setErrorMsg(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const fetchBlockStatus = async () => {
      if (!user?.id || user.id === id) return;
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/users/${user.id}/blocked`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        const json = await res.json();
        if (!cancelled && res.ok && json.success)
          setIsBlocked(json.data.map(String).includes(String(id)));
      } catch {
        /* ignore */
      }
    };

    const fetchHosted = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/events/search/host/${id}`
        );
        const json = await res.json();
        if (!cancelled && res.ok && json.success) setHostedEvents(json.data);
      } catch {
        if (!cancelled) setHostedEvents([]);
      }
    };

    fetchProfile();
    fetchHosted();
    fetchBlockStatus();
    return () => {
      cancelled = true;
    };
  }, [id, user?.id, user?.token]);

  const toggleBlock = async () => {
    if (!user?.id || isOwnProfile) return;
    const action = isBlocked ? 'unblock' : 'block';
    setBlockBusy(true);
    setBlockError('');
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/users/${user.id}/${action}/${id}`,
        { method: 'PUT', headers: { Authorization: `Bearer ${user.token}` } }
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        setBlockError(json.message || 'Could not update block status.');
        return;
      }
      setIsBlocked(!isBlocked);
    } catch {
      setBlockError('Network error — please try again.');
    } finally {
      setBlockBusy(false);
    }
  };

  const renderEventCard = (event) => (
    <EventComponent
      key={event._id}
      eventId={event._id}
      eventName={event.name}
      eventDate={
        event.time?.start ? new Date(event.time.start).toLocaleDateString() : ''
      }
      eventTime={
        event.time?.start
          ? new Date(event.time.start).toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            })
          : ''
      }
      eventAddress={event.address}
      description={event.description}
      interest={Array.isArray(event.interests) ? event.interests.join(', ') : ''}
      attendees={event.attendees}
      host={event.host}
    />
  );

  if (loading) return <div className="pub-loading">Loading profile…</div>;
  if (errorMsg)
    return (
      <div className="pub-page">
        <Navbar page="/" />
        <div className="pub-loading">{errorMsg}</div>
      </div>
    );

  const interests = Array.isArray(profile?.interests) ? profile.interests : [];

  return (
    <div className="pub-page">
      <Navbar page="/" />

      <div className="pub-back-wrapper">
        <button className="pub-back" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="pub-layout">
        <aside className="pub-sidebar">
          <div className="pub-sidebar-card">
            <div className="pub-avatar">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="pub-avatar-img"
                />
              ) : (
                <div className="pub-avatar-initials">
                  {(profile?.name?.charAt(0) || '?').toUpperCase()}
                </div>
              )}
            </div>

            <p className="pub-name">{profile?.name || '—'}</p>
            {profile?.isVerifiedStudent && (
              <div className="pub-verified">
                <VerifiedBadge size="sm" />
              </div>
            )}
            {profile?.city && <p className="pub-city">{profile.city}</p>}

            {interests.length > 0 && (
              <div className="pub-stats">
                <span className="pub-stat">
                  {interests.length} interest
                  {interests.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {user?.id && !isOwnProfile && (
              <>
                <button
                  className={`pub-block-btn ${isBlocked ? 'is-blocked' : ''}`}
                  onClick={toggleBlock}
                  disabled={blockBusy}>
                  {blockBusy
                    ? '…'
                    : isBlocked
                      ? 'Unblock'
                      : 'Block user'}
                </button>
                {blockError && (
                  <p className="pub-block-error" role="alert">{blockError}</p>
                )}
              </>
            )}
          </div>
        </aside>

        <div className="pub-main">
          <div className="pub-panel">
            <div className="pub-panel-header">
              <span className="pub-dot" />
              <h3>About</h3>
            </div>
            <div className="pub-panel-body">
              {profile?.bio ? (
                <p className="pub-bio">{profile.bio}</p>
              ) : (
                <span className="pub-empty">No bio yet</span>
              )}
            </div>
          </div>

          <div className="pub-panel">
            <div className="pub-panel-header">
              <span className="pub-dot" />
              <h3>Interests</h3>
            </div>
            <div className="pub-panel-body">
              {interests.length ? (
                <div className="pub-tags">
                  {interests.map((tag, idx) => (
                    <span key={idx} className="pub-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="pub-empty">No interests added yet</span>
              )}
            </div>
          </div>

          <div className="pub-panel">
            <div className="pub-panel-header">
              <span className="pub-dot" />
              <h3>Hosted Events</h3>
            </div>
            <div className="pub-panel-body">
              {hostedEvents.length ? (
                <div className="pub-event-list">
                  {hostedEvents.map(renderEventCard)}
                </div>
              ) : (
                <span className="pub-empty">No hosted events yet</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
