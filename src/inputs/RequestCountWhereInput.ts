import { InputType, Field } from 'type-graphql';

type FilterType = { email?: { in?: string[], endsWith?: string }, username?: { in: string[] } };

@InputType()
export class RequestCountWhereInput {
  @Field(() => String, { nullable: true })
  domain?: string

  @Field(() => [String], { nullable: true })
  emails?: string[]

  @Field(() => [String], { nullable: true })
  usernames?: string[]

  toQuery(): FilterType {
    const query: FilterType = {};
    if (this.emails) {
      query.email = { in: this.emails };
    } else if (this.domain) {
      query.email = { endsWith: `@${this.domain}` };
    }

    if (this.usernames) {
      query.username = { in: this.usernames };
    }

    return query;
  }
}
