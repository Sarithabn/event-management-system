export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const formatTime = (time) => {
  if (!time) return '';
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${m} ${ampm}`;
};

export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === 0) return 'Free';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const truncate = (str, len = 120) => str?.length > len ? str.slice(0, len) + '...' : str;

export const getStatusColor = (status) => {
  const map = { published: '#22c55e', draft: '#f59e0b', cancelled: '#ef4444', completed: '#6366f1', confirmed: '#22c55e', pending: '#f59e0b', attended: '#6366f1' };
  return map[status] || '#94a3b8';
};

export const getCategoryIcon = (cat) => {
  const map = { conference: '🎤', concert: '🎵', workshop: '🛠️', sports: '⚽', exhibition: '🖼️', festival: '🎉', networking: '🤝', other: '📅' };
  return map[cat] || '📅';
};

export const getDaysUntil = (date) => {
  const diff = new Date(date) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';