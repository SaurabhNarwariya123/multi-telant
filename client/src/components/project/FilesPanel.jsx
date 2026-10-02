'use client';

import { useState } from 'react';
import { api, downloadFile, uploadToCloudinary } from '@/lib/api';
import { useList } from '@/lib/useList';
import { formatDate } from '@/lib/format';
import { IconButton } from '@/components/ui';
import { DownloadIcon, LockIcon, ShareIcon, TrashIcon } from '@/components/Icons';

const attachedLabel = { project: 'Project', task: 'Task', feedback: 'Feedback' };

// With attachedToType/attachedToId the panel is scoped to one task or feedback item; otherwise it lists the whole project.
export default function FilesPanel({ projectId, canManage, attachedToType = 'project', attachedToId }) {
  const scoped = attachedToType !== 'project' && attachedToId;
  const query = scoped
    ? `/files?projectId=${projectId}&attachedToType=${attachedToType}&attachedToId=${attachedToId}`
    : `/files?projectId=${projectId}`;
  const { items: files, reload } = useList(query);
  const [share, setShare] = useState(false);
  const [error, setError] = useState('');

  const upload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError('');
    try {
      const uploaded = await uploadToCloudinary(file, projectId);
      await api('/files', {
        method: 'POST',
        body: {
          projectId,
          attachedToType,
          attachedToId: scoped ? attachedToId : undefined,
          publicId: uploaded.public_id,
          resourceType: uploaded.resource_type,
          originalName: file.name,
          sharedWithClient: share,
        },
      });
      reload();
    } catch (err) {
      setError(err.message);
    }
    event.target.value = '';
  };

  const toggleShare = async (file) => {
    await api(`/files/${file._id}`, { method: 'PATCH', body: { sharedWithClient: !file.sharedWithClient } });
    reload();
  };

  const remove = async (id) => {
    await api(`/files/${id}`, { method: 'DELETE' });
    reload();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <input type="file" onChange={upload} className="text-sm text-zinc-300" />
        {canManage && (
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={share} onChange={(event) => setShare(event.target.checked)} />
            Share with client
          </label>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      <ul className="mt-4 space-y-3">
        {files.map((file) => (
          <li key={file._id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-4">
            <div>
              <button onClick={() => downloadFile(file)} className="font-medium text-indigo-300 hover:text-indigo-200">
                {file.originalName}
              </button>
              <p className="text-xs text-zinc-400">
                Attached to {attachedLabel[file.attachedToType] || file.attachedToType} · uploaded by{' '}
                {file.uploadedBy?.name || 'unknown'} · {formatDate(file.createdAt)} ·{' '}
                {file.sharedWithClient ? 'shared with client' : 'internal'}
              </p>
            </div>
            {canManage ? (
              <div className="flex gap-2">
                <IconButton icon={DownloadIcon} label="Download" tone="view" onClick={() => downloadFile(file)} />
                <IconButton
                  icon={file.sharedWithClient ? LockIcon : ShareIcon}
                  label={file.sharedWithClient ? 'Make private' : 'Share with client'}
                  tone={file.sharedWithClient ? 'edit' : 'success'}
                  onClick={() => toggleShare(file)}
                />
                <IconButton icon={TrashIcon} label="Delete file" tone="delete" onClick={() => remove(file._id)} />
              </div>
            ) : (
              <IconButton icon={DownloadIcon} label="Download" tone="view" onClick={() => downloadFile(file)} />
            )}
          </li>
        ))}
        {!files.length && <p className="text-sm text-zinc-500">No files yet.</p>}
      </ul>
    </div>
  );
}
