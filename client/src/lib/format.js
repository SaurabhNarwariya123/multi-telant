export const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '-');

export const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : '-');

export const label = (value) => (value ? String(value).replace(/_/g, ' ') : '');

// 'overdue' when past due and not done, 'due_soon' when due within 7 days.
export const dueState = (task) => {
  if (!task.dueDate || task.status === 'done') return null;
  const diff = new Date(task.dueDate).getTime() - Date.now();
  if (diff < 0) return 'overdue';
  return diff <= 7 * 24 * 60 * 60 * 1000 ? 'due_soon' : null;
};
