'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useUser } from '@/context/UserContext';
import { useList } from '@/lib/useList';
import { Button, IconButton } from '@/components/ui';
import { EyeIcon, KeyIcon, PencilIcon, PlusIcon, TrashIcon } from '@/components/Icons';

const inputClass =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20';

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</span>
      {children}
    </label>
  );
}

// One form for create and edit: pass `client` to edit it.
function ClientForm({ client, onSaved, onCancel }) {
  const [form, setForm] = useState({
    company: client?.company || '',
    contactName: client?.contactName || '',
    email: client?.email || '',
    phone: client?.phone || '',
    notes: client?.notes || '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (client) await api(`/clients/${client._id}`, { method: 'PATCH', body: form });
      else await api('/clients', { method: 'POST', body: form });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h2 className="text-lg font-semibold">{client ? `Edit ${client.company}` : 'Add client company'}</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Company name">
          <input className={inputClass} value={form.company} onChange={update('company')} placeholder="Acme Inc." required />
        </Field>
        <Field label="Primary contact">
          <input className={inputClass} value={form.contactName} onChange={update('contactName')} placeholder="Jane Doe" />
        </Field>
        <Field label="Email">
          <input className={inputClass} type="email" value={form.email} onChange={update('email')} placeholder="jane@acme.com" />
        </Field>
        <Field label="Phone">
          <input className={inputClass} value={form.phone} onChange={update('phone')} placeholder="+1 555 0100" />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Internal notes">
            <textarea className={inputClass} rows={3} value={form.notes} onChange={update('notes')} placeholder="Only your team can see this" />
          </Field>
        </div>
      </div>
      {error && <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-300">{error}</p>}
      <div className="mt-5 flex gap-3">
        <Button disabled={saving} icon={client ? PencilIcon : PlusIcon}>
          {saving ? 'Saving...' : client ? 'Save changes' : 'Create client'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// Creates the portal login (role "client") for one client company.
function LoginForm({ client, onSaved, onCancel }) {
  const [form, setForm] = useState({ name: client.contactName || '', email: client.email || '', password: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api('/users', { method: 'POST', body: { ...form, role: 'client', clientId: client._id } });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h2 className="text-lg font-semibold">Give {client.company} a portal login</h2>
      <p className="mt-1 text-xs text-zinc-500">This person will only see {client.company}&apos;s projects and the items you share with them.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Field label="Full name">
          <input className={inputClass} value={form.name} onChange={update('name')} required />
        </Field>
        <Field label="Login email">
          <input className={inputClass} type="email" value={form.email} onChange={update('email')} required />
        </Field>
        <Field label="Password (min 8 characters)">
          <input className={inputClass} type="password" minLength={8} value={form.password} onChange={update('password')} required />
        </Field>
      </div>
      {error && <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-300">{error}</p>}
      <div className="mt-5 flex gap-3">
        <Button disabled={saving} icon={KeyIcon}>
          {saving ? 'Creating...' : 'Create login'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function ClientsPage() {
  const me = useUser();
  const canWrite = true;
  const canGiveLogin = me.role === 'admin' && canWrite;
  const [panel, setPanel] = useState(null); // { type: 'add' | 'edit' | 'login', client? }
  const [error, setError] = useState('');
  const { items: clients, reload } = useList('/clients');
  const { items: logins, reload: reloadLogins } = useList(me.role === 'admin' ? '/users?role=client' : null);

  const loginsOf = (client) => logins.filter((login) => login.clientId === client._id);

  const removeClient = async (client) => {
    if (!confirm(`Delete ${client.company}? Its portal logins will be removed too.`)) return;
    setError('');
    try {
      await api(`/clients/${client._id}`, { method: 'DELETE' });
    } catch (err) {
      setError(err.message);
    }
    reload();
    reloadLogins();
  };

  const saved = () => {
    setPanel(null);
    reload();
    reloadLogins();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="mt-1 text-sm text-zinc-400">{clients.length} client companies</p>
        </div>
        {canWrite && !panel && (
          <Button icon={PlusIcon} onClick={() => setPanel({ type: 'add' })}>
            Add client
          </Button>
        )}
      </div>

      {panel?.type === 'add' && <ClientForm onSaved={saved} onCancel={() => setPanel(null)} />}
      {panel?.type === 'edit' && <ClientForm client={panel.client} onSaved={saved} onCancel={() => setPanel(null)} />}
      {panel?.type === 'login' && <LoginForm client={panel.client} onSaved={saved} onCancel={() => setPanel(null)} />}
      {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}

      <ul className="mt-6 space-y-3">
        {clients.map((client) => {
          const clientLogins = loginsOf(client);
          return (
            <li
              key={client._id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-4"
            >
              <div>
                <p className="font-medium">{client.company}</p>
                <p className="text-xs text-zinc-400">{[client.contactName, client.email, client.phone].filter(Boolean).join(' · ')}</p>
                {me.role === 'admin' && (
                  <p className={`mt-1 text-xs ${clientLogins.length ? 'text-emerald-300' : 'text-amber-300'}`}>
                    {clientLogins.length ? `${clientLogins.length} portal login(s): ${clientLogins.map((login) => login.email).join(', ')}` : 'No portal login yet'}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <IconButton icon={EyeIcon} label="View client" tone="view" href={`/dashboard/clients/${client._id}`} />
                {canWrite && (
                  <>
                    <IconButton icon={PencilIcon} label="Edit client" tone="edit" onClick={() => setPanel({ type: 'edit', client })} />
                    {canGiveLogin && (
                      <IconButton icon={KeyIcon} label="Give portal login" tone="success" onClick={() => setPanel({ type: 'login', client })} />
                    )}
                    <IconButton icon={TrashIcon} label="Delete client" tone="delete" onClick={() => removeClient(client)} />
                  </>
                )}
              </div>
            </li>
          );
        })}
        {!clients.length && <p className="text-sm text-zinc-500">No clients yet. Click &quot;Add client&quot; to create your first one.</p>}
      </ul>
    </div>
  );
}
