import { Profile } from '@prisma/client';
import { DateTime } from 'luxon';

export type SeekingDescriptionProfileFields = Pick<Profile, 'searchOpen' | 'searchFullTimeAt' | 'searchInternships'>;

export function seekingDescription(profile: SeekingDescriptionProfileFields): string | null {
  const now = new Date();
  if (!profile.searchOpen) return 'Not actively looking';
  if (!profile.searchInternships && !profile.searchFullTimeAt) return null;

  if (profile.searchFullTimeAt && profile.searchFullTimeAt < now) {
    return 'Full-Time';
  }

  if (profile.searchFullTimeAt) {
    const searchFullTimeStr = DateTime.fromJSDate(profile.searchFullTimeAt)
      .toLocaleString({ month: 'short', year: 'numeric' });

    return `${profile.searchInternships ? 'Internships, ' : ''} FTE in ${searchFullTimeStr}`;
  }

  return 'Internships';
}
