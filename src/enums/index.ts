import { registerEnumType } from 'type-graphql';
import {
  RequestType,
  AdvisorType,
  TagType,
  RecommendationRating,
} from '@prisma/client';

registerEnumType(TagType, { name: 'TagType' });
registerEnumType(RecommendationRating, { name: 'RecommendationRating' });
registerEnumType(RequestType, { name: 'RequestType' });
registerEnumType(AdvisorType, { name: 'AdvisorType' });

export {
  RequestType, AdvisorType, TagType, RecommendationRating,
};
