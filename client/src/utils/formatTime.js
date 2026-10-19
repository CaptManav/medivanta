import { format, formatDistanceToNow, isAfter, subHours } from 'date-fns';

/**
 * Format timestamp into relative 'time ago' string.
 * @param {string|Date} timestamp
 */
export const timeAgo = (timestamp) => {
  if (!timestamp) return 'Unknown';
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch {
    return 'Recently';
  }
};

/**
 * Format date into standard display (e.g. "18 Oct 2026").
 * @param {string|Date} dateStr
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    return format(new Date(dateStr), 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
};

/**
 * Check if the bed/status data is older than specified hours (default 24h).
 * @param {string|Date} timestamp
 * @param {number} hours
 */
export const isStale = (timestamp, hours = 24) => {
  if (!timestamp) return true;
  try {
    const cutoff = subHours(new Date(), hours);
    return !isAfter(new Date(timestamp), cutoff);
  } catch {
    return true;
  }
};

/**
 * Get color scheme based on availability count.
 * @param {number} available
 * @param {number} total
 */
export const getBedStatusColor = (available, total) => {
  if (total === 0) return { bg: 'bg-slate-100', text: 'text-slate-500', label: 'None' };
  const ratio = available / total;
  if (ratio > 0.3) {
    return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700', label: 'Available' };
  }
  if (ratio > 0) {
    return { bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700', label: 'Limited' };
  }
  return { bg: 'bg-rose-50 text-rose-700 border-rose-200', text: 'text-rose-700', label: 'Full' };
};
