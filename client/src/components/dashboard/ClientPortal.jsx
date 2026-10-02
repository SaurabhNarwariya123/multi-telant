'use client';

import Link from 'next/link';
import { api } from '@/lib/api';
import { useUser } from '@/context/UserContext';
import { useItem } from '@/lib/useItem';
import { useList } from '@/lib/useList';
import { formatDate } from '@/lib/format';
import ProjectCard from '@/components/ProjectCard';
import ActivityTimeline from '@/components/ActivityTimeline';

export default function ClientPortal() {
  const user = useUser();
  const { item: me } = useItem('/auth/me');
  const { items: projects, reload } = useList('/projects');
  const { items: milestones } = useList('/milestones');
  const { items: feedbacks } = useList('/feedback');
  const { items: activity } = useList('/activity');

  const awaitingApproval = projects.filter((project) => project.status === 'client_review' && !project.clientApprovedAt);
  const upcoming = milestones.filter((milestone) => milestone.status !== 'completed').slice(0, 5);
  const openFeedback = feedbacks.filter((item) => !['resolved', 'declined'].includes(item.status)).length;

  const approve = async (id) => {
    await api(`/projects/${id}/approve`, { method: 'POST' });
    reload();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
      <p className="mt-1 text-sm text-zinc-400">
        {me?.company && <span className="font-medium text-zinc-200">{me.company} · </span>}
        {openFeedback} open feedback request(s)
      </p>

      {!!awaitingApproval.length && (
        <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
          <h2 className="font-semibold">Needs your action</h2>
          {awaitingApproval.map((project) => (
            <div key={project._id} className="mt-3 flex items-center justify-between text-sm">
              <span>{project.name} is ready for your review</span>
              <button onClick={() => approve(project._id)} className="rounded-lg bg-indigo-500 px-4 py-2 hover:bg-indigo-400">
                Approve
              </button>
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-8 text-lg font-semibold">Your projects</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link key={project._id} href={`/dashboard/projects/${project._id}`}>
            <ProjectCard project={project} />
          </Link>
        ))}
      </div>

      <h2 className="mt-8 text-lg font-semibold">Upcoming milestones</h2>
      <ul className="mt-4 space-y-2">
        {upcoming.map((milestone) => (
          <li key={milestone._id} className="flex justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm">
            <span>{milestone.title}</span>
            <span className="text-zinc-400">{formatDate(milestone.dueDate)}</span>
          </li>
        ))}
        {!upcoming.length && <p className="text-sm text-zinc-500">No upcoming milestones.</p>}
      </ul>

      <h2 className="mt-8 text-lg font-semibold">Recent updates</h2>
      <div className="mt-4">
        <ActivityTimeline items={activity.slice(0, 8)} />
      </div>
    </div>
  );
}
