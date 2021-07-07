import { InputType, Field } from 'type-graphql';

@InputType()
export class AdvisorLimitInput {
  @Field(() => Number)
  resumesPerWeek: number

  @Field(() => Number)
  interviewsPerWeek: number

  toQuery(): { resumesPerWeek: number, interviewsPerWeek: number } {
    return {
      resumesPerWeek: this.resumesPerWeek,
      interviewsPerWeek: this.interviewsPerWeek,
    };
  }
}
