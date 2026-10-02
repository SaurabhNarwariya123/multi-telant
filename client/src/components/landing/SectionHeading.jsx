export default function SectionHeading({ eyebrow, title, text }) {
  return (
    <div>
      <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
      {text && <p className="mt-4 max-w-2xl text-zinc-400">{text}</p>}
    </div>
  );
}
