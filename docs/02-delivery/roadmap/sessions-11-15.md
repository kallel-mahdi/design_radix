# Roadmap — Sessions 11-15 (Week 3: Imports, Search & Projects)

## Week 3: Imports, Search & Projects

**Focus**: Smooth navigation, complete all import formats, ship search/filtering, wire projects.

#### Frontend Deliverables (40-50 hours)
- [x] `useKeyboardShortcuts` hook + AppLayout wiring
  - Cmd/Ctrl+N, Cmd/Ctrl+F, Cmd/Ctrl+A, Delete, Cmd/Ctrl+Delete, arrows, Enter, ESC
  - Prevent browser default conflicts, respect platform differences
- [x] `ImportModal` enhancements
  - BibTeX drag-drop + paste, CSL JSON + RIS auto-detection
  - Preview table with select all/none, per-record errors, retry flow
- [x] Export dropdown (BibTeX All/Collection/Selected) + Blob download helper
- [x] Search experience
  - `SearchPage` with FilterPanel + SearchBar
  - `search.store.ts` for query/filter state + debounce hook
  - Search results reuse ReferenceTable with facets summary
- [x] Projects experience
  - `ProjectsPage` layout with ProjectList + LinkedCollections toggles
  - `ProjectReferences` read-only grid + linked indicators
  - Stores + React Query hooks for link/unlink mutations

**Testing**:
- Integration: Import BibTeX/CSL/RIS, Search flow, Project linking toggles
- E2E: Search filters + export verification

#### Backend Deliverables (25-35 hours)
- [x] BibTeX parser/exporter routes (`POST /references/import-bibtex`, `POST /export/bibtex`)
- [x] CSL JSON + RIS parsers + routes
- [x] SearchService (text + filters + facets + pagination) + `/search` endpoint
- [x] ProjectLinkService & routes (link/unlink/list references)
- [x] Import/export error handling + validation improvements

**Testing**:
- Unit: Parser edge cases, SearchService pipelines
- Integration: Import endpoints with fixtures, `/search` filter combos, project linking routes

---
