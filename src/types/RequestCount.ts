import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class RequestCount {
  @Field(() => String)
  givenName: string

  @Field(() => String)
  familyName: string

  @Field(() => String, { nullable: true })
  username?: string

  @Field(() => String)
  email: string

  @Field(() => Number)
  resumeReviews: number

  @Field(() => Number)
  practiceInterviews: number
}
