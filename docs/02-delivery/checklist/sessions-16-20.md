# Implementation Checklist — Sessions 16-20

### Session 16: Trash & Restore (2-3 hours)

**Goal**: Soft delete with trash view + restore before duplicates/testing.

#### Backend Tasks (30 minutes)

- [ ] Soft delete already implemented (Session 3)
- [ ] Add `PATCH /references/:id/restore` route
- [ ] Add `DELETE /references/:id?force=true` (permanent delete)

#### Frontend Tasks (1.5-2 hours)

**Create TrashView**:

- [ ] Special view when Trash selected in ActivityBar
- [ ] Reuse ReferenceTable with "Restore" action column
- [ ] "Empty Trash" button (permanent delete all)

**Add Confirmation Dialogs**:

- [ ] Move to trash: "Move X item(s) to trash?"
- [ ] Permanent delete: "Permanently delete X item(s)? This cannot be undone."

**Update ActivityBar**:

- [ ] Trash icon shows full/empty state

#### Verification

- [ ] Delete reference → appears in trash
- [ ] Restore → item returns to library
- [ ] Empty trash → permanent delete all

**Estimated Time**: 2-3 hours

---

### Session 17: Duplicate Detection Implementation (4-5 hours)

**Goal**: Implement 3-stage duplicate detection algorithm inspired by Zotero (see `zotero/chrome/content/zotero/xpcom/duplicates.js`).

#### Backend Tasks (2.5-3 hours)

**Create DuplicateService**:

- [ ] Stage 1: ISBN match (normalized via `cleanISBN`-style helper)
- [ ] Stage 2: DOI match (case-insensitive uppercase)
- [ ] Stage 3: Title + Creator match:
  - Normalize titles (remove diacritics/punctuation, lowercase)
  - Require ≥1 creator last name + first initial match
  - Ensure years differ ≤1, DOIs/ISBNs don't conflict
- [ ] Mirror Zotero’s disjoint-set approach (`Zotero.DisjointSetForest` in `zotero/.../duplicates.js`) so each detected match unions into a group before surfacing in UI
- [ ] Use `fastest-levenshtein` for fuzzy fallback + `modern-diacritics` like Zotero
- [ ] Create `DuplicateCandidate` records, store `matchReason` and `confidence`

**Wire to ReferenceService**:

- [ ] Trigger async detection on create/update
- [ ] Avoid blocking request path

**Add Routes**:

- [ ] `GET /duplicates` (list pending groups)
- [ ] `POST /duplicates/resolve` (keep-existing, merge, keep-both)
- [ ] `POST /duplicates/refresh` (manual trigger)

#### Frontend Tasks (1.5-2 hours)

**Create DuplicatesPage**:

- [ ] Sidebar: duplicate rules + count badge (mirrors Zotero virtual collection)
- [ ] Main: list of duplicate groups

**Create DuplicateCard**:

- [ ] Two-column comparison (Existing | New)
- [ ] Diff highlighting + actions: Keep Existing | Merge Fields | Keep Both

**Create Duplicates Queries**

#### Verification

- [ ] Import duplicate reference (same DOI) → candidate created automatically
- [ ] DuplicatesPage shows group with confidence + reason
- [ ] "Keep Existing" resolves duplicate + badge count decrements

**Estimated Time**: 4-5 hours

---

### Session 18: MergeModal & Resolution (2-3 hours)

**Goal**: Field-by-field merge UI for duplicates after backend logic is ready.

#### Frontend Tasks (2-3 hours)

**Create MergeModal**:

- [ ] `src/features/duplicates/components/MergeModal.tsx`:
  - Two-column field comparison
  - Radio buttons to select value per field
  - Preview merged result (bottom) + highlight conflicts
  - "Merge & Save" button

**Implement Merge Logic**:

- [ ] Generate merged reference object from selections
- [ ] Call resolve mutation with `action: 'merge'` + merged payload
- [ ] Delete duplicate reference + update existing record

#### Verification

- [ ] Merge modal opens from DuplicateCard
- [ ] Preview updates dynamically as selections change
- [ ] "Merge & Save" resolves group + updates ReferenceTable row

**Estimated Time**: 2-3 hours

---

### Session 19: Unit & Integration Tests (4-5 hours)

**Goal**: Comprehensive test coverage for critical paths.

#### Backend Tests (2-2.5 hours)

**Unit Tests** (Vitest):

- [ ] `tests/unit/services/ReferenceService.test.ts`
- [ ] `tests/unit/services/DuplicateService.test.ts`
- [ ] `tests/unit/utils/normalizeTitle.test.ts`

**Integration Tests** (Supertest):

- [ ] `tests/integration/references.test.ts`
- [ ] `tests/integration/duplicates.test.ts`

#### Frontend Tests (2-2.5 hours)

**Unit Tests**: DOI validator, debounce hook, library store selection helpers

**Integration Tests**: ReferenceModal, ReferenceTable, ImportModal happy paths

#### Verification

- [ ] All unit/integration suites passing locally + CI
- [ ] Coverage reports hit 80%+ for core modules

**Estimated Time**: 4-5 hours

---

### Session 20: E2E Tests & Final Polish (3-4 hours)

**Goal**: Playwright E2E coverage + performance/accessibility polish.

#### Frontend Tasks (2-3 hours)

- [ ] Playwright tests: Login → Import DOI → Add to collection → Export; Import duplicate → Resolve; Delete → Trash → Restore
- [ ] Toast + empty-state polish, keyboard shortcut docs update
- [ ] Performance tweaks (memoization, React Query cache)
- [ ] Accessibility audit (keyboard nav, ARIA labels, color contrast)

#### Backend Tasks (1 hour)

- [ ] Final logging review (structured JSON)
- [ ] Performance smoke tests (indexes, slow query logs)

#### Verification

- [ ] Playwright suite green locally + CI
- [ ] Lighthouse score ≥90 for PWA metrics
- [ ] Accessibility checklist complete

**Estimated Time**: 3-4 hours

---
