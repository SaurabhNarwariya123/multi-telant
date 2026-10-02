import { label } from '@/lib/format';

export default function BarChart({ title, data = [] }) {
  const max = Math.max(1, ...data.map((item) => item.count));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-4 space-y-3">
        {data.map((item) => (
          <div key={item._id}>
            <div className="flex justify-between text-xs text-zinc-400">
              <span className="capitalize">{label(item._id)}</span>
              <span>{item.count}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-indigo-500" style={{ width: `${(item.count / max) * 100}%` }} />
            </div>
          </div>
        ))}
        {!data.length && <p className="text-sm text-zinc-500">No data yet.</p>}
      </div>
    </div>
  );
}
