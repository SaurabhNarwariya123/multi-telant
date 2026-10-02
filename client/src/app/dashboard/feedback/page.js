'use client';

import { useUser } from '@/context/UserContext';
import FeedbackPanel from '@/components/project/FeedbackPanel';

export default function FeedbackPage() {
  const user = useUser();

  return (
    <div>
      <h1 className="text-2xl font-bold">Feedback</h1>
      <div className="mt-6">
        <FeedbackPanel canManage={user.role !== 'client'} />
      </div>
    </div>
  );
}
