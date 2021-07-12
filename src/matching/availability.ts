import { Container } from 'typedi';
import { Advisor, PrismaClient } from '@prisma/client';
import { DateTime } from 'luxon';
import { RequestType } from '../enums';

export type AdvisorWithRemaining = Advisor & { remaining: Record<RequestType, number> };

function calculateRemainingAssignments(perWeek: number, assignmentsThisMonth: { createdAt: Date }[]): number {
  if (perWeek === 0) return 0;
  const perFortnight = Math.ceil(perWeek * 2);
  const perMonth = Math.floor(perWeek * 4);

  const startOfWeek = DateTime.now().startOf('week');
  const startOfFortnight = DateTime.now().startOf('week').minus({ weeks: 1 });
  const assignmentsThisWeek = assignmentsThisMonth.filter((a) => DateTime.fromJSDate(a.createdAt) > startOfWeek);
  const assignmentsThisFortnight = assignmentsThisMonth
    .filter((a) => DateTime.fromJSDate(a.createdAt) > startOfFortnight);

  // Calculate remaining

  const remainingThisWeek = perWeek - assignmentsThisWeek.length;
  const remainingThisFortnight = perFortnight - assignmentsThisFortnight.length;
  const remainingThisMonth = perMonth - assignmentsThisMonth.length;

  // Don't give someone extra assignments two weeks in a row, even if it would be under their monthly limit.
  const roundFn = (remainingThisMonth > 0 && remainingThisFortnight > 0) ? Math.ceil : Math.floor;
  return Math.max(0, roundFn(Math.min(remainingThisWeek, remainingThisFortnight, remainingThisMonth)));
}

export async function getAvailableAdvisors(): Promise<AdvisorWithRemaining[]> {
  const prisma = Container.get(PrismaClient);
  const startOfMonth = DateTime.now().minus({ months: 1 }).toJSDate();

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
