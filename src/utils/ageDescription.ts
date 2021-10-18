import { Profile } from '@prisma/client';
import { DateTime } from 'luxon';
import { yearInSchool } from './yearInSchool';

type AgeDescriptionProfileFields = Pick<Profile, 'gradHighSchoolAt' | 'gradUniversityAt'>;

const SCHOOL_YEARS = ['Senior', 'Junior', 'Sophomore', 'Freshman'];

export function ageDescription(profile: AgeDescriptionProfileFields): string | null {
  if (!profile.gradHighSchoolAt && !profile.gradUniversityAt) return null;

  // If we know when they graduate college, but not high school, and it's more than 4 years away, we can infer. We can't
  // do the opposite because they may not be in college, though.
  const hsGrad = profile.gradHighSchoolAt
    ?? (
      profile.gradUniversityAt
        ? DateTime.fromJSDate(profile.gradUniversityAt)
          .minus({ year: 4 })
          .toJSDate()
        : null
    );
  const hsGradYears = hsGrad ? yearInSchool(hsGrad) : null;

  // Currently in high school or below.
  if (hsGradYears !== null) {
    if (hsGradYears > 3) return 'Middle School Student';
    return `High School ${SCHOOL_YEARS[hsGradYears]}`;
  }

  // They're in college, or a college graduate
  if (profile.gradUniversityAt) {
    const collegeGradYears = yearInSchool(profile.gradUniversityAt);
    if (collegeGradYears !== null) {
      return `College ${SCHOOL_YEARS[Math.min(collegeGradYears, 3)]}`;
    }
    return 'College Grad';
  }

  return 'High School Grad';
}
