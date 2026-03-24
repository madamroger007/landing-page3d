# Test Suite Overview

This folder follows the plan in .agent/testing-plan.md.

## Structure

- tests/unit: pure logic/unit-level tests
- tests/integration: API route and service orchestration tests with mocks
- tests/e2e: browser journey tests (Playwright phase)
- tests/fixtures: deterministic test data factories
- tests/helpers: shared testing helpers

## Current Coverage Domains

- Auth:
  - withAuth guards
  - auth/me route
  - auth/token routes
  - auth/users route
- Payment:
  - create-transaction route
  - orders/public route
  - transaction-status route
- Product:
  - products route baseline checks
- Voucher:
  - voucher route baseline checks

## Commands

- pnpm test
- pnpm test:unit
- pnpm test:integration
- pnpm test:coverage
- pnpm test:e2e
- pnpm test:e2e:headed

## Safety Notes

- External providers are mocked in integration tests.
- JWT_SECRET is set in tests/setup.ts for isolated test runtime.
- No tests require production secrets.
