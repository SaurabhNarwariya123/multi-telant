'use client';

import { useUser } from '@/context/UserContext';
import PlatformOverview from '@/components/dashboard/PlatformOverview';
import AgencyOverview from '@/components/dashboard/AgencyOverview';
import ClientPortal from '@/components/dashboard/ClientPortal';

export default function DashboardPage() {
  const user = useUser();

  if (user.role === 'superadmin') return <PlatformOverview />;
  if (user.role === 'client') return <ClientPortal />;
  return <AgencyOverview />;
}
