import { Container } from 'typedi';
import { Advisor, PrismaClient } from '@prisma/client';
import { DateTime } from 'luxon';
import { RequestType } from '../enums';

export type AdvisorWithRemaining = Advisor & { remaining: Record<RequestType, number> };

function calculateRemainingAssignments(perWeek: number, assignmentsThisMonth: { createdAt: Date }[]): number {
  const maxAccumulated = Math.max(perWeek > 0 ? 1 : 0, perWeek);
  const startOfWeek = DateTime.local().startOf('week');
  const assignmentsThisWeek = assignmentsThisMonth.filter((a) => DateTime.fromJSDate(a.createdAt) > startOfWeek);
  const remainingWithoutAccumulation = perWeek - assignmentsThisWeek.length;
  if (remainingWithoutAccumulation > 0) return Math.ceil(remainingWithoutAccumulation);
  return Math.ceil(maxAccumulated - assignmentsThisMonth.length);
}

export async function getAvailableAdvisors(): Promise<AdvisorWithRemaining[]> {
  const prisma = Container.get(PrismaClient);
  const startOfMonth = DateTime.local().startOf('month').toJSDate();

  // TODO(@tylermenezes): This should be possible to do with groupBy, but at the time of writing it is broken, and there
  // aren't enough advisors/requests for there to be a performance implication.
  const advisors = await prisma.advisor.findMany({
    include: {
      requestAssignments: {
        where: { createdAt: { gte: startOfMonth } },
        select: { createdAt: true, request: { select: { type: true } } },
      },
    },
  });

  return advisors.map(
    ({ requestAssignments, ...advisor }) => ({
      ...advisor,
      remaining: Object.keys(RequestType).reduce((accum, rt): Record<RequestType, number> => ({
        ...accum,
        [rt as RequestType]: calculateRemainingAssignments(
          rt === RequestType.INTERVIEW ? advisor.interviewsPerWeek : advisor.resumesPerWeek,
          requestAssignments.filter((a) => a.request.type === rt),
        ),
      }), {} as Record<RequestType, number>),
    }),
  );
}
