import { InputType, Field } from 'type-graphql';
import { Prisma } from '@prisma/client';
import emailValid from 'email-validator';
import { AdvisorLimitInput } from './AdvisorLimitInput';
import { AdvisorType } from '../enums';

@InputType()
export class AdvisorCreateInput {
  @Field(() => String)
  givenName: string

  @Field(() => String)
  familyName: string

  @Field(() => String)
  email: string

  @Field(() => String, { nullable: true })
  username?: string

  @Field(() => AdvisorLimitInput)
  limits: AdvisorLimitInput

  @Field(() => AdvisorType)
  type: AdvisorType

  toQuery(): Prisma.AdvisorCreateInput {
    if (!emailValid.validate(this.email)) throw Error('Email is invalid.');
    return {
      givenName: this.givenName,
      familyName: this.familyName,
      email: this.email,
      username: this.username,
      type: this.type,
      ...this.limits.toQuery(),
    };
  }
}
