import { DateTime } from 'luxon';

export function yearInSchool(graduateAt: Date): number | null {
  const now = DateTime.now();
  const grad = DateTime.fromJSDate(graduateAt);
  if (now > grad) return null;
  return Math.floor(grad.diff(now, 'years').years);
}
