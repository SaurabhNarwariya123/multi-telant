import Link from 'next/link';

const anchors = [
  { href: '#structure', label: 'Structure' },
  { href: '#features', label: 'Features' },
  { href: '#workflow', label: 'Workflow' },
  { href: '#security', label: 'Security' },
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-20 border-b border-white/5 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          AgencyHub
        </Link>

        <div className="hidden gap-6 text-sm text-zinc-400 md:flex">
          {anchors.map((anchor) => (
            <a key={anchor.href} href={anchor.href} className="hover:text-white">
              {anchor.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3 text-sm">
          <Link href="/login" className="rounded-lg px-4 py-2 text-zinc-300 hover:text-white">
            Login
          </Link>
          <Link href="/register" className="rounded-lg bg-indigo-500 px-4 py-2 font-medium hover:bg-indigo-400">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
