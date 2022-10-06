import {
  Resolver, Query, Mutation, Authorized, Ctx, Arg,
} from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { GraphQLJSONObject } from 'graphql-type-json';
import { Inject } from 'typedi';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import Uploader from '@codeday/uploader-node';
import { sendRequestResponseSubmitted, sendRequestSubmitted } from '../email';
import { RequestType } from '../enums';
import { PendingRequests, Request, RequestAssignment, RequestCount } from '../types';
import { AuthRole, Context } from '../context';
import { getPendingRequests } from '../matching';
import { RequestCountWhereInput } from '../inputs';
import { uploadToBuffer } from '../utils';

@Resolver()
export class RequestResolver {
  @Inject(() => PrismaClient)
  private readonly prisma: PrismaClient;

  @Inject(() => Uploader)
  private readonly uploader: Uploader;

  @Authorized(AuthRole.REQUESTER, AuthRole.ADMIN)
  @Query(() => [PendingRequests])
  async pendingRequests(
    @Ctx() { auth }: Context,
  ): Promise<PendingRequests[]> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const pending = await getPendingRequests(auth.username!);
    return Object.keys(pending).map((k): PendingRequests => ({
      requestType: k as RequestType,
      pendingRequests: pending[k as keyof typeof pending] || 0,
    }));
  }

  @Authorized(AuthRole.REQUESTER, AuthRole.ADMIN)
  @Mutation(() => Boolean)
  async createRequest(
    @Ctx() { auth }: Context,
    @Arg('type', () => RequestType) type: RequestType,
    @Arg('givenName', () => String) givenName: string,
    @Arg('familyName', () => String) familyName: string,
    @Arg('email', () => String) email: string,
    @Arg('resume', () => GraphQLUpload, { nullable: true }) resume?: FileUpload,
  ): Promise<boolean> {
    // Validate the user is allowed to make this request
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const pending = await getPendingRequests(auth.username!);
    if (pending[type]) throw Error(`A pending request of this type already exists.`);

    // Make sure the request includes a resume if one should be provided
    let resumeUrl: string | null = null;
    if (type === RequestType.RESUME && !resume) throw Error(`Resume must be provided with this request.`);
    if (resume) {
      const { url } = await this.uploader.file(await uploadToBuffer(resume), resume.filename || '_.pdf');
      resumeUrl = url;
    }

    const request = await this.prisma.request.create({
      data: {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        username: auth.username!,
        givenName,
        familyName,
        email,
        type,
        resumeUrl,
      },
    });

    await sendRequestSubmitted(request);
    return true;
  }

  @Authorized(AuthRole.ADVISOR)
  @Query(() => Request)
  async getRequest(
    @Ctx() { auth }: Context,
    @Arg('request', () => String) request: string,
  ): Promise<Request> {
    const dbRequest = await this.prisma.requestAssignment.findUniqueOrThrow({
      where: { advisorId_requestId: { advisorId: auth.advisorId!, requestId: request } },
      include: { request: true },
    });
    return dbRequest.request;
  }

  @Authorized(AuthRole.ADVISOR)
  @Query(() => RequestAssignment)
  async getRequestAssignment(
    @Ctx() { auth }: Context,
    @Arg('request', () => String) request: string,
  ): Promise<RequestAssignment> {
    return this.prisma.requestAssignment.findUniqueOrThrow({
      where: { advisorId_requestId: { advisorId: auth.advisorId!, requestId: request } },
      include: { request: true },
    });
  }

  @Authorized(AuthRole.ADVISOR)
  @Mutation(() => Boolean)
  async respondRequest(
    @Ctx() { auth }: Context,
    @Arg('request', () => String) request: string,
    @Arg('response', () => GraphQLJSONObject, { nullable: true }) response: object,
    @Arg('file', () => GraphQLUpload, { nullable: true }) file?: FileUpload,
  ): Promise<boolean> {
    const dbRequest = await this.prisma.requestAssignment.findUniqueOrThrow({
      where: { advisorId_requestId: { advisorId: auth.advisorId!, requestId: request } },
    });
    if (dbRequest.response || dbRequest.responseFile) throw new Error('Response was already submitted for this request.');

    let responseFile = null;
    if (file) {
      const { url } = await this.uploader.file(await uploadToBuffer(file), file.filename || '_.pdf');
      responseFile = url;
    }

    const dbRequestUpdated = await this.prisma.requestAssignment.update({
      where: { advisorId_requestId: { advisorId: auth.advisorId!, requestId: request } },
      data: {
        response,
        responseFile
      },
      include: { advisor: true, request: true },
    });

    await sendRequestResponseSubmitted(dbRequestUpdated);
    return true;
  }

  @Authorized(AuthRole.ADMIN)
  @Query(() => [RequestCount])
  async submittedRequests(
    @Arg('where', () => RequestCountWhereInput, { nullable: true }) where?: RequestCountWhereInput,
  ): Promise<RequestCount[]> {
    const requests = await this.prisma.request.findMany({
      where: where ? where.toQuery() : undefined,
      select: {
        id: true,
        username: true,
        email: true,
        type: true,
        givenName: true,
        familyName: true,
      },
    });

    const typeToName = { INTERVIEW: 'practiceInterviews', RESUME: 'resumeReviews' };

    return Object.values(requests.reduce((accum, request) => {
      const prev = <Record<string, unknown> | undefined>accum[request.username as keyof typeof accum];
      return {
        ...accum,
        [request.username]: {
          givenName: request.givenName,
          familyName: request.familyName,
          username: request.username,
          email: request.email,
          practiceInterviews: (prev?.practiceInterviews || 0),
          resumeReviews: (prev?.resumeRevews || 0),
          [typeToName[request.type]]: (prev ? (<number | undefined>prev[typeToName[request.type]] || 0) : 0) + 1,
        },
      };
    }, {}));
  }
}
