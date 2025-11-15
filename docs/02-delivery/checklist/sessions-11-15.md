# Implementation Checklist — Sessions 11-15

### Session 11: Keyboard Shortcuts & Library UX Glue (1-2 hours)

**Goal**: Implement essential keyboard shortcuts now that the ReferenceTable + DetailsPane exist.

#### Frontend Tasks (1-2 hours)

**Create Keyboard Handler**:

- [ ] `src/common/hooks/useKeyboardShortcuts.ts`:
  ```typescript
  export function useKeyboardShortcuts() {
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        const isMac = navigator.platform.includes('Mac');
        const modKey = isMac ? e.metaKey : e.ctrlKey;

        if (modKey && e.key === 'n') {
          e.preventDefault();
          // Open create reference modal
        } else if (modKey && e.key === 'f') {
          e.preventDefault();
          // Focus search box
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
          // Move to trash
        } else if (modKey && e.key === 'a') {
          e.preventDefault();
          // Select all references
        } else if (e.key === 'Escape') {
          // Close modal/pane
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
  }
  ```

**Essential Shortcuts** (MVP): Cmd/Ctrl+N, Cmd/Ctrl+F, Cmd/Ctrl+A, Delete, Cmd/Ctrl+Delete (force delete), Arrow keys, Enter, ESC.

**Wire to AppLayout** so hook is mounted once.

#### Verification

- [ ] Every shortcut works in Library view without fighting browser defaults
- [ ] Focus management works (search input, modals, table)
- [ ] Cmd vs Ctrl detection works on macOS/Linux/Windows

**Estimated Time**: 1-2 hours

---

### Session 12: BibTeX Import & Export (3-4 hours)

**Goal**: Complete BibTeX ingestion/export now that manual CRUD/table exist.

#### Backend Tasks (1.5-2 hours)

**Create BibTeXParser**:

- [ ] Regex-based parser (or `bibtex-parse-js`)
- [ ] Map BibTeX fields to Reference schema
- [ ] Handle malformed entries gracefully

**Create BibTeXExporter**:

- [ ] Template-based formatting
- [ ] LaTeX escaping for special characters

**Add Routes**:

- [ ] `POST /references/import-bibtex`
- [ ] `POST /export/bibtex`

#### Frontend Tasks (1.5-2 hours)

**Extend ImportModal**:

- [ ] File Upload tab with drag-drop + paste textarea
- [ ] Preview table with select all/none & error badges
- [ ] Progress indicator for large imports

**Create Export Functionality**:

- [ ] Toolbar dropdown: Export All | Collection | Selected
- [ ] Generate Blob + trigger download
- [ ] Right-click menu placeholder for later phases

#### Verification

- [ ] Import sample .bib with 10+ entries → preview + import success
- [ ] Export generates valid BibTeX file and can be re-imported
- [ ] Errors surfaced without breaking rest of import

**Estimated Time**: 3-4 hours

---

### Session 13: CSL JSON & RIS Import (2-3 hours)

**Goal**: Additional import formats for Zotero compatibility immediately after BibTeX work.

#### Backend Tasks (1.5-2 hours)

**Create Parsers**:

- [ ] CSL JSON parser (JSON.parse + validation)
- [ ] RIS parser (line-by-line `TY  -`, `AU  -`, `TI  -`, etc.)

**Add Routes**:

- [ ] `POST /references/import-csl-json`
- [ ] `POST /references/import-ris`

#### Frontend Tasks (30 minutes)

**Extend ImportModal**:

- [ ] Auto-detect format by extension (.json, .ris)
- [ ] Format selector dropdown for ambiguous pastes

#### Verification

- [ ] Import Zotero CSL JSON export
- [ ] Import RIS from PubMed/Web of Science
- [ ] All fields map correctly

**Estimated Time**: 2-3 hours

---

### Session 14: Search Service & SearchPage (3-4 hours)

**Goal**: Full-text search with MongoDB aggregation + Search view that feeds the ReferenceTable.

#### Backend Tasks (1.5-2 hours)

**Create SearchService**:

- [ ] MongoDB aggregation pipeline (text search + filters)
- [ ] `$text` operator for title/abstract search
- [ ] `$match` for authors, year range, venues, tags
- [ ] Facet counts (authors, venues, years)
- [ ] Pagination support

**Add Search Route**:

- [ ] `GET /search?q=...&authors=...&yearMin=...&yearMax=...`

#### Frontend Tasks (1.5-2 hours)

**Create SearchPage**:

- [ ] Layout: FilterPanel | SearchResults (reusing ReferenceTable)
- [ ] SearchBar with 300 ms debounce + loading indicator
- [ ] Result count + empty state

**Create FilterPanel**:

- [ ] AuthorFilter, YearRangeFilter, VenueFilter, TagFilter, Clear All button

**Create Search Store**:

- [ ] Query, debouncedQuery, filters state + `useDebounce`

#### Verification

- [ ] Search by keyword updates results + facets
- [ ] Filters narrow results + persist to query key
- [ ] Pagination works without nuking selection

**Estimated Time**: 3-4 hours

---

### Session 15: Project Links & ProjectsPage (2-3 hours)

**Goal**: Link collections to projects once collections/tags/search are stable.

#### Backend Tasks (1-1.5 hours)

**Create ProjectLinkService**:

- [ ] Link/unlink collection to project
- [ ] Get all references from linked collections
- [ ] Many-to-many queries respecting deleted flags

**Add Routes**:

- [ ] `POST /projects/:id/link-collection`
- [ ] `DELETE /projects/:id/unlink-collection/:collectionId`
- [ ] `GET /projects/:id/references`

#### Frontend Tasks (1-1.5 hours)

**Create ProjectsPage**:

- [ ] ProjectList sidebar
- [ ] LinkedCollections toggles (show linked collections)
- [ ] ProjectReferences (read-only ReferenceTable subset)

**Create Projects Store + Queries**

- [ ] Track selected project + linked collections
- [ ] Mutations for link/unlink

#### Verification

- [ ] Link collection to project and see toggles update
- [ ] ProjectReferences shows aggregated references
- [ ] Unlink removes references immediately

**Estimated Time**: 2-3 hours

---

### Buffer: Sample Library Seeding (0.5 session)

Create/update the fixture generator so Search/Projects/Duplicates have non-empty datasets for demos and Playwright. Seed at least 50 references with diverse tags/collections (can adapt from Zotero sample library export referenced in `docs/02-delivery/roadmap/future-phases.md`).
