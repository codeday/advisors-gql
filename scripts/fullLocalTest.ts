import 'dotenv/config';
import fetch from 'node-fetch';
import { sign } from 'jsonwebtoken';
import { AuthRole, JwtToken } from '../src/context/auth';

type GraphQLResponse = {
    data?: Record<string, unknown>;
    errors?: Array<{ message: string }>;
};

const endpoint = process.env.GRAPHQL_URL || 'http://localhost:5000/graphql';
const authSecret = process.env.AUTH_SECRET || 'local-dev-secret';
const authAudience = process.env.AUTH_AUDIENCE || 'event-test-2025';
const requestId = 'request-test-2025';
const advisorId = 'advisor-alice-test';

function createToken(payload: JwtToken): string {
    return sign(payload, authSecret, { audience: authAudience, expiresIn: '31d' });
}

async function runQuery(name: string, query: string, token?: string, variables?: Record<string, unknown>): Promise<GraphQLResponse> {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query, variables }),
    });

    const payload = await response.json() as GraphQLResponse;
    // eslint-disable-next-line no-console
    console.log(`\n${name}`);
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(payload, null, 2));

    if (!response.ok || payload.errors) {
        throw new Error(`${name} failed`);
    }

    return payload;
}

async function main(): Promise<void> {
    await runQuery('Public tags query', `
    query PublicTags {
      tags {
        id
        displayName
        type
      }
    }
  `);

    const adminToken = createToken({ typ: AuthRole.ADMIN });
    await runQuery('Admin submitted requests query', `
    query SubmittedRequests {
      submittedRequests {
        username
        email
        givenName
        familyName
        practiceInterviews
        resumeReviews
      }
    }
  `, adminToken);

    const advisorToken = createToken({ typ: AuthRole.ADVISOR, adv: advisorId });
    await runQuery('Advisor request lookup', `
    query GetRequest($request: String!) {
      getRequest(request: $request) {
        username
        givenName
        familyName
        email
        type
        resumeUrl
      }
    }
  `, advisorToken, { request: requestId });

    await runQuery('Advisor response mutation', `
    mutation RespondRequest($request: String!, $response: JSONObject) {
      respondRequest(request: $request, response: $response)
    }
  `, advisorToken, {
        request: requestId,
        response: { status: 'accepted', note: 'local test response' },
    });

    await runQuery('Advisor request assignment query', `
    query GetRequestAssignment($request: String!) {
      getRequestAssignment(request: $request) {
        response
        responseFile
        request {
          username
          givenName
          familyName
          email
          type
        }
      }
    }
  `, advisorToken, { request: requestId });
}

main().catch((error: unknown) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exitCode = 1;
});