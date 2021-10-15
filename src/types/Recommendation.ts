import { ObjectType, Field } from 'type-graphql';
import { PrismaClient, Profile as PrismaProfile } from '@prisma/client';
import { Container } from 'typedi';
import { Profile } from './Profile';
import { RecommendationRating } from '../enums';

@ObjectType()
export class Recommendation {
  @Field(() => String)
  id: string

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date

  @Field(() => String, { nullable: true })
  username?: string

  @Field(() => String)
  givenName: string

  @Field(() => String)
  familyName: string

  @Field(() => String)
  title: string

  @Field(() => String)
  employer: string

  @Field(() => String)
  relation: string

  @Field(() => RecommendationRating, { nullable: true })
  skillEngineering?: RecommendationRating

  @Field(() => RecommendationRating, { nullable: true })
  skillTechnical?: RecommendationRating

  @Field(() => RecommendationRating, { nullable: true })
  skillInterpersonal?: RecommendationRating

  @Field(() => String, { nullable: true })
  recommendation?: string

  profileUsername: string

  profile?: PrismaProfile

  @Field(() => Profile, { name: 'profile' })
  async fetchProfile(): Promise<PrismaProfile> {
    if (!this.profile) {
      this.profile = await Container.get(PrismaClient).profile.findUnique({
        rejectOnNotFound: true,
        where: { username: this.profileUsername },
      });
    }
    return this.profile;
  }
}
