import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from 'date-fns';

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'MMM d, yyyy');
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function isOverdue(date: string | Date): boolean {
  return isPast(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy h:mm a');
}
