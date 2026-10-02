'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useUser } from '@/context/UserContext';
import { useList } from '@/lib/useList';
import { formatDate } from '@/lib/format';
import Badge from '@/components/Badge';
import { Button, IconButton } from '@/components/ui';
import { PlusIcon, TrashIcon } from '@/components/Icons';

const inputClass = 'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-indigo-400';
const roles = [
  { value: 'admin', label: 'Admin', hint: 'Manages team, clients, projects and all data' },
  { value: 'member', label: 'Team member', hint: 'Works on projects, tasks and updates' },
  { value: 'client', label: 'Client', hint: 'Client portal login for one client company' },
];
const filters = [['', 'All'], ['admin', 'Admins'], ['member', 'Team members'], ['client', 'Clients']];
const emptyForm = { name: '', email: '', password: '', role: 'member', clientId: '' };

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</span>
      {children}
    </label>
  );
}

function AddUserForm({ clients, onCreated, onCancel }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });
  const isClient = form.role === 'client';

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (isClient && !form.clientId) return setError('Select the client company this login belongs to');

    setSaving(true);
    try {
      await api('/users', { method: 'POST', body: { ...form, clientId: isClient ? form.clientId : undefined } });
      setForm(emptyForm);
      onCreated();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h2 className="text-lg font-semibold">Add team member</h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Full name">
          <input className={inputClass} value={form.name} onChange={update('name')} placeholder="Jane Doe" required />
        </Field>
        <Field label="Email">
          <input className={inputClass} type="email" value={form.email} onChange={update('email')} placeholder="jane@company.com" required />
        </Field>
        <Field label="Password (min 8 characters)">
          <input className={inputClass} type="password" minLength={8} value={form.password} onChange={update('password')} required />
        </Field>
        <Field label="Role">
          <select className={inputClass} value={form.role} onChange={update('role')}>
            {roles.map((role) => (
              <option key={role.value} value={role.value} className="bg-zinc-900">
                {role.label}
              </option>
            ))}
          </select>
          <span className="block text-xs text-zinc-500">{roles.find((role) => role.value === form.role).hint}</span>
        </Field>
        {isClient && (
          <Field label="Client company">
            <select className={inputClass} value={form.clientId} onChange={update('clientId')} required>
              <option value="" className="bg-zinc-900">
                {clients.length ? 'Select client company' : 'Add a client company first'}
              </option>
              {clients.map((client) => (
                <option key={client._id} value={client._id} className="bg-zinc-900">
                  {client.company}
                </option>
              ))}
            </select>
          </Field>
        )}
      </div>

      {error && <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">{error}</p>}

      <div className="mt-5 flex gap-3">
        <Button disabled={saving} icon={PlusIcon}>
          {saving ? 'Saving...' : 'Create user'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function TeamPage() {
  const me = useUser();
  const [filter, setFilter] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const { items: users, reload } = useList('/users');
  const { items: clients } = useList('/clients');

  const companyOf = (user) => clients.find((client) => client._id === user.clientId)?.company;
  const visible = users.filter((user) => !filter || user.role === filter);
  const readOnly = false;

  const changeRole = async (user, role) => {
    setError('');
    try {
      await api(`/users/${user._id}`, { method: 'PATCH', body: { role } });
    } catch (err) {
      setError(err.message);
    }
    reload();
  };

  const removeUser = async (user) => {
    if (!confirm(`Delete ${user.name}? They will lose access immediately.`)) return;
    setError('');
    try {
      await api(`/users/${user._id}`, { method: 'DELETE' });
    } catch (err) {
      setError(err.message);
    }
    reload();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="mt-1 text-sm text-zinc-400">{users.length} users in this agency</p>
        </div>
        {!readOnly && !adding && (
          <Button icon={PlusIcon} onClick={() => setAdding(true)}>
            Add team member
          </Button>
        )}
      </div>

      {adding && (
        <AddUserForm
          clients={clients}
          onCreated={() => {
            setAdding(false);
            reload();
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        {filters.map(([value, text]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded-full px-3 py-1 ${filter === value ? 'bg-indigo-500' : 'bg-white/5 text-zinc-300 hover:bg-white/10'}`}
          >
            {text}
          </button>
        ))}
      </div>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-zinc-400">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Company</th>
              <th className="px-5 py-3">Added</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {visible.map((user) => {
              const isSelf = user._id === me.id;
              return (
                <tr key={user._id}>
                  <td className="px-5 py-3 font-medium">
                    {user.name} {isSelf && <span className="text-xs text-zinc-500">(you)</span>}
                  </td>
                  <td className="px-5 py-3 text-zinc-400">{user.email}</td>
                  <td className="px-5 py-3">
                    {user.role === 'client' || readOnly ? (
                      <Badge value={user.role} />
                    ) : (
                      <select
                        value={user.role}
                        onChange={(event) => changeRole(user, event.target.value)}
                        className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm"
                      >
                        <option value="admin" className="bg-zinc-900">Admin</option>
                        <option value="member" className="bg-zinc-900">Team member</option>
                      </select>
                    )}
                  </td>
                  <td className="px-5 py-3 text-zinc-400">{companyOf(user) || '-'}</td>
                  <td className="px-5 py-3 text-zinc-400">{formatDate(user.createdAt)}</td>
                  <td className="px-5 py-3 text-right">
                    {!readOnly && !isSelf && (
                      <IconButton icon={TrashIcon} label="Delete user" tone="delete" onClick={() => removeUser(user)} />
                    )}
                  </td>
                </tr>
              );
            })}
            {!visible.length && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-zinc-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
