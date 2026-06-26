import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Clubs.css';
import Navbar from '../../Components/Navbar/Navbar';
import { useDocumentTitle } from '../../Hooks/UseDocumentTitle.js';
import { useAuth } from '../../Hooks/UseAuth.ts';
import { useModal } from '../../Components/ModalContext.jsx';
import { useToast } from '../../Components/Toast/ToastContext.jsx';
import RegisterClubModal from '../../Components/RegisterClubModal/RegisterClubModal';
import VerifiedBadge from '../../Components/VerifiedBadge/VerifiedBadge';

const API = import.meta.env.VITE_API_BASE_URL;

export default function Clubs() {
  useDocumentTitle('Clubs');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { openSignIn } = useModal();
  const toast = useToast();

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const fetchClubs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/organizations/all`);
      const json = await res.json();
      setClubs(res.ok && json.success ? json.data : []);
    } catch {
      setClubs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  const isMember = (club) =>
    !!user?.id && (club.members || []).map(String).includes(String(user.id));

  const toggleMembership = async (club) => {
    if (!isAuthenticated || !user?.id) {
      openSignIn();
      return;
    }
    const joining = !isMember(club);
    const route = joining ? 'add' : 'remove';
    setBusyId(club._id);
    try {
      const res = await fetch(
        `${API}/organizations/${club._id}/members/${route}/${user.id}`,
        { method: 'PUT', headers: { Authorization: `Bearer ${user.token}` } }
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.message || 'Could not update membership');
        return;
      }
      setClubs((prev) =>
        prev.map((c) =>
          c._id === club._id
            ? {
                ...c,
                members: joining
                  ? [...(c.members || []), user.id]
                  : (c.members || []).filter(
                      (m) => String(m) !== String(user.id)
                    ),
              }
            : c
        )
      );
      toast.success(joining ? `Joined ${club.name}!` : `Left ${club.name}`);
    } catch {
      toast.error('Network error updating membership');
    } finally {
      setBusyId(null);
    }
  };

  const filtered = clubs.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="clubs-page">
      <Navbar page="/" />

      <div className="clubs-wrapper">
        <div className="clubs-header">
          <div className="clubs-header-text">
            <h1>Clubs &amp; Organizations</h1>
            <p className="clubs-sub">
              Join a club to get its events surfaced first.
            </p>
          </div>
          <button
            className="clubs-register-btn"
            onClick={() =>
              isAuthenticated ? setShowRegister(true) : openSignIn()
            }>
            + Register your club
          </button>
        </div>

        <input
          className="clubs-search"
          type="search"
          placeholder="Search clubs by name, category…"
          aria-label="Search clubs"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {loading ? (
          <div className="clubs-empty">Loading clubs…</div>
        ) : filtered.length === 0 ? (
          <div className="clubs-empty">
            No clubs yet. Be the first to register one!
          </div>
        ) : (
          <div className="clubs-grid">
            {filtered.map((club) => {
              const member = isMember(club);
              return (
                <div key={club._id} className="club-card" role="button" tabIndex={0} onClick={() => navigate(`/clubs/${club._id}`)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/clubs/${club._id}`); }}>
                  <div className="club-card-top">
                    <div className="club-logo">
                      {club.logo ? (
                        <img src={club.logo} alt={club.name} />
                      ) : (
                        (club.name?.charAt(0) || '?').toUpperCase()
                      )}
                    </div>
                    <div className="club-card-head">
                      <h3>{club.name}</h3>
                      <div className="club-meta">
                        {club.category && (
                          <span className="club-cat">{club.category}</span>
                        )}
                        {club.studentOnly && (
                          <VerifiedBadge size="sm" label="Students only" />
                        )}
                      </div>
                    </div>
                  </div>

                  {club.description && (
                    <p className="club-desc">{club.description}</p>
                  )}

                  <div className="club-card-footer">
                    <span className="club-members">
                      {(club.members || []).length} member
                      {(club.members || []).length !== 1 ? 's' : ''}
                    </span>
                    <button
                      className={`club-join-btn ${member ? 'is-member' : ''}`}
                      disabled={busyId === club._id}
                      onClick={(e) => { e.stopPropagation(); toggleMembership(club); }}>
                      {busyId === club._id
                        ? '…'
                        : member
                          ? 'Leave'
                          : 'Join'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <RegisterClubModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onSuccess={() => {
          setShowRegister(false);
          navigate('/profile');
        }}
      />
    </div>
  );
}
