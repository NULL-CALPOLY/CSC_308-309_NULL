import React from 'react';

export default function CreateEventButton({ onClick, label = 'Create Event' }) {
  return (
    <button
      className="inline-flex items-center gap-2 h-[46px] px-5 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] text-white font-semibold text-sm border-none cursor-pointer shadow-[0_4px_20px_rgba(124,58,237,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(124,58,237,0.55)]"
      onClick={onClick}>
      <svg
        className="w-4 h-4 flex-shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      <span>{label}</span>
    </button>
  );
}
