import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import Navbar from '../../Components/Navbar/Navbar';
import VerifiedBadge from '../../Components/VerifiedBadge/VerifiedBadge';
import { useAuth } from '../../Hooks/UseAuth.ts';
import { useDocumentTitle } from '../../Hooks/UseDocumentTitle.js';
import './ClubDetail.css';

const API = import.meta.env.VITE_API_BASE_URL;

function fmtDate(iso) {
  if (!iso) return '—';
  try { return format(new Date(iso), 'EEE, MMM d · h:mm a'); } catch { return '—'; }
}

export default function ClubDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

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

  const toggleMembership = async () => {
    if (!user?.token || busyMember) return;
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
      <div className="cd-page">
        <Navbar page="/" />
        <div className="cd-loading">
          <div className="cd-spinner" />
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="cd-page">
        <Navbar page="/" />
        <div className="cd-loading">Club not found.</div>
      </div>
    );
  }

  return (
    <div className="cd-page">
      <Navbar page="/" />
      <div className="cd-wrapper">

        {/* ── Breadcrumb ── */}
        <nav className="cd-breadcrumb">
          <Link to="/clubs" className="cd-breadcrumb-link">Clubs</Link>
          <span className="cd-breadcrumb-sep">/</span>
          <span className="cd-breadcrumb-cur">{club.name}</span>
        </nav>

        {/* ── Hero card ── */}
        <div className="cd-hero">
          <div className="cd-hero-logo">
            {club.logo
              ? <img src={club.logo} alt={club.name} />
              : <span>{(club.name?.charAt(0) || '?').toUpperCase()}</span>}
          </div>
          <div className="cd-hero-info">
            <div className="cd-hero-name-row">
              <h1 className="cd-hero-name">{club.name}</h1>
              {club.studentOnly && <VerifiedBadge size="sm" label="Students only" />}
            </div>
            <div className="cd-hero-meta">
              {club.category && <span className="cd-badge">{club.category}</span>}
              <span className="cd-hero-stat">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                {(club.members || []).length} members
              </span>
              {club.email && (
                <span className="cd-hero-stat">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  {club.email}
                </span>
              )}
            </div>
          </div>
          {user && (
            <button
              className={`cd-hero-join${isMember ? ' is-member' : ''}`}
              onClick={toggleMembership}
              disabled={busyMember}>
              {busyMember ? '…' : isMember ? 'Leave' : 'Join'}
            </button>
          )}
        </div>

        <div className="cd-body">
          {/* ── About ── */}
          <section className="cd-section">
            <div className="cd-section-hdr">
              <h2 className="cd-section-title">About</h2>
              {isAdmin && !editing && (
                <button className="cd-edit-btn" onClick={() => setEditing(true)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <div className="cd-edit-block">
                <textarea
                  className="cd-desc-editor"
                  value={descDraft}
                  onChange={(e) => setDescDraft(e.target.value)}
                  maxLength={1000}
                  rows={5}
                  placeholder="Describe your club…"
                />
                <div className="cd-edit-footer">
                  <span className="cd-char-count">{descDraft.length}/1000</span>
                  <div className="cd-edit-actions">
                    {saveError && <span className="cd-save-error">{saveError}</span>}
                    <button
                      className="cd-cancel-btn"
                      onClick={() => { setEditing(false); setDescDraft(club.description || ''); }}>
                      Cancel
                    </button>
                    <button className="cd-save-btn" onClick={saveDescription} disabled={saving}>
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="cd-description">
                {club.description || (isAdmin ? 'No description yet. Click Edit to add one.' : 'No description yet.')}
              </p>
            )}
          </section>

          {/* ── Events ── */}
          <section className="cd-section">
            <div className="cd-tabs">
              <button
                className={`cd-tab${activeTab === 'upcoming' ? ' active' : ''}`}
                onClick={() => setActiveTab('upcoming')}>
                Upcoming
                <span className="cd-tab-count">{upcoming.length}</span>
              </button>
              <button
                className={`cd-tab${activeTab === 'past' ? ' active' : ''}`}
                onClick={() => setActiveTab('past')}>
                Past
                <span className="cd-tab-count">{past.length}</span>
              </button>
            </div>

            {loadingEvents ? (
              <div className="cd-ev-empty">
                <div className="cd-spinner" />
              </div>
            ) : displayEvents.length === 0 ? (
              <div className="cd-ev-empty">No {activeTab} events.</div>
            ) : (
              <div className="cd-ev-list">
                {displayEvents.map((ev) => (
                  <Link key={ev.id} to={`/events/${ev.id}`} className="cd-ev-card">
                    <div className="cd-ev-accent" />
                    <div className="cd-ev-main">
                      <div className="cd-ev-date">{fmtDate(ev.start)}</div>
                      <div className="cd-ev-name">{ev.name}</div>
                      <div className="cd-ev-addr">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {ev.address}
                      </div>
                      {ev.interests.length > 0 && (
                        <div className="cd-ev-tags">
                          {ev.interests.slice(0, 3).map((t) => (
                            <span key={t} className="cd-ev-tag">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="cd-ev-right">
                      <span className="cd-ev-attendees">{ev.attendees} attending</span>
                      <svg className="cd-ev-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
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
