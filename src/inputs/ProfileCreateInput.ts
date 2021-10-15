import { InputType, Field } from 'type-graphql';
import { Prisma } from '@prisma/client';
import { Container } from 'typedi';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import Uploader from '@codeday/uploader-node';
import { uploadToBuffer } from '../utils';

@InputType()
export class ProfileCreateInput {
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

  @Field(() => Boolean)
  searchOpen: boolean

  @Field(() => Boolean)
  searchInternships: boolean

  @Field(() => Date, { nullable: true })
  searchFullTimeAt?: Date

  @Field(() => [String], { nullable: true })
  experience?: string[]

  async toQuery(): Promise<Omit<Prisma.ProfileCreateInput, 'username'>> {
    const { resume, experience, ...rest } = this;
    let resumeUrl: string | undefined;
    if (resume) {
      const { url } = await (<Uploader>Container.get(Uploader))
        .file(await uploadToBuffer(resume), resume.filename || '_.pdf');
      resumeUrl = url;
    }
    return {
      resumeUrl,
      experience: experience ? { connect: experience.map((e) => ({ id: e })) } : undefined,
      ...rest,
    };
  }
}
