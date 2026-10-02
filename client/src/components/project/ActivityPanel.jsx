'use client';

import { useList } from '@/lib/useList';
import ActivityTimeline from '@/components/ActivityTimeline';

export default function ActivityPanel({ projectId }) {
  const { items } = useList(`/activity?projectId=${projectId}`);

  return <ActivityTimeline items={items} />;
}
