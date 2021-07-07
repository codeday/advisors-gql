import { InputType, Field } from 'type-graphql';
import { Prisma } from '@prisma/client';

@InputType()
export class AdvisorWhereInput {
  @Field(() => String, { nullable: true })
  id?: string

  @Field(() => String, { nullable: true })
  username?: string

  @Field(() => String, { nullable: true })
  email?: string

  toQuery(): Prisma.AdvisorWhereUniqueInput {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
    };
  }
}
