'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { PlusIcon } from '@/components/Icons';

const inputClass =
  'rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20';

export default function SimpleForm({ fields, submitLabel, onSubmit }) {
  const [values, setValues] = useState({});
  const [error, setError] = useState('');

  const change = (name) => (event) => {
    const { type, checked, value } = event.target;
    setValues({ ...values, [name]: type === 'checkbox' ? checked : value });
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const filled = Object.fromEntries(Object.entries(values).filter(([, value]) => value !== ''));
      await onSubmit(filled);
      setValues({});
    } catch (err) {
      setError(err.message);
    }
  };

  const renderField = ({ name, placeholder, type = 'text', options }) => {
    if (options) {
      return (
        <select key={name} className={inputClass} value={values[name] || ''} onChange={change(name)}>
          <option value="" className="bg-zinc-900">
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-zinc-900">
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (type === 'checkbox') {
      return (
        <label key={name} className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" className="accent-indigo-500" checked={Boolean(values[name])} onChange={change(name)} />
          {placeholder}
        </label>
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          key={name}
          rows={2}
          placeholder={placeholder}
          className={`${inputClass} w-full`}
          value={values[name] || ''}
          onChange={change(name)}
        />
      );
    }

    return (
      <input
        key={name}
        type={type}
        placeholder={placeholder}
        className={inputClass}
        value={values[name] || ''}
        onChange={change(name)}
      />
    );
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      {fields.map(renderField)}
      <Button icon={PlusIcon}>{submitLabel}</Button>
      {error && <p className="w-full text-sm text-rose-400">{error}</p>}
    </form>
  );
}
