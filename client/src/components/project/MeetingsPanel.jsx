'use client';

import { api } from '@/lib/api';
import { useList } from '@/lib/useList';
import { formatDate } from '@/lib/format';
import SimpleForm from '@/components/SimpleForm';
import { IconButton } from '@/components/ui';
import { TrashIcon } from '@/components/Icons';

const fields = [
  { name: 'title', placeholder: 'Meeting title' },
  { name: 'date', placeholder: 'Date', type: 'date' },
  { name: 'notes', placeholder: 'Meeting notes', type: 'textarea' },
  { name: 'sharedWithClient', placeholder: 'Share with client', type: 'checkbox' },
];

export default function MeetingsPanel({ projectId, canEdit }) {
  const { items: meetings, reload } = useList(`/meetings?projectId=${projectId}`);

  const addMeeting = async (values) => {
    await api('/meetings', { method: 'POST', body: { ...values, projectId } });
    reload();
  };

  const removeMeeting = async (id) => {
    await api(`/meetings/${id}`, { method: 'DELETE' });
    reload();
  };

  return (
    <div>
      {canEdit && <SimpleForm fields={fields} submitLabel="Record meeting" onSubmit={addMeeting} />}
      <ul className="mt-6 space-y-3">
        {meetings.map((meeting) => (
          <li key={meeting._id} className="rounded-xl border border-white/10 bg-white/5 px-5 py-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">{meeting.title}</p>
              <p className="text-xs text-zinc-400">
                {formatDate(meeting.date)} {canEdit && (meeting.sharedWithClient ? '· shared' : '· internal')}
              </p>
            </div>
            {meeting.notes && <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">{meeting.notes}</p>}
            {canEdit && (
              <div className="mt-3">
                <IconButton icon={TrashIcon} label="Delete meeting" tone="delete" onClick={() => removeMeeting(meeting._id)} />
              </div>
            )}
          </li>
        ))}
        {!meetings.length && <p className="text-sm text-zinc-500">No meetings yet.</p>}
      </ul>
    </div>
  );
}
