import { PrismaClient } from '@prisma/client';
import { Container } from 'typedi';
import { RequestType } from '../enums';
import { getOutstandingRequestsWhereFilter } from './utils';

export async function getPendingRequests(username: string): Promise<Record<RequestType, number>> {
  const prisma = Container.get(PrismaClient);
  const myPendingRequests = await prisma.request.findMany({
    where: {
      username,
      ...getOutstandingRequestsWhereFilter(),
    },
  });

  return myPendingRequests.reduce((accum, r) => ({
    ...accum,
    [r.type]: (accum[r.type] || 0) + 1,
  }), {} as Record<RequestType, number>);
}
