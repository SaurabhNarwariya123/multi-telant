'use client';

import Link from 'next/link';
import { api } from '@/lib/api';
import { useUser } from '@/context/UserContext';
import { useList } from '@/lib/useList';
import SimpleForm from '@/components/SimpleForm';
import ProjectCard from '@/components/ProjectCard';

export default function ProjectsPage() {
  const user = useUser();
  const canCreate = user.role !== 'client';
  const { items: projects, reload } = useList('/projects');
  const { items: clients } = useList(canCreate ? '/clients' : null);
  const { items: members } = useList(canCreate ? '/users/team' : null);

  const fields = [
    { name: 'name', placeholder: 'Project name' },
    { name: 'clientId', placeholder: 'Select client', options: clients.map((client) => ({ value: client._id, label: client.company })) },
    { name: 'managerId', placeholder: 'Project manager', options: members.map((member) => ({ value: member._id, label: member.name })) },
    { name: 'priority', placeholder: 'Priority', options: ['low', 'medium', 'high'].map((value) => ({ value, label: value })) },
    { name: 'startDate', placeholder: 'Start date', type: 'date' },
    { name: 'dueDate', placeholder: 'Due date', type: 'date' },
    { name: 'description', placeholder: 'Description', type: 'textarea' },
  ];

  const addProject = async (values) => {
    await api('/projects', { method: 'POST', body: values });
    reload();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Projects</h1>
      {canCreate && (
        <div className="mt-6">
          <SimpleForm fields={fields} submitLabel="Add project" onSubmit={addProject} />
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link key={project._id} href={`/dashboard/projects/${project._id}`}>
            <ProjectCard project={project} />
          </Link>
        ))}
      </div>
      {!projects.length && <p className="mt-6 text-sm text-zinc-500">No projects yet.</p>}
    </div>
  );
}
