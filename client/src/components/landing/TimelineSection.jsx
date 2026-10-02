import SectionHeading from './SectionHeading';

const events = [
  'Project created',
  'Milestone completed',
  'File uploaded',
  'Feedback submitted',
  'Meeting recorded',
  'Status changed',
  'Approval received',
];

export default function TimelineSection() {
  return (
    <section id="activity" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        eyebrow="Activity"
        title="Every important project event, connected."
        text="Each record stores the agency, actor, event type, related entity, visibility and timestamp."
      />

      <ol className="relative mt-12 ml-3 space-y-8 border-l border-indigo-400/40 pl-8">
        {events.map((event) => (
          <li key={event} className="relative">
            <span className="absolute -left-[39px] top-1 h-3 w-3 rounded-full bg-indigo-400 ring-4 ring-zinc-950" />
            <p className="font-medium">{event}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
