import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../Hooks/UseAuth.ts';
import { useModal } from '../../ModalContext.jsx';

const fieldCls =
  'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[8px] py-[0.7rem] px-[0.9rem] text-[0.95rem] text-white outline-none w-full box-border transition-[border-color,box-shadow] duration-200 placeholder:text-[rgba(255,255,255,0.2)] focus:border-[#7c3aed] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.2)]';

export default function SignInModal({ isOpen, onClose, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [verificationPending, setVerificationPending] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const { login, loginWithGoogle, resendVerificationEmail } = useAuth();
  const signInError = useModal()?.signInError || '';
  const navigate = useNavigate();

  // Seed the error from an OAuth redirect (e.g. ?authError=) when opening.
  useEffect(() => {
    if (isOpen && signInError) setErrorMsg(signInError);
  }, [isOpen, signInError]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setVerificationPending(false);
    setResendMsg('');
    setLoading(true);
    try {
      await login(email, password);
      onClose();
      navigate('/home');
    } catch (err) {
      if (err.requiresVerification) {
        setVerificationPending(true);
        setPendingEmail(err.email || email);
      } else {
        setErrorMsg(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMsg('');
    try {
      await resendVerificationEmail(pendingEmail);
      setResendMsg('Verification email resent! Check your inbox.');
    } catch (err) {
      setResendMsg(err.message || 'Failed to resend. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div
      data-testid="modal-overlay"
      className="fixed inset-0 z-[2000] bg-[rgba(0,0,0,0.65)] backdrop-blur-[4px] flex items-center justify-center p-4 overflow-y-auto max-[480px]:items-end max-[480px]:p-0 [animation:overlay-in_0.2s_ease]"
      onClick={onClose}>
      <div
        className="relative bg-[#111111] border border-[rgba(255,255,255,0.1)] rounded-[16px] py-10 px-9 w-full max-w-[400px] max-h-[calc(100vh-2rem)] overflow-y-auto shadow-[0_24px_60px_rgba(0,0,0,0.5)] [animation:card-in_0.25s_cubic-bezier(0.16,1,0.3,1)] max-[480px]:max-w-full max-[480px]:rounded-t-[20px] max-[480px]:rounded-b-none max-[480px]:py-6 max-[480px]:px-5 max-[480px]:pb-8 max-[480px]:max-h-[92dvh] max-[480px]:[animation:card-slide-up_0.3s_cubic-bezier(0.16,1,0.3,1)]"
        onClick={(e) => e.stopPropagation()}>
        <button
          className="absolute top-4 right-4 bg-[rgba(255,255,255,0.06)] border-none text-[rgba(255,255,255,0.5)] w-[30px] min-w-[30px] h-[30px] p-0 aspect-square rounded-full text-[0.75rem] leading-none cursor-pointer flex items-center justify-center flex-shrink-0 box-border transition-[background,color] duration-200 hover:bg-[rgba(255,255,255,0.12)] hover:text-white"
          onClick={onClose}
          aria-label="Close">
          ✕
        </button>

        <h2 className="m-0 mb-1 text-[1.5rem] font-bold text-white font-[Consolas,monospace]">
          Welcome back
        </h2>
        <p className="m-0 mb-7 text-[0.875rem] text-[rgba(255,255,255,0.4)]">
          Sign in to your account
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-[0.4rem]">
            <label
              htmlFor="modal-email"
              className="text-[0.8rem] font-semibold text-[rgba(255,255,255,0.6)] tracking-[0.05em] uppercase">
              Email
            </label>
            <input
              id="modal-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className={fieldCls}
            />
          </div>

          <div className="flex flex-col gap-[0.4rem]">
            <label
              htmlFor="modal-password"
              className="text-[0.8rem] font-semibold text-[rgba(255,255,255,0.6)] tracking-[0.05em] uppercase">
              Password
            </label>
            <div className="relative">
              <input
                id="modal-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className={fieldCls + ' pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none p-0 cursor-pointer text-[rgba(255,255,255,0.35)] hover:text-[rgba(255,255,255,0.7)] transition-colors duration-150">
                {showPassword ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {errorMsg && (
            <p className="m-0 text-[0.85rem] text-[#f87171]">{errorMsg}</p>
          )}

          {verificationPending && (
            <div className="rounded-[10px] bg-[rgba(167,139,250,0.08)] border border-[rgba(167,139,250,0.25)] px-4 py-3 flex flex-col gap-2">
              <p className="m-0 text-[0.85rem] text-[rgba(255,255,255,0.75)] leading-[1.5]">
                Your email isn&apos;t verified yet. We sent a link to{' '}
                <strong className="text-[#a78bfa]">{pendingEmail}</strong>.
              </p>
              {resendMsg ? (
                <p
                  className={`m-0 text-[0.8rem] ${resendMsg.includes('resent') || resendMsg.includes('Check') ? 'text-[#34d399]' : 'text-[#f87171]'}`}>
                  {resendMsg}
                </p>
              ) : (
                <button
                  type="button"
                  className="self-start bg-transparent border-none text-[#a78bfa] text-[0.82rem] font-semibold cursor-pointer p-0 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleResend}
                  disabled={resendLoading}>
                  {resendLoading ? 'Sending…' : 'Resend verification email'}
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            className="mt-2 bg-[#7c3aed] border-none text-white py-3 px-0 rounded-[8px] text-[0.95rem] font-bold cursor-pointer transition-[background,transform,box-shadow] duration-200 tracking-[0.03em] hover:not-disabled:bg-[#6d28d9] hover:not-disabled:-translate-y-[1px] hover:not-disabled:shadow-[0_6px_20px_rgba(124,58,237,0.35)] disabled:opacity-50 disabled:cursor-not-allowed max-[480px]:py-[0.85rem] max-[480px]:text-[1rem]"
            disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* modal__divider — ::before/::after lines added in App.css */}
        <div className="modal__divider flex items-center gap-3 my-5 text-[rgba(255,255,255,0.3)] text-[0.75rem] uppercase tracking-[0.08em]">
          <span>or</span>
        </div>

        <button
          type="button"
          className="flex items-center justify-center gap-[0.6rem] w-full bg-white text-[#1f1f1f] border-none rounded-[8px] py-[0.7rem] px-0 text-[0.95rem] font-semibold cursor-pointer transition-[background,transform,box-shadow] duration-200 hover:-translate-y-[1px] hover:bg-[#f1f1f1] hover:shadow-[0_6px_20px_rgba(0,0,0,0.35)] max-[480px]:py-[0.85rem] max-[480px]:text-[1rem]"
          onClick={loginWithGoogle}>
          <svg
            className="w-[18px] h-[18px] flex-shrink-0"
            viewBox="0 0 18 18"
            aria-hidden="true">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
            />
            <path
              fill="#FBBC05"
              d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"
            />
          </svg>
          Continue with Google
        </button>

        <p className="mt-[0.85rem] text-[0.78rem] leading-[1.4] text-center text-[rgba(255,255,255,0.55)]">
          🎓 Use your <strong className="text-[#34d399]">@calpoly.edu</strong>{' '}
          email to get a Verified Student badge and access club &amp; campus
          events.
        </p>

        <p className="mt-5 text-center text-[0.85rem] text-[rgba(255,255,255,0.35)]">
          Don't have an account?{' '}
          <button
            type="button"
            className="bg-none border-none text-[#a78bfa] font-semibold text-[0.85rem] cursor-pointer p-0 hover:underline"
            onClick={onSwitchToRegister}>
            Register
          </button>
        </p>
      </div>
    </div>
  );
}
