# Testing Documentation

Comprehensive testing coverage for the Bibliography Manager project, tracking test types, coverage metrics, and testing approach.

---

## Executive Summary

**Total Test Count:** 485 tests
**Test Pyramid Ratio:** 69% unit / 24% integration / 8% E2E (target: 60/30/10)

| Test Type         | Count | Coverage | Location                                    |
|-------------------|-------|----------|---------------------------------------------|
| Frontend Unit     | 333   | 45.95%   | `bibliography_frontend/src/**/__tests__`    |
| Backend Integration| 115  | 66.98%   | `bibliography_backend/tests/integration`    |
| Frontend E2E      | 37    | N/A      | `bibliography_frontend/e2e`                 |

**Testing Philosophy:**
- Comprehensive integration tests for critical workflows
- Unit tests for complex logic and utilities
- E2E tests for end-to-end user journeys
- Focus on user-facing functionality over implementation details

---

## Test Pyramid Analysis

### Current Distribution
```
Frontend Unit Tests:        333 tests (68.7%)
  ├─ Component tests:       ~180 tests
  ├─ Integration workflows: 46 tests (NEW)
  ├─ Store tests:          57 tests
  └─ Utils/API tests:      ~50 tests

Backend Integration Tests:  115 tests (23.7%)
  ├─ API endpoints:        ~70 tests
  ├─ Service layer:        ~30 tests
  └─ Security (user scoping): 15 tests (NEW)

E2E Tests:                  37 tests (7.6%)
  ├─ Critical flows:       8 tests
  ├─ DOI import:           11 tests
  ├─ Collection workflows: 8 tests
  └─ Tag workflows:        10 tests
```

### Recent Improvements
**2025-01-15:** Added 61 new integration tests to improve pyramid ratio
- `ImportDOIWorkflow.integration.test.tsx`: 11 tests covering complete DOI import workflow
- `TagFilterWorkflow.integration.test.tsx`: 18 tests covering tag selection and filtering
- `CollectionFilterWorkflow.integration.test.tsx`: 17 tests covering collection navigation and filtering
- `user-scoping.test.ts`: 15 tests ensuring user data isolation

**Impact:** Moved from 70:20:10 ratio closer to target 60:30:10

---

## Frontend Testing (`bibliography_frontend/`)

### Unit Tests (`src/**/__tests__/*.test.tsx`)

**Run command:** `pnpm test:unit`
**Coverage command:** `pnpm test:unit --coverage`
**Current coverage:** 45.95% statements

#### Component Tests

| Component                    | Tests | Coverage | File                                                |
|------------------------------|-------|----------|-----------------------------------------------------|
| ReferenceCard               | 18    | 95.57%   | `library/components/__tests__/ReferenceCard.test.tsx` |
| TreeView                    | 19    | 100%     | `library/components/__tests__/TreeView.test.tsx`    |
| TreeNode                    | 21    | 100%     | `library/components/__tests__/TreeNode.test.tsx`    |
| TagSelector                 | 28    | 100%     | `library/components/__tests__/TagSelector.test.tsx` |
| TagItem                     | 9     | 100%     | `library/components/__tests__/TagItem.test.tsx`     |
| ImportModal                 | 24    | 95.61%   | `library/components/__tests__/ImportModal.test.tsx` |
| CollectionColorPickerModal  | 19    | 100%     | `library/components/__tests__/CollectionColorPickerModal.test.tsx` |
| TagColorPickerModal         | 23    | 98.34%   | `library/components/__tests__/TagColorPickerModal.test.tsx` |
| ReferenceList               | 5     | 84.84%   | `library/components/__tests__/ReferenceList.test.tsx` |

#### Integration Tests (Frontend)

| Workflow                    | Tests | File                                                      |
|-----------------------------|-------|-----------------------------------------------------------|
| Library Workflow            | 12    | `library/__tests__/LibraryWorkflow.integration.test.tsx` |
| Import DOI Workflow         | 11    | `library/__tests__/ImportDOIWorkflow.integration.test.tsx` |
| Tag Filter Workflow         | 18    | `library/__tests__/TagFilterWorkflow.integration.test.tsx` |
| Collection Filter Workflow  | 17    | `library/__tests__/CollectionFilterWorkflow.integration.test.tsx` |

**What These Tests Cover:**
- Complete user workflows from start to finish
- Store state management and persistence
- React Query cache updates
- MSW API mocking for realistic testing
- Visual state synchronization with store
- Edge cases (empty states, rapid actions, invalid inputs)

#### Store Tests

| Store         | Tests | Coverage | File                                      |
|---------------|-------|----------|-------------------------------------------|
| library.store | 26    | 84.25%   | `store/__tests__/library.store.test.ts`   |
| auth.store    | 10    | 98.61%   | `store/__tests__/auth.store.test.ts`      |
| ui.store      | 21    | 99.19%   | `store/__tests__/ui.store.test.ts`        |

#### Utilities & API

| Module             | Tests | Coverage | File                                            |
|--------------------|-------|----------|-------------------------------------------------|
| Common utils       | 23    | 86.27%   | `common/__tests__/utils.test.ts`                |
| Validation utils   | 15    | 100%     | `common/utils/__tests__/validation.test.ts`     |
| References queries | 15    | 100%     | `library/api/__tests__/references.queries.test.tsx` |

### E2E Tests (`e2e/*.spec.ts`)

**Run command:** `pnpm test:e2e`
**Requires:** Backend running on port 8005, frontend on port 5173

#### Critical Flows (`e2e/critical-flows.spec.ts`) - 8 tests
1. Create Reference → Add to Collection → Search → View Details
2. Collection Management: Create → Rename → Organize → Delete → Restore
3. Tag Management: Create → Assign Color → Filter by Multiple Tags
4. Bulk Operations: Select Multiple → Tag → Delete → Restore
5. Search and Sort: Combine Filters → Sort by Author → Persist Preferences
6. Error Recovery: API Failure → Retry → Success
7. Duplicate Detection: Import → Detect → Resolve
8. Reference Details Modal: View → Edit → Save → Verify

#### DOI Import Flow (`e2e/doi-import.spec.ts`) - 11 tests
- Successful import from DOI (one-step)
- Error handling (invalid format, non-existent DOI, rate limits, network errors)
- User experience (loading states, keyboard shortcuts, sequential imports)
- State persistence across page refreshes

#### Collection Workflows (`e2e/collection-workflows.spec.ts`) - 8 tests
- Create root collection and add references
- Nested collection hierarchy (3 levels deep)
- Assign color and verify visual indicator
- Reparenting (move to different parent)
- Delete collection (references remain, goes to trash)
- Expand/collapse state persistence
- Rename and verify references association
- Reference count dynamic updates

#### Tag Workflows (`e2e/tag-workflows.spec.ts`) - 10 tests
- Create tag on-the-fly and apply to reference
- Assign color with keyboard shortcut (1-9)
- Multiple colored tags with max 9 limit
- Filter by multiple tags and clear filters
- Tag usage count updates
- Remove color from tag
- Rename tag and verify references association
- Delete tag and remove from references
- Tag search/filter in selector
- Collapse/expand state persistence

---

## Backend Testing (`bibliography_backend/`)

### Integration Tests (`tests/integration/*.test.ts`)

**Run command:** `pnpm test:integration`
**Coverage command:** `pnpm test:integration --coverage`
**Current coverage:** 66.98% statements

#### API Endpoints

| Endpoint               | Tests | File                              |
|------------------------|-------|-----------------------------------|
| References CRUD        | ~25   | `references.test.ts`              |
| Collections CRUD       | ~20   | `collections.test.ts`             |
| Tags CRUD              | ~20   | `tags.test.ts`                    |
| Duplicate detection    | ~15   | `duplicates.test.ts`              |
| Projects/links         | ~15   | `projects.test.ts`                |
| DOI import             | ~10   | `doi-import.test.ts`              |
| User scoping (security)| 15    | `user-scoping.test.ts` (NEW)      |

#### Service Layer

| Service              | Tests | File                                    |
|----------------------|-------|-----------------------------------------|
| ReferenceService     | ~8    | `reference.service.test.ts`             |

**User Scoping Test Coverage (Security-Critical):**
- Reference isolation (5 tests): CRUD operations scoped by userId
- Collection isolation (4 tests): CRUD operations scoped by userId
- Tag isolation (2 tests): Tag documents scoped by userId
- Cross-resource scoping (2 tests): Prevent cross-user reference assignments
- Auth bypass in development (2 tests): Default user + explicit overrides

#### Coverage Breakdown by Layer

| Layer          | Coverage | Notes                                    |
|----------------|----------|------------------------------------------|
| Controllers    | 73.38%   | High coverage from integration tests     |
| Services       | 70.58%   | Core business logic well-tested          |
| Models         | 97.56%   | Mongoose schemas validated               |
| Routes         | 90.71%   | Routing layer thoroughly tested          |
| Middleware     | 36.79%   | Lower priority (error handling, logging) |

---

## Testing Best Practices

### Frontend Testing Approach

**1. Component Tests (`ComponentName.test.tsx`)**
- Test component in isolation with mocked dependencies
- Focus on user interactions and visual states
- Use React Testing Library queries (getByRole, getByText)
- Mock API calls with MSW handlers

**2. Integration Tests (`FeatureWorkflow.integration.test.tsx`)**
- Test complete user workflows end-to-end
- Include store state management
- Verify React Query cache updates
- Test visual synchronization with store state
- Cover edge cases and error scenarios

**3. E2E Tests (`feature.spec.ts`)**
- Test critical user journeys that cross multiple features
- Run against real backend (not mocked)
- Focus on high-value, time-consuming manual test scenarios
- Use Playwright for browser automation

### Backend Testing Approach

**1. Integration Tests (Preferred)**
- Test complete request → response flows
- Use mongodb-memory-server for isolated database
- Test with Supertest for HTTP assertions
- Cover happy path + error cases + edge cases

**2. Unit Tests (Selective)**
- Only for complex algorithms (e.g., duplicate detection)
- Only for utility functions with complex logic
- Not for simple CRUD operations (covered by integration)

### Act() Warning Resolution

**Issue:** Tests showed "not wrapped in act()" warnings when store updates triggered re-renders

**Solution:** Wrap all direct Zustand store updates in `act()` blocks when components are mounted:
```typescript
import { act } from '@/test/utils/testUtils';

act(() => {
  useLibraryStore.getState().setActiveCollection('col-1');
});
```

**When to use act():**
- Direct store.setState() calls during tests
- Manual store action calls (not user events)
- Async state updates that trigger re-renders

**When NOT needed:**
- User events via userEvent.click() (already wrapped)
- Initial store setup in beforeEach (no components mounted)

### MSW Handler Configuration

**Critical Pattern:** Backend API envelope format must match in MSW handlers:

```typescript
// ✅ CORRECT: Wrap in API envelope
return HttpResponse.json({
  success: true,
  data: mockReference,
}, { status: 201 });

// ❌ WRONG: Direct data return
return HttpResponse.json(mockReference, { status: 201 });
```

**Port Configuration:**
- MSW handlers use `http://localhost:8005/api/bibliography` (backend direct)
- Frontend production uses Vite proxy: `/api/bibliography` → `http://localhost:8005`
- In tests, API client bypasses Vite proxy, calls backend directly

---

## Running Tests

### All Tests
```bash
# Frontend
cd bibliography_frontend
pnpm test:unit          # Unit + integration tests (333 tests)
pnpm test:e2e           # E2E tests (37 tests)
pnpm test:unit --coverage  # With coverage report

# Backend
cd bibliography_backend
pnpm test:integration   # Integration tests (115 tests)
pnpm test:integration --coverage  # With coverage report
```

### Specific Tests
```bash
# Run single test file
pnpm test:unit ImportModal.test.tsx
pnpm test:integration references.test.ts

# Run tests matching pattern
pnpm test:unit -- Tag
pnpm test:integration -- doi

# Watch mode
pnpm test:unit --watch
```

### Coverage Reports
```bash
# Frontend coverage
pnpm test:unit --coverage
# View: bibliography_frontend/coverage/index.html

# Backend coverage
pnpm test:integration --coverage
# Coverage summary printed to console
```

---

## Test File Locations

```
bibliography_frontend/
├── src/
│   ├── features/library/
│   │   ├── __tests__/                          # Integration tests
│   │   │   ├── ImportDOIWorkflow.integration.test.tsx
│   │   │   ├── TagFilterWorkflow.integration.test.tsx
│   │   │   ├── CollectionFilterWorkflow.integration.test.tsx
│   │   │   └── LibraryWorkflow.integration.test.tsx
│   │   ├── components/__tests__/               # Component unit tests
│   │   │   ├── ReferenceCard.test.tsx
│   │   │   ├── TreeView.test.tsx
│   │   │   ├── TagSelector.test.tsx
│   │   │   └── ImportModal.test.tsx
│   │   ├── api/__tests__/                      # API/query tests
│   │   │   └── references.queries.test.tsx
│   │   └── store/__tests__/                    # Store tests
│   │       └── library.store.test.ts
│   ├── store/__tests__/                        # Global store tests
│   │   ├── auth.store.test.ts
│   │   └── ui.store.test.ts
│   └── common/__tests__/                       # Utility tests
│       └── utils.test.ts
├── e2e/                                        # E2E tests
│   ├── critical-flows.spec.ts
│   ├── doi-import.spec.ts
│   ├── collection-workflows.spec.ts
│   └── tag-workflows.spec.ts
└── test/                                       # Test utilities
    ├── setup.ts
    ├── mocks/handlers.ts                       # MSW handlers
    ├── fixtures/mockData.ts
    └── utils/testUtils.tsx                     # Testing Library setup

bibliography_backend/
└── tests/
    ├── integration/                            # Integration tests
    │   ├── references.test.ts
    │   ├── collections.test.ts
    │   ├── tags.test.ts
    │   ├── duplicates.test.ts
    │   ├── projects.test.ts
    │   ├── doi-import.test.ts
    │   └── user-scoping.test.ts                # Security tests (NEW)
    ├── unit/                                   # Unit tests
    │   ├── models/
    │   └── services/
    └── utils/                                  # Test utilities
        ├── mongoMemoryServer.ts
        └── testApp.ts
```

---

## Outstanding Gaps

### Low Priority (Working Features, Not Tested)
- Placeholder features (PDF viewing, reference editing modals)
- Search functionality (not wired up to backend)
- Duplicate resolution UI (backend works, UI placeholder)

### Coverage Improvements Needed
- Middleware error handling (currently 36.79% coverage)
- API client error scenarios (network failures, timeouts)
- E2E tests for bulk operations (partially covered)

### Future Testing Needs (Post-MVP)
- Performance testing (large libraries, 10k+ references)
- Accessibility testing (screen reader compatibility)
- Cross-browser E2E testing (currently Chromium only)
- Mobile responsive E2E testing

---

**Last Updated:** 2025-01-15
**Test Count:** 485 tests (333 frontend unit/integration, 115 backend integration, 37 E2E)
**Coverage:** Frontend 45.95%, Backend 66.98%

---

## Changelog

### 2025-01-15: Comprehensive Testing Update
- Added 61 new integration tests (11 DOI + 18 tag + 17 collection + 15 user scoping)
- Improved test pyramid ratio from 70:20:10 to 69:24:8
- Fixed MSW handler API envelope format
- Resolved act() warnings in integration tests
- Fixed bypassGatewayAuth middleware to allow test user ID overrides
- Documented comprehensive test locations and best practices
- Rewrote TESTING.md with complete coverage inventory
