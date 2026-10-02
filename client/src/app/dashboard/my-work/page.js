'use client';

import Link from 'next/link';
import { api } from '@/lib/api';
import { useUser } from '@/context/UserContext';
import { useList } from '@/lib/useList';
import { dueState } from '@/lib/format';
import TaskRow from '@/components/TaskRow';

export default function MyWorkPage() {
  const user = useUser();
  const { items: tasks, reload } = useList(`/tasks?assigneeId=${user.id}`);
  const { items: projects } = useList('/projects');
  const { items: members } = useList('/users/team');

  const projectName = (id) => projects.find((project) => project._id === id)?.name;
  const open = tasks.filter((task) => task.status !== 'done');
  const overdue = open.filter((task) => dueState(task) === 'overdue');
  const dueSoon = open.filter((task) => dueState(task) === 'due_soon');
  const later = open.filter((task) => !dueState(task));
  const done = tasks.filter((task) => task.status === 'done');

  const updateTask = async (id, changes) => {
    await api(`/tasks/${id}`, { method: 'PATCH', body: changes });
    reload();
  };

  const removeTask = async (id) => {
    await api(`/tasks/${id}`, { method: 'DELETE' });
    reload();
  };

  const group = (title, items) =>
    !!items.length && (
      <section className="mt-8">
        <h2 className="text-lg font-semibold">
          {title} <span className="text-sm font-normal text-zinc-500">({items.length})</span>
        </h2>
        <ul className="mt-3 space-y-3">
          {items.map((task) => (
            <TaskRow
              key={task._id}
              task={task}
              members={members}
              projectName={projectName(task.projectId)}
              onUpdate={updateTask}
              onRemove={removeTask}
            />
          ))}
        </ul>
      </section>
    );

  return (
    <div>
      <h1 className="text-2xl font-bold">My work</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Tasks assigned to you across all projects.{' '}
        <Link href="/dashboard/projects" className="text-indigo-300">
          Browse projects
        </Link>
      </p>

      {group('Overdue', overdue)}
      {group('Due this week', dueSoon)}
      {group('Later', later)}
      {group('Done', done)}
      {!tasks.length && <p className="mt-8 text-sm text-zinc-500">Nothing is assigned to you yet.</p>}
    </div>
  );
}
