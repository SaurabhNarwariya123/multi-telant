'use client';

import { useItem } from '@/lib/useItem';
import { useList } from '@/lib/useList';
import StatCard from '@/components/StatCard';
import ActivityTimeline from '@/components/ActivityTimeline';

export default function PlatformOverview() {
  const { item: stats } = useItem('/agencies/stats');
  const { items: activity } = useList('/agencies/activity');

  return (
    <div>
      <h1 className="text-2xl font-bold">Platform overview</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total agencies" value={stats?.agencies} />
        <StatCard title="Active agencies" value={stats?.activeAgencies} />
        <StatCard title="Inactive agencies" value={stats?.inactiveAgencies} />
        <StatCard title="Total users" value={stats?.users} />
        <StatCard title="Total clients" value={stats?.clients} />
        <StatCard title="Total projects" value={stats?.projects} />
      </div>

      <h2 className="mt-10 text-lg font-semibold">Platform activity</h2>
      <div className="mt-4">
        <ActivityTimeline items={activity} />
      </div>
    </div>
  );
}
