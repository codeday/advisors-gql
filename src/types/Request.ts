import { ObjectType, Field } from 'type-graphql';
import { RequestType } from '../enums';

@ObjectType()
export class Request {
  @Field(() => String)
  username: string

  @Field(() => String)
  givenName: string

  @Field(() => String)
  familyName: string

  @Field(() => String)
  email: string

  @Field(() => RequestType)
  type: RequestType

  @Field(() => String, { nullable: true })
  resumeUrl: string | null

}
