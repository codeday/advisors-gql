import { ObjectType, Field } from 'type-graphql';
import { AdvisorType } from '../enums';

@ObjectType()
export class RemainingRequestsByAdvisorType {
  @Field(() => AdvisorType)
  advisorType: AdvisorType

  @Field(() => Number)
  remainingRequests: number
}
