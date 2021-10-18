import {
  Resolver, Query, Authorized, Arg,
} from 'type-graphql';
import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';
import { Inject } from 'typedi';
import Uploader from '@codeday/uploader-node';
import { AuthRole } from '../context';
import { makeMetadataPdf, mergePdfs, streamToBuffer } from '../utils';

@Resolver()
export class BookResolver {
  @Inject(() => PrismaClient)
  private readonly prisma: PrismaClient;

  @Inject(() => Uploader)
  private readonly uploader: Uploader;

  @Authorized(AuthRole.ADMIN)
  @Query(() => String)
  async buildResumePackage(
    @Arg('username', () => String) username: string,
  ): Promise<string> {
    const profile = await this.prisma.profile.findUnique({
      rejectOnNotFound: true,
      where: { username },
      include: { recommendations: true, eventParticipation: true },
    });

    if (!profile.urlResume) throw new Error('Profile has no resume.');

    const [resumePdf, metadataPdf] = await Promise.all([
      await streamToBuffer((await fetch(profile.urlResume)).body),
      await makeMetadataPdf(profile),
    ]);
    const mergedPdfs = await mergePdfs([metadataPdf, resumePdf]);

    const { url } = await this.uploader.file(mergedPdfs, '_.pdf');
    return url;
  }
}
