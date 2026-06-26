import { createPortal } from 'react-dom';
import './Toast.css';

const ICONS = {
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
};

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return createPortal(
    <div className="toast-stack" role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`} role="alert">
          <span className="toast-icon">{ICONS[t.type] ?? ICONS.info}</span>
          <span className="toast-msg">{t.message}</span>
          <button className="toast-close" onClick={() => onDismiss(t.id)} aria-label="Dismiss">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/>
            </svg>
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}
