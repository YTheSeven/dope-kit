/**
 * 时间格式化工具
 */

function formatTime(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function formatDate(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatRelativeTime(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  const now = Date.now();
  const diff = now - d.getTime();

  if (diff < 60 * 1000) return '刚刚';
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60 / 1000)}分钟前`;
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 60 / 60 / 1000)}小时前`;
  if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / 24 / 60 / 60 / 1000)}天前`;
  return formatDate(d);
}

export { formatTime, formatDate, formatRelativeTime };
