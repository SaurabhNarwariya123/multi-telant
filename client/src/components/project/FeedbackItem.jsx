'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { formatDateTime, label } from '@/lib/format';
import Badge from '@/components/Badge';
import FilesPanel from './FilesPanel';
import { Button, IconButton } from '@/components/ui';
import { SendIcon, TrashIcon } from '@/components/Icons';

const statuses = ['open', 'in_review', 'in_progress', 'resolved', 'declined'];

const inputClass = 'flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-indigo-400';

export default function FeedbackItem({ feedback, canManage, onChange }) {
  const [comment, setComment] = useState('');
  const [response, setResponse] = useState(feedback.agencyResponse || '');

  const update = async (changes) => {
    await api(`/feedback/${feedback._id}`, { method: 'PATCH', body: changes });
    onChange();
  };

  const addComment = async (event) => {
    event.preventDefault();
    if (!comment.trim()) return;
    await api(`/feedback/${feedback._id}/comments`, { method: 'POST', body: { message: comment } });
    setComment('');
    onChange();
  };

  const remove = async () => {
    await api(`/feedback/${feedback._id}`, { method: 'DELETE' });
    onChange();
  };

  return (
    <li className="rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium">{feedback.title}</p>
        {canManage ? (
          <select
            value={feedback.status}
            onChange={(event) => update({ status: event.target.value })}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm"
          >
            {statuses.map((status) => (
              <option key={status} value={status} className="bg-zinc-900">
                {label(status)}
              </option>
            ))}
          </select>
        ) : (
          <Badge value={feedback.status} />
        )}
      </div>

      {feedback.description && <p className="mt-2 text-sm text-zinc-300">{feedback.description}</p>}

      {canManage ? (
        <div className="mt-3 flex gap-2">
          <input className={inputClass} placeholder="Agency response" value={response} onChange={(event) => setResponse(event.target.value)} />
          <Button variant="secondary" onClick={() => update({ agencyResponse: response })}>
            Save
          </Button>
        </div>
      ) : (
        feedback.agencyResponse && (
          <p className="mt-3 rounded-lg bg-indigo-500/10 px-3 py-2 text-sm">Agency: {feedback.agencyResponse}</p>
        )
      )}

      <ul className="mt-4 space-y-2">
        {feedback.comments.map((item) => (
          <li key={item._id} className="text-sm text-zinc-300">
            <span className="font-medium">{item.userName}</span>: {item.message}
            <span className="ml-2 text-xs text-zinc-500">{formatDateTime(item.createdAt)}</span>
          </li>
        ))}
      </ul>

      <form onSubmit={addComment} className="mt-3 flex gap-2">
        <input className={inputClass} placeholder="Add a comment" value={comment} onChange={(event) => setComment(event.target.value)} />
        <Button icon={SendIcon}>Send</Button>
      </form>

      <div className="mt-4">
        <h4 className="text-sm font-semibold">Files</h4>
        <div className="mt-2">
          <FilesPanel projectId={feedback.projectId} attachedToType="feedback" attachedToId={feedback._id} canManage={canManage} />
        </div>
      </div>

      {canManage && (
        <div className="mt-3">
          <IconButton icon={TrashIcon} label="Delete feedback" tone="delete" onClick={remove} />
        </div>
      )}
    </li>
  );
}
