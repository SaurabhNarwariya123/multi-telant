import { formatDateTime, label } from '@/lib/format';

export default function ActivityTimeline({ items }) {
  if (!items.length) return <p className="text-sm text-zinc-500">No activity yet.</p>;

  return (
    <ol className="relative ml-2 space-y-5 border-l border-white/10 pl-6">
      {items.map((item) => (
        <li key={item._id} className="relative">
          <span className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full bg-indigo-400 ring-4 ring-zinc-950" />
          <p className="text-sm">{item.message}</p>
          <p className="mt-1 text-xs text-zinc-500">
            {item.actorName} · <span className="capitalize">{label(item.eventType)}</span> · {formatDateTime(item.createdAt)}
            {item.agencyId?.name && ` · ${item.agencyId.name}`}
          </p>
        </li>
      ))}
    </ol>
  );
}
