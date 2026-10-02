import Link from 'next/link';

export default function Hero() {
  return (
    <section className="mx-auto flex min-h-screen max-w-6xl items-center px-6 pt-20">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          Manage Agencies. Projects. Teams. Clients.
        </h1>
        <p className="mt-6 text-lg text-zinc-400">
          Build a project management platform where agencies can manage their teams, clients, projects, tasks,
          meetings, feedback, and files, while keeping every agency&apos;s data completely isolated.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/register" className="rounded-lg bg-indigo-500 px-6 py-3 font-medium hover:bg-indigo-400">
            Explore Platform
          </Link>
          <a href="#features" className="rounded-lg border border-white/15 bg-zinc-950/60 px-6 py-3 font-medium hover:bg-white/5">
            View Features
          </a>
        </div>
      </div>
    </section>
  );
}
