import { registerEnumType } from 'type-graphql';
import { RequestType, AdvisorType } from '@prisma/client';

registerEnumType(RequestType, { name: 'RequestType' });
registerEnumType(AdvisorType, { name: 'AdvisorType' });

export { RequestType, AdvisorType };
