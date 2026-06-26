import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar/Navbar';
import { useAuth } from '../../Hooks/UseAuth.ts';
import { useToast } from '../../Components/Toast/ToastContext.jsx';
import './Settings.css';

const API = import.meta.env.VITE_API_BASE_URL;

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="st-toggle-row">
      <div className="st-toggle-info">
        <span className="st-toggle-label">{label}</span>
        {description && <span className="st-toggle-desc">{description}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`st-toggle${checked ? ' st-toggle--on' : ''}`}
        onClick={() => onChange(!checked)}>
        <span className="st-toggle-thumb" />
      </button>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="st-section">
      <h2 className="st-section-title">{title}</h2>
      <div className="st-section-body">{children}</div>
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

  useEffect(() => {
    if (!isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (lightMode) {
      document.body.classList.add('light-mode');
      localStorage.setItem('findr-theme', 'light');
    } else {
      document.body.classList.remove('light-mode');
      localStorage.setItem('findr-theme', 'dark');
    }
  }, [lightMode]);

  useEffect(() => {
    localStorage.setItem('findr-email-notifs', emailNotifs ? 'true' : 'false');
  }, [emailNotifs]);

  useEffect(() => {
    if (!user?.id || !user?.token) return;
    setLoadingBlocked(true);
    fetch(`${API}/users/${user.id}/blocked`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setBlockedUsers(json.data || []);
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
    <div className="st-page">
      <Navbar page="/" />
      <div className="st-wrapper">
        <div className="st-header">
          <button className="st-back" onClick={() => navigate(-1)}>← Back</button>
          <h1 className="st-title">Settings</h1>
        </div>

        {/* ── Account info ── */}
        <Section title="Account">
          <div className="st-account-row">
            <div className="st-account-avatar">
              {user?.avatar
                ? <img src={user.avatar} alt={user.name} />
                : <span>{(user?.name?.charAt(0) || '?').toUpperCase()}</span>}
            </div>
            <div className="st-account-info">
              <span className="st-account-name">{user?.name || 'User'}</span>
              <span className="st-account-email">{user?.email || ''}</span>
              {user?.isVerifiedStudent && (
                <span className="st-account-badge">Verified Student</span>
              )}
            </div>
            <button className="st-link-btn" onClick={() => navigate('/profile')}>
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
            onChange={setEmailNotifs}
            label="Email notifications"
            description="Receive updates about events you've joined"
          />
        </Section>

        {/* ── Blocked users ── */}
        <Section title="Blocked users">
          {loadingBlocked ? (
            <div className="st-loading">
              <div className="st-spinner" />
            </div>
          ) : blockedUsers.length === 0 ? (
            <p className="st-empty">You haven't blocked anyone.</p>
          ) : (
            <div className="st-blocked-list">
              {blockedUsers.map((u) => {
                const uid = typeof u === 'object' ? u._id : u;
                const name = typeof u === 'object' ? u.name : uid;
                return (
                  <div key={uid} className="st-blocked-row">
                    <div className="st-blocked-avatar">
                      {(name?.charAt(0) || '?').toUpperCase()}
                    </div>
                    <span className="st-blocked-name">{name}</span>
                    <button
                      className="st-unblock-btn"
                      onClick={() => handleUnblock(uid)}>
                      Unblock
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* ── Danger zone ── */}
        <Section title="Session">
          {!deleteConfirm ? (
            <button className="st-danger-btn" onClick={() => setDeleteConfirm(true)}>
              Sign out of all devices
            </button>
          ) : (
            <div className="st-confirm-box">
              <p>Are you sure? You'll need to sign in again.</p>
              <div className="st-confirm-actions">
                <button className="st-ghost-btn" onClick={() => setDeleteConfirm(false)}>Cancel</button>
                <button className="st-danger-btn" onClick={handleLogoutAll}>Yes, sign out</button>
              </div>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
