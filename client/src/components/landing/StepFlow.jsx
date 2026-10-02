import SectionHeading from './SectionHeading';

export default function StepFlow({ id, eyebrow, title, text, steps }) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading eyebrow={eyebrow} title={title} text={text} />

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-none xl:[grid-template-columns:repeat(var(--steps),minmax(0,1fr))]" style={{ '--steps': steps.length }}>
        {steps.map((step, index) => (
          <div key={step} className="h-full rounded-2xl border border-white/10 bg-white/5 p-5">
            <span className="text-xs text-indigo-400">0{index + 1}</span>
            <p className="mt-2 font-medium">{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
