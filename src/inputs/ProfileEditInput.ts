import { InputType, Field } from 'type-graphql';
import { Prisma } from '@prisma/client';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { uploadResume } from '../utils';

@InputType()
export class ProfileEditInput {
  @Field(() => String, { nullable: true })
  givenName?: string

  @Field(() => String, { nullable: true })
  familyName?: string

  @Field(() => String, { nullable: true })
  email?: string

  @Field(() => String, { nullable: true })
  bio?: string

  @Field(() => Boolean, { nullable: true })
  underrepresentedGender?: boolean

  @Field(() => Boolean, { nullable: true })
  underrepresentedEthnicity?: boolean

  @Field(() => GraphQLUpload, { nullable: true })
  resume?: FileUpload

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

  @Field(() => Boolean, { nullable: true })
  searchOpen?: boolean

  @Field(() => Boolean, { nullable: true })
  searchInternships?: boolean

  @Field(() => Date, { nullable: true })
  searchFullTimeAt?: Date

  @Field(() => [String], { nullable: true })
  experience?: string[]

  async toQuery(): Promise<Omit<Prisma.ProfileUpdateInput, 'username'>> {
    const { resume, experience, ...rest } = this;
    return {
      urlResume: await uploadResume(resume),
      experience: experience ? { set: experience.map((e) => ({ id: e })) } : undefined,
      ...rest,
    };
  }
}
