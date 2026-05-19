import 'dotenv/config';
import fetch from 'node-fetch';

type GraphQLResponse = {
    data?: unknown;
    errors?: Array<{ message: string }>;
};

const endpoint = process.env.GRAPHQL_URL || 'http://localhost:5000/graphql';
const token = process.env.API_KEY;

async function runQuery(name: string, query: string, variables?: Record<string, unknown>): Promise<void> {
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

    if (token) {
        await runQuery('Authenticated profile query', `
      query AuthenticatedProfile($username: String!) {
        profile(username: $username) {
          username
          givenName
          familyName
        }
      }
    `, { username: 'ava' });

        await runQuery('Authenticated submitted requests query', `
      query SubmittedRequests {
        submittedRequests {
          username
          email
          type
        }
      }
    `);
    }
}

main().catch((error: unknown) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exitCode = 1;
});