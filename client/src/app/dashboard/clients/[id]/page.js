'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useItem } from '@/lib/useItem';
import ActivityTimeline from '@/components/ActivityTimeline';
import ProjectCard from '@/components/ProjectCard';

export default function ClientDetailPage() {
  const { id } = useParams();
  const { item: detail } = useItem(`/clients/${id}`);

  if (!detail) return <p className="text-zinc-400">Loading...</p>;
  const { client, projects, activity } = detail;

  return (
    <div>
      <Link href="/dashboard/clients" className="text-sm text-zinc-400 hover:text-white">
        ← Clients
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{client.company}</h1>
      <p className="mt-1 text-sm text-zinc-400">{[client.contactName, client.email, client.phone].filter(Boolean).join(' · ')}</p>
      {client.notes && (
        <p className="mt-4 whitespace-pre-wrap rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">{client.notes}</p>
      )}

      <h2 className="mt-8 text-lg font-semibold">Projects</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link key={project._id} href={`/dashboard/projects/${project._id}`}>
            <ProjectCard project={project} />
          </Link>
        ))}
      </div>
      {!projects.length && <p className="mt-4 text-sm text-zinc-500">No projects for this client yet.</p>}

      <h2 className="mt-8 text-lg font-semibold">History</h2>
      <div className="mt-4">
        <ActivityTimeline items={activity} />
      </div>
    </div>
  );
}
