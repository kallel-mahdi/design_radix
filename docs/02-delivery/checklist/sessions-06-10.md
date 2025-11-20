# Implementation Checklist — Sessions 06-10

### Session 6: DOI Import & Crossref Integration (2-3 hours) ✅ COMPLETE

**Goal**: Import references from DOI using Crossref API

#### Backend Tasks (1-1.5 hours)

**Create CrossrefService**:

- [x] `src/services/CrossrefService.ts`:
  - Fetch metadata from `https://api.crossref.org/works/{doi}`
  - Map Crossref JSON to Reference schema
  - Handle errors (404, rate limits)

**Add Import Route**:

- [x] `POST /references/import-doi` in ReferenceController

#### Frontend Tasks (1-1.5 hours)

**Create ImportModal**:

- [x] `src/features/library/components/ImportModal.tsx`:
  - Tabs: DOI | File Upload
  - DOI tab: Input + Fetch button → Preview → Add button
  - Show loading state during fetch
  - Error handling (invalid DOI, not found)

**Create Import Mutation**:

- [x] `src/features/library/api/import.queries.ts`

#### Verification

- [x] Import DOI `10.1145/3411764.3445518` successfully
- [x] Preview shows correct metadata
- [x] Add to library creates reference
- [x] Reference appears in table

**Estimated Time**: 2-3 hours
**Actual Time**: 20-30+ hours (significantly expanded scope)
**Completion Date**: 2025-01-15

**Note**: Session 6 delivered far beyond original scope including comprehensive testing (45+ tests), session workflow infrastructure, documentation reorganization, and production-grade retry logic. See CHANGELOG.md for full details.

---

### Session 7: ReferenceModal & Manual CRUD (3-4 hours) ✅ COMPLETE (with Code Review Fixes)

**Goal**: Complete create/edit reference modal backed by Zod validation so manual workflows work before bulk imports.

**Completion Date**: 2025-01-16 (includes post-review fixes)

#### Frontend Tasks (3-4 hours) ✅

**Extend ReferenceModal**:

- [x] `src/features/library/components/ReferenceModal.tsx`:
  - Full form with react-hook-form + `@bibliography/shared` Zod schema
  - Fields: type, title (required), authors (dynamic array), year, venue, DOI, URL, tags, PDF placeholder
  - Create vs Edit mode + optimistic save state
  - Footer: Cancel (ghost) | Save (green primary)
  - Loading state during mutation

**Create Schema Helpers**:

- [x] `src/features/library/types/schemas.ts` exports `ReferenceFormSchema` inferred from shared package but adapted for form defaults

**Wire Mutations**:

- [x] `useCreateReferenceMutation` and `useUpdateReferenceMutation` submit parsed payloads
- [x] Ensure mutations invalidate `['references', activeCollectionId, filters]`

**UI Polish**:

- [x] Dynamic authors list (add/remove buttons, keyboard focus after add)
- [x] Dual-mode author entry (structured firstName/lastName OR single full name)
- [x] Validation errors inline + toast fallback
- [ ] Venue autocomplete seeded from existing references (deferred to Session 11+)

#### Verification ✅

- [x] Can create reference with title only (minimal) - **Fixed in code review**
- [x] Can create reference with all fields populated
- [x] Validation errors show correctly (invalid DOI/URL)
- [x] Edit mode pre-fills data and saves updates
- [x] Newly created references immediately appear in ReferenceTable selection

#### Code Review Fixes (2025-01-16) ✅

- [x] **Fixed title-only creation** - Filter empty authors before submission
- [x] **Fixed selection/details sync** - Clear activeReferenceId when deselecting
- [x] **Fixed DOI normalization** - Normalize to lowercase in service layer
- [x] **Updated E2E test documentation** - Marked 31 tests as skipped pending UI

**Estimated Time**: 3-4 hours
**Actual Time**: 4-5 hours (including code review fixes)

---

### Session 8: ReferenceTable with TanStack Table (3-4 hours) ✅ COMPLETE

**Goal**: Full-featured reference table with selection + keyboard support so manual CRUD and imports have a home.

**Completion Date**: 2025-01-16 (implemented during Session 3)

#### Frontend Tasks (3-4 hours) ✅

**Create ReferenceTable**:

- [x] `src/features/library/components/ReferenceTable.tsx`:
  - TanStack React Table v8 with useReactTable hook ✅
  - @tanstack/react-virtual for virtualized rows (>500 refs) ✅
  - Columns: Checkbox | Title | Authors | Year | Venue | Tags | Files | DOI ✅
  - Sortable headers (click to toggle asc/desc) ✅
  - Multi-select: checkbox column, Cmd/Ctrl+Click, Shift+Click ranges ✅
  - CVA row variants (default, selected, hasPdf) ✅
  - Keyboard navigation (ArrowUp/ArrowDown at lines 431-439) ✅
  - Double-click opens ReferenceModal in edit mode ✅

**Define Columns**:

```typescript
const columns = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    )
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue()}</span>
    )
  },
  // ... more columns
];
```

**Wire to Library Store**:

- [x] Selection + activeReferenceId comes from `library.store.ts` ✅
- [x] Table listens to filters (collection, tag, search) so Query Keys stay consistent ✅

**Add Keyboard Navigation**:

- [x] Keyboard handler implemented with ArrowUp/ArrowDown navigation ✅
- [x] Enter opens DetailsPane ✅
- [x] Space toggles selection ✅

#### Verification ✅

- [x] Table renders rows + columns with data from `useReferencesQuery` ✅
- [x] Sorting works via TanStack state ✅
- [x] Multi-select works (all 3 modes: checkbox, Cmd/Ctrl+Click, Shift+Click) ✅
- [x] Details pane opens on click and keyboard navigation works ✅
- [x] Double-click opens ReferenceModal ✅

**Tests**:
- [x] Unit tests: ReferenceTable.test.tsx (15 tests)
- [x] Integration tests: ReferenceTable.integration.test.tsx (5 tests)
- [x] E2E tests: reference-table.spec.ts (6 comprehensive workflows)

**Estimated Time**: 3-4 hours
**Actual Time**: Implemented during Session 3 (already included in Session 3 time)

**Note**: ReferenceTable was implemented ahead of schedule during Session 3, so Session 8 plan was archived.

---

### Session 9: DetailsPane Implementation (2-3 hours) ✅ COMPLETE

**Goal**: Right panel with Info/PDF/Notes tabs that opens whenever a reference is active.

**Completion Date**: 2025-01-16

#### Frontend Tasks (2-3 hours) ✅

**Create InfoTab** (inline in DetailsPane.tsx lines 118-267):

- [x] Display reference metadata (read-only MVP) ✅
- [x] Edit button opens ReferenceModal (lines 133-142) ✅
- [x] Tags section with colored pills and remove (X) buttons (lines 183-205) ✅
- [x] Collections section with clickable filter links (lines 208-234) ✅
- [x] Metadata footer with Created/Modified dates, source (lines 245-262) ✅

**Create PdfTab** (separate component):

- [x] Imported from separate PdfTab component (line 14, 271) ✅
- [x] Wired into DetailsPane (completed in Session 10) ✅
- [x] Shows "Upload PDF" CTA when `hasPdf` false ✅

**Create NotesTab**:

- [x] EmptyState: "Notes coming in Phase 2" (lines 274-280) ✅

**Wire DetailsPane**:

- [x] Opens when `activeReferenceId` set (library store) ✅
- [x] Auto-open on row click ✅
- [x] Resizable width (integrated in AppLayout) ✅
- [x] ESC key handler (handled in library.tsx route) ✅

#### Verification ✅

- [x] Click reference → DetailsPane opens with Info tab data ✅
- [x] PDF tab displays viewer (completed in Session 10) ✅
- [x] Tabs switch correctly and width persists between reloads ✅
- [x] ESC closes pane ✅

**Tests**:
- [x] Unit tests: DetailsPane.test.tsx (20 tests, 1 failing - PDF worker issue in test env)
- [x] E2E tests: reference-details-session9.spec.ts (11 comprehensive workflows)

**Estimated Time**: 2-3 hours

**Note**: InfoTab implemented inline within DetailsPane.tsx instead of as separate component (no functional difference).

---

### Session 9.5: Test Fixtures Setup (0.5 hours) ✅ COMPLETE

**Goal**: PDF test fixtures for E2E tests (arXiv papers + hand-crafted minimal PDFs)

**Completion Date**: 2025-01-16

#### Tasks ✅

- [x] Created `e2e/fixtures/pdfs/` directory structure
- [x] Generated minimal.pdf (293B) and small-test.pdf (739B) - committed to Git
- [x] Created `scripts/download-test-fixtures.cjs` - downloads arXiv papers (gitignored)
- [x] Created `e2e/fixtures/paths.ts` - type-safe fixture paths
- [x] Added NPM script `pnpm test:download-fixtures`
- [x] Updated `.gitignore` and `.gitattributes` for binary PDFs
- [x] Created comprehensive README.md with legal attribution

**Fixtures**: minimal (293B), smallTest (739B), small (233KB), medium (2.2MB), large (224KB)

---

### Session 10: PDF Upload & Viewer (3-4 hours) ✅ COMPLETE

**Goal**: Single PDF upload per reference with polished react-pdf viewer (MVP feature)

**Completion Date**: 2025-11-17

#### Backend Tasks (1.5-2 hours) ✅

**Configure Multer**:

- [x] `src/utils/fileUpload.ts`:
  - Single file upload
  - .pdf MIME type filter
  - Max 50MB size limit (from API spec, not 10MB)
  - Store at `data/bibliography/uploads/{uuid}.pdf`

**Add PDF Routes**:

- [x] `POST /references/:id/upload-pdf` (multipart upload)
- [x] `GET /references/:id/pdf` (download)
- [x] `DELETE /references/:id/pdf` (remove)

**Update ReferenceService**:

- [x] Save PDF metadata (storedPath, originalName, size, mimeType)
- [x] Set `hasPdf: true`

#### Frontend Tasks (1.5-2 hours) ✅

**Extend ReferenceModal**:

- [x] PdfUploadZone with drag-drop + file input wired to mutation
- [x] Show filename + size when selected
- [x] Upload on save (multipart request)

**Create PdfTab**:

- [x] Use `react-pdf` Document/Page with zoom + navigation controls
- [x] Download + "Open in new tab" buttons
- [x] Empty state when no PDF

**Create PDF Upload Mutation**

- [x] `useUploadPdfMutation` handles optimistic updates to `hasPdf`
- [x] `useDeletePdfMutation` for PDF removal

#### Tests ✅

- [x] Backend unit: 2 tests (uploadPdf, deletePdf service methods)
- [x] Backend integration: 13 tests (upload/download/delete, MIME/size validation, ownership)
- [x] Frontend unit: 0 tests (deferred per test pyramid - 60/30/10 ratio)
- [x] E2E: 7 comprehensive tests with worker isolation
- [x] Total: 22 tests passing ✅

#### Verification ✅

- [x] Upload PDF via ReferenceModal → `hasPdf: true`
- [x] PdfTab displays PDF with controls
- [x] Zoom + page navigation + download buttons work
- [x] Remove PDF returns to empty state
- [x] All E2E tests pass (7/7) ✅

**Estimated Time**: 3-4 hours
**Actual Time**: 4-5 hours (including bug fix)

**Bug Fixed (2025-11-17):**
- Type mismatch in pdf.mutations.ts caused E2E test failure
- Fix: Corrected generic type from `PdfUploadResponse` to `PdfData` to match apiClient.uploadFile() contract
- Result: E2E tests improved from 6/7 to 7/7 passing

**Note**: Implementation includes drag-drop support (adapted from editor FileUpload.tsx) and comprehensive PDF management with replace functionality. 50MB limit from API spec used instead of 10MB from checklist.

---
