const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getToken = () => localStorage.getItem('token');
export const saveToken = (token) => localStorage.setItem('token', token);
export const clearToken = () => localStorage.removeItem('token');

const SUPPORT_KEY = 'supportAgency';

export const getSupportAgency = () => {
  try {
    return JSON.parse(sessionStorage.getItem(SUPPORT_KEY));
  } catch {
    return null;
  }
};
export const enterSupportMode = (agency) => sessionStorage.setItem(SUPPORT_KEY, JSON.stringify({ id: agency._id, name: agency.name }));
export const exitSupportMode = () => sessionStorage.removeItem(SUPPORT_KEY);

export async function api(path, { method = 'GET', body } = {}) {
  const token = typeof window === 'undefined' ? null : getToken();
  const isForm = body instanceof FormData;
  // Support mode scopes workspace calls to one agency; platform (/agencies) calls are never scoped to it.
  const support = typeof window === 'undefined' || path.startsWith('/agencies') ? null : getSupportAgency();

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(!isForm && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(support && { 'X-Support-Agency': support.id }),
    },
    body: isForm ? body : body && JSON.stringify(body),
  });

  if (response.status === 204) return null;

  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
}

export async function downloadFile(file) {
  const { url } = await api(`/files/${file._id}/download`);
  window.location.href = url;
}

export async function uploadToCloudinary(file, projectId) {
  const signed = await api('/files/upload-signature', { method: 'POST', body: { projectId } });

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', signed.apiKey);
  form.append('timestamp', signed.timestamp);
  form.append('signature', signed.signature);
  form.append('folder', signed.folder);
  form.append('type', signed.type);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/auto/upload`, {
    method: 'POST',
    body: form,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Upload failed');

  return data;
}
