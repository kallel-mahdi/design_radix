# Code Review Prompt: Bibliography Manager Test Coverage Analysis

## Context

You are reviewing the test coverage and quality for a bibliography manager application (similar to Zotero). The codebase consists of:
- **Frontend**: React 19 + TypeScript, Vite, TanStack Router, Zustand, React Query
- **Backend**: Node.js + Express + MongoDB (microservices architecture)
- **Testing**: Vitest (unit/integration), Playwright (E2E)

## Previous Work

**Session 7** implemented initial ReferenceModal tests:
- 19 schema validation tests
- 17 component unit tests (3 skipped for author-mode toggling)
- 5 E2E tests (claimed as "deferred" but actually exist in codebase)

**Session 8** claimed to complete coverage gaps:
- Created 9 "integration" tests in `ReferenceModal.integration.test.tsx`
- Un-skipped 3 author-mode tests
- Added 4 edit-mode tests
- Added 5 validation tests
- Fixed useReferenceQuery cache issue
- Added authorModes regression test

**Session 9** discovered serious problems:
- The "integration" tests avoid testing form submission (the critical path)
- E2E tests are failing due to auth/backend integration issues
- Test coverage numbers were inflated/misleading

---

## Current State

### Test Metrics
- **Total passing**: 391 unit tests | 1 skipped
- **Frontend coverage**: 50.48% (statements)
- **E2E tests**: 10 passing (DOI import) | 32 failing (everything else)
- **Test pyramid**: ~87% unit / 13% integration / 2% E2E (target: 60/30/10)

### Component Coverage Breakdown
```
ReferenceModal.tsx:        94.2% (good)
references.queries.ts:      98.09% (good)
TreeView, TagSelector:      100% (good, but unit tests only)
ReferenceCard:              95.57% (good)

Routes (library.tsx, etc.): 0% (not tested)
tags.queries.ts:            0% (not tested)
collections.queries.ts:     0% (not tested)
Toast.tsx:                  0% (not tested)
```

---

## Critical Issues Discovered

### Issue 1: Integration Tests Avoid Hard Parts

**File**: `src/features/library/components/__tests__/ReferenceModal.integration.test.tsx`

**What they claim to test**:
> "Full component integration with QueryClientProvider and MSW. Tests real workflows without heavy mocking."

**What they actually test**:
- Rendering of form elements
- Validation ERROR messages (not success paths)
- UI interactions that don't submit (toggle modes, add/remove authors)
- Keyboard shortcuts that close the modal (not submit)

**What they explicitly AVOID** (documented in Session 8 summary):
> "Avoid testing full form submission workflows (timing-sensitive with react-hook-form). Focus on UI behavior, validation display, and component integration."

**The problem**: Form submission IS the core feature. The ImportDOIWorkflow integration tests successfully test form submission, proving it's possible. Session 8 took the easy path.

**Critical missing tests**:
1. Fill form → submit → verify React Query cache updated
2. Fill form → submit → verify modal closes
3. Fill form → submit → verify success toast appears
4. Edit mode → load data → modify → submit → verify cache updated
5. Submit with validation error → verify form stays open
6. Backend error (409, 500) → verify error toast → verify modal stays open

---

### Issue 2: E2E Tests Infrastructure Broken

**Files**: All files in `e2e/` directory

**Current status**:
- 42 E2E tests exist and run
- 10 passing (all in `doi-import.spec.ts`)
- 32 failing (all others)

**Failing tests breakdown**:
- `reference-crud.spec.ts`: 5 tests failing
- `collection-workflows.spec.ts`: 8 tests failing
- `tag-workflows.spec.ts`: 10 tests failing
- `critical-flows.spec.ts`: 8 tests failing

**Root cause identified**: Authentication not set up properly for E2E tests

**Evidence**:
1. Backend health check returns: `{"success":false,"message":"Unauthorized - missing user context"}`

2. `doi-import.spec.ts` (passing tests) uses direct API calls with headers:
```typescript
await page.request.delete('http://localhost:8005/api/bibliography/references/test-cleanup', {
  headers: {
    'x-user-id': 'test-user-id',
  },
});
```

3. Browser-based tests (`reference-crud.spec.ts`) need auth state in localStorage but:
   - Auth setup was added in Session 9 but tests still fail
   - Modal doesn't close after form submission
   - Toast messages don't appear
   - Suggests API calls are failing (likely auth rejection)

**Attempted fix** (Session 9):
```typescript
// Added to reference-crud.spec.ts beforeEach
await page.evaluate(() => {
  const authState = {
    state: {
      isAuthenticated: true,
      tokens: { accessToken: 'test-token', refreshToken: 'test-refresh-token' },
      user: { id: 'test-user-id', email: 'test@example.com', name: 'Test User' },
      sessionExpiry: new Date(Date.now() + 3600000).toISOString(),
    },
    version: 0,
  };
  localStorage.setItem('auth-storage', JSON.stringify(authState));
});
```

**Result**: Still failing. The auth tokens in localStorage aren't being sent to the backend correctly, or the backend doesn't accept them.

**Likely issues**:
- API client doesn't read auth from localStorage correctly in E2E environment
- Backend middleware expects different auth format
- CORS or header issues in test environment
- Race condition between localStorage set and page reload

---

### Issue 3: Test Documentation Misleading

**File**: `docs/03-quality/TESTING.md`

**Claimed numbers**:
- Total tests: 485 (frontend 333 unit, backend 115, E2E 37)
- Frontend coverage: 45.95%
- Test pyramid: 69% unit / 24% integration / 8% E2E

**Actual numbers**:
- Total frontend tests: 391 passing + 1 skipped
- Frontend coverage: 50.48%
- Test pyramid: 87% unit / 13% integration / 2% real E2E

**Discrepancy**: Documentation overstates E2E coverage (claims 37, but only 10 actually pass)

---

## Files to Review

### Primary Files (Most Important)

1. **`src/features/library/components/__tests__/ReferenceModal.integration.test.tsx`**
   - Review lines 140-310 to see what's NOT being tested
   - Compare with `src/features/library/__tests__/ImportDOIWorkflow.integration.test.tsx` (lines 273-297) to see how form submission SHOULD be tested

2. **`e2e/reference-crud.spec.ts`**
   - Review the test setup (lines 11-43)
   - Check test expectations vs. actual behavior
   - Compare with `e2e/doi-import.spec.ts` (lines 36-56) to see working auth setup

3. **`src/features/library/components/ReferenceModal.tsx`**
   - Review form submission logic (lines 143-160)
   - Check how mutations are called
   - Verify error handling

4. **`src/common/api/client.ts`**
   - Check how auth headers are added to requests
   - Verify if `x-user-id` header is being sent
   - Coverage is 48.26% - what's NOT covered?

### Supporting Files

5. **`src/store/auth.store.ts`**
   - How auth state is persisted (lines 39-41: `persist` middleware)
   - How tokens are stored and retrieved

6. **`docs/sessions/Session-8-Summary.md`**
   - Read "Key Learnings" section to see the rationalization
   - Note the admission about avoiding form submission testing

7. **`docs/sessions/Session-7-Summary.md`**
   - See original E2E test attempt and why it was "deferred"

---

## Questions for Review

### Testing Strategy
1. Is the current integration test approach valid, or is it avoiding the hard problems?
2. Should ReferenceModal integration tests actually test form submission end-to-end?
3. Is 50% frontend coverage acceptable for this stage, or should it be higher?

### E2E Infrastructure
4. What's the correct way to set up auth for Playwright E2E tests in this architecture?
5. Should E2E tests use real backend or mocked backend (MSW)?
6. Is it worth fixing 32 failing E2E tests, or should we remove them and write fewer, better ones?

### Architecture
7. Why does the backend require `x-user-id` header instead of JWT tokens?
8. Is the API client correctly reading auth from Zustand persist storage?
9. Are there race conditions in how E2E tests set up localStorage auth?

### Priorities
10. What's the ROI of fixing E2E tests vs. adding comprehensive integration tests?
11. Should we test ReferenceModal submission in integration tests (with MSW) or E2E tests (with real backend)?
12. What's the minimum viable test coverage to ship this feature confidently?

---

## Specific Code Patterns to Review

### Pattern 1: Integration Test Avoidance

**Bad (current approach)**:
```typescript
// ReferenceModal.integration.test.tsx:154-171
it('should show validation error when title is missing', async () => {
  await user.type(screen.getAllByPlaceholderText(/last name/i)[0], 'Doe');
  await user.click(screen.getByRole('button', { name: /create/i }));

  await waitFor(() => {
    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
  });
  // Tests error case, but NOT success case!
});
```

**Good (ImportDOI approach)**:
```typescript
// ImportDOIWorkflow.integration.test.tsx:273-297
test('should import reference and update React Query cache', async () => {
  // Fill input
  await user.type(doiInput, TEST_DOI);
  await user.click(importButton);

  // Wait for mutation
  await waitFor(() => {
    expect(mockImportMutation).toHaveBeenCalled();
  });

  // Verify cache updated
  const references = queryClient.getQueryData(['references', 'list']);
  expect(references).toContainEqual(expect.objectContaining({ doi: TEST_DOI }));
});
```

**Question**: Why didn't Session 8 use the ImportDOI pattern for ReferenceModal tests?

---

### Pattern 2: E2E Auth Setup

**DOI Import (working)**:
```typescript
// e2e/doi-import.spec.ts:37-43
test.beforeEach(async ({ page }) => {
  const cleanupResponse = await page.request.delete('http://localhost:8005/api/bibliography/references/test-cleanup', {
    headers: {
      'x-user-id': 'test-user-id',
    },
  });
  await page.goto('http://localhost:5173/library');
});
```

**Reference CRUD (failing)**:
```typescript
// e2e/reference-crud.spec.ts:15-34
await page.evaluate(() => {
  localStorage.setItem('auth-storage', JSON.stringify({
    state: {
      tokens: { accessToken: 'test-token' },
      user: { id: 'test-user-id' },
    },
  }));
});
await page.reload();
```

**Question**: Why does DOI import work but Reference CRUD fail? What's different about the auth flow?

---

### Pattern 3: React Query Cache Testing

**Current (ReferenceModal integration tests)**:
```typescript
// NOT TESTED: Cache updates after mutation
```

**ImportDOI (successful pattern)**:
```typescript
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

// After mutation
const cachedReferences = queryClient.getQueryData(['references', 'list']);
expect(cachedReferences).toContainEqual(expect.objectContaining({ title: 'New Reference' }));
```

**Question**: Should ReferenceModal integration tests verify cache updates like ImportDOI tests do?

---

## Backend Context

The backend uses a gateway pattern:
- API Gateway routes requests to microservices
- Auth middleware injects `x-user-id` header from JWT token
- Services trust the gateway and use `x-user-id` directly
- No JWT validation in individual services

**Files**:
- `bibliography_backend/src/middleware/auth.middleware.ts` (likely where auth happens)
- `bibliography_backend/src/routes/references.routes.ts` (API endpoints)

**Question**: How should E2E tests authenticate? Mock gateway headers or use real JWT flow?

---

## Recommended Focus Areas

1. **ReferenceModal Integration Tests** (high ROI)
   - Add 4-5 tests that actually test form submission with MSW
   - Follow ImportDOI test pattern
   - Verify cache updates, modal closes, toast appears

2. **E2E Auth Infrastructure** (medium ROI, but time-consuming)
   - Either: Fix localStorage → API client → backend flow
   - Or: Use MSW in E2E tests instead of real backend
   - Or: Remove failing E2E tests and document as future work

3. **Documentation Accuracy** (low effort, high value)
   - Update TESTING.md with real numbers
   - Remove or mark placeholder E2E tests
   - Document what's actually tested vs. not tested

---

## Success Criteria for Fix

After fixes, the test suite should:
1. ✅ Test ReferenceModal form submission end-to-end (integration tests with MSW)
2. ✅ Verify React Query cache updates after create/edit
3. ✅ Test error handling (409 duplicate, 500 server error)
4. ✅ Have honest documentation of coverage gaps
5. ⚠️ Either fix E2E tests OR remove them and document decision

**Timeline estimate**: 4-6 hours to complete properly

---

## Files Changed So Far (Session 9)

- `e2e/reference-crud.spec.ts`: Added auth setup, added author fields to tests (still failing)
- `shared/src/schemas.ts`: Added `.trim()` to AuthorInputSchema for whitespace handling

**Status**: E2E debugging blocked, pivoting to integration tests
