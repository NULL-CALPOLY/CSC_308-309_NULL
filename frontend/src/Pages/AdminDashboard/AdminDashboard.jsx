import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar/Navbar';
import { useAuth } from '../../Hooks/UseAuth.ts';
import { useDocumentTitle } from '../../Hooks/UseDocumentTitle.js';

const API = import.meta.env.VITE_API_BASE_URL;

export default function AdminDashboard() {
  useDocumentTitle('Admin');
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
    return (
      <div className="py-16 px-6 text-center text-[rgba(255,255,255,0.6)] flex flex-col items-center gap-4">
        Loading…
      </div>
    );

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-[#080808] pt-[var(--nav-h,72px)] text-white">
        <Navbar page="/" />
        <div className="py-16 px-6 text-center text-[rgba(255,255,255,0.6)] flex flex-col items-center gap-4">
          You don't have access to this page.
          <button
            className="bg-none border border-[rgba(255,255,255,0.2)] text-[rgba(255,255,255,0.7)] rounded-[8px] py-[0.4rem] px-4 cursor-pointer"
            onClick={() => navigate('/')}>
            ← Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] pt-[var(--nav-h,72px)] text-white">
      <Navbar page="/" />
      <div className="max-w-[900px] mx-auto px-6 pt-8 pb-16">
        <h1 className="m-0 text-[1.8rem]">Club registrations</h1>
        <p className="mt-[0.35rem] mb-6 text-[rgba(255,255,255,0.65)]">
          {pending.length} pending review{pending.length !== 1 ? 's' : ''}
        </p>

        {actionError && (
          <div
            className="flex items-center justify-between gap-4 bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.35)] text-[#fca5a5] rounded-[10px] py-3 px-4 mb-5 text-[0.9rem]"
            role="alert">
            {actionError}
            <button
              className="bg-none border-none text-[#fca5a5] text-[1.2rem] leading-none cursor-pointer py-0 px-1 flex-shrink-0 opacity-75 transition-opacity duration-150 hover:opacity-100"
              onClick={() => setActionError('')}>
              ×
            </button>
          </div>
        )}

        {/* Reject reason modal */}
        {rejectTarget && (
          <div
            className="fixed inset-0 bg-[rgba(0,0,0,0.7)] flex items-center justify-center z-[2000] p-6 backdrop-blur-[4px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-title">
            <div className="bg-[#111118] border border-[rgba(255,255,255,0.12)] rounded-2xl p-8 w-full max-w-[460px] shadow-[0_24px_64px_rgba(0,0,0,0.6)]">
              <h2 id="reject-title" className="m-0 mb-2 text-[1.15rem] text-[#f8fafc]">
                Reject "{rejectTarget.name}"?
              </h2>
              <p className="m-0 mb-4 text-[rgba(248,250,252,0.65)] text-[0.88rem] leading-relaxed">
                Provide an optional reason that will be sent to the applicant.
              </p>
              <textarea
                className="w-full box-border bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.12)] rounded-[10px] text-[#f8fafc] text-[0.9rem] leading-relaxed py-3 px-4 resize-y outline-none transition-[border-color] duration-200 placeholder:text-[rgba(248,250,252,0.3)] focus:border-[rgba(124,58,237,0.5)]"
                placeholder="Reason for rejection (optional)…"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                autoFocus
              />
              <div className="flex gap-3 mt-5 flex-wrap">
                <button
                  className="border border-[rgba(248,113,113,0.5)] bg-transparent text-[#f87171] rounded-[8px] py-2 px-5 font-semibold cursor-pointer min-w-[100px] disabled:opacity-60 disabled:cursor-default"
                  onClick={confirmReject}
                  disabled={busyId === rejectTarget._id}>
                  {busyId === rejectTarget._id ? 'Rejecting…' : 'Confirm Rejection'}
                </button>
                <button
                  className="bg-transparent border border-[rgba(255,255,255,0.18)] text-[rgba(255,255,255,0.7)] rounded-[8px] py-2 px-5 font-semibold cursor-pointer min-w-[100px] transition-[border-color,color,background] duration-200 hover:border-[rgba(255,255,255,0.4)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
                  onClick={() => setRejectTarget(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {pending.length === 0 ? (
          <div className="py-12 px-4 text-center text-[rgba(255,255,255,0.45)]">
            Nothing waiting for review. 🎉
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {pending.map((club) => (
              <div
                key={club._id}
                className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-[14px] px-6 py-5 flex items-start justify-between gap-4 transition-[border-color,box-shadow] duration-200 hover:border-[rgba(124,58,237,0.25)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.25)] max-[560px]:flex-col">
                <div>
                  <h3 className="m-0 mb-[0.4rem]">{club.name}</h3>
                  <div className="flex flex-wrap gap-3 text-[rgba(255,255,255,0.5)] text-[0.82rem]">
                    {club.category && <span>{club.category}</span>}
                    <span>{club.email}</span>
                    {club.phoneNumber && <span>{club.phoneNumber}</span>}
                    {club.studentOnly && (
                      <span className="bg-[rgba(52,211,153,0.12)] border border-[rgba(52,211,153,0.3)] text-[#34d399] py-[0.1rem] px-2 rounded-full">
                        Students only
                      </span>
                    )}
                  </div>
                  {club.description && (
                    <p className="mt-[0.6rem] mb-0 text-[rgba(255,255,255,0.75)] text-[0.9rem] leading-relaxed">
                      {club.description}
                    </p>
                  )}
                  {club.owner?.name && (
                    <p className="mt-2 mb-0 text-[0.8rem] text-[rgba(255,255,255,0.4)]">
                      Submitted by {club.owner.name}
                      {club.owner.email ? ` (${club.owner.email})` : ''}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0 max-[560px]:flex-row max-[560px]:w-full">
                  <button
                    className="bg-[#16a34a] border-none text-white rounded-[8px] py-2 px-5 font-semibold cursor-pointer min-w-[100px] disabled:opacity-60 disabled:cursor-default max-[560px]:flex-1"
                    disabled={!!busyId}
                    onClick={() => review(club._id, 'approve')}>
                    {busyId === club._id ? 'Processing…' : 'Approve'}
                  </button>
                  <button
                    className="bg-transparent border border-[rgba(248,113,113,0.5)] text-[#f87171] rounded-[8px] py-2 px-5 font-semibold cursor-pointer min-w-[100px] disabled:opacity-60 disabled:cursor-default max-[560px]:flex-1"
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
