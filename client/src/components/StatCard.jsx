export default function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <p className="text-sm text-zinc-400">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value ?? 0}</p>
    </div>
  );
}
