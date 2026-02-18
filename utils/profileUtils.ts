import type { UserProfile } from '@/context/AuthContext';

export const getDisplayName = (profile: UserProfile | null, email?: string | null) => {
  const trimmedName = profile?.fullName?.trim();

  if (trimmedName) {
    return trimmedName;
  }

  const emailPrefix = email?.split('@')[0]?.trim();

  if (emailPrefix) {
    return emailPrefix;
  }

  return 'QueueMe User';
};

export const getInitials = (name: string) => {
  const words = name
    .split(' ')
    .map((word) => word.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (words.length === 0) {
    return 'Q';
  }

  return words.map((word) => word[0]?.toUpperCase() ?? '').join('');
};
