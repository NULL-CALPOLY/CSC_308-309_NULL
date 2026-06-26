// Small "Verified Student" badge shown for accounts on a recognized student
// email domain (e.g. @calpoly.edu). Render only when isVerifiedStudent is true.

const SIZE_CLASSES = {
  sm: 'text-[0.72rem]',
  md: 'text-[0.85rem]',
  lg: 'text-[1rem]',
};

const ICON_SIZES = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4',
};

export default function VerifiedBadge({ size = 'md', label = 'Verified Student' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[rgba(52,211,153,0.12)] border border-[rgba(52,211,153,0.3)] text-[#34d399] font-semibold ${SIZE_CLASSES[size] ?? SIZE_CLASSES.md}`}
      title="Verified student — signed in with a school email">
      <svg
        viewBox="0 0 24 24"
        className={`${ICON_SIZES[size] ?? ICON_SIZES.md} flex-shrink-0`}
        aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 1l2.6 1.9 3.2-.1 1 3.05 2.6 1.85-1 3.05L23 15l-2.6 1.85 1 3.05-3.2-.1L15.6 21 12 19.1 8.4 21l-1.8-2.25-3.2.1 1-3.05L1 13.85 3.6 12l-1-3.05 3.2.1L7.4 6 12 1z"
        />
        <path
          fill="#080808"
          d="M10.6 14.6l-2.3-2.3-1.1 1.1 3.4 3.4 6-6-1.1-1.1z"
        />
      </svg>
      {label && <span>{label}</span>}
    </span>
  );
}
