import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import Navbar from '../../Components/Navbar/Navbar';
import { useAuth } from '../../Hooks/UseAuth.ts';

const API = import.meta.env.VITE_API_BASE_URL;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState('');
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchPending = useCallback(async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/organizations/pending`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const json = await res.json();
      setPending(res.ok && json.success ? json.data : []);
    } catch {
      setPending([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user?.isAdmin) {
      setLoading(false);
      return;
    }
    fetchPending();
  }, [authLoading, isAuthenticated, user, fetchPending]);

  const review = async (id, action, reason = '') => {
    setBusyId(id);
    setActionError('');
    try {
      const res = await fetch(`${API}/organizations/${id}/${action}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ reason }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setActionError(json.message || 'Action failed — please try again.');
        return;
      }
      setPending((prev) => prev.filter((c) => c._id !== id));
    } catch {
      setActionError('Network error — please check your connection and try again.');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = (club) => {
    setRejectTarget(club);
    setRejectReason('');
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    await review(rejectTarget._id, 'reject', rejectReason);
    setRejectTarget(null);
    setRejectReason('');
  };

  if (authLoading || loading)
    return <div className="admin-loading">Loading…</div>;

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="admin-page">
        <Navbar page="/" />
        <div className="admin-loading">
          You don't have access to this page.
          <button className="admin-back" onClick={() => navigate('/')}>
            ← Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <Navbar page="/" />
      <div className="admin-wrapper">
        <h1>Club registrations</h1>
        <p className="admin-sub">
          {pending.length} pending review{pending.length !== 1 ? 's' : ''}
        </p>

        {actionError && (
          <div className="admin-error" role="alert">
            {actionError}
            <button className="admin-error-dismiss" onClick={() => setActionError('')}>×</button>
          </div>
        )}

        {/* Reject reason modal */}
        {rejectTarget && (
          <div className="admin-reject-overlay" role="dialog" aria-modal="true" aria-labelledby="reject-title">
            <div className="admin-reject-modal">
              <h2 id="reject-title">Reject "{rejectTarget.name}"?</h2>
              <p>Provide an optional reason that will be sent to the applicant.</p>
              <textarea
                className="admin-reject-reason"
                placeholder="Reason for rejection (optional)…"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                autoFocus
              />
              <div className="admin-reject-actions">
                <button
                  className="admin-btn admin-btn--reject"
                  onClick={confirmReject}
                  disabled={busyId === rejectTarget._id}>
                  {busyId === rejectTarget._id ? 'Rejecting…' : 'Confirm Rejection'}
                </button>
                <button
                  className="admin-btn admin-btn--ghost"
                  onClick={() => setRejectTarget(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {pending.length === 0 ? (
          <div className="admin-empty">Nothing waiting for review. 🎉</div>
        ) : (
          <div className="admin-list">
            {pending.map((club) => (
              <div key={club._id} className="admin-card">
                <div className="admin-card-main">
                  <h3>{club.name}</h3>
                  <div className="admin-card-meta">
                    {club.category && <span>{club.category}</span>}
                    <span>{club.email}</span>
                    {club.phoneNumber && <span>{club.phoneNumber}</span>}
                    {club.studentOnly && (
                      <span className="admin-tag">Students only</span>
                    )}
                  </div>
                  {club.description && (
                    <p className="admin-desc">{club.description}</p>
                  )}
                  {club.owner?.name && (
                    <p className="admin-owner">
                      Submitted by {club.owner.name}
                      {club.owner.email ? ` (${club.owner.email})` : ''}
                    </p>
                  )}
                </div>
                <div className="admin-card-actions">
                  <button
                    className="admin-btn admin-btn--approve"
                    disabled={!!busyId}
                    onClick={() => review(club._id, 'approve')}>
                    {busyId === club._id ? 'Processing…' : 'Approve'}
                  </button>
                  <button
                    className="admin-btn admin-btn--reject"
                    disabled={!!busyId}
                    onClick={() => handleReject(club)}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
