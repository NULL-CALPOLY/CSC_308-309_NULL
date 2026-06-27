import { createPortal } from 'react-dom';

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

const VARIANT_CLASSES = {
  success: 'bg-[rgba(16,38,22,0.92)] border-[rgba(34,197,94,0.3)] text-[#86efac]',
  error:   'bg-[rgba(38,16,16,0.92)] border-[rgba(239,68,68,0.3)] text-[#fca5a5]',
  warning: 'bg-[rgba(38,32,10,0.92)] border-[rgba(234,179,8,0.3)] text-[#fde68a]',
  info:    'bg-[rgba(10,16,38,0.92)] border-[rgba(124,58,237,0.35)] text-[#c4b5fd]',
};

const ICON_CLASSES = {
  success: 'text-[#4ade80]',
  error:   'text-[#f87171]',
  warning: 'text-[#facc15]',
  info:    'text-[#a78bfa]',
};

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return createPortal(
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 pointer-events-none max-w-[360px] w-[calc(100vw-48px)] max-[520px]:bottom-20 max-[520px]:right-3 max-[520px]:left-3 max-[520px]:w-auto max-[520px]:max-w-none"
      role="region"
      aria-label="Notifications"
      aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-medium leading-snug backdrop-blur-xl border shadow-[0_8px_32px_rgba(0,0,0,0.4)] pointer-events-auto animate-toast-in ${VARIANT_CLASSES[t.type] ?? VARIANT_CLASSES.info}`}
          role="alert">
          <span className={`flex-shrink-0 flex items-center ${ICON_CLASSES[t.type] ?? ICON_CLASSES.info}`}>
            {ICONS[t.type] ?? ICONS.info}
          </span>
          <span className="flex-1">{t.message}</span>
          <button
            className="flex-shrink-0 bg-transparent border-none p-0.5 cursor-pointer opacity-55 flex items-center rounded hover:opacity-100 transition-opacity duration-150"
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss">
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
