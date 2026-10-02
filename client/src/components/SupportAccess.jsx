'use client';

import { useAuth } from '@/context/UserContext';
import { ShieldIcon } from '@/components/Icons';

// Module-wise permissions a Super Admin gets inside an agency in support mode (matches the access matrix).
const MODULES = [
  { name: 'Overview', href: '/dashboard', view: true, create: false, edit: false, remove: false },
  { name: 'Team members & roles', href: '/dashboard/team', view: true, create: true, edit: true, remove: true },
  { name: 'Clients', href: '/dashboard/clients', view: true, create: true, edit: true, remove: true },
  { name: 'Projects', href: '/dashboard/projects', view: true, create: true, edit: true, remove: true },
  { name: 'Tasks & milestones', href: '/dashboard/projects', view: true, create: true, edit: true, remove: true },
  { name: 'Meetings & updates', href: '/dashboard/projects', view: true, create: true, edit: true, remove: true },
  { name: 'Client feedback', href: '/dashboard/feedback', view: true, create: false, edit: true, remove: true },
  { name: 'Files', href: '/dashboard/projects', view: true, create: true, edit: true, remove: true },
];

const Mark = ({ on }) => (
  <span className={on ? 'text-emerald-400' : 'text-zinc-600'}>{on ? '✓' : '—'}</span>
);

export default function SupportAccess({ agency }) {
  const { startSupport } = useAuth();
  const open = (href) => startSupport(agency, href);

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold">Support access</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Open a module directly. Super Admin gets admin-level access in this agency only, and every change is audited.
      </p>
      <div className="mt-3 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase text-zinc-400">
            <tr>
              <th className="px-4 py-3">Module</th>
              <th className="px-4 py-3 text-center">View</th>
              <th className="px-4 py-3 text-center">Create</th>
              <th className="px-4 py-3 text-center">Edit</th>
              <th className="px-4 py-3 text-center">Delete</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {MODULES.map((module) => (
              <tr key={module.name} className="border-t border-white/10">
                <td className="px-4 py-3">{module.name}</td>
                <td className="px-4 py-3 text-center"><Mark on={module.view} /></td>
                <td className="px-4 py-3 text-center"><Mark on={module.create} /></td>
                <td className="px-4 py-3 text-center"><Mark on={module.edit} /></td>
                <td className="px-4 py-3 text-center"><Mark on={module.remove} /></td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => open(module.href)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1 text-xs hover:bg-white/10"
                  >
                    <ShieldIcon className="h-3.5 w-3.5" /> Open
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
