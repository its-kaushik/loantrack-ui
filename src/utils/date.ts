import { format, parseISO } from 'date-fns';

export function formatDate(dateStr: string): string {
  // Try ISO format first, fall back to native Date parsing for non-ISO strings
  const date = dateStr.includes('-') ? parseISO(dateStr) : new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return format(date, 'dd MMM yyyy');
}

export function formatTimestamp(isoStr: string): string {
  return format(parseISO(isoStr), 'dd MMM yyyy, hh:mm a');
}

export function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
