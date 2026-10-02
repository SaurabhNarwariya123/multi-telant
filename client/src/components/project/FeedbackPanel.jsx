'use client';

import { api } from '@/lib/api';
import { useList } from '@/lib/useList';
import SimpleForm from '@/components/SimpleForm';
import FeedbackItem from './FeedbackItem';

export default function FeedbackPanel({ projectId, canManage }) {
  const { items: feedbacks, reload } = useList(projectId ? `/feedback?projectId=${projectId}` : '/feedback');
  const { items: projects } = useList('/projects');

  const fields = [
    ...(projectId
      ? []
      : [{ name: 'projectId', placeholder: 'Select project', options: projects.map((project) => ({ value: project._id, label: project.name })) }]),
    { name: 'title', placeholder: 'Request title' },
    { name: 'description', placeholder: 'Describe the change or feedback', type: 'textarea' },
  ];

  const addFeedback = async (values) => {
    await api('/feedback', { method: 'POST', body: { projectId, ...values } });
    reload();
  };

  return (
    <div>
      <SimpleForm fields={fields} submitLabel="Submit feedback" onSubmit={addFeedback} />
      <ul className="mt-6 space-y-4">
        {feedbacks.map((feedback) => (
          <FeedbackItem key={feedback._id} feedback={feedback} canManage={canManage} onChange={reload} />
        ))}
        {!feedbacks.length && <p className="text-sm text-zinc-500">No feedback yet.</p>}
      </ul>
    </div>
  );
}
