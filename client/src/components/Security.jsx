import SectionHeading from './landing/SectionHeading';

const rules = [
  'Tenant-level data isolation',
  'Backend authorization on every request',
  'Role-based access',
  'Password hashing',
  'Separate Super Admin privileges',
  'Protected file access',
  'Suspended agency blocking',
];

const Wall = ({ left, right }) => (
  <div className="flex items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6">
    <span className="rounded-lg bg-indigo-500/20 px-4 py-2 text-sm">{left}</span>
    <span className="relative flex h-8 w-16 items-center justify-center">
      <span className="absolute h-px w-full bg-red-400/60" />
      <span className="relative rounded-full bg-zinc-950 px-2 text-red-400">✕</span>
    </span>
    <span className="rounded-lg bg-indigo-500/20 px-4 py-2 text-sm">{right}</span>
  </div>
);

export default function Security() {
  return (
    <section id="security" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading eyebrow="Security" title="Every agency. Completely isolated." text="Access control is enforced by the backend, not by hiding routes in the UI." />

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <Wall left="Agency A" right="Agency B" />
        <Wall left="Client A" right="Client B" />
      </div>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rules.map((rule) => (
          <li key={rule} className="rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-zinc-300">{rule}</li>
        ))}
      </ul>
    </section>
  );
}
