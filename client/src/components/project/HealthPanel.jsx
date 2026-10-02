'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';
import Badge from '@/components/Badge';

export default function HealthPanel({ projectId }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyze = async () => {
    setLoading(true);
    setError('');
    try {
      setHealth(await api(`/ai/project-health/${projectId}`));
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <button onClick={analyze} disabled={loading} className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium hover:bg-indigo-400 disabled:opacity-50">
        {loading ? 'Analyzing...' : 'Analyze project health'}
      </button>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {health && (
        <div className="mt-6 space-y-5">
          <div className="flex items-center gap-3">
            <Badge value={health.riskLevel} />
            <span className="text-xs text-zinc-500">{health.source === 'ai' ? 'AI summary' : 'Rule-based summary'}</span>
          </div>
          <p className="whitespace-pre-wrap text-sm text-zinc-200">{health.summary}</p>

          {!!health.risks.length && (
            <div>
              <h3 className="font-semibold">Possible risks</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-300">
                {health.risks.map((risk) => (
                  <li key={risk}>{risk}</li>
                ))}
              </ul>
            </div>
          )}

          {!!health.overdueTasks.length && (
            <div>
              <h3 className="font-semibold">Overdue tasks</h3>
              <ul className="mt-2 space-y-1 text-sm text-zinc-300">
                {health.overdueTasks.map((task) => (
                  <li key={task.title}>
                    {task.title} · due {formatDate(task.dueDate)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!!health.stalledMilestones.length && (
            <div>
              <h3 className="font-semibold">Stalled milestones</h3>
              <ul className="mt-2 space-y-1 text-sm text-zinc-300">
                {health.stalledMilestones.map((item) => (
                  <li key={item.title}>
                    {item.title} · due {formatDate(item.dueDate)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
