import React, { useState, useEffect } from 'react';

export default function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}) {
  const [confirmText, setConfirmText] = useState('');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!isOpen) setConfirmText('');
  }, [isOpen]);

  if (!isOpen) return null;

  const isMatch = confirmText === 'DELETE';

  const handleConfirm = () => {
    if (!isMatch) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    onConfirm();
  };

  return (
    <div
      data-testid="dam-backdrop"
      className="fixed inset-0 bg-[rgba(0,0,0,0.75)] backdrop-blur-[6px] flex items-center justify-center z-[9999] animate-[dam-fade-in_0.2s_ease_both]"
      onClick={onClose}>
      <div
        data-testid="dam-modal"
        className={`relative bg-[#0f0f0f] border border-[rgba(239,68,68,0.2)] rounded-[20px] px-8 pt-10 pb-8 w-full max-w-[420px] m-4 flex flex-col items-center gap-4 overflow-hidden shadow-[0_0_0_1px_rgba(239,68,68,0.08),0_24px_60px_rgba(0,0,0,0.6)] animate-[dam-slide-up_0.3s_cubic-bezier(0.16,1,0.3,1)_both] ${shake ? 'animate-[dam-shake_0.45s_cubic-bezier(0.36,0.07,0.19,0.97)_both]' : ''}`}
        onClick={(e) => e.stopPropagation()}>
        {/* Glow orb */}
        <div className="absolute -top-[60px] left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-[radial-gradient(ellipse,rgba(239,68,68,0.15)_0%,transparent_70%)] pointer-events-none" />

        {/* Icon */}
        <div className="w-[54px] h-[54px] rounded-[14px] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] flex items-center justify-center flex-shrink-0">
          <svg
            className="w-[26px] h-[26px] text-[#ef4444]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        <h2 className="font-['DM_Serif_Display',serif] text-[1.45rem] text-white m-0 text-center">Delete Account</h2>
        <p className="font-['DM_Mono',monospace] text-[0.74rem] text-[rgba(255,255,255,0.38)] text-center leading-[1.7] m-0">
          This action is{' '}
          <span className="text-[#f87171]">permanent and irreversible.</span>
          <br />
          All your data, events, and preferences will be erased.
        </p>

        <div className="w-full flex flex-col gap-[0.45rem] mt-1">
          <label className="font-['DM_Mono',monospace] text-[0.62rem] uppercase tracking-[0.1em] text-[rgba(255,255,255,0.28)]">
            Type <span className="text-[#f87171] font-['DM_Mono',monospace]">DELETE</span> to confirm
          </label>
          <input
            className={`bg-[rgba(255,255,255,0.04)] border rounded-[8px] py-[0.65rem] px-[0.9rem] font-['DM_Mono',monospace] text-[0.9rem] tracking-[0.15em] text-white w-full box-border outline-none transition-[border-color,box-shadow,background] duration-200 placeholder:text-[rgba(255,255,255,0.12)] placeholder:tracking-[0.15em] focus:border-[rgba(255,255,255,0.2)] focus:bg-[rgba(255,255,255,0.06)] ${
              confirmText && !isMatch
                ? 'border-[rgba(239,68,68,0.4)] shadow-[0_0_0_3px_rgba(239,68,68,0.08)]'
                : isMatch
                  ? 'border-[rgba(239,68,68,0.6)] shadow-[0_0_0_3px_rgba(239,68,68,0.12)] bg-[rgba(239,68,68,0.04)]'
                  : 'border-[rgba(255,255,255,0.1)]'
            }`}
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            placeholder="DELETE"
            autoFocus
            spellCheck={false}
          />
        </div>

        <div className="flex gap-3 w-full mt-1">
          <button
            className="flex-1 py-[0.7rem] px-4 rounded-[9px] border border-[rgba(255,255,255,0.1)] bg-transparent font-['DM_Mono',monospace] text-[0.72rem] font-medium tracking-[0.07em] uppercase cursor-pointer transition-all duration-200 text-[rgba(255,255,255,0.4)] flex items-center justify-center min-h-[40px] hover:not-disabled:border-[rgba(255,255,255,0.25)] hover:not-disabled:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={onClose}
            disabled={isDeleting}>
            Cancel
          </button>
          <button
            className="flex-1 py-[0.7rem] px-4 rounded-[9px] border-none bg-[#ef4444] text-white font-['DM_Mono',monospace] text-[0.72rem] font-medium tracking-[0.07em] uppercase cursor-pointer transition-all duration-200 flex items-center justify-center min-h-[40px] hover:not-disabled:bg-[#dc2626] hover:not-disabled:shadow-[0_6px_20px_rgba(239,68,68,0.4)] hover:not-disabled:-translate-y-px disabled:opacity-35 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
            onClick={handleConfirm}
            disabled={!isMatch || isDeleting}>
            {isDeleting ? (
              <span data-testid="dam-spinner" className="w-[14px] h-[14px] border-2 border-[rgba(255,255,255,0.3)] border-t-white rounded-full animate-[dam-spin_0.6s_linear_infinite] inline-block" />
            ) : (
              'Delete My Account'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
