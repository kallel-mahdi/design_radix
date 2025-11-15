Session Test: <User provides session number>

You are writing comprehensive tests for Session X of the Bibliography Manager project.

**Executive Summary**
- **Objective:** Achieve the 60/30/10 test mix (unit/integration/E2E) for the work completed in Session X.
- **Required tools:** Skill `bibliography-testing-skill`, Read (`docs/sessions/XX-plan.md`, `TESTING.md`), pnpm/Vitest/Playwright commands, Skill frontend/backend as needed for fixes.
- **Outputs:** New/updated tests committed to repo, documented coverage updates in `TESTING.md`, readiness to run `/session-finish X`.

## CRITICAL: Read Context First

1. **Read plan**: `docs/sessions/XX-plan.md` (understand what was implemented)
2. **Read testing strategy**: `TESTING.md` (60/30/10 pyramid: unit/integration/E2E)
3. **Load skill**: bibliography-testing-skill (if available, otherwise use TESTING.md)

## Testing Strategy

**Follow 60/30/10 pyramid:**
- 60% Unit tests (fast, isolated, comprehensive)
- 30% Integration tests (API endpoints, component workflows)
- 10% E2E tests (critical user paths only)

## Phase 1: Backend Tests

### Unit Tests

**Location**: `bibliography_backend/tests/unit/`

**Test coverage:**
- Services (business logic)
- Utils (helpers, validators)
- Models (Mongoose schema methods)

**Run:**
```bash
pnpm --filter bibliography-backend test:unit
```

### Integration Tests

**Location**: `bibliography_backend/tests/integration/`

**Test coverage:**
- API endpoints (request → response)
- Database operations
- Service layer integration

**Run:**
```bash
pnpm --filter bibliography-backend test:integration
```

## Phase 2: Frontend Tests

### Unit Tests

**Location**: `bibliography_frontend/tests/unit/`

**Test coverage:**
- Utils (pure functions)
- Hooks (custom React hooks)
- Store slices (Zustand state logic)

**Run:**
```bash
pnpm --filter bibliography-frontend test:unit
```

### Integration Tests

**Location**: `bibliography_frontend/tests/integration/`

**Test coverage:**
- Component workflows (user interactions)
- API query integration (React Query)
- Form validation (react-hook-form + Zod)

**Run:**
```bash
pnpm --filter bibliography-frontend test:unit
```

## Phase 3: E2E Tests (Optional for MVP features)

**Location**: `tests/e2e/`

**Test coverage:** Critical user paths only (defer most to Phase 2+)

**Run:**
```bash
pnpm test:e2e
```

## Completion Checklist

After writing tests:
- [ ] Backend unit tests passing
- [ ] Backend integration tests passing
- [ ] Frontend unit tests passing
- [ ] Frontend integration tests passing
- [ ] E2E tests passing (if applicable)
- [ ] Coverage > 80% for critical paths
- [ ] All tests documented with clear descriptions

## Next Step

**Run**: `/session-finish X` (documentation + commit + archive)

---

**CRITICAL REMINDERS**:
- ✅ Follow 60/30/10 pyramid (don't over-invest in E2E)
- ✅ Test behavior, not implementation details
- ✅ Use descriptive test names
- ✅ Mock external dependencies (API calls, database in unit tests)
- ❌ Don't duplicate tests (if integration covers it, skip unit test)
