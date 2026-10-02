import SectionHeading from './SectionHeading';

const stack = [
  { name: 'Next.js', role: 'Frontend' },
  { name: 'Node.js', role: 'Backend' },
  { name: 'MongoDB', role: 'Database' },
  { name: 'Tailwind CSS', role: 'Styling' },
];

export default function TechSection() {
  return (
    <section id="technology" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading eyebrow="Technology" title="Built with a modern full-stack architecture." />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stack.map((item) => (
          <div key={item.name} className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-lg font-semibold">{item.name}</p>
            <p className="mt-1 text-sm text-zinc-400">{item.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
