import { Prisma } from '@prisma/client';
import { DateTime } from 'luxon';
import { AdvisorType } from '../enums';
import config from '../config';

export function getOutstandingRequestsWhereFilter(): Prisma.RequestWhereInput {
  return {
    createdAt: { gte: DateTime.now().minus(config.requestTimeout).toJSDate() },
    NOT: {
      AND: Object.keys(AdvisorType).map((t): Prisma.RequestWhereInput => ({
        requestAssignments: { some: { advisor: { type: t as AdvisorType } } },
      })),
    },
  };
}
