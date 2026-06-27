import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar/Navbar';
import EventComponent from '../../Components/EventComponent/EventComponent';
import { useAuth } from '../../Hooks/UseAuth.ts';
import VerifiedBadge from '../../Components/VerifiedBadge/VerifiedBadge';

function Panel({ children }) {
  return (
    <div className="bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-2xl overflow-hidden">
      {children}
    </div>
  );
}

function PanelHeader({ title }) {
  return (
    <div className="flex items-center gap-[0.6rem] px-6 py-4 border-b border-[rgba(255,255,255,0.06)]">
      <span className="w-2 h-2 rounded-full bg-[#7c3aed]" />
      <h3 className="m-0 text-base font-semibold">{title}</h3>
    </div>
  );
}

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
          user?.token ? { headers: { Authorization: `Bearer ${user.token}` } } : undefined
        );
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || 'User not found');
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
      } catch { /* ignore */ }
    };

    const fetchHosted = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/events/search/host/${id}`);
        const json = await res.json();
        if (!cancelled && res.ok && json.success) setHostedEvents(json.data);
      } catch {
        if (!cancelled) setHostedEvents([]);
      }
    };

    fetchProfile();
    fetchHosted();
    fetchBlockStatus();
    return () => { cancelled = true; };
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
      eventDate={event.time?.start ? new Date(event.time.start).toLocaleDateString() : ''}
      eventTime={event.time?.start ? new Date(event.time.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ''}
      eventAddress={event.address}
      description={event.description}
      interest={Array.isArray(event.interests) ? event.interests.join(', ') : ''}
      attendees={event.attendees}
      host={event.host}
    />
  );

  if (loading)
    return (
      <div className="py-16 px-6 text-center text-[rgba(255,255,255,0.6)] text-base">
        Loading profile…
      </div>
    );
  if (errorMsg)
    return (
      <div className="min-h-screen bg-[#080808] pt-[var(--nav-h,72px)] text-white">
        <Navbar page="/" />
        <div className="py-16 px-6 text-center text-[rgba(255,255,255,0.6)]">{errorMsg}</div>
      </div>
    );

  const interests = Array.isArray(profile?.interests) ? profile.interests : [];

  return (
    <div className="min-h-screen bg-[#080808] pt-[var(--nav-h,72px)] text-white">
      <Navbar page="/" />

      <div className="max-w-[1100px] mx-auto px-6 pt-6 pb-0">
        <button
          className="bg-none border-none text-[rgba(255,255,255,0.5)] cursor-pointer text-[0.95rem] py-[0.4rem] px-0 transition-colors duration-150 hover:text-[#a78bfa]"
          onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 pt-6 pb-12 grid grid-cols-[300px_1fr] gap-6 items-start max-[768px]:grid-cols-1 max-[768px]:px-4">
        <aside>
          <div className="sticky top-[calc(var(--nav-h,72px)+2rem)] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-[18px] px-6 py-8 text-center max-[768px]:static">
            <div className="w-[120px] h-[120px] rounded-full mx-auto mb-4 overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#1a0533] to-[#2e1065] border-2 border-[rgba(124,58,237,0.4)]">
              {profile?.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[2.5rem] font-bold text-[#a78bfa]">
                  {(profile?.name?.charAt(0) || '?').toUpperCase()}
                </span>
              )}
            </div>

            <p className="text-[1.3rem] font-bold mt-2 mb-1">{profile?.name || '—'}</p>
            {profile?.isVerifiedStudent && (
              <div className="flex justify-center mt-[0.1rem] mb-[0.4rem]">
                <VerifiedBadge size="sm" />
              </div>
            )}
            {profile?.city && <p className="text-[rgba(255,255,255,0.5)] text-[0.9rem] m-0">{profile.city}</p>}

            {interests.length > 0 && (
              <div className="mt-4 flex justify-center gap-2 flex-wrap">
                <span className="bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.25)] text-[#a78bfa] text-[0.8rem] py-[0.3rem] px-[0.7rem] rounded-full">
                  {interests.length} interest{interests.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {user?.id && !isOwnProfile && (
              <>
                <button
                  className={`mt-5 w-full bg-transparent py-2 px-4 rounded-[8px] cursor-pointer font-semibold text-[0.85rem] transition-[background,border-color,color] duration-200 disabled:opacity-60 disabled:cursor-default ${
                    isBlocked
                      ? 'border border-[rgba(255,255,255,0.25)] text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.04)]'
                      : 'border border-[rgba(248,113,113,0.4)] text-[#f87171] hover:bg-[rgba(248,113,113,0.1)]'
                  }`}
                  onClick={toggleBlock}
                  disabled={blockBusy}>
                  {blockBusy ? '…' : isBlocked ? 'Unblock' : 'Block user'}
                </button>
                {blockError && (
                  <p className="mt-2 mb-0 text-[0.8rem] text-[#fca5a5] text-center leading-snug" role="alert">
                    {blockError}
                  </p>
                )}
              </>
            )}
          </div>
        </aside>

        <div className="flex flex-col gap-5">
          <Panel>
            <PanelHeader title="About" />
            <div className="px-6 py-6">
              {profile?.bio ? (
                <p className="m-0 leading-relaxed text-[rgba(255,255,255,0.85)] whitespace-pre-wrap">{profile.bio}</p>
              ) : (
                <span className="text-[rgba(255,255,255,0.35)] text-[0.9rem]">No bio yet</span>
              )}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Interests" />
            <div className="px-6 py-6">
              {interests.length ? (
                <div className="flex flex-wrap gap-2">
                  {interests.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.25)] text-[#a78bfa] text-[0.85rem] py-[0.35rem] px-3 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-[rgba(255,255,255,0.35)] text-[0.9rem]">No interests added yet</span>
              )}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Hosted Events" />
            <div className="px-6 py-6">
              {hostedEvents.length ? (
                <div className="flex flex-col gap-4">
                  {hostedEvents.map(renderEventCard)}
                </div>
              ) : (
                <span className="text-[rgba(255,255,255,0.35)] text-[0.9rem]">No hosted events yet</span>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
