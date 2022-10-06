import { GraphQLJSONObject } from 'graphql-type-json';
import { ObjectType, Field } from 'type-graphql';
import { RequestType } from '../enums';
import { Request } from './Request';
import { Prisma } from '@prisma/client';

@ObjectType()
export class RequestAssignment {
  @Field(() => Request)
  request: Request

  @Field(() => GraphQLJSONObject, { nullable: true })
  response: Prisma.JsonValue | object | null

  @Field(() => String, { nullable: true })
  responseFile: string | null
}
