'use client';

import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/UserContext';
import { useItem } from '@/lib/useItem';
import { formatDate } from '@/lib/format';
import StatCard from '@/components/StatCard';
import Badge from '@/components/Badge';
import { Button } from '@/components/ui';
import { PauseIcon, PlayIcon, ShieldIcon } from '@/components/Icons';
import ActivityTimeline from '@/components/ActivityTimeline';
import SupportAccess from '@/components/SupportAccess';

const Section = ({ title, children }) => (
  <div className="mt-8">
    <h2 className="text-lg font-semibold">{title}</h2>
    <ul className="mt-3 space-y-2">{children}</ul>
  </div>
);

const Row = ({ left, right }) => (
  <li className="flex justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm">
    <span>{left}</span>
    <span className="text-zinc-400">{right}</span>
  </li>
);

export default function AgencyDetailPage() {
  const { id } = useParams();
  const { startSupport } = useAuth();
  const { item: detail, reload } = useItem(`/agencies/${id}`);

  if (!detail) return <p className="text-zinc-400">Loading...</p>;

  const { agency } = detail;

  const toggleStatus = async () => {
    const next = agency.status === 'active' ? 'suspended' : 'active';
    if (next === 'suspended' && !confirm(`Suspend ${agency.name}? Its users will be blocked immediately.`)) return;
    await api(`/agencies/${id}/status`, { method: 'PATCH', body: { status: next } });
    reload();
  };

  const openSupport = () => startSupport(agency);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{agency.name}</h1>
          <Badge value={agency.status} />
        </div>
        <div className="flex gap-3 text-sm">
          <Button icon={ShieldIcon} onClick={openSupport}>
            Open in support mode
          </Button>
          <Button
            variant={agency.status === 'active' ? 'danger' : 'secondary'}
            icon={agency.status === 'active' ? PauseIcon : PlayIcon}
            onClick={toggleStatus}
          >
            {agency.status === 'active' ? 'Suspend' : 'Activate'}
          </Button>
        </div>
      </div>
      <p className="mt-2 text-sm text-zinc-400">
        Owner: {detail.owner ? `${detail.owner.name} (${detail.owner.email})` : 'none'} · Plan {agency.plan} · Joined{' '}
        {formatDate(agency.createdAt)}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard title="Users" value={detail.users.length} />
        <StatCard title="Clients" value={detail.clients.length} />
        <StatCard title="Projects" value={detail.projects.length} />
      </div>

      <SupportAccess agency={agency} />

      <Section title="Users">
        {detail.users.map((user) => (
          <Row key={user._id} left={`${user.name} (${user.email})`} right={user.role} />
        ))}
      </Section>

      <Section title="Clients">
        {detail.clients.map((client) => (
          <Row key={client._id} left={client.company} right={client.email} />
        ))}
      </Section>

      <Section title="Projects">
        {detail.projects.map((project) => (
          <Row key={project._id} left={project.name} right={project.status} />
        ))}
      </Section>

      <h2 className="mt-8 text-lg font-semibold">Recent activity</h2>
      <div className="mt-4">
        <ActivityTimeline items={detail.activity} />
      </div>
    </div>
  );
}
