'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { dueState } from '@/lib/format';
import { useList } from '@/lib/useList';
import SimpleForm from '@/components/SimpleForm';
import TaskRow from '@/components/TaskRow';

const filters = [
  ['all', 'All'],
  ['open', 'Open'],
  ['overdue', 'Overdue'],
  ['week', 'Due this week'],
];

export default function TasksPanel({ projectId, onChange }) {
  const { items: tasks, reload } = useList(`/tasks?projectId=${projectId}`);
  const { items: members } = useList('/users/team');
  const [filter, setFilter] = useState('all');

  const visible = tasks.filter((task) => {
    if (filter === 'overdue') return dueState(task) === 'overdue';
    if (filter === 'week') return dueState(task) === 'due_soon';
    if (filter === 'open') return task.status !== 'done';
    return true;
  });

  const fields = [
    { name: 'title', placeholder: 'Task title' },
    { name: 'description', placeholder: 'Description', type: 'textarea' },
    { name: 'assigneeId', placeholder: 'Assignee', options: members.map((member) => ({ value: member._id, label: member.name })) },
    { name: 'priority', placeholder: 'Priority', options: ['low', 'medium', 'high'].map((value) => ({ value, label: value })) },
    { name: 'dueDate', placeholder: 'Due date', type: 'date' },
  ];

  const refresh = () => {
    reload();
    onChange();
  };

  const addTask = async (values) => {
    await api('/tasks', { method: 'POST', body: { ...values, projectId } });
    refresh();
  };

  const updateTask = async (id, changes) => {
    await api(`/tasks/${id}`, { method: 'PATCH', body: changes });
    refresh();
  };

  const removeTask = async (id) => {
    await api(`/tasks/${id}`, { method: 'DELETE' });
    refresh();
  };

  return (
    <div>
      <SimpleForm fields={fields} submitLabel="Add task" onSubmit={addTask} />

      <div className="mt-5 flex flex-wrap gap-2 text-sm">
        {filters.map(([value, text]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded-full px-3 py-1 ${filter === value ? 'bg-indigo-500' : 'bg-white/5 text-zinc-300 hover:bg-white/10'}`}
          >
            {text}
          </button>
        ))}
      </div>

      <ul className="mt-4 space-y-3">
        {visible.map((task) => (
          <TaskRow key={task._id} task={task} members={members} onUpdate={updateTask} onRemove={removeTask} />
        ))}
        {!visible.length && (
          <p className="text-sm text-zinc-500">{tasks.length ? 'No tasks match this filter.' : 'No tasks yet.'}</p>
        )}
      </ul>
    </div>
  );
}
