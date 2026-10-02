'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useUser } from '@/context/UserContext';
import { useItem } from '@/lib/useItem';
import { formatDate, label } from '@/lib/format';
import Badge from '@/components/Badge';
import Tabs from '@/components/Tabs';
import TasksPanel from '@/components/project/TasksPanel';
import MilestonesPanel from '@/components/project/MilestonesPanel';
import MeetingsPanel from '@/components/project/MeetingsPanel';
import FeedbackPanel from '@/components/project/FeedbackPanel';
import FilesPanel from '@/components/project/FilesPanel';
import ActivityPanel from '@/components/project/ActivityPanel';
import HealthPanel from '@/components/project/HealthPanel';

const stages = ['planning', 'design', 'development', 'testing', 'client_review', 'launched'];
const staffTabs = ['tasks', 'milestones', 'meetings', 'feedback', 'files', 'activity', 'ai health'];
const clientTabs = ['milestones', 'meetings', 'feedback', 'files', 'activity'];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const user = useUser();
  const isClient = user.role === 'client';
  const tabs = isClient ? clientTabs : staffTabs;
  const [tab, setTab] = useState(tabs[0]);
  const { item: project, reload } = useItem(`/projects/${id}`);

  if (!project) return <p className="text-zinc-400">Loading...</p>;

  const changeStatus = async (status) => {
    await api(`/projects/${id}`, { method: 'PATCH', body: { status } });
    reload();
  };

  const approve = async () => {
    await api(`/projects/${id}/approve`, { method: 'POST' });
    reload();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {project.description} · Due {formatDate(project.dueDate)} · <Badge value={project.priority} />
          </p>
        </div>

        {isClient ? (
          <div className="flex items-center gap-3">
            <Badge value={project.status} />
            {project.status === 'client_review' && project.clientApprovedAt && (
              <span className="text-sm text-emerald-300">Approved</span>
            )}
            {project.status === 'client_review' && !project.clientApprovedAt && (
              <button onClick={approve} className="rounded-lg bg-indigo-500 px-4 py-2 text-sm hover:bg-indigo-400">
                Approve
              </button>
            )}
          </div>
        ) : (
          <select
            value={project.status}
            onChange={(event) => changeStatus(event.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          >
            {stages.map((stage) => (
              <option key={stage} value={stage} className="bg-zinc-900">
                {label(stage)}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-indigo-500" style={{ width: `${project.progress}%` }} />
        </div>
        <span className="text-sm text-zinc-400">{project.progress}%</span>
      </div>

      <div className="mt-8">
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
        <div className="mt-6">
          {tab === 'tasks' && <TasksPanel projectId={id} onChange={reload} />}
          {tab === 'milestones' && <MilestonesPanel projectId={id} canEdit={!isClient} />}
          {tab === 'meetings' && <MeetingsPanel projectId={id} canEdit={!isClient} />}
          {tab === 'feedback' && <FeedbackPanel projectId={id} canManage={!isClient} />}
          {tab === 'files' && <FilesPanel projectId={id} canManage={!isClient} />}
          {tab === 'activity' && <ActivityPanel projectId={id} />}
          {tab === 'ai health' && <HealthPanel projectId={id} />}
        </div>
      </div>
    </div>
  );
}
