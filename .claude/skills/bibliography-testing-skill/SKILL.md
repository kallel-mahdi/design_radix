---
name: bibliography-testing-skill
description: Testing conventions for bibliography manager. Use when writing tests for backend or frontend. Covers test pyramid ratios, project structure, and monorepo commands. (project)
---

# Bibliography Manager Testing Conventions

## Test Pyramid Ratio

**Project decision**: 60% unit / 30% integration / 10% E2E

---

## Entry / Exit Criteria

**Run this skill when:**
- You are planning `/session-test X` or adding tests during `/session-execute X`
- A feature needs measurable coverage before `/session-finish X`
- Test debt was identified in `TESTING.md`

**You are done when:**
- The 60/30/10 mix is satisfied (or variance is documented in `TESTING.md`)
- Commands below have been executed and results recorded
- New cases are linked back to the relevant session checklist item

---

## Project Structure

**Frontend tests:**
```
bibliography_frontend/
├── src/features/*/components/__tests__/  # Component unit tests
├── src/features/*/__tests__/             # Feature integration tests
└── src/test/
    ├── fixtures/mockData.ts              # Shared test data
    ├── mocks/handlers.ts                 # MSW API handlers
    └── utils/testUtils.tsx               # Custom render wrapper
```

**Backend tests:**
```
bibliography_backend/
├── tests/unit/           # Services, utils, models
└── tests/integration/    # API endpoints with database
```

**E2E tests:**
```
tests/e2e/               # Critical flows only (root level)
```

---

## Test Fixtures (Session 9.5)

**Setup:** `pnpm test:download-fixtures` (downloads arXiv PDFs)

**Usage:** `import { FIXTURE_PATHS } from './fixtures/paths'`
- `minimal` (293B), `smallTest` (739B) - committed to Git
- `small` (233KB), `medium` (2.2MB), `large` (224KB) - arXiv papers, gitignored

---

## Monorepo Commands

```bash
# Frontend
pnpm --filter bibliography-frontend test:unit
pnpm --filter bibliography-frontend test:unit --watch
pnpm --filter bibliography-frontend test:coverage

# Backend
pnpm --filter bibliography-backend test:unit
pnpm --filter bibliography-backend test:integration

# E2E
pnpm test:e2e
pnpm test:e2e --ui
```

---

## Test Inventory

See `TESTING.md` for what's been tested so far and coverage status.

---

## E2E Critical Patterns

### Worker Isolation (REQUIRED)
**Problem:** Shared user IDs cause race conditions in parallel tests
**Solution:** Worker-scoped user IDs via Playwright fixtures

```typescript
// ALWAYS import from custom fixture
import { test, expect } from './fixtures/workerFixtures';

test.beforeEach(async ({ page, workerUserId }) => {
  // Use workerUserId - each worker gets unique ID
  await page.request.delete(
    'http://localhost:8005/api/bibliography/references/test-cleanup',
    { headers: { 'x-user-id': workerUserId } }
  );

  await page.route('http://localhost:8005/api/bibliography/**', async (route) => {
    await route.continue({
      headers: { ...route.request().headers(), 'x-user-id': workerUserId }
    });
  });
});
```

**Never use:** Hardcoded `'test-user-id'` - causes race conditions
**Always use:** `workerUserId` fixture from `./fixtures/workerFixtures`

---

Before creating e2e tests use the playwright MCP to explore the app yourself. Once you are sure everything works properly write the tests using playwright and make sure they run. Whenever an e2e test is not working double check with the Playwright MCP yourself!!