                                                                                                                            │
     │ Add 75-100 tests to cover critical backend gaps and essential E2E flows. No over-engineering—just the tests you'd be        │
     │ embarrassed to ship without.                                                                                                │
     │                                                                                                                             │
     │ ---                                                                                                                         │
     │ Part 1: Backend Tests (50-65 tests)                                                                                         │
     │                                                                                                                             │
     │ Priority 1: Integration Tests - CRITICAL GAPS ⚠️                                                                            │
     │                                                                                                                             │
     │ These endpoints have ZERO tests right now:                                                                                  │
     │                                                                                                                             │
     │ A. Projects API Tests (tests/integration/projects.test.ts)                                                                  │
     │                                                                                                                             │
     │ 12-15 tests covering:                                                                                                       │
     │ - POST /api/bibliography/projects/link - Link reference to project (success, already linked, not found)                     │
     │ - POST /api/bibliography/projects/unlink - Unlink reference (success, not found)                                            │
     │ - GET /api/bibliography/projects/:projectId/references - Get project references                                             │
     │ - GET /api/bibliography/projects/references/:referenceId/projects - Get reference's projects                                │
     │ - Same 4 operations for collections (link, unlink, get)                                                                     │
     │ - Verify project IDs are tracked correctly                                                                                  │
     │                                                                                                                             │
     │ B. Duplicates API Tests (tests/integration/duplicates.test.ts)                                                              │
     │                                                                                                                             │
     │ 8-10 tests covering:                                                                                                        │
     │ - GET /api/bibliography/duplicates - List unresolved duplicates (success, empty state)                                      │
     │ - POST /api/bibliography/duplicates/:id/resolve - Resolve with "keep-existing", "merge", "keep-both"                        │
     │ - Verify duplicate detection triggers on reference creation                                                                 │
     │ - Test resolution updates references correctly                                                                              │
     │                                                                                                                             │
     │ Priority 2: Unit Tests - Service Layer                                                                                      │
     │                                                                                                                             │
     │ 30-40 tests for services without dedicated unit tests:                                                                      │
     │                                                                                                                             │
     │ C. ReferenceService Unit Tests (tests/unit/services/ReferenceService.test.ts)                                               │
     │                                                                                                                             │
     │ 10-12 tests covering:                                                                                                       │
     │ - create (with auto citationKey generation)                                                                                 │
     │ - getById, list (with filters)                                                                                              │
     │ - update, softDelete, restore, permanentDelete                                                                              │
     │ - attachPdf, detachPdf                                                                                                      │
     │ - Edge cases: invalid userId, not found                                                                                     │
     │                                                                                                                             │
     │ D. ProjectService Unit Tests (tests/unit/services/ProjectService.test.ts)                                                   │
     │                                                                                                                             │
     │ 8-10 tests covering all 8 methods:                                                                                          │
     │ - linkReference, unlinkReference                                                                                            │
     │ - linkCollection, unlinkCollection                                                                                          │
     │ - getProjectReferences, getReferenceProjects                                                                                │
     │ - getProjectCollections, getCollectionProjects                                                                              │
     │ - Edge cases: duplicate links, not found                                                                                    │
     │                                                                                                                             │
     │ E. Model Validation Tests (tests/unit/models/*.test.ts)                                                                     │
     │                                                                                                                             │
     │ 10-12 tests (optional, skip if time-constrained):                                                                           │
     │ - Reference model (required fields, citationKey format)                                                                     │
     │ - Collection model (parentId validation)                                                                                    │
     │ - ProjectLink model (required fields)                                                                                       │
     │ - DuplicateCandidate model (status validation)                                                                              │
     │                                                                                                                             │
     │ Backend Total: 50-65 tests                                                                                                  │
     │                                                                                                                             │
     │ ---                                                                                                                         │
     │ Part 2: Frontend E2E Tests (25-35 tests)                                                                                    │
     │                                                                                                                             │
     │ Setup Playwright Test Suite                                                                                                 │
     │                                                                                                                             │
     │ Create /e2e/ directory with Playwright configuration                                                                        │
     │                                                                                                                             │
     │ Critical Flows - "Embarrassing to Ship Broken"                                                                              │
     │                                                                                                                             │
     │ Test File 1: e2e/reference-crud.spec.ts (5 tests)                                                                           │
     │                                                                                                                             │
     │ 1. Create reference → appears in table                                                                                      │
     │ 2. Edit reference → changes persist                                                                                         │
     │ 3. Delete reference → moves to trash                                                                                        │
     │ 4. Restore from trash → back in library                                                                                     │
     │ 5. Permanent delete → gone forever                                                                                          │
     │                                                                                                                             │
     │ Test File 2: e2e/collections.spec.ts (4 tests)                                                                              │
     │                                                                                                                             │
     │ 1. Create nested collections (Parent → Child → Grandchild)                                                                  │
     │ 2. Assign reference to collection → filter shows it                                                                         │
     │ 3. Rename collection → all references updated                                                                               │
     │ 4. Delete collection → soft delete (can restore)                                                                            │
     │                                                                                                                             │
     │ Test File 3: e2e/tags.spec.ts (3 tests)                                                                                     │
     │                                                                                                                             │
     │ 1. Create tag + assign to reference                                                                                         │
     │ 2. Set tag color + position (max 9 colored tags validation)                                                                 │
     │ 3. Filter references by multiple tags                                                                                       │
     │                                                                                                                             │
     │ Test File 4: e2e/duplicates.spec.ts (3 tests)                                                                               │
     │                                                                                                                             │
     │ 1. Import same DOI twice → duplicate detected                                                                               │
     │ 2. Resolve duplicate: "keep-existing" → merged correctly                                                                    │
     │ 3. Resolve duplicate: "merge" → fields combined                                                                             │
     │                                                                                                                             │
     │ Test File 5: e2e/pdf-management.spec.ts (2 tests)                                                                           │
     │                                                                                                                             │
     │ 1. Upload PDF → indicator appears in table                                                                                  │
     │ 2. View PDF in iframe → loads correctly                                                                                     │
     │                                                                                                                             │
     │ Secondary Flows (10-15 tests)                                                                                               │
     │                                                                                                                             │
     │ Test File 6: e2e/import-export.spec.ts (4 tests)                                                                            │
     │                                                                                                                             │
     │ 1. Import from DOI → reference created                                                                                      │
     │ 2. Import BibTeX file → multiple references created                                                                         │
     │ 3. Export selection to BibTeX → .bib file downloads                                                                         │
     │ 4. Verify exported format is valid                                                                                          │
     │                                                                                                                             │
     │ Test File 7: e2e/search.spec.ts (3 tests)                                                                                   │
     │                                                                                                                             │
     │ 1. Search by title → filtered results                                                                                       │
     │ 2. Search by author → filtered results                                                                                      │
     │ 3. Clear search → all references return                                                                                     │
     │                                                                                                                             │
     │ Test File 8: e2e/project-links.spec.ts (3 tests)                                                                            │
     │                                                                                                                             │
     │ 1. Link reference to project → appears in project view                                                                      │
     │ 2. View all references in project                                                                                           │
     │ 3. Unlink reference → removed from project                                                                                  │
     │                                                                                                                             │
     │ Test File 9: e2e/navigation.spec.ts (2 tests)                                                                               │
     │                                                                                                                             │
     │ 1. Navigate between Library/Duplicates/Projects views                                                                       │
     │ 2. Verify state persists (active collection, tags) on navigation                                                            │
     │                                                                                                                             │
     │ E2E Total: 25-35 tests                                                                                                      │
     │                                                                                                                             │
     │ ---                                                                                                                         │
     │ Test Count Breakdown                                                                                                        │
     │                                                                                                                             │
     │ | Category                         | Tests  | Priority          |                                                           │
     │ |----------------------------------|--------|-------------------|                                                           │
     │ | Backend Integration (Projects)   | 12-15  | 🔴 CRITICAL       |                                                           │
     │ | Backend Integration (Duplicates) | 8-10   | 🔴 CRITICAL       |                                                           │
     │ | Backend Unit (ReferenceService)  | 10-12  | 🟡 HIGH           |                                                           │
     │ | Backend Unit (ProjectService)    | 8-10   | 🟡 HIGH           |                                                           │
     │ | Backend Unit (Models)            | 10-12  | 🟢 LOW (optional) |                                                           │
     │ | E2E Critical Flows               | 17-20  | 🟡 HIGH           |                                                           │
     │ | E2E Secondary Flows              | 8-15   | 🟢 MEDIUM         |                                                           │
     │ | TOTAL                            | 75-100 | Realistic MVP     |                                                           │
     │                                                                                                                             │
     │ ---                                                                                                                         │
     │ Execution Order                                                                                                             │
     │                                                                                                                             │
     │ Week 1: Backend Critical Gaps                                                                                               │
     │                                                                                                                             │
     │ 1. ✅ Create projects.test.ts integration tests (12-15 tests)                                                                │
     │ 2. ✅ Create duplicates.test.ts integration tests (8-10 tests)                                                               │
     │ 3. ✅ Create ReferenceService.test.ts unit tests (10-12 tests)                                                               │
     │ 4. ✅ Create ProjectService.test.ts unit tests (8-10 tests)                                                                  │
     │                                                                                                                             │
     │ Checkpoint: Backend now 90%+ tested                                                                                         │
     │                                                                                                                             │
     │ Week 2: E2E Critical Flows                                                                                                  │
     │                                                                                                                             │
     │ 5. ✅ Set up Playwright test infrastructure                                                                                  │
     │ 6. ✅ Create reference-crud.spec.ts (5 tests)                                                                                │
     │ 7. ✅ Create collections.spec.ts (4 tests)                                                                                   │
     │ 8. ✅ Create tags.spec.ts (3 tests)                                                                                          │
     │ 9. ✅ Create duplicates.spec.ts (3 tests)                                                                                    │
     │ 10. ✅ Create pdf-management.spec.ts (2 tests)                                                                               │
     │                                                                                                                             │
     │ Checkpoint: Critical user flows protected                                                                                   │
     │                                                                                                                             │
     │ Week 3 (Optional): Secondary Flows + Models                                                                                 │
     │                                                                                                                             │
     │ 11. ✅ Create import-export.spec.ts (4 tests)                                                                                │
     │ 12. ✅ Create search.spec.ts (3 tests)                                                                                       │
     │ 13. ✅ Create project-links.spec.ts (3 tests)                                                                                │
     │ 14. ✅ Create model validation tests (if time permits)                                                                       │
     │                                                                                                                             │
     │ ---                                                                                                                         │
     │ What We're NOT Testing (MVP Boundaries)                                                                                     │
     │                                                                                                                             │
     │ ❌ Skip these (over-engineering for MVP):                                                                                    │
     │ - Every permutation of filters/sorts                                                                                        │
     │ - Visual regression tests (pixel-perfect UI)                                                                                │
     │ - Performance benchmarks                                                                                                    │
     │ - Offline behavior (Phase 2 feature)                                                                                        │
     │ - Manual ordering (Phase 2 feature)                                                                                         │
     │ - Collaboration features (Phase 2)                                                                                          │
     │ - Custom PDF viewer (Phase 2 - using iframe for MVP)                                                                        │
     │                                                                                                                             │
     │ ---                                                                                                                         │
     │ Files to Create                                                                                                             │
     │                                                                                                                             │
     │ Backend Tests                                                                                                               │
     │                                                                                                                             │
     │ bibliography_backend/tests/                                                                                                 │
     │ ├── integration/                                                                                                            │
     │ │   ├── projects.test.ts         [NEW - 12-15 tests]                                                                        │
     │ │   └── duplicates.test.ts       [NEW - 8-10 tests]                                                                         │
     │ └── unit/                                                                                                                   │
     │     ├── services/                                                                                                           │
     │     │   ├── ReferenceService.test.ts  [NEW - 10-12 tests]                                                                   │
     │     │   └── ProjectService.test.ts    [NEW - 8-10 tests]                                                                    │
     │     └── models/                                                                                                             │
     │         ├── reference.model.test.ts   [NEW - 3-4 tests, optional]                                                           │
     │         ├── collection.model.test.ts  [NEW - 3-4 tests, optional]                                                           │
     │         └── projectLink.model.test.ts [NEW - 3-4 tests, optional]                                                           │
     │                                                                                                                             │
     │ Frontend E2E Tests                                                                                                          │
     │                                                                                                                             │
     │ bibliography_frontend/e2e/                                                                                                  │
     │ ├── reference-crud.spec.ts     [NEW - 5 tests]                                                                              │
     │ ├── collections.spec.ts        [NEW - 4 tests]                                                                              │
     │ ├── tags.spec.ts              [NEW - 3 tests]                                                                               │
     │ ├── duplicates.spec.ts        [NEW - 3 tests]                                                                               │
     │ ├── pdf-management.spec.ts    [NEW - 2 tests]                                                                               │
     │ ├── import-export.spec.ts     [NEW - 4 tests]                                                                               │
     │ ├── search.spec.ts            [NEW - 3 tests]                                                                               │
     │ ├── project-links.spec.ts     [NEW - 3 tests]                                                                               │
     │ └── navigation.spec.ts        [NEW - 2 tests]                                                                               │
     │                                                                                                                             │
     │ ---                                                                                                                         │
     │ Success Criteria                                                                                                            │
     │                                                                                                                             │
     │ ✅ Backend: Projects and Duplicates endpoints have full integration test coverage✅ Backend: Core services (Reference,        │
     │ Project) have unit tests✅ E2E: 5 critical flows pass reliably✅ CI/CD: All tests run in GitHub Actions on every PR✅          │
     │ Coverage: Backend 90%+, Critical E2E paths 100%✅ Confidence: You can ship MVP without fear of breaking core functionality   │
     │                                                                                                                             │
     │ ---                                                                                                                         │
     │ Estimated Effort                                                                                                            │
     │                                                                                                                             │
     │ - Backend integration tests: 6-8 hours                                                                                      │
     │ - Backend unit tests: 8-10 hours                                                                                            │
     │ - E2E critical flows: 10-12 hours                                                                                           │
     │ - E2E secondary flows: 6-8 hours                                                                                            │
     │ - CI/CD setup: 2-3 hours                                                                                                    │
     │                                                                                                                             │
     │ Total: 32-41 hours (4-5 days full-time, or 2-3 weeks part-time)                                                             │
     │                                                                                                                             │
     │ ---                                                                                                                         │
     │ Ready to Execute?                                                                                                           │
     │                                                                                                                             │
     │ This plan focuses on:                                                                                                       │
     │ 1. ✅ Filling critical gaps (Projects, Duplicates untested)                                                                  │
     │ 2. ✅ Testing "embarrassing to ship broken" flows                                                                            │
     │ 3. ✅ Realistic test count (75-100, not 96+)                                                                                 │
     │ 4. ✅ MVP scope only (no future features)                                                                                    │
     │ 5. ✅ Giving you confidence as a non-professional developer                                                                  │
     │                                                                                                                             │
     │ Start with Week 1 (backend critical gaps), then Week 2 (E2E critical flows). Week 3 is optional polish.    