  ✅ VERIFIED ISSUES

  1. Tests are Red (CRITICAL)

  Status: CONFIRMED - 13 failed tests, 3 test suites failed

  Root Causes:
  - ReferenceService.test.ts: Invalid ObjectId passed to collectionIds.map()
  - ReferenceService.test.ts: pdf field returns {} instead of undefined after detach
  - ProjectService tests: Duplicate key errors from partial indexes
  - Integration tests: Expected 200, got 201 for project link endpoints
  - Integration tests: Missing data due to failed inserts

  Fix Priority: P0 (blocking)

  ---
  2. Tag Rename API Mismatch (HIGH)

  Status: CONFIRMED

  Current State:
  - Frontend: PATCH /tags/${oldName} with body {name: newName}
  - Backend: PATCH /tags/:oldName/rename with body {newName}

  Evidence:
  - bibliography_frontend/src/features/library/api/tags.queries.ts:98-100
  - bibliography_backend/src/routes/tags.ts:30-33

  Impact: Tag rename feature completely broken in production

  Fix Priority: P0 (feature broken)

  ---
  3. Reference Creation - Unsafe ObjectId Conversion (HIGH)

  Status: CONFIRMED

  Issues:
  - ReferenceService.ts:47 - No try-catch around collectionIds.map(id => new mongoose.Types.ObjectId(id))
  - ReferenceService.ts:221 - Citation key uniqueness check not scoped by userId

  Evidence:
  BSONError: input must be a 24 character hex string, 12 byte Uint8Array, or an integer
    at ReferenceService.create (src/services/ReferenceService.ts:47:38)

  Impact:
  - Invalid collectionId crashes server
  - Citation key collisions possible across users

  Fix Priority: P1 (data integrity)

  ---
  4. Search & Projects Features Incomplete (MEDIUM)

  Status: CONFIRMED

  Current State: Both are placeholder screens with hardcoded text

  Evidence:
  - bibliography_frontend/src/routes/search.tsx:28-32
  - bibliography_frontend/src/routes/projects.tsx:28-34

  Spec Requirements (Spec.md:174-195):
  - Search: Full-text search, author/year/venue/tag filters, faceted counts
  - Projects: Link collections to projects, reference preview

  Fix Priority: P2 (per roadmap - Session 8 & 10)

  ---
  5. Test Cleanup Endpoint Exposed (SECURITY)

  Status: CONFIRMED

  Issue: DELETE /api/bibliography/references/test-cleanup has no environment guard

  Evidence: bibliography_backend/src/routes/references.ts:32-38
  // TODO: Disable in production via environment check
  router.delete('/test-cleanup', (req, res) => {

  Impact: Anyone can delete all references in production

  Fix Priority: P0 (security vulnerability)

  ---
  6. UI State Inconsistency - Missing 'trash' View (HIGH)

  Status: CONFIRMED

  Issue:
  - ui.store.ts:23 - activeView type: 'library' | 'search' | 'projects' | 'duplicates'
  - trash.tsx:17 - Calls setActiveView('trash') (TypeScript error)

  Impact: TypeScript compilation error, trash view won't highlight in ActivityBar

  Fix Priority: P1 (type safety)

  ---
  7. CSS Classes Don't Exist (HIGH)

  Status: CONFIRMED

  Issue: Using non-existent Tailwind classes

  Wrong Classes (search.tsx, projects.tsx):
  - text-text-primary → should be text-app-text-primary
  - text-text-secondary → should be text-app-text-secondary
  - bg-bg-surface → should be bg-app-surface
  - border-border → should be border-app-border

  Correct Classes (trash.tsx):
  - text-app-text-primary ✅
  - border-app-border ✅

  Evidence: tailwind.css:8-26 defines --color-app-* custom properties

  Fix Priority: P1 (visual bugs)

  ---
  8. Console Logging in Production Code (MEDIUM)

  Status: CONFIRMED

  Locations:
  - bibliography_frontend/src/features/library/api/import.queries.ts:38
  console.error('DOI import failed:', error);

  Best Practice: Use proper logging (ApplicationLogger for backend, toast for frontend)

  Fix Priority: P2 (code quality)

  ---
  9. ProjectLink Duplicate Key Errors (HIGH)

  Status: CONFIRMED

  Issue: Partial indexes don't prevent duplicate inserts when field is null

  Evidence (test-results.txt:63-68):
  E11000 duplicate key error collection: test.projectlinks
  index: userId_1_projectId_1_collectionId_1 
  dup key: { userId: "dev-user-123", projectId: "proj-123", collectionId: null }

  Root Cause: MongoDB partial indexes with $ne: null still create entries for null values

  Spec Requirement (Spec.md:729-740): Validation hook prevents both fields being null/set

  Fix Priority: P1 (data integrity)

  ---
  10. Documentation Lags Reality (MEDIUM)

  Status: CONFIRMED

  Issues:
  - docs/03-quality/TESTING.md - All coverage shows "TBD" (outdated since Session 6)
  - Backend README doesn't mention Zod vs Joi clearly
  - Spec.md:613-629 shows Joi examples, but backend uses Zod

  Impact: Developer confusion, onboarding friction

  Fix Priority: P2 (documentation)

  ---
  11. Unused Dependencies (LOW)

  Status: CONFIRMED

  Frontend (package.json):
  - react-hook-form - NOT USED (no imports in codebase)
  - @hookform/resolvers - NOT USED
  - i18next - NOT USED (MVP is English-only per Spec.md:363)
  - i18next-browser-languagedetector - NOT USED
  - i18next-http-backend - NOT USED
  - react-i18next - NOT USED

  Impact:
  - Larger bundle size (~500KB)
  - Slower npm install
  - Security surface

  Fix Priority: P3 (optimization)

  ---
  12. ReferenceFilters Incomplete (MEDIUM)

  Status: CONFIRMED

  Current (IReferenceService.ts:47-54):
  interface ReferenceFilters {
    collectionId?: string;
    tags?: string[];
    deleted?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }

  Spec Requirements (Spec.md:174-195):
  - authors?: string[] - Filter by author names
  - yearMin?: number - Year range filter
  - yearMax?: number - Year range filter
  - venues?: string[] - Filter by venue

  Impact: Search feature (Session 8) will need these filters

  Fix Priority: P2 (feature gap)

  ---
  13. PDF Detach Test Failure (LOW)

  Status: CONFIRMED

  Issue: ReferenceService.detachPdf() returns {pdf: {}} instead of {pdf: undefined}

  Test Expectation (tests/unit/services/ReferenceService.test.ts:513):
  expect(detached?.pdf).toBeUndefined();
  // Received: {}

  Fix: Use $unset instead of $set for pdf field

  Fix Priority: P3 (test quality)

  ---
  📋 COMPREHENSIVE FIX PLAN

  Phase 1: Critical Fixes (P0 - Do First) ⚠️

  1.1 Fix Tag Rename API Mismatch

  Files:
  - bibliography_frontend/src/features/library/api/tags.queries.ts

  Change:
  // Line 98
  const response = await apiClient.patch<Tag>(`/tags/${oldName}/rename`, {
    newName,  // Changed from: name: newName
  });

  Test: Backend integration test already exists and passes

  ---
  1.2 Add Test Cleanup Environment Guard

  Files:
  - bibliography_backend/src/routes/references.ts

  Change:
  // Only register in test/dev environments
  if (process.env.NODE_ENV !== 'production') {
    router.delete('/test-cleanup', (req, res) => {
      const controller = container.get<ReferenceController>(TYPES.ReferenceController);
      return controller.testCleanup(req, res);
    });
  }

  Test: Try accessing endpoint with NODE_ENV=production (should 404)

  ---
  1.3 Fix Backend Tests (ReferenceService)

  Files:
  - bibliography_backend/tests/unit/services/ReferenceService.test.ts

  Changes:
  1. Line 199 - Use valid ObjectId for collectionId:
  const validCollectionId = new mongoose.Types.ObjectId().toString();
  const reference = await service.create(userId, {
    // ...
    collectionIds: [validCollectionId],
  });
  2. Line 513 - Fix PDF detach assertion:
  expect(detached?.hasPdf).toBe(false);
  expect(detached?.pdf).toBeNull(); // Changed from toBeUndefined()
  3. Fix ReferenceService.detachPdf:
  return Reference.findOneAndUpdate(
    { _id: id, userId },
    { $set: { hasPdf: false }, $unset: { pdf: 1 } }, // Use $unset
    { new: true }
  );

  ---
  1.4 Fix UI State - Add 'trash' to activeView

  Files:
  - bibliography_frontend/src/store/ui.store.ts

  Change:
  // Line 23
  activeView: 'library' | 'search' | 'projects' | 'duplicates' | 'trash';

  Test: Navigate to /trash, check TypeScript errors gone

  ---
  Phase 2: High Priority Fixes (P1 - Do Next) 🔧

  2.1 Add Error Handling for ObjectId Conversion

  Files:
  - bibliography_backend/src/services/ReferenceService.ts

  Change:
  // Line 46-48
  const collectionIds = data.collectionIds
    ? data.collectionIds.map(id => {
        try {
          return new mongoose.Types.ObjectId(id);
        } catch (error) {
          throw new Error(`Invalid collectionId format: ${id}`);
        }
      })
    : [];

  Test: Try creating reference with invalid collectionId, expect 400 error

  ---
  2.2 Fix Citation Key Scoping

  Files:
  - bibliography_backend/src/services/ReferenceService.ts

  Change:
  // Line 221
  const existing = await Reference.findOne({
    userId,  // ADD THIS
    citationKey: key
  });

  Add Test: Create two users with same citation key, verify both succeed

  ---
  2.3 Fix CSS Class Names

  Files:
  - bibliography_frontend/src/routes/search.tsx
  - bibliography_frontend/src/routes/projects.tsx

  Find/Replace:
  - text-text-primary → text-app-text-primary
  - text-text-secondary → text-app-text-secondary
  - bg-bg-surface → bg-app-surface
  - border-border → border-app-border

  Test: Visual inspection, check placeholder screens render correctly

  ---
  2.4 Fix ProjectLink Duplicate Errors

  Files:
  - bibliography_backend/src/models/ProjectLink.ts
  - bibliography_backend/tests/integration/projects.test.ts
  - bibliography_backend/tests/unit/services/ProjectService.test.ts

  Root Issue: Tests don't clean up between runs, partial indexes fail on null

  Solution 1 - Update indexes to handle null properly:
  // Remove current partial indexes (lines 41-54)
  // Add composite unique indexes that exclude null
  ProjectLinkSchema.index(
    { userId: 1, projectId: 1, referenceId: 1 },
    {
      unique: true,
      sparse: true  // Use sparse instead of partial
    }
  );

  Solution 2 - Fix test cleanup:
  beforeEach(async () => {
    await ProjectLink.deleteMany({}); // Ensure clean state
    await Reference.deleteMany({});
    await Collection.deleteMany({});
  });

  Solution 3 - Fix expected status codes in tests:
  // tests/integration/projects.test.ts
  // Line 40, 90, 290
  .expect(201);  // Changed from 200

  ---
  Phase 3: Medium Priority Fixes (P2 - After MVP) 📝

  3.1 Remove Console Logging

  Files:
  - bibliography_frontend/src/features/library/api/import.queries.ts

  Change:
  // Line 35-40 - Remove onError handler entirely
  // Error toast already handled by ImportModal.tsx:71-86

  ---
  3.2 Extend ReferenceFilters Interface

  Files:
  - bibliography_backend/src/interfaces/IReferenceService.ts
  - bibliography_backend/src/services/ReferenceService.ts

  Change:
  export interface ReferenceFilters {
    collectionId?: string;
    tags?: string[];
    deleted?: boolean;
    search?: string;

    // Add for Session 8 (Search)
    authors?: string[];      // Exact match on author names
    yearMin?: number;        // Year >= yearMin
    yearMax?: number;        // Year <= yearMax
    venues?: string[];       // Regex match on venue

    limit?: number;
    offset?: number;
  }

  Implementation: Update ReferenceService.list() to handle new filters

  Test: Add integration tests for each new filter

  ---
  3.3 Update Documentation

  Files:
  - docs/03-quality/TESTING.md
  - bibliography_backend/README.md

  Changes:
  1. TESTING.md - Update coverage summary with actual numbers
  2. README.md - Add section clarifying Zod validation (not Joi)
  3. Spec.md - Update validation examples to show Zod instead of Joi

  ---
  Phase 4: Low Priority Fixes (P3 - Optional) 🧹

  4.1 Remove Unused Dependencies

  Files:
  - bibliography_frontend/package.json

  Remove:
  "react-hook-form": "^7.57.0",
  "@hookform/resolvers": "^5.0.1",
  "@hookform/devtools": "^4.4.0",
  "i18next": "^25.2.1",
  "i18next-browser-languagedetector": "^8.1.0",
  "i18next-http-backend": "^3.0.2",
  "react-i18next": "^15.5.2"

  Run: pnpm install to update lockfile

  Impact: Reduces bundle by ~500KB

  ---
  🎯 EXECUTION ORDER

  Week 1 - Critical Path

  1. ✅ Fix tag rename API (5 min)
  2. ✅ Add test cleanup guard (5 min)
  3. ✅ Fix UI state type (2 min)
  4. ✅ Fix CSS classes (10 min)
  5. ✅ Fix backend tests (30 min)
    - ReferenceService ObjectId handling
    - PDF detach assertion
    - ProjectLink test cleanup

  Run Tests: pnpm --filter bibliography-backend test

  Week 2 - Data Integrity

  6. ✅ Add ObjectId error handling (15 min)
  7. ✅ Fix citation key scoping (5 min)
  8. ✅ Fix ProjectLink indexes (30 min)
  9. ✅ Update project integration tests (15 min)

  Run Tests: pnpm --filter bibliography-backend test:integration

  Week 3 - Polish

  10. ✅ Remove console logging (5 min)
  11. ✅ Extend ReferenceFilters (20 min)
  12. ✅ Update documentation (30 min)

  Optional - Cleanup

  13. Remove unused dependencies (10 min)

  ---
  📊 RISK ASSESSMENT

  High Risk:
  - ProjectLink index changes (might break existing data)
  - ReferenceFilters extension (might break existing queries)

  Medium Risk:
  - Citation key scoping (need migration for existing data)

  Low Risk:
  - All UI/CSS changes (no data impact)
  - Tag rename API (simple route change)
  - Test cleanup guard (environment-based)

  ---
  ✅ VALIDATION CHECKLIST

  After fixes, verify:
  - pnpm --filter bibliography-backend test - All tests green
  - pnpm --filter bibliography-frontend test:unit - All tests green
  - Tag rename works in UI
  - Trash view highlights correctly in ActivityBar
  - Placeholder screens have correct styling
  - Test cleanup endpoint returns 404 in production
  - Creating reference with invalid collectionId shows proper error
  - Two users can have same citation key
