'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, saveToken } from '@/lib/api';

const inputClass =
  'w-full rounded-xl border border-white/10 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20';

const points = [
  ['Isolated workspaces', 'Every agency’s data stays completely separate.'],
  ['Role-based access', 'Team and client permissions enforced on the server.'],
  ['One place for everything', 'Projects, tasks, feedback, meetings and files.'],
];

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</span>
      {children}
    </label>
  );
}

export default function AuthForm({ mode }) {
  const router = useRouter();
  const isRegister = mode === 'register';
  const [form, setForm] = useState({ agencyName: '', name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const path = isRegister ? '/auth/register-agency' : '/auth/login';
      const { token } = await api(path, { method: 'POST', body: form });
      saveToken(token);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="relative grid min-h-screen overflow-hidden bg-zinc-950 lg:grid-cols-2">
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative hidden flex-col justify-between border-r border-white/10 p-12 lg:flex">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-500 text-sm font-bold">M</span>
          Multi-Tenant Agency
        </Link>

        <div>
          <h2 className="text-4xl font-bold leading-tight tracking-tight">
            Run every project in one <span className="text-indigo-400">secure workspace.</span>
          </h2>
          <ul className="mt-10 space-y-6">
            {points.map(([title, text]) => (
              <li key={title} className="flex gap-4">
                <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-indigo-500/20 text-xs text-indigo-300">
                  ✓
                </span>
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-zinc-400">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-zinc-500">Agency A can never see Agency B.</p>
      </div>

      <div className="relative flex items-center justify-center px-6 py-12">
        <form
          onSubmit={submit}
          className="w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-black/40 backdrop-blur"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{isRegister ? 'Create your agency' : 'Welcome back'}</h1>
            <p className="mt-2 text-sm text-zinc-400">
              {isRegister ? 'Set up your isolated workspace in a minute.' : 'Log in to continue to your workspace.'}
            </p>
          </div>

          {isRegister && (
            <>
              <Field label="Agency name">
                <input className={inputClass} placeholder="Acme Studio" value={form.agencyName} onChange={update('agencyName')} required />
              </Field>
              <Field label="Your name">
                <input className={inputClass} placeholder="Jane Doe" value={form.name} onChange={update('name')} required />
              </Field>
            </>
          )}
          <Field label="Email">
            <input className={inputClass} type="email" placeholder="you@company.com" value={form.email} onChange={update('email')} required />
          </Field>
          <Field label="Password">
            <input className={inputClass} type="password" placeholder="••••••••" value={form.password} onChange={update('password')} required />
          </Field>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{error}</p>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-indigo-500 py-3 font-medium shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-400 disabled:opacity-60"
          >
            {loading ? 'Please wait…' : isRegister ? 'Create agency' : 'Log in'}
          </button>

          <p className="text-center text-sm text-zinc-400">
            {isRegister ? 'Already have an account?' : 'New agency?'}{' '}
            <Link href={isRegister ? '/login' : '/register'} className="font-medium text-indigo-400 hover:text-indigo-300">
              {isRegister ? 'Log in' : 'Register'}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
