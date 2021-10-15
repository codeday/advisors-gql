import { ObjectType, Field } from 'type-graphql';
import { Container } from 'typedi';
import { PrismaClient, Profile as PrismaProfile } from '@prisma/client';
import { TagType } from '../enums';
import { Profile } from './Profile';

@ObjectType()
export class Tag {
  @Field(() => String)
  id: string

  @Field(() => String)
  displayName: string

  @Field(() => TagType)
  type: TagType

  profiles?: PrismaProfile[]

  @Field(() => [Profile], { name: 'profiles' })
  async fetchProfiles(): Promise<PrismaProfile[]> {
    if (!this.profiles) {
      this.profiles = await Container.get(PrismaClient).profile.findMany({
        where: { experience: { some: { id: this.id } } },
      });
    }
    return this.profiles;
  }
}
