import { InputType, Field } from 'type-graphql';
import { TagType } from '../enums';

@InputType()
export class TagCreateInput {
  @Field(() => String)
  id: string

  @Field(() => String)
  displayName: string

  @Field(() => TagType)
  type: TagType
}
