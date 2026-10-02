'use client';

import { useItem } from '@/lib/useItem';
import { useList } from '@/lib/useList';
import StatCard from '@/components/StatCard';
import BarChart from '@/components/BarChart';
import ActivityTimeline from '@/components/ActivityTimeline';

export default function AgencyOverview() {
  const { item: stats } = useItem('/dashboard');
  const { items: activity } = useList('/activity');

  return (
    <div>
      <h1 className="text-2xl font-bold">Overview</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total clients" value={stats?.totalClients} />
        <StatCard title="Active projects" value={stats?.activeProjects} />
        <StatCard title="Due this week" value={stats?.dueSoon} />
        <StatCard title="Completed projects" value={stats?.completedProjects} />
        <StatCard title="Pending feedback" value={stats?.pendingFeedback} />
        <StatCard title="Overdue tasks" value={stats?.overdueTasks} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <BarChart title="Projects by status" data={stats?.projectsByStatus} />
        <BarChart title="Tasks by status" data={stats?.tasksByStatus} />
      </div>

      <h2 className="mt-10 text-lg font-semibold">Recent activity</h2>
      <div className="mt-4">
        <ActivityTimeline items={activity.slice(0, 10)} />
      </div>
    </div>
  );
}
