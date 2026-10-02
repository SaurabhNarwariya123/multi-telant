'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/UserContext';
import { useItem } from '@/lib/useItem';
import { formatDate } from '@/lib/format';
import Badge from '@/components/Badge';
import { Button, IconButton } from '@/components/ui';
import { EyeIcon, PauseIcon, PlayIcon, PlusIcon, ShieldIcon } from '@/components/Icons';

const inputClass = 'rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-indigo-400';

const emptyAgency = { agencyName: '', ownerName: '', email: '', password: '' };

function AddAgencyForm({ onCreated, onCancel }) {
  const [form, setForm] = useState(emptyAgency);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api('/agencies', { method: 'POST', body: form });
      onCreated();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h2 className="text-lg font-semibold">Add agency</h2>
      <p className="mt-1 text-xs text-zinc-500">Creates the agency workspace and its first admin (the owner).</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <input className={`${inputClass} w-full`} placeholder="Agency name" value={form.agencyName} onChange={update('agencyName')} required />
        <input className={`${inputClass} w-full`} placeholder="Owner name" value={form.ownerName} onChange={update('ownerName')} required />
        <input className={`${inputClass} w-full`} type="email" placeholder="Owner email" value={form.email} onChange={update('email')} required />
        <input
          className={`${inputClass} w-full`}
          type="password"
          minLength={8}
          placeholder="Owner password (min 8 characters)"
          value={form.password}
          onChange={update('password')}
          required
        />
      </div>
      {error && <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">{error}</p>}
      <div className="mt-5 flex gap-3">
        <Button disabled={saving} icon={PlusIcon}>
          {saving ? 'Creating...' : 'Create agency'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function AgenciesPage() {
  const { startSupport } = useAuth();
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const query = `/agencies?search=${encodeURIComponent(debounced)}&status=${status}&page=${page}`;
  const { item: result, reload } = useItem(query);
  const agencies = result?.items || [];

  const toggleStatus = async (agency) => {
    const next = agency.status === 'active' ? 'suspended' : 'active';
    if (next === 'suspended' && !confirm(`Suspend ${agency.name}? Its users will be blocked immediately.`)) return;
    await api(`/agencies/${agency._id}/status`, { method: 'PATCH', body: { status: next } });
    reload();
  };

  const openSupport = (agency) => startSupport(agency);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Agencies</h1>
        {!adding && (
          <Button icon={PlusIcon} onClick={() => setAdding(true)}>
            Add agency
          </Button>
        )}
      </div>

      {adding && (
        <AddAgencyForm
          onCreated={() => {
            setAdding(false);
            reload();
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          className={`${inputClass} w-72`}
          placeholder="Search by agency or owner"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          className={inputClass}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
        >
          <option value="" className="bg-zinc-900">All</option>
          <option value="active" className="bg-zinc-900">Active</option>
          <option value="suspended" className="bg-zinc-900">Suspended</option>
        </select>
      </div>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <ul className="mt-6 space-y-3">
        {agencies.map((agency) => (
          <li key={agency._id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-4">
            <div>
              <p className="font-medium">{agency.name}</p>
              <p className="text-xs text-zinc-400">
                {agency.owner ? `${agency.owner.name} · ${agency.owner.email}` : 'No owner'} · Joined {formatDate(agency.createdAt)}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {agency.counts.users} users · {agency.counts.clients} clients · {agency.counts.projects} projects · plan {agency.plan}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Badge value={agency.status} />
              <IconButton icon={EyeIcon} label="View agency" tone="view" href={`/dashboard/agencies/${agency._id}`} />
              <IconButton icon={ShieldIcon} label="Open in support mode" tone="edit" onClick={() => openSupport(agency)} />
              <IconButton
                icon={agency.status === 'active' ? PauseIcon : PlayIcon}
                label={agency.status === 'active' ? 'Suspend agency' : 'Activate agency'}
                tone={agency.status === 'active' ? 'delete' : 'success'}
                onClick={() => toggleStatus(agency)}
              />
            </div>
          </li>
        ))}
        {result && !agencies.length && <p className="text-sm text-zinc-500">No agencies found.</p>}
      </ul>

      {result && result.pages > 1 && (
        <div className="mt-6 flex items-center gap-4 text-sm">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-white/15 px-3 py-1 disabled:opacity-40">
            Previous
          </button>
          <span className="text-zinc-400">
            Page {result.page} of {result.pages} · {result.total} agencies
          </span>
          <button
            disabled={page >= result.pages}
            onClick={() => setPage(page + 1)}
            className="rounded-lg border border-white/15 px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
