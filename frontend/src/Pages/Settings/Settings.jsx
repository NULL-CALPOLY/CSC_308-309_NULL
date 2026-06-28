import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar/Navbar';
import { useAuth } from '../../Hooks/UseAuth.ts';
import { useToast } from '../../Components/Toast/ToastContext.jsx';

const API = import.meta.env.VITE_API_BASE_URL;

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between gap-3 min-h-[44px]">
      <div className="flex flex-col gap-0.5">
        <span className="text-[0.9rem] font-semibold text-[rgba(255,255,255,0.88)]">{label}</span>
        {description && <span className="text-[0.75rem] text-[rgba(255,255,255,0.35)]">{description}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`w-11 h-6 min-w-[44px] rounded-full border-none cursor-pointer p-0 relative transition-[background] duration-200 flex-shrink-0 ${checked ? 'bg-[#7c3aed]' : 'bg-[rgba(255,255,255,0.12)]'}`}
        onClick={() => onChange(!checked)}>
        <span
          className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white transition-transform duration-200 shadow-[0_1px_4px_rgba(0,0,0,0.4)] ${checked ? 'translate-x-5' : 'translate-x-0'}`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)' }}
        />
      </button>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="mb-6 bg-[#111111] border border-[rgba(255,255,255,0.07)] rounded-[18px] overflow-hidden">
      <h2 className="m-0 px-6 pt-4 pb-3 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[rgba(255,255,255,0.4)] font-[Consolas,monospace] border-b border-[rgba(255,255,255,0.06)]">
        {title}
      </h2>
      <div className="px-6 py-4 flex flex-col gap-3 max-[680px]:px-4 max-[680px]:py-3">
        {children}
      </div>
    </section>
  );
}

export default function Settings() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [lightMode, setLightMode] = useState(() => localStorage.getItem('findr-theme') === 'light');
  const [emailNotifs, setEmailNotifs] = useState(() => localStorage.getItem('findr-email-notifs') !== 'false');
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loadingBlocked, setLoadingBlocked] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [savingNotifs, setSavingNotifs] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (lightMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('findr-theme', 'light');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('findr-theme', 'dark');
    }
  }, [lightMode]);

  useEffect(() => {
    localStorage.setItem('findr-email-notifs', emailNotifs ? 'true' : 'false');
  }, [emailNotifs]);

  // Sync emailNotifications preference from user profile on mount
  useEffect(() => {
    if (user?.emailNotifications !== undefined) {
      setEmailNotifs(user.emailNotifications);
    }
  }, [user?.emailNotifications]);

  const handleEmailNotifsChange = async (value) => {
    setEmailNotifs(value);
    if (!user?.id || !user?.token) return;
    setSavingNotifs(true);
    try {
      await fetch(`${API}/users/${user.id}/notifications`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ emailNotifications: value }),
      });
    } catch {
      // silently keep local state
    } finally {
      setSavingNotifs(false);
    }
  };

  useEffect(() => {
    if (!user?.id || !user?.token) return;
    setLoadingBlocked(true);
    fetch(`${API}/users/${user.id}/blocked`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then(async (json) => {
        if (!json.success) return;
        const raw = json.data || [];
        // If items are already objects with a name, use them directly.
        // If they're plain ID strings, resolve each one to a user profile.
        const resolved = await Promise.all(
          raw.map(async (item) => {
            if (typeof item === 'object' && item !== null && item.name) return item;
            const id = typeof item === 'object' ? item._id || item.id : item;
            try {
              const r = await fetch(`${API}/users/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` },
              });
              const data = await r.json();
              const profile = data.user || data.data || data;
              return { _id: id, name: profile.name || profile.username || id };
            } catch {
              return { _id: id, name: id };
            }
          })
        );
        setBlockedUsers(resolved);
      })
      .catch(() => {})
      .finally(() => setLoadingBlocked(false));
  }, [user?.id, user?.token]);

  const handleUnblock = async (blockedId) => {
    try {
      const res = await fetch(`${API}/users/${user.id}/unblock/${blockedId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        setBlockedUsers((prev) => prev.filter((u) => (typeof u === 'object' ? u._id : u) !== blockedId));
        toast.success('User unblocked.');
      } else {
        toast.error('Could not unblock user.');
      }
    } catch {
      toast.error('Could not unblock user.');
    }
  };

  const handleLogoutAll = () => {
    logout();
    toast.success('Signed out successfully.');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#f8fafc]">
      <Navbar page="/" />
      <div className="max-w-[640px] mx-auto px-6 pt-[calc(var(--nav-h)+24px)] pb-20 max-[680px]:px-4 max-[680px]:pt-[calc(var(--nav-h)+16px)] max-[680px]:pb-16">
        <div className="mb-8">
          <button
            className="bg-none border-none text-[rgba(255,255,255,0.5)] text-[0.82rem] cursor-pointer p-0 mb-4 font-[Consolas,monospace] transition-colors duration-200 inline-flex items-center gap-[5px] tracking-[0.04em] hover:text-[#a78bfa]"
            onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 className="m-0 text-[1.75rem] font-extrabold text-white font-[Consolas,monospace] tracking-[-0.01em]">
            Settings
          </h1>
        </div>

        {/* ── Account info ── */}
        <Section title="Account">
          <div className="flex items-center gap-3.5 max-[680px]:flex-wrap">
            <div className="w-[52px] h-[52px] min-w-[52px] rounded-full bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] flex items-center justify-center text-[1.3rem] font-bold text-white overflow-hidden flex-shrink-0">
              {user?.avatar
                ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
                : <span>{(user?.name?.charAt(0) || '?').toUpperCase()}</span>}
            </div>
            <div className="flex-1 flex flex-col gap-[3px] min-w-0">
              <span className="text-[0.95rem] font-bold text-white">{user?.name || 'User'}</span>
              <span className="text-[0.8rem] text-[rgba(255,255,255,0.45)]">{user?.email || ''}</span>
              {user?.isVerifiedStudent && (
                <span className="inline-flex items-center gap-1 py-0.5 px-2 bg-[rgba(16,185,129,0.15)] border border-[rgba(16,185,129,0.3)] rounded-[20px] text-[0.68rem] font-bold text-[#34d399] w-fit">
                  Verified Student
                </span>
              )}
            </div>
            <button
              className="bg-none border border-[rgba(124,58,237,0.35)] text-[#a78bfa] py-[0.4rem] px-[0.9rem] rounded-[8px] text-[0.78rem] font-semibold cursor-pointer whitespace-nowrap transition-[background,border-color] duration-200 flex-shrink-0 hover:bg-[rgba(124,58,237,0.12)] hover:border-[rgba(124,58,237,0.6)] max-[680px]:w-full max-[680px]:text-center"
              onClick={() => navigate('/profile')}>
              Edit profile →
            </button>
          </div>
        </Section>

        {/* ── Appearance ── */}
        <Section title="Appearance">
          <Toggle
            checked={lightMode}
            onChange={setLightMode}
            label="Light mode"
            description="Switch between dark and light theme"
          />
        </Section>

        {/* ── Notifications ── */}
        <Section title="Notifications">
          <Toggle
            checked={emailNotifs}
            onChange={handleEmailNotifsChange}
            label="Email notifications"
            description={savingNotifs ? 'Saving…' : 'Receive updates about events you\'ve joined'}
          />
        </Section>

        {/* ── Blocked users ── */}
        <Section title="Blocked users">
          {loadingBlocked ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-[22px] h-[22px] border-2 border-[rgba(124,58,237,0.2)] border-t-[#7c3aed] rounded-full animate-[st-spin_0.7s_linear_infinite]" />
            </div>
          ) : blockedUsers.length === 0 ? (
            <p className="text-[rgba(255,255,255,0.35)] text-[0.875rem] m-0 py-1">
              You haven't blocked anyone.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {blockedUsers.map((u) => {
                const uid = typeof u === 'object' ? u._id : u;
                const name = typeof u === 'object' ? u.name : uid;
                return (
                  <div key={uid} className="flex items-center gap-3 py-2">
                    <div className="w-9 h-9 min-w-[36px] rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-[0.9rem] font-bold text-[rgba(255,255,255,0.55)]">
                      {(name?.charAt(0) || '?').toUpperCase()}
                    </div>
                    <span className="flex-1 text-[0.875rem] text-[rgba(255,255,255,0.75)]">{name}</span>
                    <button
                      className="py-[0.3rem] px-[0.8rem] rounded-[7px] border border-[rgba(248,113,113,0.3)] bg-transparent text-[#f87171] text-[0.75rem] font-semibold cursor-pointer transition-[background,border-color] duration-200 hover:bg-[rgba(248,113,113,0.08)] hover:border-[#f87171]"
                      onClick={() => handleUnblock(uid)}>
                      Unblock
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* ── Session ── */}
        <Section title="Session">
          {!deleteConfirm ? (
            <button
              className="py-[0.55rem] px-5 rounded-[10px] border-[1.5px] border-[rgba(248,113,113,0.35)] bg-transparent text-[#f87171] text-[0.875rem] font-semibold cursor-pointer transition-[background,border-color] duration-200 w-fit hover:bg-[rgba(248,113,113,0.08)] hover:border-[#f87171]"
              onClick={() => setDeleteConfirm(true)}>
              Sign out of all devices
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="m-0 text-[0.875rem] text-[rgba(255,255,255,0.6)]">
                Are you sure? You'll need to sign in again.
              </p>
              <div className="flex gap-2">
                <button
                  className="py-[0.55rem] px-5 rounded-[10px] border-[1.5px] border-[rgba(255,255,255,0.12)] bg-transparent text-[rgba(255,255,255,0.55)] text-[0.875rem] font-semibold cursor-pointer transition-[border-color,color] duration-200 hover:border-[rgba(255,255,255,0.3)] hover:text-white"
                  onClick={() => setDeleteConfirm(false)}>
                  Cancel
                </button>
                <button
                  className="py-[0.55rem] px-5 rounded-[10px] border-[1.5px] border-[rgba(248,113,113,0.35)] bg-transparent text-[#f87171] text-[0.875rem] font-semibold cursor-pointer transition-[background,border-color] duration-200 hover:bg-[rgba(248,113,113,0.08)] hover:border-[#f87171]"
                  onClick={handleLogoutAll}>
                  Yes, sign out
                </button>
              </div>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
