# Testing Plan

## Goals

- Prevent regressions in checkout, payment, auth, and dashboard flows.
- Catch security issues early with repeatable automated checks.
- Keep feedback fast in pull requests and complete in main branch pipelines.

## Current Baseline

- Framework: Next.js (App Router) + TypeScript.
- Existing quality checks: lint and build scripts available.
- Gap: no dedicated unit/integration/e2e test pipeline yet.

## Scope And Priorities

### Priority 1: Critical Business Flow Coverage

- Auth routes:
  - login, logout, me, token generation, token revoke, user management guards.
- Payment routes:
  - create transaction, public order query, transaction status, webhook signature validation.
- Checkout UI:
  - cart to checkout, order creation, payment page render for pending/success.
- Security guardrails:
  - role-based access for admin endpoints.
  - rate-limit behavior and response headers.
  - reset password token lifecycle.

### Priority 2: Core Domain Coverage

- Product, category, tools, voucher CRUD APIs.
- Order management updates and filtering.
- Email route input validation and response handling.

### Priority 3: Broader UI Regression Coverage

- Home products list interactions.
- Dashboard tables/forms and modals.
- Error/loading states for major pages.

## Testing Pyramid

1. Unit tests (fast, many)

- Target pure logic and utilities:
  - price calculations and formatting.
  - payment data extraction and mapping.
  - token/hash helpers.
  - validation schema behavior.

2. Integration tests (medium)

- Target API route handlers and service-repository orchestration:
  - route request/response status and payload contract.
  - auth and role checks.
  - rate-limiting behavior.
  - mocked external providers (Midtrans, Resend, Cloudinary, Redis).

3. End-to-end tests (few, high confidence)

- Target real user journeys in browser:
  - checkout and payment status flow.
  - dashboard login and admin actions.
  - protected route redirects.

## Recommended Tooling

### Unit + Integration

- Runner: Vitest.
- HTTP testing: route handlers called with mocked NextRequest/Response.
- Mocking: vi.mock for providers and repositories.
- Coverage: V8 coverage reporter.

### E2E

- Playwright:
  - chromium baseline in CI.
  - seeded/stable test fixtures.

## Folder Structure Proposal

- tests/unit/
- tests/integration/
- tests/e2e/
- tests/fixtures/
- tests/helpers/

Example mapping:

- tests/unit/server/services/payment.test.ts
- tests/integration/api/auth/users.route.test.ts
- tests/integration/api/payment/create-transaction.route.test.ts
- tests/e2e/checkout-payment.spec.ts

## Environment Strategy

- Use dedicated test env file (example: .env.test).
- Replace external dependencies in tests with mocks/stubs:
  - Midtrans API calls.
  - Email provider send function.
  - Redis rate-limit backend.
- For integration DB tests:
  - use isolated test database schema.
  - run migrations before tests.
  - rollback/reset between suites.

## Data And Fixtures

- Create deterministic fixtures:
  - admin and user accounts.
  - sample product/category/tool/voucher records.
  - pending and settlement order records.
- Keep fixture factory helpers to avoid brittle duplicated setup.

## Coverage Targets

Phase targets:

- Phase 1 minimum:
  - 70% statements, 60% branches.
  - 100% coverage for auth/role guard modules.
- Phase 2 target:
  - 80% statements, 70% branches for server logic.
- Phase 3 target:
  - critical e2e journeys all green in CI.

## CI Test Matrix

- Pull request:
  - lint
  - type check
  - unit tests
  - integration tests (mocked external services)
- Main branch:
  - all PR checks
  - e2e smoke suite
  - dependency audit

## Execution Plan

### Phase 1 (Week 1)

- Add Vitest setup and first auth/payment guard tests.
- Add npm scripts:
  - test
  - test:unit
  - test:integration
  - test:coverage

### Phase 2 (Week 2)

- Add integration tests for critical API routes.
- Add Playwright with one checkout smoke scenario.

### Phase 3 (Week 3)

- Expand e2e to admin dashboard and protected routes.
- Enforce coverage threshold in CI.

## Definition Of Done

- Critical auth/payment endpoints covered by integration tests.
- At least one full checkout e2e flow passing in CI.
- Coverage threshold enforced and visible in pipeline.
- PRs blocked on failing lint/type/test checks.
