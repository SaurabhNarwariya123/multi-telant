export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`rounded-lg px-4 py-2 text-sm capitalize ${active === tab ? 'bg-indigo-500' : 'text-zinc-400 hover:text-white'}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
