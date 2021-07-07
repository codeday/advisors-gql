import { ObjectType, Field } from 'type-graphql';
import { RemainingRequestsByAdvisorType } from './RemainingRequestsByAdvisorType';
import { RequestType } from '../enums';

@ObjectType()
export class RemainingRequestsType {
  @Field(() => RequestType)
  requestType: RequestType

  @Field(() => Number)
  totalRemainingRequests: number

  @Field(() => [RemainingRequestsByAdvisorType])
  advisorTypes: RemainingRequestsByAdvisorType[]
}
