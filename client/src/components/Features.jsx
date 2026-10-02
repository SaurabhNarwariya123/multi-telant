import SectionHeading from './landing/SectionHeading';

const features = [
  { title: 'Super Admin', text: 'Platform stats, agency search, status controls and support view.' },
  { title: 'Teams', text: 'Manage agency users and roles.' },
  { title: 'Clients', text: 'Client companies, contacts and notes in one place.' },
  { title: 'Projects', text: 'Progress is calculated from completed tasks, never typed in.' },
  { title: 'Tasks & Milestones', text: 'Assign work and track status, priority and deadlines.' },
  { title: 'Meetings & Activity', text: 'Record meetings, notes, updates and approvals.' },
  { title: 'Feedback', text: 'Client requests become trackable work.' },
  { title: 'Client Portal', text: 'Clients see only their own projects and shared content.' },
];

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading eyebrow="Agency workspace" title="Everything your agency needs to run projects." />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((item) => (
          <div key={item.title} className="h-full rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-zinc-400">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
