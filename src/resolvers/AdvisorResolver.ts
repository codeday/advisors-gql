import {
  Resolver, Arg, Mutation, Query, Authorized,
} from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { Inject } from 'typedi';
import { RemainingRequestsType, RequestCount } from '../types';
import {
  AdvisorCreateInput, AdvisorWhereInput, AdvisorLimitInput, RequestCountWhereInput,
} from '../inputs';
import { sendOnboard, sendChangeLimits } from '../email';
import { getAvailableAdvisors } from '../matching';
import { AdvisorType, RequestType } from '../enums';
import { AuthRole } from '../context';

@Resolver()
export class AdvisorResolver {
  @Inject(() => PrismaClient)
  private readonly prisma: PrismaClient;

  @Authorized(AuthRole.ADMIN)
  @Mutation(() => Boolean)
  async createAdvisor(
    @Arg('data', () => AdvisorCreateInput) data: AdvisorCreateInput,
  ): Promise<boolean> {
    const advisor = await this.prisma.advisor.create({ data: data.toQuery() });
    await sendOnboard(advisor);
    return true;
  }

  @Authorized(AuthRole.ADMIN)
  @Mutation(() => Boolean)
  async editAdvisorLimits(
    @Arg('where', () => AdvisorWhereInput) where: AdvisorWhereInput,
    @Arg('limits', () => AdvisorLimitInput) limits: AdvisorLimitInput,
  ): Promise<boolean> {
    const advisor = await this.prisma.advisor.update({ where: where.toQuery(), data: { ...limits.toQuery() } });
    await sendChangeLimits(advisor);
    return true;
  }

  @Query(() => [RemainingRequestsType])
  async remainingRequests(): Promise<RemainingRequestsType[]> {
    const advisors = await getAvailableAdvisors();
    return Object.keys(RequestType).map((rt) => ({
      requestType: rt as RequestType,
      totalRemainingRequests: advisors
        .reduce((accum, a) => accum + a.remaining[rt as RequestType], 0),
      advisorTypes: Object.keys(AdvisorType).map((at) => ({
        advisorType: at as AdvisorType,
        remainingRequests: advisors
          .filter((a) => a.type === at)
          .reduce((accum, a) => accum + a.remaining[rt as RequestType], 0),
      })),
    }));
  }

  @Authorized(AuthRole.ADMIN)
  @Query(() => [RequestCount])
  async servedRequests(
    @Arg('where', () => RequestCountWhereInput, { nullable: true }) where?: RequestCountWhereInput,
  ): Promise<RequestCount[]> {
    const advisors = await this.prisma.advisor.findMany({
      where: where ? where.toQuery() : undefined,
      select: {
        id: true,
        username: true,
        email: true,
        givenName: true,
        familyName: true,
        requestAssignments: { select: { request: { select: { type: true } } } },
      },
    });

    const typeToName = { INTERVIEW: 'practiceInterviews', RESUME: 'resumeReviews' };

    return Object.values(advisors.reduce((accum, advisor) => ({
      ...accum,
      [advisor.id]: {
        givenName: advisor.givenName,
        familyName: advisor.familyName,
        username: advisor.username,
        email: advisor.email,
        ...(advisor.requestAssignments.reduce((accum, assign) => ({
          ...accum,
          [typeToName[assign.request.type]]: (accum[<keyof typeof accum><unknown>typeToName[assign.request.type]])
            + 1,
        }), { practiceInterviews: 0, resumeReviews: 0 })),
      },
    }), {}));
  }
}
