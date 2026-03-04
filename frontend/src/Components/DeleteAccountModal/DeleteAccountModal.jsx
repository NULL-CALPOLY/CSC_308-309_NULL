import React, { useState, useEffect } from 'react';
import './DeleteAccountModal.css';

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
    <div className="dam-backdrop" onClick={onClose}>
      <div
        className={`dam-modal ${shake ? 'dam-shake' : ''}`}
        onClick={(e) => e.stopPropagation()}>
        {/* Glow orb */}
        <div className="dam-glow" />

        {/* Icon */}
        <div className="dam-icon-wrap">
          <svg
            className="dam-icon"
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

        <h2 className="dam-title">Delete Account</h2>
        <p className="dam-subtitle">
          This action is{' '}
          <span className="dam-highlight">permanent and irreversible.</span>
          <br />
          All your data, events, and preferences will be erased.
        </p>

        <div className="dam-confirm-field">
          <label className="dam-label">
            Type <span className="dam-code">DELETE</span> to confirm
          </label>
          <input
            className={`dam-input ${confirmText && !isMatch ? 'dam-input--error' : ''} ${isMatch ? 'dam-input--valid' : ''}`}
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            placeholder="DELETE"
            autoFocus
            spellCheck={false}
          />
        </div>

        <div className="dam-actions">
          <button
            className="dam-btn dam-btn--cancel"
            onClick={onClose}
            disabled={isDeleting}>
            Cancel
          </button>
          <button
            className="dam-btn dam-btn--delete"
            onClick={handleConfirm}
            disabled={!isMatch || isDeleting}>
            {isDeleting ? (
              <span className="dam-spinner" />
            ) : (
              'Delete My Account'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
