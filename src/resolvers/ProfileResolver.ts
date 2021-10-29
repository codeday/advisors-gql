/* eslint-disable sonarjs/no-duplicate-string */
import {
  Resolver, Arg, Mutation, Query, Authorized, Ctx,
} from 'type-graphql';
import {
  PrismaClient,
  Tag as PrismaTag,
  EventParticipation as PrismaEventParticipation,
  Recommendation as PrismaRecommendation,
  Profile as PrismaProfile,
} from '@prisma/client';
import { Inject } from 'typedi';
import {
  Tag, Recommendation, EventParticipation, Profile,
} from '../types';
import {
  TagCreateInput,
  EventParticipationCreateInput,
  ProfileCreateInput,
  ProfileEditInput,
  RecommendationCreateInput,
  RecommendationEditInput,
} from '../inputs';
import { TagType } from '../enums';
import { AuthRole, Context } from '../context';

@Resolver()
export class ProfileResolver {
  @Inject(() => PrismaClient)
  private readonly prisma: PrismaClient;

  @Authorized(AuthRole.ADMIN)
  @Mutation(() => Tag)
  async createTag(
    @Arg('data', () => TagCreateInput) data: TagCreateInput,
  ): Promise<PrismaTag> {
    return this.prisma.tag.create({ data });
  }

  @Authorized(AuthRole.ADMIN)
  @Mutation(() => Boolean)
  async deleteTag(
    @Arg('id', () => String) id: string,
  ): Promise<boolean> {
    await this.prisma.tag.delete({ where: { id } });
    return true;
  }

  @Query(() => [Tag])
  async tags(
    @Arg('type', () => TagType, { nullable: true }) type?: TagType,
  ): Promise<PrismaTag[]> {
    return this.prisma.tag.findMany({ where: { type } });
  }

  @Authorized(AuthRole.ADMIN)
  @Mutation(() => EventParticipation)
  async createEventParticipation(
    @Arg('username', () => String) username: string,
    @Arg('data', () => EventParticipationCreateInput) data: EventParticipationCreateInput,
  ): Promise<PrismaEventParticipation> {
    return this.prisma.eventParticipation.create({
      data: {
        ...data,
        profile: { connect: { username } },
      },
    });
  }

  @Authorized(AuthRole.ADMIN, AuthRole.RECOMMENDER)
  @Mutation(() => Recommendation)
  async createRecommendation(
    @Ctx() { auth }: Context,
    @Arg('username', () => String) username: string,
    @Arg('data', () => RecommendationCreateInput) data: RecommendationCreateInput,
    @Arg('authorUsername', () => String, { nullable: true }) authorUsername?: string,
  ): Promise<PrismaRecommendation> {
    if (!auth.isAdmin && authorUsername) {
      throw new Error('Only admins can set authorUsername');
    }
    return this.prisma.recommendation.create({
      data: {
        ...data,
        username: authorUsername ?? auth.username,
        profile: { connect: { username } },
      },
    });
  }

  @Authorized(AuthRole.ADMIN, AuthRole.RECOMMENDER)
  @Mutation(() => Recommendation)
  async editRecommendation(
    @Ctx() { auth }: Context,
    @Arg('id', () => String) id: string,
    @Arg('data', () => RecommendationEditInput) data: RecommendationEditInput,
  ): Promise<PrismaRecommendation> {
    if (!auth.isAdmin && !auth.username) throw new Error('Cannot edit as an anonymous user.');
    if (!auth.isAdmin && (await this.prisma.recommendation.count({ where: { id, username: auth.username } })) === 0) {
      throw new Error('Cannot edit this object.');
    }
    return this.prisma.recommendation.update({
      where: { id },
      data,
    });
  }

  @Authorized(AuthRole.REQUESTER, AuthRole.COMMUNITY_MEMBER, AuthRole.ADMIN)
  @Mutation(() => Profile)
  async createProfile(
    @Ctx() { auth }: Context,
    @Arg('data', () => ProfileCreateInput) data: ProfileCreateInput,
    @Arg('username', () => String, { nullable: true }) username?: string,
  ): Promise<PrismaProfile> {
    if (!auth.isAdmin && username !== null && username !== auth.username) {
      throw new Error('Username did not match the signed-in user.');
    }

    return this.prisma.profile.create({
      data: {
        ...(await data.toQuery()),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        username: username || auth.username!,
      },
    });
  }

  @Authorized(AuthRole.REQUESTER, AuthRole.COMMUNITY_MEMBER, AuthRole.ADMIN)
  @Mutation(() => Profile)
  async editProfile(
    @Ctx() { auth }: Context,
    @Arg('data', () => ProfileEditInput) data: ProfileEditInput,
    @Arg('username', () => String, { nullable: true }) username?: string,
  ): Promise<PrismaProfile> {
    if (!auth.isAdmin && username !== null && username !== auth.username) {
      throw new Error('Username did not match the signed-in user.');
    }

    return this.prisma.profile.update({
      where: { username: username || auth.username },
      data: await data.toQuery(),
    });
  }

  @Authorized(AuthRole.REQUESTER, AuthRole.COMMUNITY_MEMBER, AuthRole.ADMIN)
  @Query(() => Profile)
  async profile(
    @Ctx() { auth }: Context,
    @Arg('username', () => String, { nullable: true }) username?: string,
  ): Promise<PrismaProfile> {
    if (!auth.isAdmin && username !== null && username !== auth.username) {
      throw new Error('Username did not match the signed-in user.');
    }

    return this.prisma.profile.findUnique({
      rejectOnNotFound: true,
      where: { username: username ?? auth.username },
      include: { experience: true, eventParticipation: true, recommendations: auth.isAdmin },
    });
  }
}
