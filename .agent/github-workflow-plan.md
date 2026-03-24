# GitHub Workflow Plan

## Objectives

- Guarantee code quality before merge.
- Prevent security regressions.
- Keep deployment-ready confidence on main.

## Branch And PR Strategy

- Protected branches:
  - main (required checks, no direct push).
- Pull request rules:
  - at least 1 reviewer.
  - all required CI checks green.
  - up-to-date branch before merge.

## Workflow Set

### 1) ci.yml (Primary Pull Request Workflow)

Triggers:

- pull_request on main
- push on main (optional for consistency)

Jobs:

1. setup

- checkout repository
- setup pnpm + Node LTS
- cache pnpm store and Next build cache
- install dependencies with lockfile

2. static-checks

- run lint
- run type check (tsc --noEmit)

3. test

- run unit tests
- run integration tests
- upload coverage artifact

4. build

- run production build

5. dependency-audit

- run pnpm audit --prod
- fail on high/critical, report low/moderate as warning policy decision

### 2) e2e.yml (Main/Release Confidence)

Triggers:

- push on main
- workflow_dispatch

Jobs:

1. e2e-smoke

- install deps
- start app in test mode
- run Playwright smoke tests
- upload screenshots/videos on failure

### 3) security.yml (Scheduled Security Scan)

Triggers:

- schedule (daily or weekly)
- workflow_dispatch

Jobs:

1. dependency-security

- run pnpm audit --prod
- store audit report artifact

2. code-security

- run CodeQL (JavaScript/TypeScript)

## Suggested Job Order

For ci.yml:

1. install
2. lint + typecheck (fast fail)
3. unit/integration tests
4. build
5. audit

## Caching Strategy

- Cache key from:
  - OS
  - Node version
  - pnpm-lock.yaml hash
- Cache:
  - ~/.pnpm-store
  - .next/cache (for faster builds where safe)

## Secrets And Environment

- Required repository secrets (as needed by tests):
  - POSTGRES_URL_TEST
  - JWT_SECRET
  - MIDTRANS_SERVER_KEY_TEST
  - RESEND_API_KEY_TEST
- Never use production credentials in CI.
- Prefer mocked providers for non-e2e test jobs.

## Quality Gates

Required checks on PR:

- lint
- typecheck
- unit-integration-tests
- build
- audit (policy-based threshold)

Optional but recommended:

- coverage summary comment on PR

## Artifacts And Reporting

- Upload on each run:
  - test coverage reports
  - build logs on failure
  - e2e traces/screenshots/videos on failure
- Keep retention short (example: 7-14 days) to manage storage.

## Rollout Plan

### Phase 1

- Add ci.yml with lint, typecheck, build, audit.

### Phase 2

- Add unit/integration tests to ci.yml.
- Add coverage artifact and threshold checks.

### Phase 3

- Add e2e.yml smoke workflow.
- Add security.yml scheduled scans.

## Example Scripts Expected In Package

- lint
- build
- test
- test:unit
- test:integration
- test:e2e
- typecheck

## Definition Of Done

- PR cannot merge without passing required checks.
- main branch has repeatable green CI for build and tests.
- Scheduled security workflow runs and reports findings.
- Failing workflows provide enough artifacts for fast debugging.
