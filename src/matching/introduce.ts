/* eslint-disable no-await-in-loop */
import { Container } from 'typedi';
import { PrismaClient } from '@prisma/client';
import { DateTime } from 'luxon';
import { AdvisorType } from '../enums';
import { sendIntro } from '../email';
import config from '../config';
import { getAvailableAdvisors } from './availability';
import { getOutstandingRequestsWhereFilter } from './utils';

const INTRODUCTION_SEND_INTERVAL = config.debug
  ? 1000 * 15
  : 1000 * 60 * 15;

export default async function introduce(): Promise<void> {
  const prisma = Container.get(PrismaClient);
  const pendingRequests = await prisma.request.findMany({
    where: getOutstandingRequestsWhereFilter(),
    include: {
      requestAssignments: {
        select: {
          advisor: {
            select: { type: true },
          },
        },
      },
    },
  });

  const recentIntroductions = await prisma.requestAssignment.findMany({
    where: { createdAt: { gte: DateTime.now().minus({ months: 3 }).toJSDate() } },
    select: {
      request: { select: { username: true, type: true } },
      advisor: { select: { id: true } },
    },
  });
  const recentIntroductionsMap: Record<string, string> = recentIntroductions
    .reduce((accum, intro) => ({
      ...accum,
      [`${intro.request.username}-${intro.request.type}`]: [
        ...(accum[`${intro.request.username}-${intro.request.type}` as keyof typeof accum] || []),
        intro.advisor.id,
      ],
    }), {});

  // eslint-disable-next-line no-console
  console.log(`Checking for available introductions (${pendingRequests.length} in queue).`);

  const advisors = await getAvailableAdvisors();

  for (const req of pendingRequests) {
    const existingAdvisorTypes = req.requestAssignments
      .map((ra) => ra.advisor.type);
    const missingAdvisorTypes = <AdvisorType[]>Object.keys(AdvisorType)
      .filter((t) => !existingAdvisorTypes.includes(t as AdvisorType));

    for (const missingType of missingAdvisorTypes) {
      const matchingAvailableAdvisors = advisors
        .filter((a) => !(recentIntroductionsMap[`${req.username}-${req.type}`]?.includes(a.id)))
        .filter((a) => a.type === missingType && a.remaining[req.type] > 0);

      if (matchingAvailableAdvisors.length > 0) {
        const sendAdvisor = matchingAvailableAdvisors[Math.floor(Math.random() * matchingAvailableAdvisors.length)];
        // eslint-disable-next-line no-console
        console.log(`- Introducing advisor ${sendAdvisor.givenName} to ${req.givenName} for ${req.type}.`);
        await sendIntro(sendAdvisor, req);
        await prisma.requestAssignment.create({
          data: {
            advisor: { connect: { id: sendAdvisor.id } },
            request: { connect: { id: req.id } },
          },
        });
        sendAdvisor.remaining[req.type] -= 1;
      }
    }
  }
}

export function startIntroducing(): void {
  setInterval(introduce, INTRODUCTION_SEND_INTERVAL);
  introduce();
}
