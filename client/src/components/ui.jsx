import Link from 'next/link';

// Shared button styles so every action looks and behaves the same across the app.
const variants = {
  primary:
    'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-400 hover:to-violet-400',
  secondary: 'border border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10',
  danger: 'border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20',
};

export function Button({ variant = 'primary', icon: Icon, children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

const tones = {
  view: 'text-sky-300 hover:bg-sky-500/15',
  edit: 'text-amber-300 hover:bg-amber-500/15',
  delete: 'text-rose-300 hover:bg-rose-500/15',
  success: 'text-emerald-300 hover:bg-emerald-500/15',
  neutral: 'text-zinc-300 hover:bg-white/10',
};

const iconButtonClass = (tone) =>
  `inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition disabled:opacity-40 ${tones[tone]}`;

// Icon-only action; `label` is used for the tooltip and screen readers.
export function IconButton({ icon: Icon, label, tone = 'neutral', href, ...props }) {
  if (href) {
    return (
      <Link href={href} title={label} aria-label={label} className={iconButtonClass(tone)}>
        <Icon size={16} />
      </Link>
    );
  }
  return (
    <button type="button" title={label} aria-label={label} {...props} className={iconButtonClass(tone)}>
      <Icon size={16} />
    </button>
  );
}
