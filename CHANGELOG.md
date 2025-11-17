# Changelog

All notable changes to the Bibliography Manager project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Session 10 - PDF Upload & Viewer (2025-11-17)

**Frontend:**
- Created PdfTab component with react-pdf v9 integration
  - Document/Page rendering with PDF.js worker
  - Zoom controls (0.5x - 3.0x in 0.25x increments)
  - Page navigation (prev/next buttons + direct input)
  - Download button with proper filename
  - Open in new tab functionality
  - Empty state when no PDF attached
  - Loading spinner during PDF load
- Created PdfUploadZone component with drag-and-drop support
  - Drag-over visual feedback (border/background color change)
  - MIME type validation (application/pdf only)
  - File size validation (50MB max from API spec)
  - Shows current PDF if exists with "Replace" button
  - Shows selected file pending upload with icon
  - Validation error display with XCircleIcon
- Created pdf.mutations.ts with TanStack Query mutations
  - useUploadPdfMutation with optimistic updates (sets hasPdf: true immediately)
  - useDeletePdfMutation with optimistic updates (sets hasPdf: false immediately)
  - Automatic cache invalidation on success
  - Error handling with revert on failure
- Integrated PdfUploadZone into ReferenceModal
  - Track selectedPdfFile state
  - Upload PDF after reference save (create or edit)
  - Clear state on modal close
- Wired PdfTab into DetailsPane replacing placeholder

**Backend:**
- Created fileUpload.ts with Multer v2 configuration
  - Disk storage at `./data/bibliography/uploads/{uuid}.pdf`
  - UUID v4 filenames for collision resistance
  - 50MB file size limit (from API spec, not 10MB from checklist)
  - PDF MIME type validation
  - Auto-create upload directory
- Added 3 PDF management routes to references.ts:
  - POST `/:id/upload-pdf` (multipart/form-data)
  - GET `/:id/pdf` (download/stream)
  - DELETE `/:id/pdf` (remove file + metadata)
- Implemented ReferenceController methods:
  - uploadPdf: Handles multipart upload, validates file presence
  - downloadPdf: Streams PDF with Content-Disposition header
  - deletePdf: Removes file and metadata
- Implemented ReferenceService methods:
  - uploadPdf: Saves file metadata, deletes old PDF if exists (replace operation)
  - getPdfPath: Returns storedPath for streaming
  - deletePdf: Removes file from disk and clears metadata
- Updated IReferenceService interface with PDF method signatures
- Created upload directory structure: `data/bibliography/uploads/` with .gitkeep and .gitignore

**Tests:**
- Backend unit: 2 tests (uploadPdf, deletePdf service methods)
- Backend integration: 13 tests (PDF upload/download/delete, file validation, error handling)
- Frontend unit: 0 tests (deferred per test pyramid)
- E2E: 7 comprehensive tests with worker isolation
- Total: 22 tests passing ✅

**Critical Bug Fixed (2025-11-17):**
- **Type mismatch in pdf.mutations.ts** (caused E2E test failure "should handle complete workflow")
  - Problem: Generic type for `apiClient.uploadFile<T>()` was `PdfUploadResponse` (full response) instead of `PdfData` (data field)
  - Backend returns: `{success, message, data: {hasPdf, pdf}}`
  - apiClient expects `T` to be type of `data` field, not entire response
  - Fix: Renamed interface to `PdfData`, changed `data.data.hasPdf` to `data.hasPdf` in onSuccess handler
  - File: `bibliography_frontend/src/features/library/api/pdf.mutations.ts`
  - Result: All 7/7 E2E tests now pass (was 6/7 before)
- **Added await to query invalidation** in ReferenceModal.tsx:172
  - Ensures cache refetch completes before PDF upload starts (prevents race condition)
  - File: `bibliography_frontend/src/features/library/components/ReferenceModal.tsx`

**Dependencies:**
- Backend: uuid, @types/uuid (already installed)
- Frontend: react-pdf v9 (already installed)

**Deviations from Zotero:**
- Single PDF per reference (MVP constraint, Zotero supports multiple attachments)
- react-pdf viewer (Phase 1 MVP, Zotero has custom PDF viewer with annotations)
- Drag-drop adapted from editor FileUpload.tsx (Zotero uses desktop file drag)

**References:**
- Session Plan: `docs/sessions/10-plan.md`
- API Spec: `docs/01-specification/backend/APIDesignSystem.md:363` (50MB limit)
- Zotero Patterns: `zotero/chrome/content/zotero/xpcom/attachments.js` (file storage patterns)
- Editor Patterns: `editor_frontend/src/features/*/components/FileUpload.tsx` (drag-drop)
- react-pdf Docs: https://react-pdf.org/ (v9 API with worker configuration)

### Session 9 - DetailsPane Enhancement (2025-11-16)

**Frontend:**
- Enhanced InfoTab in DetailsPane with comprehensive metadata display
- Added Edit button in header (opens ReferenceModal for editing)
- Added Tags section with colored pills and remove (X) buttons
- Added Collections section with clickable filter links and folder icons
- Added Metadata footer showing Created/Modified dates and source provider
- Implemented ESC key handler to close DetailsPane and clear active reference
- Fixed API envelope unwrapping bug (response.data instead of full response)

**Backend:**
- Added virtual `collections` field to Reference model for proper population
- Updated ReferenceService.getById() to populate collections without overwriting collectionIds array
- Fixed Mongoose virtual field configuration (toJSON/toObject)

**Shared:**
- Fixed CollectionSchema.deletedAt from .nullable() to .nullish() for correct validation

**Tests:**
- Backend unit: 1 test for collection population in ReferenceService.getById()
- Frontend unit: 20 tests for DetailsPane (Edit button, Tags, Collections, Metadata footer)
- Frontend integration: 13 tests (8 for tag removal workflow, 5 for ESC key handler)
- E2E: 11 comprehensive tests with worker isolation pattern
- Total: 45 tests passing ✅
- Created TESTING.md with test pyramid analysis, best practices, running instructions

**Critical Bugs Fixed During Testing:**
1. API envelope unwrapping in DetailsPane (caught by integration tests)
2. Collection population overwriting collectionIds (caught by E2E tests)
3. Zod schema validation for deletedAt field (caught by E2E tests)

**Deviations from Zotero:**
- None - Session 9 follows Zotero's item pane patterns (tags, collections, metadata footer)

**References:**
- Session Plan: `docs/sessions/09-plan.md`
- Testing Documentation: `TESTING.md`
- Zotero UI: `zotero/chrome/content/zotero/elements/itemPane.js` (tag pills, collections links)
- Editor Patterns: Button/Card CVA variants, Zustand store patterns

### Session 8 - ReferenceTable with TanStack Table (2025-11-16)

**Note:** Session 8 was planned for ReferenceTable implementation with TanStack Table, but this component was already fully implemented in Session 3. The Session 8 plan has been archived for reference, but no new implementation work was required.

**Session 8 Scope (Already Complete):**
- TanStack Table v8 integration ✅ (implemented in Session 3)
- Virtualization with @tanstack/react-virtual ✅ (implemented in Session 3)
- Multi-select with checkbox, Cmd/Ctrl+Click, Shift+Click ✅ (implemented in Session 3)
- Client-side sorting with Zustand state management ✅ (implemented in Session 3)
- Author display formatting (LastName, F.) ✅ (implemented in Session 3)
- Tag pills with overflow handling ✅ (implemented in Session 3)
- Keyboard navigation (Arrow keys, Enter, Space) ✅ (implemented in Session 3)

**References:**
- Session Plan: `docs/sessions/completed/08-plan.md`
- Existing Implementation: `bibliography_frontend/src/features/library/components/ReferenceTable.tsx`

### Session 7 Code Review - Bug Fixes & Test Documentation (2025-01-16)

**Code Review Fixes:**
- Fixed title-only reference creation (Session 7 acceptance criteria)
  - Filter empty authors before submission in `formDataToCreateInput()` and `formDataToUpdateInput()`
  - Allows minimal reference creation (title only) while maintaining intuitive UI
  - Files: `bibliography_frontend/src/features/library/types/schemas.ts`

- Fixed selection/details pane synchronization
  - Clear `activeReferenceId` when deselecting items
  - Differentiate single-click (select/deselect) vs Ctrl/Cmd-click (multi-select)
  - Files: `bibliography_frontend/src/features/library/components/ReferenceTable.tsx`, `bibliography_frontend/src/features/library/store/library.store.ts`

- Fixed DOI normalization for duplicate prevention
  - Normalize DOI to lowercase + trim in service layer (both create and update methods)
  - Prevents duplicate references when same DOI has different casing
  - Files: `bibliography_backend/src/services/ReferenceService.ts`

**Testing Documentation:**
- Clarified E2E test status in `docs/03-quality/TESTING.md`
  - Marked 31 E2E tests as `.skip()` pending UI implementation (Sessions 8-10)
  - Updated test counts: 11 passing / 42 total (26% passing, 74% skipped)
  - Removed misleading "auth infrastructure issues" narrative
  - Added clear roadmap for when tests will be enabled
  - Files: `bibliography_frontend/e2e/collection-workflows.spec.ts`, `bibliography_frontend/e2e/tag-workflows.spec.ts`, `bibliography_frontend/e2e/critical-flows.spec.ts`

**Deviations:**
- None - these fixes align code with original Session 7 specifications

**References:**
- Code review feedback document
- Session 7 acceptance criteria: `docs/sessions/07-plan.md:487`
- Testing documentation: `docs/03-quality/TESTING.md`

### Session 6: DOI Import & Crossref Integration (2025-01-15)

#### Added

**DOI Import Feature**:
- Import references from DOI via Crossref API with one-step flow (no preview, immediate creation)
- Exponential backoff retry logic (1s, 2s, 4s, 8s, 16s) with `Retry-After` header support (adapted from Zotero xpcom/http.js)
- Crossref polite pool integration (mailto in User-Agent for priority processing)
- Sequential import pattern: modal stays open after successful import for multiple DOI additions
- 6 specific error messages: 404 (DOI not found), 429 (rate limit), timeout/503 (network error), duplicate detection, invalid format, generic fallback
- Pre-database check before Crossref API call (performance optimization for duplicates)
- Crossref type mapping: 8 Crossref types mapped to reference schema with fallback to 'other'
- Abstract handling: saves abstract when Crossref provides it (confirmed via Zotero behavior)

**Testing Infrastructure**:
- 45+ comprehensive tests (15 backend, 19 frontend, 11 E2E)
  - Backend: Integration tests with mocked Crossref API (nock), unit tests for CrossrefService, user scoping tests
  - Frontend: ImportModal component tests, DOI import workflow integration tests, collection/tag filter workflow tests
  - E2E: 11 tests covering one-step flow, duplicates, errors, loading states, sequential imports, persistence
- Test cleanup endpoint: `DELETE /references/test-cleanup` (development only, environment-gated)
- Bibliography testing skill with 60/30/10 pyramid strategy, monorepo commands, coverage targets

**Session Workflow**:
- 4 session commands: `session-plan` (Research → Clarify → Plan), `session-execute` (Backend → Frontend), `session-test` (60/30/10 tests), `session-finish` (Commit → Archive)
- Session-plan enforcement hook: reminds to execute all phases (Explore → WebSearch → Plan → AskUserQuestion → Approval)
- Comprehensive testing guide: `docs/03-quality/TESTING.md` with test pyramid, commands, coverage targets

**Documentation Reorganization**:
- Moved `bibliography_plan/` → `docs/` structure (50+ files reorganized)
- Created `docs/INDEX.md` as navigation hub
- Split into `01-specification/` (Spec + backend/frontend details), `02-delivery/` (checklists + roadmap), `03-quality/` (testing guide)
- Added `docs/sessions/` directory for session plans (with `completed/` archive)
- Deleted redundant root docs: BUG.md, TESTING.md, test_plan.md (consolidated into docs/)

#### Changed

**Backend**:
- ReferenceController: Added user-scoped queries for project isolation (prevents cross-user data leakage)
- ReferenceService: Added search parameter support for filtering references
- ProjectController: User isolation improvements for all project operations
- Auth middleware: Improved header handling in `trustGateway.ts`

**Frontend**:
- Library page: Integrated "Import" button in toolbar and ImportModal component
- ReferenceTable: Updated to work with DOI import feature
- UI components: Refined ErrorBoundary, ActivityBar, SearchBar, EmptyState for consistency
- MSW handlers: Updated mocks for new features

**Shared**:
- Added `ImportDoiInputSchema` with Crossref-recommended DOI regex (99.3% coverage)
- Exported `ReferenceType` for CrossrefService type mapping

**Documentation**:
- CLAUDE.md: Updated all paths (bibliography_plan → docs), added reuse hierarchy (Editor → Zotero → Net-new), added session workflow section
- All bibliography skills: Updated to reference new docs/ structure
- Skill rules: Added path exclusions (*.generated.ts, *.d.ts)

#### Fixed

- E2E tests: Updated for text wrapping (use partial title matching) - all 11 DOI import tests now pass

#### Documented Deviations from Zotero

1. **Direct Crossref API** (not translator system): MVP simplicity, single source vs Zotero's multi-source translator system
2. **Single DOI import** (not batch): MVP scope constraint, Zotero supports batch identifier import (DOI, ISBN, PMID)
3. **Modal-based import** (not popup panel): Web UX best practice vs Zotero's desktop popup panel
4. **Sequential import with modal staying open**: Improved web UX vs Zotero's close-panel-after-import
5. **Max 5 retries** (Zotero retries up to 1 hour): User-facing appropriateness for web application

#### Performance

- Pre-database check reduces unnecessary Crossref API calls when DOI already exists
- Minimum 250ms loading duration prevents UI flash during fast API responses
- Optimistic cache updates provide immediate UI feedback for imports

#### Known Issues

- E2E tests use partial text matching (fragile, may break with UI changes)
- E2E tests use real Crossref API (may hit rate limits in CI/CD)
- Optimistic cache duplicate detection may show incorrect toast in rare edge cases

#### References

- Session Plan: `docs/sessions/06-plan.md`
- Testing Strategy: `docs/03-quality/TESTING.md`
- Zotero Patterns: `zotero/chrome/content/zotero/lookup.js` (one-step flow), `zotero/xpcom/http.js` (retry logic)
- Editor Patterns: `editor_frontend/src/components/ui/` (Modal, Button, Input), `editor_frontend/src/store/` (Zustand patterns)

---

## [0.1.0] - 2025-01-15

### Initial Setup

- Project structure created with frontend/backend separation
- Monorepo configuration with shared schemas
- Documentation framework established
