import { ObjectType, Field } from 'type-graphql';
import { Container } from 'typedi';
import { PrismaClient, Profile as PrismaProfile } from '@prisma/client';
import { Profile } from './Profile';

@ObjectType()
export class EventParticipation {
  @Field(() => String)
  id: string

  @Field(() => String)
  eventId: string

  awardIds?: string[]

  @Field(() => [String], { name: 'awardIds' })
  fetchAwardIds(): string[] {
    if (!this.awardIds) return [];
    return this.awardIds;
  }

  profileUsername: string

  profile?: PrismaProfile

  @Field(() => Profile, { name: 'profile' })
  async fetchProfile(): Promise<PrismaProfile> {
    if (!this.profile) {
      const profile = await Container.get(PrismaClient).profile.findUnique({
        where: { username: this.profileUsername },
      });
      if (!profile) throw new Error('Profile not found.');
      this.profile = profile;
    }
    return this.profile;
  }
}
