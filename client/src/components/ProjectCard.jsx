import Badge from './Badge';
import { formatDate } from '@/lib/format';

export default function ProjectCard({ project }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-indigo-400/50">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">{project.name}</h3>
        <Badge value={project.status} />
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-indigo-500" style={{ width: `${project.progress}%` }} />
      </div>
      <p className="mt-2 text-xs text-zinc-400">
        {project.progress}% complete · due {formatDate(project.dueDate)}
      </p>
    </div>
  );
}
