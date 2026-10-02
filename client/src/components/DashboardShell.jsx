'use client';

import { useAuth } from '@/context/UserContext';
import Sidebar from './Sidebar';

export default function DashboardShell({ children }) {
  const { user, support, leaveSupport, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col">
      {support && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/30 bg-amber-500/15 px-6 py-2.5 text-sm text-amber-200">
          <span>
            You are viewing <strong>{support.name}</strong> as Super Admin (support mode). Changes you make are recorded in the agency's activity log.
          </span>
          <button onClick={leaveSupport} className="rounded-lg border border-amber-400/40 px-3 py-1 hover:bg-amber-500/20">
            Exit support mode
          </button>
        </div>
      )}
      <div className="flex flex-1">
        <Sidebar user={user} onLogout={logout} />
        <main className="min-w-0 flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
