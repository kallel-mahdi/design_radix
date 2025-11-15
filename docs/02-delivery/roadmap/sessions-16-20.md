# Roadmap — Sessions 16-20 (Week 4: Data Hygiene, Duplicates, Testing)

## Week 4: Data Hygiene, Duplicates, Testing

**Focus**: Trash/restore flows, duplicate detection/resolution inspired by Zotero, and full test suites.

#### Frontend Deliverables (45-55 hours)
- [x] `TrashView` + confirmations
  - ActivityBar trash indicator (full/empty)
  - Restore + Empty Trash actions with dialogs
- [x] `DuplicatesPage`
  - Badge count in ActivityBar
  - Duplicate groups list referencing match reason/confidence
- [x] `DuplicateCard` + `MergeModal`
  - Two-column diff, keep existing/both, merge modal with field-by-field selection
  - Notes referencing Zotero workflow so UX matches expectations
- [x] Toast notifications + empty/loading states tuned during trash/duplicate UX
- [x] Keyboard shortcuts finalize (Delete → trash, Cmd/Ctrl+Delete force delete) integrated with new flows
- [x] Comprehensive testing push
  - Vitest unit/integration tests for stores, hooks, components
  - Playwright E2E for CRUD → trash/restore, duplicate merge, import/export
  - Accessibility + performance polish (Lighthouse ≥90)

#### Backend Deliverables (20-25 hours)
- [x] Trash management endpoints (`PATCH /references/:id/restore`, `DELETE /references/:id?force=true`)
- [x] DuplicateService + routes (`/duplicates`, `/duplicates/resolve`, `/duplicates/refresh`)
  - Stage 1 ISBN, Stage 2 DOI, Stage 3 title+creator/year (mirrors `zotero/chrome/content/zotero/xpcom/duplicates.js`)
  - Confidence scores + reasons stored on `DuplicateCandidate`
- [x] PDF upload stack finalized (from Session 10) + background cleanup job placeholder
- [x] Test suites
  - Vitest unit (>80% coverage) + Supertest integration for references/duplicates
  - Playwright API fixtures for import/resolve flows
- [x] Performance & logging review (index verification, structured logs)

**Testing**:
- Unit: DuplicateService stage coverage, trash restore logic
- Integration: Import duplicate → detect → resolve, trash → restore
- E2E: Login → import DOI → export; import duplicate → merge; delete → trash → restore

---
