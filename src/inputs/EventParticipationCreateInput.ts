import { InputType, Field } from 'type-graphql';

@InputType()
export class EventParticipationCreateInput {
  @Field(() => String)
  eventId: string

  @Field(() => [String], { nullable: true })
  awardIds?: string[]
}
