# Session 8 Plan: ReferenceTable with TanStack Table

**Created**: 2025-01-16
**Status**: Approved
**Estimated Time**: 3-4 hours

---

## Research Findings

### Zotero Frontend (UI Patterns)

**File**: `zotero/chrome/content/zotero/itemTree.js`
**Finding**: Zotero uses XUL tree component for item display with multi-column layout. Items support multi-select via three methods: checkbox column, Cmd/Ctrl+Click for individual toggle, and Shift+Click for range selection between two items.

**Creator Display**: Format is "LastName, FirstInitial" (e.g., "Smith, J."). When more than 3 authors, displays "Author1, Author2, Author3, et al." to prevent column overflow.

**Tag Display**: Tags shown as colored pills with max 9 colors in system. Overflow handling shows first few tags with "+N more" indicator.

**Keyboard Navigation**: Arrow keys navigate rows, Enter opens details/edit, Space toggles selection of current row.

**Decision**: We'll implement React-based table with TanStack instead of XUL, but preserve the proven UX patterns (multi-select modes, author truncation, tag pills).

---

### Zotero Backend (Logic)

**File**: `zotero/resource/schema/userdata.sql`
**Finding**: Database schema uses multiple normalized tables:
- `items` table (lines 158-171): itemID, itemTypeID, dateAdded, dateModified, libraryID, key, version, synced
- `itemData` table (lines 179-189): itemID, fieldID, valueID for metadata storage
- `itemDataValues` table (lines 173-176): Normalized values (title, year, venue, etc.)
- `creators` table: Separate objects with firstName/lastName for authors
- Indexes on: itemID, synced, libraryID, fieldID for fast queries

**File**: `zotero/chrome/content/zotero/xpcom/data/item.js`
**Finding**: Item model tracks: itemTypeID, creators array, itemData map, tags array, collections array, dateAdded, dateModified, version, synced flag, deleted status. Child items (attachments, notes) linked via parentItemID.

**Decision**: Our MongoDB schema already captures similar structure. References have authors array, tags array, hasPdf boolean for attachment indicator. No backend changes needed for Session 8.

---

### Zotero Database

**File**: `zotero/resource/schema/userdata.sql`
**Finding**: Complex LEFT JOINs in Items Collection SQL (lines 86-96) for attachments, notes, annotations, deletedItems. Primary data includes firstCreator, sortCreator for efficient sorting without parsing creators array.

**Decision**: We'll handle creator sorting client-side by formatting authors array on-the-fly. MongoDB references query already returns full objects with populated authors.

---

### Editor Patterns

**File**: `editor_frontend/src/components/ui/Button.tsx`
**Finding**: CVA variant patterns with primary, secondary, outline, ghost, destructive, gradient. Sizes: sm, default, lg, icon. Loading state with spinner. Uses React.forwardRef for ref forwarding.

**File**: `editor_frontend/src/components/ui/Card.tsx`
**Finding**: Composable subcomponents (Card, CardHeader, CardTitle, CardContent, CardFooter). Variants: default, gradient, surface, primary, secondary. Padding variants: none, sm, default, lg. Dark mode support.

**File**: `editor_frontend/src/store/ui.store.ts`
**Finding**: Zustand store with devtools middleware for Redux DevTools debugging. Selector pattern for performance (subscribe to specific fields only).

**File**: `editor_frontend/src/common/api/client.ts`
**Finding**: Fetch-based API client (not axios). Standard response format: `{ success: boolean, message: string, data?: any }`.

**File**: `editor_backend/services/auth-service/src/controllers/AuthController.ts`
**Finding**: @injectable() decorator for Inversify DI. Constructor injection pattern. Try-catch with service delegation. Context tracking (requestId, IP, userAgent) for logging.

**Decision**: Copy CVA patterns from Button/Card. Use Zustand devtools middleware in library.store. Follow fetch-based API client for queries. No backend changes needed (references endpoint exists from Session 6).

---

### WebSearch Verification

**Query**: "TanStack Table v8 React virtualization best practices 2025"
**Finding**: TanStack Table doesn't include virtualization built-in. Official docs recommend `@tanstack/react-virtual` for 500+ rows. Virtualization renders only visible rows, significantly reducing DOM nodes. Use `useVirtualizer` with configuration: count (rows.length), estimateSize (row height), getScrollElement (container ref), overscan (buffer rows).

**Query**: "React multi-select table shift click range selection pattern"
**Finding**: Shift-click pattern requires tracking `lastSelectedIndex` state. Algorithm: detect shift key, calculate range between last selected and current click (handle both directions by sorting indices), loop through range to add/remove from selection. Works for both selecting and deselecting ranges.

**Query**: "TanStack Table column sorting state management with Zustand"
**Finding**: TanStack Table allows controlled sorting state via `state.sorting` and `onSortingChange`. Zustand setter must handle both direct values and updater functions (TanStack uses both). Client-side sorting uses `getSortedRowModel()`. Server-side uses `manualSorting: true` with API param coordination.

**Decision**: Use `@tanstack/react-virtual` for virtualization as spec requires 500+ ref support. Implement shift-click with lastSelectedIndex tracking. Use client-side sorting via Zustand-controlled state (simpler MVP, no backend changes).

---

## Architecture Decisions

### Decision 1: Client-Side vs Server-Side Sorting

**Options**:
- A: Client-side sorting via TanStack `getSortedRowModel()`
- B: Server-side sorting with `manualSorting: true` and API params

**Choice**: A (Client-side)

**Rationale**: Simpler MVP implementation, no backend endpoint changes required. GET `/api/bibliography/references` already returns all references for collection. Expected dataset size (<1000 refs per collection) fits well within client-side sorting performance. TanStack provides efficient `getSortedRowModel()` built-in.

**Trade-off**: If datasets grow beyond 1000 refs, may need migration to server-side sorting for performance. Client downloads all refs before filtering/sorting (larger initial payload).

---

### Decision 2: Virtualization Implementation

**Options**:
- A: Use `@tanstack/react-virtual` for row virtualization
- B: Defer virtualization to Phase 2, render all rows

**Choice**: A (Use virtualization)

**Rationale**: Spec explicitly requires handling 500+ references smoothly. TanStack Virtual is official integration recommended by TanStack docs. Performance critical for web app (unlike Zotero desktop). Virtualization only renders visible rows (~20-30), keeping DOM size constant regardless of dataset.

**Trade-off**: Slightly more complex setup (scroll container ref, `useVirtualizer` hook, virtual item positioning). Development mode React performance degraded until production build.

---

### Decision 3: Authors Column Display Format

**Options**:
- A: Show max 3 authors + "et al." (Zotero pattern)
- B: Show all authors comma-separated (complete info)

**Choice**: A (Max 3 + "et al.")

**Rationale**: Proven UX from Zotero. Prevents column overflow for papers with many authors (common in academia). Maintains readability in dense table layout. Full author list visible in details pane and reference modal.

**Trade-off**: Truncated view in table. Users must click to details pane to see full author list. Acceptable since table is for browsing, not comprehensive review.

---

### Decision 4: Tags Column Display Format

**Options**:
- A: Colored tag pills (max 3 visible + "+N more")
- B: Plain text comma-separated tags

**Choice**: A (Colored pills)

**Rationale**: Matches Zotero's 9-colored-tag system established in Session 7. Visual consistency across components (TagSelector, TagItem already use pills). Color-coding aids quick visual scanning in dense tables. Aligns with spec's tag color requirements.

**Trade-off**: Requires TagPill component (should exist from Session 7, or create minimal version). Slightly more complex rendering logic for overflow handling.

---

### Decision 5: Multi-Select Implementation Strategy

**Options**:
- A: Three modes - checkbox column, Cmd/Ctrl+Click, Shift+Click range
- B: Checkbox-only (simpler)

**Choice**: A (Three modes)

**Rationale**: Standard table UX pattern across all modern table libraries. Matches Zotero behavior (familiar to target users). Accessibility benefit (keyboard users can use Shift+Click). Power users benefit from Cmd/Ctrl efficiency. Spec explicitly requires all three modes (ComponentsSpec.md lines 417-423).

**Trade-off**: More complex click handler logic. Must track `lastSelectedIndex` for shift-click range calculations. Need to detect modifier keys (metaKey, ctrlKey, shiftKey).

---

## Deviations from Zotero

### 1. Web-Based Table vs XUL Tree View

**Zotero**: Uses XUL tree component (Mozilla desktop platform)
**Ours**: React + TanStack Table (web platform)

**Rationale**: Different platform requirements. TanStack is React ecosystem standard, well-maintained, excellent TypeScript support. XUL is legacy technology tied to desktop Electron/Firefox.

**Future**: No alignment planned. This is a fundamental platform difference. Modern Zotero is also moving away from XUL to React components.

---

### 2. Virtualization in MVP

**Zotero**: No virtualization in early versions (added later as dataset sizes grew)
**Ours**: Virtualization from MVP via `@tanstack/react-virtual`

**Rationale**: Web performance more critical than desktop. Browser DOM limits lower than native apps. Spec explicitly requires 500+ ref support from Session 8. Proactive optimization prevents technical debt.

**Future**: Already aligned with modern Zotero practices. They added virtualization in later versions after performance issues.

---

### 3. Client-Side Sorting Initially

**Zotero**: SQLite database handles sorting at query layer
**Ours**: Client-side via TanStack `getSortedRowModel()` (browser layer)

**Rationale**: Simpler MVP, no backend changes needed. Backend GET `/api/bibliography/references` endpoint unchanged. Expected dataset size (<1000 refs) fits client-side performance envelope. Defer server-side sorting to Phase 2 if datasets grow.

**Future**: May migrate to server-side sorting if >1000 refs per collection becomes common pattern. Easy migration path (change to `manualSorting: true`, add sortBy/sortOrder query params).

---

## Implementation Checklist

### Frontend (3-4 hours)

#### Setup & Dependencies
- [ ] Install `@tanstack/react-table@^8.0.0` via pnpm
- [ ] Install `@tanstack/react-virtual@^3.0.0` via pnpm
- [ ] Verify `@tanstack/react-query` already installed from Session 6

#### Component Structure
- [ ] Create `src/features/library/components/ReferenceTable.tsx`
- [ ] Create `src/features/library/components/__tests__/ReferenceTable.test.tsx` (placeholder)
- [ ] Define TypeScript interfaces for props, sorting state, selection state

#### Column Definitions
- [ ] Define 8 columns array with `ColumnDef<Reference>[]` type
- [ ] Column 1: Select checkbox (header: select all, cell: individual toggle)
- [ ] Column 2: Title (font-semibold, clickable triggers selection)
- [ ] Column 3: Authors (formatted as "LastName, F.", max 3 + "et al.")
- [ ] Column 4: Year (simple number display, sortable)
- [ ] Column 5: Venue (journal/conference name, sortable)
- [ ] Column 6: Tags (colored pills, max 3 + "+N more")
- [ ] Column 7: Files (paperclip icon if hasPdf, empty otherwise)
- [ ] Column 8: DOI (clickable link, opens in new tab)

#### TanStack Table Setup
- [ ] Implement `useReactTable` hook with configuration
- [ ] Configure `getCoreRowModel()` for basic rendering
- [ ] Configure `getSortedRowModel()` for client-side sorting
- [ ] Wire `state.sorting` to library.store Zustand state
- [ ] Implement `onSortingChange` handler to update store
- [ ] Configure `state.rowSelection` for multi-select tracking
- [ ] Implement `onRowSelectionChange` handler

#### Virtualization Setup
- [ ] Create scroll container ref with `useRef<HTMLDivElement>()`
- [ ] Implement `useVirtualizer` hook with config:
  - `count`: references.length
  - `getScrollElement`: () => scrollContainerRef.current
  - `estimateSize`: () => 48 (estimated row height in px)
  - `overscan`: 5 (buffer rows above/below viewport)
- [ ] Render virtual items via `virtualizer.getVirtualItems()`
- [ ] Apply virtual item positioning (transform: translateY)

#### Multi-Select Logic
- [ ] Track `lastSelectedIndex` in component state
- [ ] Implement checkbox column header (select/deselect all)
- [ ] Implement checkbox cell (individual row toggle)
- [ ] Implement Cmd/Ctrl+Click handler (toggle individual)
- [ ] Implement Shift+Click handler (range selection algorithm)
- [ ] Implement normal click handler (single selection + open details)
- [ ] Wire selection changes to `library.store.selectReference()`

#### Keyboard Navigation
- [ ] Add `onKeyDown` handler to table container
- [ ] Arrow Up: Move focus to previous row
- [ ] Arrow Down: Move focus to next row
- [ ] Enter: Open details pane for active row
- [ ] Space: Toggle selection of current row
- [ ] Cmd/Ctrl+A: Select all visible references
- [ ] Maintain focus state for visual indicator

#### Row Variants & Styling
- [ ] Apply base row styles (hover, cursor pointer)
- [ ] Apply selected row variant (border-left-4 border-green-500)
- [ ] Apply hasPdf indicator (paperclip icon in Files column)
- [ ] Add sorting indicator arrows to column headers (asc/desc)
- [ ] Style column headers (clickable, hover effects)
- [ ] Apply responsive column widths (Title wider, Year/Files narrow)

#### Data Integration
- [ ] Connect to `useReferencesQuery(collectionId)` hook
- [ ] Handle loading state (show skeleton or spinner)
- [ ] Handle error state (show error message)
- [ ] Handle empty state (show "No references" message)
- [ ] Wire `selectedReferenceIds` from library.store
- [ ] Wire `sortBy` and `sortOrder` from library.store

#### Event Handlers
- [ ] Implement `handleRowClick` (normal click)
- [ ] Implement `handleRowDoubleClick` (open ReferenceModal in edit mode)
- [ ] Implement `handleColumnHeaderClick` (toggle sort)
- [ ] Implement `handleCheckboxChange` (checkbox select)
- [ ] Implement `handleKeyDown` (keyboard navigation)

#### Accessibility
- [ ] Add `role="table"` to container
- [ ] Add `aria-label` to table ("Reference list")
- [ ] Add `aria-sort` to sortable column headers
- [ ] Add `aria-selected` to selected rows
- [ ] Add `tabIndex` for keyboard navigation
- [ ] Add visual focus indicators (outline on focus)

#### Author Formatting Helper
- [ ] Create `formatAuthors(authors: Author[]): string` utility
- [ ] Handle empty authors array → "Unknown"
- [ ] Format single author → "LastName, FirstInitial"
- [ ] Format 2-3 authors → "Author1, Author2, Author3"
- [ ] Format >3 authors → "Author1, Author2, Author3, et al."

#### Tag Pills Rendering
- [ ] Check if TagPill component exists from Session 7
- [ ] If exists: reuse TagPill component
- [ ] If not: create minimal TagPill component with colored background
- [ ] Render max 3 tags in Tags column
- [ ] Add "+N more" text if tags.length > 3
- [ ] Apply tag colors (red, orange, yellow, green, blue, purple, pink, gray, indigo)

#### DOI Link Formatting
- [ ] Create clickable link element
- [ ] Format href as `https://doi.org/${reference.doi}`
- [ ] Add `target="_blank"` for new tab
- [ ] Add `rel="noopener noreferrer"` for security
- [ ] Style as link (text-blue-600, underline on hover)

### Backend (No changes needed)

- ✅ GET `/api/bibliography/references` endpoint exists from Session 6
- ✅ Response format: `{ success: true, data: Reference[], pagination: {...} }`
- ✅ Query params supported: collectionId, tags, deleted, limit, offset
- ✅ Authentication via x-user-id header (API Gateway trust pattern)

### Tests (Deferred to /session-test 8)

#### Unit Tests (ReferenceTable component)
- [ ] Renders with mock reference data
- [ ] Displays 8 columns with correct headers
- [ ] Sorting column click toggles asc/desc
- [ ] Checkbox select all toggles all rows
- [ ] Checkbox individual row toggles single row
- [ ] Cmd/Ctrl+Click toggles individual selection
- [ ] Shift+Click selects range between two rows
- [ ] Normal click selects single row + calls onReferenceClick
- [ ] Double-click calls onReferenceDoubleClick with correct ID
- [ ] Keyboard Arrow Down moves to next row
- [ ] Keyboard Arrow Up moves to previous row
- [ ] Keyboard Enter calls onReferenceClick
- [ ] Keyboard Space toggles selection
- [ ] Authors column formats max 3 + "et al."
- [ ] Tags column shows colored pills (max 3 + "+N more")
- [ ] Files column shows paperclip icon when hasPdf: true
- [ ] DOI column renders clickable link
- [ ] Selected row applies green border-left variant
- [ ] CVA variants apply correctly

#### Integration Tests (ReferenceTable + Store + Query)
- [ ] Selection state persists in library.store
- [ ] Sorting state persists in library.store
- [ ] Details pane opens when activeReferenceId set
- [ ] Query refetches when collectionId changes
- [ ] Multi-select preserves selection across re-renders
- [ ] Store actions trigger component updates

#### E2E Tests (User Journeys)
- [ ] Create reference → Table displays new row → Click to select → Details opens
- [ ] Sort by Title asc → Verify alphabetical order → Sort desc → Verify reverse
- [ ] Multi-select 3 refs → Bulk action (future) applies to all 3
- [ ] Keyboard navigate to row 5 → Press Enter → Details opens
- [ ] Double-click row → ReferenceModal opens in edit mode

**Note**: Session 8 will unblock 31 skipped E2E tests that depend on table UI:
- `e2e/collections.spec.ts`: All 8 tests (collection filtering)
- `e2e/tags.spec.ts`: All 10 tests (tag filtering)
- `e2e/reference-crud.spec.ts`: All 6 tests (CRUD workflows)
- `e2e/critical-flows.spec.ts`: 7 tests (keyboard nav, search)

### Documentation
- [ ] Update CHANGELOG.md with Session 8 completion entry
- [ ] Mark Session 8 tasks complete in `docs/02-delivery/checklist/sessions-06-10.md`
- [ ] Add inline code comments for shift-click range selection algorithm
- [ ] Add JSDoc comments to ReferenceTable component and props interface
- [ ] Document virtualization setup in code comments

---

## Definition of Done

- ✅ ReferenceTable component renders with 8 columns (Select, Title, Authors, Year, Venue, Tags, Files, DOI)
- ✅ Data fetched via `useReferencesQuery(collectionId)` hook
- ✅ Loading state displays skeleton/spinner
- ✅ Empty state displays "No references" message
- ✅ Sorting works on all sortable columns (Title, Authors, Year, Venue)
- ✅ Sorting state controlled via library.store Zustand
- ✅ Multi-select works via checkbox column (select all + individual)
- ✅ Multi-select works via Cmd/Ctrl+Click (toggle individual)
- ✅ Multi-select works via Shift+Click (range selection both directions)
- ✅ Keyboard navigation functional (Arrow Up/Down, Enter, Space)
- ✅ Double-click opens ReferenceModal in edit mode
- ✅ Selection state synced with library.store.selectedReferenceIds
- ✅ Active reference synced with library.store.activeReferenceId
- ✅ Details pane opens when activeReferenceId is set
- ✅ Virtualization handles 500+ references without performance degradation
- ✅ Authors column formatted as "LastName, F." (max 3 + "et al.")
- ✅ Tags column displays colored pills (max 3 + "+N more")
- ✅ Files column shows paperclip icon if hasPdf: true
- ✅ DOI column is clickable link (opens in new tab)
- ✅ Row variants apply correctly (selected = green border-left, hasPdf shown)
- ✅ Column header sorting indicators display (asc/desc arrows)
- ✅ ARIA labels present for accessibility (role, aria-label, aria-selected, aria-sort)
- ✅ Keyboard focus indicators visible (outline on focused row)
- ✅ No console errors or warnings in browser DevTools
- ✅ Component follows editor_frontend CVA patterns
- ✅ TypeScript strict mode passes with no errors
- ✅ Responsive column widths (Title wider, metadata columns proportional)

---

## References

**Zotero Reference Files**:
- `zotero/resource/schema/userdata.sql` - Database schema (items, itemData, creators tables)
- `zotero/chrome/content/zotero/xpcom/data/item.js` - Item model structure and properties
- `zotero/chrome/content/zotero/xpcom/data/items.js` - Items collection methods and SQL queries
- `zotero/chrome/content/zotero/itemTree.js` - XUL tree component for multi-column display

**Editor Pattern Files**:
- `editor_frontend/src/components/ui/Button.tsx` - CVA variant patterns
- `editor_frontend/src/components/ui/Card.tsx` - Composable component patterns
- `editor_frontend/src/store/ui.store.ts` - Zustand with devtools middleware
- `editor_frontend/src/common/api/client.ts` - Fetch-based API client
- `editor_backend/services/auth-service/src/controllers/AuthController.ts` - Controller patterns

**Specification Files**:
- `docs/01-specification/frontend/ComponentsSpec.md` - Section 2.1 (ReferenceTable), lines 384-522
- `docs/01-specification/Spec.md` - Section 2.1 (Library View), lines 149-156
- `docs/01-specification/backend/APIDesignSystem.md` - GET /references endpoint, lines 560-605
- `docs/02-delivery/checklist/sessions-06-10.md` - Session 8 tasks, lines 102-181

**Testing References**:
- `docs/03-quality/TESTING.md` - Test pyramid strategy, E2E bypass pattern
- `sessions-06-10.md` - Verification checklist for Session 8

**WebSearch Verified**:
- TanStack Virtual documentation - Row virtualization pattern for 500+ items
- Multi-select shift-click pattern - Range selection algorithm
- TanStack Table state management - Zustand integration approach

**Libraries Documentation**:
- TanStack Table v8: https://tanstack.com/table/v8/docs
- TanStack Virtual v3: https://tanstack.com/virtual/v3/docs
- React Testing Library: https://testing-library.com/react
