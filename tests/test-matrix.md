# Project Test Matrix

This matrix aligns implementation with .agent/testing-plan.md and tracks project-wide coverage rollout.

## Legend

- covered: implemented and passing tests
- planned: scoped and queued by phase

## API Routes

- auth
  - login: planned
  - logout: planned
  - me: covered
  - forgot-password: planned
  - reset-password: planned
  - token: covered
  - token/[id]: covered
  - users: covered
  - users/[id]: planned
- payment
  - create-transaction: covered
  - transaction-status: covered
  - orders/public: covered
  - orders: planned
  - orders/send-email: planned
  - webhook/midtrans: planned
  - fee-config: planned
  - fee-estimate: planned
- products
  - products route: covered (baseline)
  - products/[id]: planned
  - categories route: planned
  - categories/[id]: planned
  - tools route: planned
  - tools/[id]: planned
  - search, like: planned
- voucher
  - voucher route: covered
  - voucher/[id]: planned
- email
  - route: planned
  - send-confirmation: planned
  - payment-link: planned
  - forget-password: planned

## Server Modules

- lib
  - rateLimit: planned
  - paymentFee: planned
  - cache/redis: planned
- services
  - auth: planned
  - token: planned
  - payment: planned
  - products/tools/voucher: planned
- repositories
  - auth: planned
  - orders: planned
  - token: planned
  - products/tools/voucher: planned
- validations
  - auth/products/tools/voucher/paymentFeeConfig: planned

## UI Coverage

- home page sections: planned
- checkout flow pages: planned for e2e phase
- dashboard pages and modal flows: planned for e2e phase

## Next Milestones

1. Add remaining Priority 1 auth/payment route tests (week 1 completion).
2. Add Priority 2 product/category/tool/voucher route detail tests (week 2).
3. Add Playwright smoke for checkout and dashboard login flows (week 2-3).
4. Enforce branch and statement coverage thresholds in CI once target baselines are reached.
