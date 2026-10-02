'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard', label: 'Overview', roles: ['superadmin', 'admin', 'member', 'client'] },
  { href: '/dashboard/agencies', label: 'Agencies', roles: ['superadmin'] },
  { href: '/dashboard/my-work', label: 'My work', roles: ['admin', 'member'] },
  { href: '/dashboard/clients', label: 'Clients', roles: ['admin', 'member'] },
  { href: '/dashboard/projects', label: 'Projects', roles: ['admin', 'member', 'client'] },
  { href: '/dashboard/feedback', label: 'Feedback', roles: ['admin', 'member', 'client'] },
  { href: '/dashboard/team', label: 'Team', roles: ['admin'] },
];

export default function Sidebar({ user, onLogout }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-white/10 p-5">
      <p className="text-lg font-semibold">AgencyHub</p>
      <p className="mt-1 text-xs text-zinc-400">
        {user.name} · {user.role}
      </p>

      <nav className="mt-8 flex flex-col gap-1 text-sm">
        {links
          .filter((link) => link.roles.includes(user.role))
          .map((link) => {
            const active = link.href === '/dashboard' ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 ${active ? 'bg-white/10' : 'text-zinc-400 hover:text-white'}`}
              >
                {link.label}
              </Link>
            );
          })}
      </nav>

      <button onClick={onLogout} className="mt-auto rounded-lg border border-white/15 px-3 py-2 text-sm hover:bg-white/5">
        Logout
      </button>
    </aside>
  );
}
