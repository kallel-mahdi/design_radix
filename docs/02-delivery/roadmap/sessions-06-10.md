# Roadmap — Sessions 06-10 (Week 2: Library UX Foundations)

## Week 2: Library UX Foundations

**Focus**: Finish manual CRUD flows before scaling imports—ReferenceModal, ReferenceTable, DetailsPane, PDF handling.

#### Frontend Deliverables (45-55 hours)
- [x] `ReferenceModal` component (react-hook-form + Zod, manual create/edit)
  - Dynamic authors list, venue autocomplete, inline validation
  - Create vs Edit mode + optimistic updates
- [x] `ReferenceTable` component (TanStack React Table)
  - Sortable columns, checkbox multi-select, Cmd/Ctrl & Shift selection
  - Keyboard navigation + Enter opens DetailsPane, double-click edits
- [x] `DetailsPane` component
  - Tabs: Info | PDF | Notes placeholder
  - Auto-open on row click, ESC closes, resizable width persists
- [x] `PdfTab` component + upload affordance
  - Shows viewer when `hasPdf` true, otherwise CTA to upload (Session 10)
- [x] Library wiring
  - `library.store.ts` selection + activeReferenceId logic
  - React Query cache keys include collection/tag filters
  - `useUploadPdfMutation`, `useCreateReferenceMutation`, `useUpdateReferenceMutation`

**Testing**:
- Manual: create/edit references, verify table selection + details
- Integration: ReferenceModal submit flow, ReferenceTable multi-select, PdfTab placeholder state

#### Backend Deliverables (15-20 hours)
- [x] Continue DOI import endpoint (`POST /references/import-doi`)
- [x] PDF upload stack (Session 10)
  - Multer config, storage path, metadata persistence
  - `POST/GET/DELETE /references/:id/pdf`
- [x] ReferenceService updates for `hasPdf` + file metadata

**Testing**:
- Unit: ReferenceService create/update
- Integration: PDF upload/download/delete

---
