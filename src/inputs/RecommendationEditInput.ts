import { InputType, Field } from 'type-graphql';
import { RecommendationRating } from '../enums';

@InputType()
export class RecommendationEditInput {
  @Field(() => String, { nullable: true })
  givenName?: string

  @Field(() => String, { nullable: true })
  familyName?: string

  @Field(() => String, { nullable: true })
  title?: string

  @Field(() => String, { nullable: true })
  employer?: string

  @Field(() => String, { nullable: true })
  relation?: string

  @Field(() => RecommendationRating, { nullable: true })
  skillEngineering?: RecommendationRating

  @Field(() => RecommendationRating, { nullable: true })
  skillTechnical?: RecommendationRating

  @Field(() => RecommendationRating, { nullable: true })
  skillInterpersonal?: RecommendationRating

  @Field(() => String, { nullable: true })
  recommendation?: string
}
