import { ObjectType, Field } from 'type-graphql';
import { RequestType } from '../enums';

@ObjectType()
export class PendingRequests {
  @Field(() => RequestType)
  requestType: RequestType

  @Field(() => Number)
  pendingRequests: number
}
