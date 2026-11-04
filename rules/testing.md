# Testing Rules

## Tools

- Test runner: **Vitest**. Not Jest.
- Backend HTTP tests: `supertest` against `createApp()`, so no real port is opened.
- Database tests: use a dedicated test database (a `MONGODB_URI` ending in `_test`). Ask before adding `mongodb-memory-server`.
- React component tests, when needed: `@testing-library/react`, `@testing-library/user-event` and `jsdom`.
- End-to-end tests, only when asked: Playwright.

## What to test first

1. Business logic in services and utilities.
2. Validation schemas, including the edge cases.
3. API endpoints: the happy path and the main error cases (400, 404, 401/403).
4. Store actions.
5. Components with real interaction logic.

## How to write tests

- Test behavior, not implementation details.
- One behavior per test, with a descriptive name: `it('returns 404 when the todo does not exist')`.
- In component tests, query by role, label or text the way a user would. Don't query by class names.
- Put test files next to the code (`todo.service.test.ts`) or in `test/`. Follow what the project already does.
- Reset shared state (stores, mocks, database collections) between tests.
- Never commit `.only`, or a skipped test without a comment explaining why.
