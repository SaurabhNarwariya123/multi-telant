import Link from 'next/link';

export default function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Build a project management platform your agency can rely on.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-zinc-400">
          Bring teams, clients, projects, tasks, feedback, meetings and files into one secure workspace.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/register" className="rounded-lg bg-indigo-500 px-6 py-3 font-medium hover:bg-indigo-400">
            Explore the Platform
          </Link>
          <a href="#workflow" className="rounded-lg border border-white/15 px-6 py-3 font-medium hover:bg-white/5">
            View Project Workflow
          </a>
        </div>
      </div>
    </section>
  );
}
