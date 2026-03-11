import { User } from '@/types';

export function getDisplayName(user: User | null | undefined): string {
  if (!user) return '';
  const names = [user.firstName, user.lastName].filter(Boolean);
  return names.length > 0 ? names.join(' ') : (user.email ?? '');
}
