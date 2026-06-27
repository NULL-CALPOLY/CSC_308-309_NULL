import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import Navbar from '../../Components/Navbar/Navbar';
import VerifiedBadge from '../../Components/VerifiedBadge/VerifiedBadge';
import { useAuth } from '../../Hooks/UseAuth.ts';
import { useDocumentTitle } from '../../Hooks/UseDocumentTitle.js';
import { useToast } from '../../Components/Toast/ToastContext.jsx';

const API = import.meta.env.VITE_API_BASE_URL;

function fmtDate(iso) {
  if (!iso) return '—';
  try { return format(new Date(iso), 'EEE, MMM d · h:mm a'); } catch { return '—'; }
}

export default function ClubDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingClub, setLoadingClub] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [editing, setEditing] = useState(false);
  const [descDraft, setDescDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [busyMember, setBusyMember] = useState(false);
  const [membersList, setMembersList] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useDocumentTitle(club?.name || 'Club');

  const isAdmin =
    !!user?.id &&
    (
      (club?.admins || []).map(String).includes(String(user.id)) ||
      String(club?.owner) === String(user.id)
    );

  const fetchClub = useCallback(async () => {
    setLoadingClub(true);
    try {
      const res = await fetch(`${API}/organizations/${id}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setClub(json.data);
        setDescDraft(json.data.description || '');
        if (user?.id) {
          setIsMember((json.data.members || []).map(String).includes(String(user.id)));
        }
      }
    } finally {
      setLoadingClub(false);
    }
  }, [id, user?.id]);

  const fetchEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const res = await fetch(`${API}/events/search/host/${id}`);
      const json = await res.json();
      if (res.ok && json.success) {
        const now = new Date();
        const mapped = (json.data || []).map((e) => ({
          id: e._id,
          name: e.name,
          description: e.description,
          start: e.time?.start,
          end: e.time?.end,
          address: e.address || 'No address',
          attendees: e.attendees?.length ?? 0,
          interests: (e.interests || []).map((i) => (typeof i === 'object' ? i.name : i)),
          isPast: new Date(e.time?.start) < now,
        }));
        setEvents(mapped);
      }
    } finally {
      setLoadingEvents(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClub();
    fetchEvents();
  }, [fetchClub, fetchEvents]);

  const saveDescription = async () => {
    if (!user?.token) return;
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch(`${API}/organizations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ description: descDraft }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to save');
      setClub((prev) => ({ ...prev, description: descDraft }));
      setEditing(false);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'members' || !club) return;
    const memberIds = (club.members || [])
      .map((m) => (typeof m === 'object' ? m._id : m))
      .filter(Boolean);
    if (!memberIds.length) { setMembersList([]); return; }
    setLoadingMembers(true);
    Promise.all(
      memberIds.map((uid) =>
        fetch(`${API}/users/${uid}`)
          .then((r) => r.json())
          .then((json) => ({
            id: uid,
            name: json.success ? json.data?.name || 'Unknown' : 'Unknown',
            avatar: json.success ? json.data?.avatar || json.data?.profileImage || null : null,
          }))
          .catch(() => ({ id: uid, name: 'Unknown', avatar: null }))
      )
    ).then(setMembersList).finally(() => setLoadingMembers(false));
  }, [activeTab, club]);

  const toggleMembership = async () => {
    if (!user?.token || busyMember) return;
    if (!isMember && club?.studentOnly && !user?.isVerifiedStudent) {
      toast.error('This club is for verified Cal Poly students only. Verify your student status in your profile to join.');
      return;
    }
    const route = isMember ? 'remove' : 'add';
    setBusyMember(true);
    try {
      const res = await fetch(
        `${API}/organizations/${id}/members/${route}/${user.id}`,
        { method: 'PUT', headers: { Authorization: `Bearer ${user.token}` } }
      );
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Could not update membership');
      setIsMember((prev) => !prev);
      setClub((prev) => ({
        ...prev,
        members: isMember
          ? (prev.members || []).filter((m) => String(m) !== String(user.id))
          : [...(prev.members || []), user.id],
      }));
    } catch { /* silent */ }
    finally { setBusyMember(false); }
  };

  const upcoming = events.filter((e) => !e.isPast);
  const past = events.filter((e) => e.isPast).sort((a, b) => new Date(b.start) - new Date(a.start));
  const displayEvents = activeTab === 'upcoming' ? upcoming : past;

  if (loadingClub) {
    return (
      <div className="min-h-screen bg-[#080808] pt-[var(--nav-h,72px)] text-[#f8fafc]">
        <Navbar page="/" />
        <div className="flex items-center justify-center py-20 px-4 text-[rgba(255,255,255,0.4)] text-[0.95rem]">
          <div className="w-7 h-7 border-2 border-[rgba(124,58,237,0.2)] border-t-[#7c3aed] rounded-full [animation:cd-spin_0.7s_linear_infinite]" />
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-[#080808] pt-[var(--nav-h,72px)] text-[#f8fafc]">
        <Navbar page="/" />
        <div className="flex items-center justify-center py-20 px-4 text-[rgba(255,255,255,0.4)]">Club not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] pt-[var(--nav-h,72px)] text-[#f8fafc]">
      <Navbar page="/" />
      <div className="max-w-[820px] mx-auto px-6 py-8 pb-20 max-[600px]:px-4 max-[600px]:py-5 max-[600px]:pb-16">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-[6px] text-[0.82rem] text-[rgba(255,255,255,0.35)] mb-6">
          <Link to="/clubs" className="text-[#a78bfa] no-underline transition-colors duration-150 hover:text-[#c4b5fd] hover:underline">Clubs</Link>
          <span className="text-[rgba(255,255,255,0.2)]">/</span>
          <span className="text-[rgba(255,255,255,0.55)] font-medium">{club.name}</span>
        </nav>

        {/* ── Hero card ── */}
        <div className="cd-hero flex items-center gap-5 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-[18px] px-6 py-6 mb-7 flex-wrap relative overflow-hidden max-[600px]:px-[1.1rem] max-[600px]:py-[1.1rem] max-[600px]:gap-[0.9rem]">
          <div className="w-[72px] h-[72px] rounded-[16px] flex-shrink-0 flex items-center justify-center text-[2rem] font-bold text-[#a78bfa] bg-gradient-to-br from-[#1a0533] to-[#2e1065] overflow-hidden max-[600px]:w-14 max-[600px]:h-14 max-[600px]:text-2xl">
            {club.logo
              ? <img src={club.logo} alt={club.name} className="w-full h-full object-cover" />
              : <span>{(club.name?.charAt(0) || '?').toUpperCase()}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h1 className="m-0 text-[1.65rem] font-extrabold text-[#f8fafc] tracking-[-0.02em] leading-[1.2] max-[600px]:text-[1.3rem]">{club.name}</h1>
              {club.studentOnly && <VerifiedBadge size="sm" label="Students only" />}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {club.category && (
                <span className="bg-[rgba(124,58,237,0.18)] border border-[rgba(124,58,237,0.35)] text-[#e9d5ff] text-[0.72rem] py-[0.2rem] px-[0.6rem] rounded-full font-medium">
                  {club.category}
                </span>
              )}
              <span className="flex items-center gap-1 text-[0.82rem] text-[rgba(255,255,255,0.5)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                {(club.members || []).length} members
              </span>
              {club.email && (
                <span className="flex items-center gap-1 text-[0.82rem] text-[rgba(255,255,255,0.5)]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  {club.email}
                </span>
              )}
            </div>
          </div>
          {user && (
            <button
              className={`py-[0.55rem] px-[1.4rem] rounded-[8px] border-none font-bold text-[0.88rem] cursor-pointer min-h-[44px] flex-shrink-0 transition-[background,box-shadow,transform,border-color,color] duration-200 disabled:opacity-50 disabled:cursor-default max-[600px]:w-full ${
                isMember
                  ? 'bg-transparent border border-[rgba(255,255,255,0.2)] text-[rgba(255,255,255,0.55)] hover:bg-[rgba(239,68,68,0.1)] hover:border-[rgba(239,68,68,0.4)] hover:text-[#fca5a5]'
                  : 'bg-[#7c3aed] text-white hover:bg-[#6d28d9] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)] hover:-translate-y-px'
              }`}
              onClick={toggleMembership}
              disabled={busyMember}>
              {busyMember ? '…' : isMember ? 'Leave' : 'Join'}
            </button>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {/* ── About ── */}
          <section className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[16px] p-6 max-[600px]:p-[1.1rem]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="m-0 text-[1.05rem] font-bold text-[#f8fafc]">About</h2>
              {isAdmin && !editing && (
                <button
                  className="flex items-center gap-[5px] py-[0.35rem] px-[0.9rem] rounded-[7px] border border-[rgba(124,58,237,0.35)] bg-[rgba(124,58,237,0.08)] text-[#a78bfa] text-[0.78rem] font-semibold font-[inherit] cursor-pointer transition-all duration-200 hover:bg-[rgba(124,58,237,0.18)] hover:border-[rgba(124,58,237,0.55)]"
                  onClick={() => setEditing(true)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <div className="flex flex-col gap-3">
                <textarea
                  className="w-full box-border bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-[10px] py-3 px-4 text-[#f8fafc] text-[0.95rem] font-[inherit] leading-[1.6] resize-y outline-none transition-[border-color,box-shadow] duration-200 focus:border-[rgba(124,58,237,0.55)] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)]"
                  value={descDraft}
                  onChange={(e) => setDescDraft(e.target.value)}
                  maxLength={1000}
                  rows={5}
                  placeholder="Describe your club…"
                />
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-[0.75rem] text-[rgba(255,255,255,0.3)]">{descDraft.length}/1000</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {saveError && <span className="text-[0.78rem] text-[#f87171]">{saveError}</span>}
                    <button
                      className="py-[0.45rem] px-4 rounded-[7px] border border-[rgba(255,255,255,0.12)] bg-transparent text-[rgba(255,255,255,0.5)] text-[0.82rem] font-[inherit] cursor-pointer transition-all duration-200 hover:border-[rgba(255,255,255,0.25)] hover:text-white"
                      onClick={() => { setEditing(false); setDescDraft(club.description || ''); }}>
                      Cancel
                    </button>
                    <button
                      className="py-[0.45rem] px-4 rounded-[7px] border-none bg-[#7c3aed] text-white text-[0.82rem] font-semibold font-[inherit] cursor-pointer min-h-9 transition-[background] duration-200 disabled:opacity-50 disabled:cursor-default hover:not(:disabled):bg-[#6d28d9]"
                      onClick={saveDescription}
                      disabled={saving}>
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="m-0 text-[rgba(255,255,255,0.7)] text-[0.95rem] leading-[1.65] whitespace-pre-wrap">
                {club.description || (isAdmin ? 'No description yet. Click Edit to add one.' : 'No description yet.')}
              </p>
            )}
          </section>

          {/* ── Events + Members ── */}
          <section className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[16px] p-6 max-[600px]:p-[1.1rem]">
            <div className="flex gap-0 mb-4 border-b border-[rgba(255,255,255,0.08)]">
              {[
                { key: 'upcoming', label: 'Upcoming', count: upcoming.length },
                { key: 'past', label: 'Past', count: past.length },
                { key: 'members', label: 'Members', count: (club.members || []).length },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  className={`flex items-center gap-[6px] py-[0.6rem] px-[1.1rem] border-none border-b-2 bg-transparent font-semibold font-[inherit] text-[0.88rem] cursor-pointer transition-[color,border-color] duration-200 -mb-px ${
                    activeTab === key
                      ? 'text-[#a78bfa] border-b-[#7c3aed]'
                      : 'text-[rgba(255,255,255,0.4)] border-b-transparent hover:text-[rgba(255,255,255,0.7)]'
                  }`}
                  onClick={() => setActiveTab(key)}>
                  {label}
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-[5px] rounded-full bg-[rgba(124,58,237,0.15)] text-[#a78bfa] text-[0.68rem] font-bold">
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {activeTab === 'members' ? (
              loadingMembers ? (
                <div className="flex items-center justify-center py-8 px-4 text-[rgba(255,255,255,0.3)] text-[0.88rem] gap-3">
                  <div className="w-7 h-7 border-2 border-[rgba(124,58,237,0.2)] border-t-[#7c3aed] rounded-full [animation:cd-spin_0.7s_linear_infinite]" />
                </div>
              ) : membersList.length === 0 ? (
                <div className="flex items-center justify-center py-8 px-4 text-[rgba(255,255,255,0.3)] text-[0.88rem]">No members yet.</div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3 py-1">
                  {membersList.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className="flex flex-col items-center gap-2 py-4 px-[10px] pb-[14px] rounded-[14px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] cursor-pointer font-[inherit] text-center transition-[background,border-color,transform] duration-200 hover:bg-[rgba(124,58,237,0.1)] hover:border-[rgba(124,58,237,0.35)] hover:-translate-y-0.5"
                      onClick={() => navigate(`/users/${m.id}`)}>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] flex items-center justify-center text-[1.2rem] font-bold text-white overflow-hidden flex-shrink-0">
                        {m.avatar
                          ? <img src={m.avatar} alt={m.name} className="w-full h-full object-cover rounded-full" />
                          : <span>{(m.name?.charAt(0) || '?').toUpperCase()}</span>}
                      </div>
                      <span className="text-[0.78rem] font-semibold text-[rgba(255,255,255,0.8)] break-words leading-[1.3]">{m.name}</span>
                    </button>
                  ))}
                </div>
              )
            ) : loadingEvents ? (
              <div className="flex items-center justify-center py-8 px-4 text-[rgba(255,255,255,0.3)] text-[0.88rem] gap-3">
                <div className="w-7 h-7 border-2 border-[rgba(124,58,237,0.2)] border-t-[#7c3aed] rounded-full [animation:cd-spin_0.7s_linear_infinite]" />
              </div>
            ) : displayEvents.length === 0 ? (
              <div className="flex items-center justify-center py-8 px-4 text-[rgba(255,255,255,0.3)] text-[0.88rem]">No {activeTab} events.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {displayEvents.map((ev) => (
                  <Link
                    key={ev.id}
                    to={`/events/${ev.id}`}
                    className="cd-ev-card flex items-center gap-4 no-underline bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-[12px] p-4 transition-[border-color,background,transform] duration-200 relative overflow-hidden hover:border-[rgba(124,58,237,0.35)] hover:bg-[rgba(124,58,237,0.04)] hover:translate-x-[3px] max-[600px]:flex-wrap">
                    <div className="w-[3px] self-stretch rounded-full bg-gradient-to-b from-[#7c3aed] to-[#4f46e5] flex-shrink-0" />
                    <div className="flex-1 min-w-0 flex flex-col gap-[3px]">
                      <div className="text-[0.75rem] font-semibold text-[#a78bfa] tracking-[0.02em]">{fmtDate(ev.start)}</div>
                      <div className="text-[0.98rem] font-bold text-[#f8fafc] whitespace-nowrap overflow-hidden text-ellipsis">{ev.name}</div>
                      <div className="flex items-center gap-1 text-[0.78rem] text-[rgba(255,255,255,0.45)] whitespace-nowrap overflow-hidden text-ellipsis">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {ev.address}
                      </div>
                      {ev.interests.length > 0 && (
                        <div className="flex gap-1 flex-wrap mt-[3px]">
                          {ev.interests.slice(0, 3).map((t) => (
                            <span key={t} className="bg-[rgba(124,58,237,0.14)] border border-[rgba(124,58,237,0.28)] text-[#c4b5fd] text-[0.68rem] py-px px-[7px] rounded-full">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-[6px] flex-shrink-0 max-[600px]:flex-row max-[600px]:items-center max-[600px]:justify-between max-[600px]:w-full max-[600px]:mt-[0.35rem]">
                      <span className="text-[0.75rem] text-[rgba(255,255,255,0.4)] whitespace-nowrap">{ev.attendees} attending</span>
                      <svg className="cd-ev-arrow text-[rgba(167,139,250,0.5)] flex-shrink-0 transition-[color,transform] duration-200" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
