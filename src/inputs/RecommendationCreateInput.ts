import { InputType, Field } from 'type-graphql';
import { RecommendationRating } from '../enums';

@InputType()
export class RecommendationCreateInput {
  @Field(() => String)
  givenName: string

  @Field(() => String)
  familyName: string

  @Field(() => String)
  title: string

  @Field(() => String)
  employer: string

  @Field(() => String)
  relation: string

  @Field(() => RecommendationRating, { nullable: true })
  skillEngineering?: RecommendationRating

  @Field(() => RecommendationRating, { nullable: true })
  skillTechnical?: RecommendationRating

  @Field(() => RecommendationRating, { nullable: true })
  skillInterpersonal?: RecommendationRating

  @Field(() => String, { nullable: true })
  recommendation?: string
}
