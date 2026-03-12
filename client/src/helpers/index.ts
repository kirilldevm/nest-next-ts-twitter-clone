import type { User } from '@/types';
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  format,
  isValid,
  parseISO,
} from 'date-fns';

export function getDisplayName(user: User | null | undefined): string {
  if (!user) return '';
  const names = [user.firstName, user.lastName].filter(Boolean);
  return names.length > 0 ? names.join(' ') : (user.email ?? '');
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';

  const now = new Date();
  const sec = differenceInSeconds(now, d);
  const min = differenceInMinutes(now, d);
  const hr = differenceInHours(now, d);
  const day = differenceInDays(now, d);

  if (day >= 7) return format(d, 'MMM d');
  if (day > 0) return `${day}d`;
  if (hr > 0) return `${hr}h`;
  if (min > 0) return `${min}m`;
  return `${sec}s`;
}
