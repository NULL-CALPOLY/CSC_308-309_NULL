import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
                  : (c.members || []).filter((m) => String(m) !== String(user.id)),
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
    <div className="min-h-screen bg-[#080808] pt-[var(--nav-h,72px)] text-white">
      <Navbar page="/" />

      <div className="max-w-[1100px] mx-auto px-6 pt-8 pb-16 max-[640px]:px-4 max-[640px]:pt-6 max-[640px]:pb-12">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6 min-w-0 max-[640px]:flex-col max-[640px]:gap-3">
          <div className="min-w-0 flex-[1_1_auto]">
            <h1 className="m-0 text-[1.9rem] font-extrabold text-[#f8fafc] tracking-[-0.02em] leading-[1.2] max-[640px]:text-[1.55rem]">
              Clubs &amp; Organizations
            </h1>
            <p className="mt-[0.35rem] mb-0 text-[rgba(255,255,255,0.75)] text-[0.95rem]">
              Join a club to get its events surfaced first.
            </p>
          </div>
          <button
            className="bg-[#7c3aed] border-none text-white font-bold py-[0.65rem] px-5 rounded-[8px] cursor-pointer whitespace-nowrap flex-shrink-0 text-[0.9rem] tracking-[0.02em] shadow-[0_4px_14px_rgba(124,58,237,0.35)] transition-[background,box-shadow,transform] duration-200 hover:bg-[#6d28d9] hover:shadow-[0_6px_20px_rgba(124,58,237,0.5)] hover:-translate-y-px max-[640px]:w-full max-[640px]:py-[0.7rem] max-[640px]:text-[0.95rem]"
            onClick={() => isAuthenticated ? setShowRegister(true) : openSignIn()}>
            + Register your club
          </button>
        </div>

        <input
          className="w-full box-border bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-[10px] py-3 px-4 text-white text-[max(16px,0.95rem)] mb-6 outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-[rgba(255,255,255,0.3)] focus:border-[rgba(124,58,237,0.55)] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]"
          type="search"
          placeholder="Search clubs by name, category…"
          aria-label="Search clubs"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {loading ? (
          <div className="py-12 px-4 text-center text-[rgba(255,255,255,0.45)]">Loading clubs…</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 px-4 text-center text-[rgba(255,255,255,0.45)]">
            No clubs yet. Be the first to register one!
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5 max-[640px]:grid-cols-1 max-[640px]:gap-4">
            {filtered.map((club) => {
              const member = isMember(club);
              return (
                <div
                  key={club._id}
                  className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-[14px] p-5 flex flex-col gap-3 cursor-pointer transition-[border-color,transform,box-shadow] duration-200 hover:border-[rgba(124,58,237,0.35)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] max-[640px]:p-4"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/clubs/${club._id}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/clubs/${club._id}`); }}>
                  <div className="flex gap-[0.85rem] items-center">
                    <div className="w-[52px] h-[52px] rounded-[12px] flex-shrink-0 flex items-center justify-center text-[1.4rem] font-bold text-[#a78bfa] bg-gradient-to-br from-[#1a0533] to-[#2e1065] overflow-hidden">
                      {club.logo ? (
                        <img src={club.logo} alt={club.name} className="w-full h-full object-cover" />
                      ) : (
                        (club.name?.charAt(0) || '?').toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="m-0 mb-[0.3rem] text-[1.1rem] text-[#f8fafc] font-semibold leading-[1.3]">{club.name}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        {club.category && (
                          <span className="bg-[rgba(124,58,237,0.18)] border border-[rgba(124,58,237,0.35)] text-[#e9d5ff] text-[0.72rem] py-[0.2rem] px-[0.55rem] rounded-full">
                            {club.category}
                          </span>
                        )}
                        {club.studentOnly && (
                          <VerifiedBadge size="sm" label="Students only" />
                        )}
                      </div>
                    </div>
                  </div>

                  {club.description && (
                    <p className="m-0 text-[rgba(255,255,255,0.7)] text-[0.9rem] leading-[1.5] flex-1">
                      {club.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[rgba(255,255,255,0.72)] text-[0.82rem]">
                      {(club.members || []).length} member{(club.members || []).length !== 1 ? 's' : ''}
                    </span>
                    <button
                      className={`border-none font-semibold py-[0.45rem] px-[1.1rem] min-h-[44px] rounded-[7px] cursor-pointer transition-[background,border-color,color] duration-200 disabled:opacity-60 disabled:cursor-default ${
                        member
                          ? 'bg-transparent border border-[rgba(255,255,255,0.2)] text-[rgba(255,255,255,0.55)] hover:bg-[rgba(239,68,68,0.1)] hover:border-[rgba(239,68,68,0.4)] hover:text-[#fca5a5]'
                          : 'bg-[#7c3aed] text-white hover:bg-[#6d28d9]'
                      }`}
                      disabled={busyId === club._id}
                      onClick={(e) => { e.stopPropagation(); toggleMembership(club); }}>
                      {busyId === club._id ? '…' : member ? 'Leave' : 'Join'}
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
