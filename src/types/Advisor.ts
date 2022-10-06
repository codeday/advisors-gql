import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class Advisor {
  @Field(() => String)
  givenName: string

  @Field(() => String)
  familyName: string

  @Field(() => String)
  email: string

  @Field(() => Number)
  interviewsPerWeek: number

  @Field(() => Number)
  resumesPerWeek: number
}