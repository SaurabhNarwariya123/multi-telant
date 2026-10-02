'use client';

import { useState } from 'react';
import SectionHeading from './SectionHeading';

const layers = [
  { name: 'Super Admin', text: 'Owns and manages the complete SaaS platform.' },
  { name: 'Agency', text: 'Each agency operates as an isolated tenant.' },
  { name: 'Agency Team', text: 'Employees and users working inside the agency.' },
  { name: 'Clients', text: 'Customers with access to a limited client portal.' },
  { name: 'Projects', text: 'Every project belongs to a client and an agency.' },
  { name: 'Tasks & more', text: 'Milestones, meetings, feedback and files stay linked to the right project.' },
];

export default function HierarchySection() {
  const [active, setActive] = useState(0);

  return (
    <section id="structure" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading eyebrow="Platform structure" title="One platform. Separate workspaces." />

      <div className="mt-12 max-w-2xl">
        <div className="space-y-2">
          {layers.map((layer, index) => (
            <button
              key={layer.name}
              onClick={() => setActive(index)}
              className={`w-full rounded-xl border px-5 py-4 text-left transition ${
                active === index ? 'border-indigo-400 bg-indigo-500/10' : 'border-white/10 bg-white/5'
              }`}
            >
              <p className="font-medium">{layer.name}</p>
              {active === index && <p className="mt-1 text-sm text-zinc-400">{layer.text}</p>}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
