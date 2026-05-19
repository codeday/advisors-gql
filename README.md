# Local Development and Full Test

This runbook gives you one reliable path to boot the stack and verify GraphQL flows end to end.

## 1) Runtime and install

```bash
nvm use
# or: asdf shell nodejs 20.19.6

yarn install
```

Node version targets:
- `.nvmrc`: `20.19.6`
- `.node-version`: `20`

## 2) Start dependencies

Start PostgreSQL + Elasticsearch first:

```bash
docker compose up -d postgres elasticsearch
```

Check health:

```bash
docker compose ps
```

Both services should be `healthy` before launching the app.

## 3) App environment variables

Set these variables in your shell (or `.env`) before starting the app.

```bash
export NODE_ENV=development
export PORT=5000
export DATABASE_URL='postgresql://advisors:advisors@localhost:55432/advisors?schema=public'
export DISABLE_AUTOMATION=true

export AUTH_SECRET='local-dev-secret'
export AUTH_AUDIENCE='event-test-2025'

export UPLOADER_BASE='http://localhost:3000'
export UPLOADER_SECRET='local-dev-secret'
export GOTENBERG_BASE='http://localhost:3001'

export EMAIL_HOST='localhost'
export EMAIL_PORT='1025'
export EMAIL_USER='local'
export EMAIL_PASS='local'
export EMAIL_FROM='local@example.com'

export TWILIO_ACCOUNT_SID='AC00000000000000000000000000000000'
export TWILIO_AUTH_TOKEN='local-dev-secret'
export TWILIO_PHONE='+15555555555'
```

Notes:
- `AUTH_SECRET` and `AUTH_AUDIENCE` must match what your local token/test scripts use.
- `DATABASE_URL` should use `localhost:55432` when running the app outside Docker.

## 4) Build and start app

```bash
yarn build
yarn dev
```

GraphQL endpoint:
- `http://localhost:5000/graphql`

## 5) Seed test data

In another terminal:

```bash
yarn seed-dummy
```

This creates deterministic local test records, including:
- advisor id `advisor-alice-test`
- advisor id `advisor-bob-test`
- request id `request-test-2025`

## 6) Run full local end-to-end test

With the app running, execute:

```bash
yarn test-local
```

This runs:
1. `yarn seed-dummy`
2. Public GraphQL query
3. Admin-auth query (`submittedRequests`)
4. Advisor-auth query (`getRequest`)
5. Advisor mutation (`respondRequest`)
6. Verification query (`getRequestAssignment`)

If all pass, your local backend path is working end to end.

## 7) Quick troubleshooting

- `Prisma` connection errors:
  - Confirm Postgres is healthy: `docker compose ps`
  - Re-check `DATABASE_URL` host/port (`localhost:55432` outside Docker)

- Auth errors (`Unauthorized`, audience/secret issues):
  - Re-check `AUTH_SECRET`
  - Re-check `AUTH_AUDIENCE`

- GraphQL upload typing/build issues:
  - Re-run `yarn install`
  - Re-run `yarn build`

- Seed/test query failures:
  - Ensure app is running on port `5000`
  - Re-run `yarn seed-dummy`
