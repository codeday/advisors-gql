import { ObjectType, Field, Ctx } from 'type-graphql';
import { Container } from 'typedi';
import {
  PrismaClient,
  Tag as PrismaTag,
  EventParticipation as PrismaEventParticipation,
  Recommendation as PrismaRecommendation,
} from '@prisma/client';
import { Tag } from './Tag';
import { EventParticipation } from './EventParticipation';
import { Recommendation } from './Recommendation';
import { Context } from '../context';

@ObjectType()
export class Profile {
  @Field(() => String)
  username: string

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date

  @Field(() => String)
  givenName: string

  @Field(() => String)
  familyName: string

  @Field(() => String)
  email: string

  @Field(() => String, { nullable: true })
  bio?: string

  @Field(() => Boolean)
  underrepresentedGender: boolean

  @Field(() => Boolean)
  underrepresentedEthnicity: boolean

  @Field(() => String, { nullable: true })
  urlResume?: string

  @Field(() => String, { nullable: true })
  urlLinkedIn?: string

  @Field(() => String, { nullable: true })
  urlGithub?: string

  @Field(() => String, { nullable: true })
  urlWebsite?: string

  @Field(() => Date, { nullable: true })
  gradHighSchoolAt?: Date

  @Field(() => Date, { nullable: true })
  gradUniversityAt?: Date

  @Field(() => Date, { nullable: true })
  workInternAt?: Date

  @Field(() => Date, { nullable: true })
  workFteAt?: Date

  @Field(() => Boolean)
  searchOpen: boolean

  @Field(() => Boolean)
  searchInternships: boolean

  @Field(() => Date, { nullable: true })
  searchFullTimeAt?: Date

  experience: PrismaTag[]

  @Field(() => [Tag], { name: 'experience' })
  async fetchExperience(): Promise<PrismaTag[]> {
    if (!this.experience) {
      this.experience = await Container.get(PrismaClient).tag.findMany({
        where: { profiles: { some: { username: this.username } } },
      });
    }
    return this.experience;
  }

  eventParticipation: PrismaEventParticipation[]

  @Field(() => [EventParticipation], { name: 'eventParticipation' })
  async fetchEventParticipation(): Promise<PrismaEventParticipation[]> {
    if (!this.eventParticipation) {
      this.eventParticipation = await Container.get(PrismaClient).eventParticipation.findMany({
        where: { profile: { username: this.username } },
      });
    }
    return this.eventParticipation;
  }

  recommendations?: PrismaRecommendation[]

  @Field(() => [Recommendation], { name: 'recommendations' })
  async fetchRecommendations(
    @Ctx() { auth }: Context,
  ): Promise<PrismaRecommendation[]> {
    if (auth.isCommunityMember) return [];

    if (!this.recommendations) {
      this.recommendations = await Container.get(PrismaClient).recommendation.findMany({
        where: { profile: { username: this.username } },
      });
    }
    return this.recommendations;
  }
}
