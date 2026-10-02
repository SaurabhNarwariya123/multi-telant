import { label } from '@/lib/format';

// emerald = good/done, sky = in motion, amber = needs attention, rose = problem, violet = default.
const tones = {
  active: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  resolved: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  completed: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  done: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  launched: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  low: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  member: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
  in_progress: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
  in_review: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
  development: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
  testing: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
  open: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  medium: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  due_soon: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  client_review: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  client: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  suspended: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
  overdue: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
  declined: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
  high: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
};

export default function Badge({ value }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${
        tones[value] || 'bg-violet-500/15 text-violet-300 ring-violet-500/30'
      }`}
    >
      {label(value)}
    </span>
  );
}
