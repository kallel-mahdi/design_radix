# Changelog

All notable changes to the Bibliography Manager project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
