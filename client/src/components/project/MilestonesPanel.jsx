'use client';

import { api } from '@/lib/api';
import { useList } from '@/lib/useList';
import { formatDate, label } from '@/lib/format';
import SimpleForm from '@/components/SimpleForm';
import Badge from '@/components/Badge';
import { IconButton } from '@/components/ui';
import { TrashIcon } from '@/components/Icons';

const statuses = ['pending', 'in_progress', 'completed'];

const fields = [
  { name: 'title', placeholder: 'Milestone title' },
  { name: 'dueDate', placeholder: 'Due date', type: 'date' },
];

export default function MilestonesPanel({ projectId, canEdit }) {
  const { items: milestones, reload } = useList(`/milestones?projectId=${projectId}`);

  const addMilestone = async (values) => {
    await api('/milestones', { method: 'POST', body: { ...values, projectId } });
    reload();
  };

  const updateStatus = async (id, status) => {
    await api(`/milestones/${id}`, { method: 'PATCH', body: { status } });
    reload();
  };

  const removeMilestone = async (id) => {
    await api(`/milestones/${id}`, { method: 'DELETE' });
    reload();
  };

  return (
    <div>
      {canEdit && <SimpleForm fields={fields} submitLabel="Add milestone" onSubmit={addMilestone} />}
      <ul className="mt-6 space-y-3">
        {milestones.map((milestone) => (
          <li key={milestone._id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-4">
            <div>
              <p className="font-medium">{milestone.title}</p>
              <p className="text-xs text-zinc-400">Due {formatDate(milestone.dueDate)}</p>
            </div>
            {canEdit ? (
              <div className="flex items-center gap-4">
                <select
                  value={milestone.status}
                  onChange={(event) => updateStatus(milestone._id, event.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status} className="bg-zinc-900">
                      {label(status)}
                    </option>
                  ))}
                </select>
                <IconButton icon={TrashIcon} label="Delete milestone" tone="delete" onClick={() => removeMilestone(milestone._id)} />
              </div>
            ) : (
              <Badge value={milestone.status} />
            )}
          </li>
        ))}
        {!milestones.length && <p className="text-sm text-zinc-500">No milestones yet.</p>}
      </ul>
    </div>
  );
}
