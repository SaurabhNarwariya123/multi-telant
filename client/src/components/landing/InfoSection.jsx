import SectionHeading from './SectionHeading';

export default function InfoSection({ id, eyebrow, title, text, points }) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading eyebrow={eyebrow} title={title} text={text} />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {points.map((point) => (
          <div key={point} className="h-full rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-300">{point}</div>
        ))}
      </div>
    </section>
  );
}
