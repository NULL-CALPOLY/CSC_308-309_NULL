import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found.');
      return;
    }

    fetch(`${import.meta.env.VITE_API_BASE_URL}/users/verify-email/${token}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setStatus('success');
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed. The link may be expired or invalid.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Network error. Please try again.');
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="bg-[#111111] border border-[rgba(255,255,255,0.1)] rounded-[16px] py-12 px-9 w-full max-w-[420px] shadow-[0_24px_60px_rgba(0,0,0,0.5)] text-center flex flex-col items-center gap-5">
        {status === 'loading' && (
          <>
            <div className="w-10 h-10 rounded-full border-[3px] border-[rgba(255,255,255,0.1)] border-t-[#7c3aed] animate-spin" />
            <p className="m-0 text-[rgba(255,255,255,0.5)] text-[0.95rem]">
              Verifying your email…
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-5xl">✅</div>
            <h1 className="m-0 text-[1.4rem] font-bold text-white font-[Consolas,monospace]">
              Email verified!
            </h1>
            <p className="m-0 text-[0.9rem] text-[rgba(255,255,255,0.5)] leading-[1.5]">
              Your account is now active. You can sign in and start exploring.
            </p>
            <Link
              to="/"
              className="mt-2 inline-block bg-[#7c3aed] text-white no-underline py-3 px-8 rounded-[8px] text-[0.95rem] font-bold transition-[background,transform,box-shadow] duration-200 hover:bg-[#6d28d9] hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(124,58,237,0.35)]">
              Sign In
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-5xl">❌</div>
            <h1 className="m-0 text-[1.4rem] font-bold text-white font-[Consolas,monospace]">
              Verification failed
            </h1>
            <p className="m-0 text-[0.9rem] text-[rgba(255,255,255,0.5)] leading-[1.5]">
              {message || 'The link is invalid or has expired.'}
            </p>
            <Link
              to="/"
              className="mt-2 inline-block bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.12)] text-white no-underline py-[0.65rem] px-6 rounded-[8px] text-[0.875rem] font-semibold transition-[background] duration-200 hover:bg-[rgba(255,255,255,0.12)]">
              Back to home
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
