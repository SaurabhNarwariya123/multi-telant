const base = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

const make = (paths) =>
  function Icon({ size = 16, className = '' }) {
    return (
      <svg {...base} width={size} height={size} className={className}>
        {paths}
      </svg>
    );
  };

export const PlusIcon = make(<path d="M12 5v14M5 12h14" />);
export const EyeIcon = make(
  <>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </>
);
export const TrashIcon = make(
  <>
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
  </>
);
export const PencilIcon = make(<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />);
export const DownloadIcon = make(<path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14" />);
export const ShareIcon = make(
  <>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
  </>
);
export const LockIcon = make(
  <>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </>
);
export const ShieldIcon = make(<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6Z" />);
export const KeyIcon = make(
  <>
    <circle cx="8" cy="15" r="4" />
    <path d="m11 12 9-9M16 7l3 3M14 9l2 2" />
  </>
);
export const PauseIcon = make(<path d="M8 5v14M16 5v14" />);
export const PlayIcon = make(<path d="m7 4 13 8-13 8Z" />);
export const ChevronIcon = make(<path d="m6 9 6 6 6-6" />);
export const CloseIcon = make(<path d="M6 6l12 12M18 6 6 18" />);
export const SendIcon = make(<path d="M22 2 11 13M22 2l-7 20-4-9-9-4Z" />);
