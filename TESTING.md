# Testing Documentation

This document tracks test coverage across all sessions following the **60/30/10 test pyramid**:
- **60% Unit Tests**: Fast, isolated tests for individual functions/components
- **30% Integration Tests**: Tests for component workflows with real dependencies
- **10% E2E Tests**: Full user workflows with browser automation

---

## Test Coverage by Session

### Session 9: DetailsPane Enhancement (✅ Complete)

**Features Tested**:
- Edit button in DetailsPane header
- Tags display with remove (X) buttons
- Tag removal workflow with API integration
- Collections display with clickable filter links
- Metadata footer (created/modified dates, source)
- ESC key handler for closing DetailsPane

**Test Breakdown**:
- **Backend Unit**: 1 test
- **Frontend Unit**: 20 tests
- **Frontend Integration**: 13 tests
- **E2E**: 11 tests
- **Total**: 45 tests ✅

#### Backend Unit Tests (1 test)
**File**: `bibliography_backend/tests/unit/services/ReferenceService.test.ts`
- ✅ ReferenceService.getById populates collections virtual field

#### Frontend Unit Tests (20 tests)
**File**: `bibliography_frontend/src/components/layout/__tests__/DetailsPane.test.tsx`

**Edit Button** (3 tests):
- ✅ Renders Edit button in header
- ✅ Calls onEdit callback when Edit button clicked
- ✅ Passes reference ID to onEdit callback

**Tags Section** (6 tests):
- ✅ Renders Tags section with tag items
- ✅ Displays tags in alphabetical order
- ✅ Shows remove button (X icon) for each tag
- ✅ Calls removeTags mutation when X button clicked
- ✅ Disables remove button during mutation
- ✅ Shows empty state when no tags

**Collections Section** (6 tests):
- ✅ Renders Collections section with collection items
- ✅ Shows folder icon for each collection
- ✅ Displays collection names and colors
- ✅ Calls onClick handler when collection clicked
- ✅ Shows empty state when no collections
- ✅ Handles null/undefined collections array

**Metadata Footer** (5 tests):
- ✅ Renders metadata footer with dates and source
- ✅ Formats created date correctly
- ✅ Formats modified date correctly
- ✅ Displays source provider
- ✅ Shows "Unknown" when source missing

#### Frontend Integration Tests (13 tests)

**Tag Removal Workflow** (8 tests):
**File**: `bibliography_frontend/src/features/library/__tests__/detailsPane.integration.test.tsx`
- ✅ Renders DetailsPane with tags when reference selected
- ✅ Shows remove buttons for all tags
- ✅ Removes tag when X button clicked
- ✅ Updates UI after tag removal
- ✅ Invalidates query cache after mutation
- ✅ Refetches reference after invalidation
- ✅ Handles remove tag mutation errors
- ✅ Complete workflow: click X → API call → invalidation → refetch

**ESC Key Handler** (5 tests):
**File**: `bibliography_frontend/src/features/library/__tests__/libraryEsc.integration.test.tsx`
- ✅ Adds ESC keydown listener when component mounts
- ✅ Removes listener on unmount
- ✅ Calls setActiveReference(null) when ESC pressed with active reference
- ✅ Does nothing when ESC pressed without active reference
- ✅ Cleanup prevents memory leaks

#### E2E Tests (11 tests)
**File**: `bibliography_frontend/e2e/reference-details-session9.spec.ts`

**Worker Isolation**: Each Playwright worker uses unique user ID (test-user-0, test-user-1, etc.) to prevent race conditions

**Test Cases**:
- ✅ Opens DetailsPane when clicking a reference
- ✅ Displays reference title, authors, year, type, DOI, abstract
- ✅ Displays tags with remove buttons (3 tags)
- ✅ Removes tag when clicking X button
- ✅ Displays collections with clickable links (2 collections)
- ✅ Filters library when clicking a collection
- ✅ Displays metadata footer (created/modified dates, source)
- ✅ Shows Edit button in DetailsPane
- ✅ Closes DetailsPane when pressing ESC key
- ✅ Does NOT close on ESC if no reference active
- ✅ Closes DetailsPane when clicking close button
- ✅ Complete workflow: open → remove tag → filter by collection → close with ESC

**Critical Bugs Fixed During Testing**:
1. **API Envelope Unwrapping**: DetailsPane was parsing entire response instead of `response.data` (caught by integration tests)
2. **Collection Population**: Backend was overwriting `collectionIds` array instead of using virtual field (caught by E2E tests)
3. **Zod Schema**: CollectionSchema.deletedAt needed `.nullish()` instead of `.nullable()` (caught by E2E tests)

---

## Test Pyramid Compliance

### Session 9 Analysis
- Unit Tests: 21/45 = **47%** (target: 60%)
- Integration Tests: 13/45 = **29%** (target: 30%) ✅
- E2E Tests: 11/45 = **24%** (target: 10%) ⚠️

**Note**: E2E percentage is higher than target due to comprehensive workflow coverage. Integration tests are spot-on. Consider adding more unit tests for utils/helpers in future sessions.

---

## Running Tests

### Backend Tests
```bash
# All backend tests
cd bibliography_backend
pnpm test

# Unit tests only
pnpm test:unit

# Integration tests only
pnpm test:integration

# With coverage
pnpm test:coverage
```

### Frontend Tests
```bash
# All frontend tests (unit + integration)
cd bibliography_frontend
pnpm test

# Unit tests only
pnpm vitest run src/**/__tests__/*.test.tsx

# Integration tests only
pnpm vitest run src/**/__tests__/*.integration.test.tsx

# E2E tests (requires servers running)
pnpm test:e2e

# Specific E2E file
pnpm test:e2e e2e/reference-details-session9.spec.ts

# E2E with UI
pnpm test:e2e --ui
```

### Run All Tests (Full Suite)
```bash
# Terminal 1: Start backend
cd /home/mahdi/Desktop/bibliography
pnpm --filter bibliography-backend dev

# Terminal 2: Start frontend
pnpm --filter bibliography-frontend dev

# Terminal 3: Run all tests
cd bibliography_backend && pnpm test
cd ../bibliography_frontend && pnpm test && pnpm test:e2e
```

---

## Test Organization

### Backend Test Structure
```
bibliography_backend/
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   │   └── ReferenceService.test.ts
│   │   ├── models/
│   │   └── utils/
│   └── integration/
│       ├── routes/
│       └── workflows/
```

### Frontend Test Structure
```
bibliography_frontend/
├── src/
│   ├── components/
│   │   └── layout/
│   │       └── __tests__/
│   │           └── DetailsPane.test.tsx (unit)
│   └── features/
│       └── library/
│           └── __tests__/
│               ├── detailsPane.integration.test.tsx
│               └── libraryEsc.integration.test.tsx
└── e2e/
    ├── fixtures/
    │   └── workerFixtures.ts (worker isolation)
    └── reference-details-session9.spec.ts
```

---

## Testing Best Practices

### 1. Test Naming Convention
- **Unit**: `ComponentName.test.tsx` or `functionName.test.ts`
- **Integration**: `featureName.integration.test.tsx`
- **E2E**: `feature-name-sessionX.spec.ts`

### 2. Test Structure (AAA Pattern)
```typescript
it('should do something when condition', async () => {
  // Arrange: Set up test data and mocks
  const mockData = { ... };
  vi.mocked(apiClient.get).mockResolvedValue({ data: mockData });

  // Act: Perform the action
  const result = await doSomething();

  // Assert: Verify the outcome
  expect(result).toBe(expected);
});
```

### 3. Integration Tests - Mock External Dependencies Only
```typescript
// ✅ GOOD: Mock API client (external dependency)
vi.mock('@/common/api/client');

// ❌ BAD: Don't mock internal modules
// vi.mock('@/features/library/store/library.store');
```

### 4. E2E Tests - Worker Isolation Pattern
```typescript
// Use worker-scoped user ID to prevent race conditions
test.beforeEach(async ({ page, workerUserId }) => {
  // Inject worker-scoped user ID into all API calls
  await page.route('http://localhost:8005/api/bibliography/**', async (route) => {
    const headers = {
      ...route.request().headers(),
      'x-user-id': workerUserId,
    };
    await route.continue({ headers });
  });
});
```

### 5. Scope Selectors to Avoid Strict Mode Violations
```typescript
// ❌ BAD: Ambiguous selector (matches multiple elements)
await expect(page.getByText('machine-learning')).toBeVisible();

// ✅ GOOD: Scoped to specific container
const detailsPane = page.getByLabel('Reference Details');
await expect(detailsPane.getByText('machine-learning')).toBeVisible();
```

---

## Test Coverage Goals

**Target Coverage** (overall):
- **Statements**: >80%
- **Branches**: >75%
- **Functions**: >80%
- **Lines**: >80%

**Critical Paths** (must be 100% covered):
- Authentication flows
- Data mutations (create/update/delete)
- Duplicate detection
- Import workflows
- PDF upload/download

**Current Coverage**: _To be measured after Session 19 (comprehensive testing session)_

---

## Future Testing Todos

- [ ] Add coverage reporting to CI/CD pipeline
- [ ] Set up test coverage badges
- [ ] Add visual regression testing (Playwright screenshots)
- [ ] Add performance benchmarks for critical queries
- [ ] Add accessibility testing (axe-core integration)
- [ ] Document testing strategy for Sessions 1-8
- [ ] Measure overall test coverage after Session 19

---

**Last Updated**: Session 9 (2025-01-16)
**Status**: 45/45 Session 9 tests passing ✅
