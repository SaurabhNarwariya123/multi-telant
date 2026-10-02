'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { dueState, formatDateTime, label } from '@/lib/format';
import Badge from '@/components/Badge';
import { IconButton } from '@/components/ui';
import { EyeIcon, TrashIcon } from '@/components/Icons';
import FilesPanel from '@/components/project/FilesPanel';

const statuses = ['todo', 'in_progress', 'done'];

const selectClass = 'rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm';
const inputClass = 'flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-indigo-400';

export default function TaskRow({ task, members, onUpdate, onRemove, projectName }) {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(task.comments || []);
  const state = dueState(task);

  const addComment = async (event) => {
    event.preventDefault();
    if (!comment.trim()) return;
    const updated = await api(`/tasks/${task._id}/comments`, { method: 'POST', body: { message: comment } });
    setComments(updated.comments);
    setComment('');
  };

  return (
    <li className="rounded-xl border border-white/10 bg-white/5 px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className={`font-medium ${task.status === 'done' ? 'text-zinc-500 line-through' : ''}`}>{task.title}</p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
            {projectName && <span>{projectName} ·</span>}
            <span>{task.priority}</span>
            {task.dueDate && <span>· due {task.dueDate.slice(0, 10)}</span>}
            {state && <Badge value={state} />}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={task.assigneeId || ''}
            onChange={(event) => onUpdate(task._id, { assigneeId: event.target.value || null })}
            className={selectClass}
          >
            <option value="" className="bg-zinc-900">
              Unassigned
            </option>
            {members.map((member) => (
              <option key={member._id} value={member._id} className="bg-zinc-900">
                {member.name}
              </option>
            ))}
          </select>

          <select value={task.status} onChange={(event) => onUpdate(task._id, { status: event.target.value })} className={selectClass}>
            {statuses.map((status) => (
              <option key={status} value={status} className="bg-zinc-900">
                {label(status)}
              </option>
            ))}
          </select>

          <IconButton icon={EyeIcon} label={open ? 'Hide details' : 'View details'} tone="view" onClick={() => setOpen(!open)} />
          <IconButton icon={TrashIcon} label="Delete task" tone="delete" onClick={() => onRemove(task._id)} />
        </div>
      </div>

      {open && (
        <div className="mt-4 space-y-5 border-t border-white/10 pt-4">
          {task.description && <p className="text-sm text-zinc-300">{task.description}</p>}

          <div>
            <h4 className="text-sm font-semibold">Comments</h4>
            <ul className="mt-2 space-y-1">
              {comments.map((item) => (
                <li key={item._id} className="text-sm text-zinc-300">
                  <span className="font-medium">{item.userName}</span>: {item.message}
                  <span className="ml-2 text-xs text-zinc-500">{formatDateTime(item.createdAt)}</span>
                </li>
              ))}
              {!comments.length && <p className="text-sm text-zinc-500">No comments yet.</p>}
            </ul>
            <form onSubmit={addComment} className="mt-3 flex gap-2">
              <input className={inputClass} placeholder="Add a note" value={comment} onChange={(event) => setComment(event.target.value)} />
              <button className="rounded-lg bg-indigo-500 px-4 py-2 text-sm hover:bg-indigo-400">Send</button>
            </form>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Files on this task</h4>
            <div className="mt-2">
              <FilesPanel projectId={task.projectId} attachedToType="task" attachedToId={task._id} canManage />
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
