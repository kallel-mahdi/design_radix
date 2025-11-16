# Session 9 Plan: DetailsPane Enhancement

**Created**: 2025-11-16
**Status**: Approved
**Estimated Time**: 2-3 hours

---

## Research Findings

### Session 9 Tasks from Checklist

**Goal**: DetailsPane Implementation (2-3 hours)
**Purpose**: Right panel with Info/PDF/Notes tabs that opens whenever a reference is active.

**Source**: `docs/02-delivery/checklist/sessions-06-10.md` (lines 185-223)

#### Frontend Tasks:

**Create InfoTab**:
- Display reference metadata (read-only MVP)
- Edit button opens ReferenceModal
- Tags section (pills with remove button)
- Collections section with quick links
- Metadata footer (dates, source)

**Create PdfTab** (wires into Session 10 work):
- Use `react-pdf` viewer component placeholder until uploads done
- Show "Upload PDF" CTA when `hasPdf` false

**Create NotesTab**:
- EmptyState: "Notes coming in Phase 2"

**Wire DetailsPane**:
- Opens when `activeReferenceId` set (library store)
- Auto-open on row click
- Resizable width (drag, persist to localStorage)
- ESC key closes

#### Verification:
- Click reference → DetailsPane opens with Info tab data
- PDF tab displays placeholder / viewer once Session 10 completes
- Tabs switch correctly and width persists between reloads
- ESC closes pane

---

### Current Implementation Status

**DetailsPane Component Exists**: `/home/mahdi/Desktop/bibliography/bibliography_frontend/src/components/layout/DetailsPane.tsx` (209 lines)

**What's Complete**:
- ✅ Basic component structure with Tab.Group from @headlessui/react
- ✅ Three tabs: Info, PDF, Notes
- ✅ Basic Info tab with read-only metadata display
- ✅ PDF tab placeholder ("PDF viewer coming in Session 7")
- ✅ Notes tab empty state ("Notes feature coming in Phase 2")
- ✅ React Query integration for fetching reference details
- ✅ Loading states with Skeleton component
- ✅ Integration with library.store.activeReferenceId

**What's Missing** (Session 9 Checklist Items):
- ❌ Edit button in Info tab (should open ReferenceModal)
- ❌ Tags section with colored pills + remove buttons
- ❌ Collections section with quick filter links
- ❌ Metadata footer (Created/Modified/Source dates)
- ❌ Resizable width with drag handle
- ❌ Width persistence to localStorage
- ❌ ESC key handler to close pane
- ❌ Verification that auto-open on row click works

---

### Zotero Frontend (UI Patterns)

**File**: `/home/mahdi/Desktop/bibliography/zotero/chrome/content/zotero/elements/itemPane.js`

**Key Patterns Observed**:
1. **Tabbed Interface**: Info, Notes, Tags, Related, Attachments tabs
2. **Editable Sections**: Each metadata field has edit/view mode toggle
3. **Tag Display**: Colored pills with remove (X) button on hover
4. **Collections Display**: Shows parent collections with clickable links
5. **Metadata Footer**: Created date, Modified date, Source library
6. **Keyboard Navigation**: Tab between fields, Enter to edit, Escape to cancel

**Patterns to Copy**:
- Tag pill design with color indicators
- Edit button placement (top-right of Info section)
- Collections section layout (list with navigation icons)
- Metadata footer styling (subtle, bottom of pane)

---

### Zotero Backend (Logic)

**File**: `/home/mahdi/Desktop/bibliography/zotero/chrome/content/zotero/xpcom/data/item.js`

**Key Methods for Session 9**:
- `getTags()` - Returns array of tag objects with {tag, type, color}
- `getCollections(asIDs)` - Returns collections containing this item
- `dateAdded` / `dateModified` - Timestamp fields for metadata footer
- `getField(fieldName)` - Generic field accessor for metadata display

**Business Logic**:
- Tags are ordered alphabetically
- Collections can be multiple (many-to-many relationship)
- Date formatting uses locale-aware formatting
- Color tags are limited to 9 colors (matching color picker)

---

### Zotero Database

**File**: `/home/mahdi/Desktop/bibliography/zotero/resource/schema/userdata.sql`

**Relevant Tables**:

**items table** (lines 1-30):
```sql
CREATE TABLE items (
    itemID INTEGER PRIMARY KEY,
    itemTypeID INT NOT NULL,
    dateAdded TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dateModified TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    clientDateModified TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    libraryID INT NOT NULL,
    key TEXT NOT NULL,
    ...
);
```

**itemTags table** (lines 116-124):
```sql
CREATE TABLE itemTags (
    itemID INT NOT NULL,
    tagID INT NOT NULL,
    type INT NOT NULL,
    PRIMARY KEY (itemID, tagID),
    FOREIGN KEY (itemID) REFERENCES items(itemID) ON DELETE CASCADE,
    FOREIGN KEY (tagID) REFERENCES tags(tagID) ON DELETE CASCADE
);
```

**collectionItems table** (lines 303-311):
```sql
CREATE TABLE collectionItems (
    collectionID INT NOT NULL,
    itemID INT NOT NULL,
    orderIndex INT NOT NULL DEFAULT 0,
    PRIMARY KEY (collectionID, itemID),
    FOREIGN KEY (collectionID) REFERENCES collections(collectionID) ON DELETE CASCADE,
    FOREIGN KEY (itemID) REFERENCES items(itemID) ON DELETE CASCADE
);
```

**Key Insights**:
- `dateAdded` and `dateModified` are auto-managed timestamps
- Tags have many-to-many relationship with items via `itemTags` join table
- Collections have many-to-many relationship with items via `collectionItems` join table
- Our MongoDB schema should include `tags` array and `collections` array in Reference model

---

### Editor Frontend

**Relevant Patterns**:

**File**: `/home/mahdi/Desktop/bibliography/editor_frontend/src/features/ide/components/FileTreeItem.tsx`

**Resizable Panel Pattern** (to verify if exists):
- Checked for react-resizable-panels usage in editor
- Pattern: PanelGroup > Panel components with resize handles
- Configuration: minSize, maxSize, defaultSize properties
- Persistence: Can store sizes in localStorage

**UI Primitives to Reuse**:
- `Button` component from `src/components/ui/Button.tsx`
- `Badge` or `Tag` component for tag pills (if exists)
- Color utilities from DesignSystem.md

---

### Editor Backend

Not directly relevant to Session 9 (frontend-only work).

---

### WebSearch Verification

#### react-resizable-panels Official Documentation

**Library**: npmjs.com/package/react-resizable-panels
**Latest Version**: 2.0.x
**Key Features**:
- Declarative panel layout with `<PanelGroup>` and `<Panel>` components
- Resize handles with `<PanelResizeHandle>`
- Persistence via `onLayout` callback + localStorage
- Collapsible panels with `collapsible` prop
- Min/max size constraints

**Installation**: Already in `bibliography_frontend/package.json`

**Basic Pattern**:
```tsx
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

<PanelGroup direction="horizontal">
  <Panel defaultSize={70} minSize={30}>
    {/* Main content */}
  </Panel>
  <PanelResizeHandle />
  <Panel defaultSize={30} minSize={20} maxSize={50}>
    {/* DetailsPane */}
  </Panel>
</PanelGroup>
```

#### @headlessui/react Tabs Verification

**Already Implemented Correctly**: ✅
- Current DetailsPane uses Tab.Group with selectedIndex/onChange
- Pattern matches official Headless UI documentation
- No changes needed for tab functionality

---

## Architecture Decisions

### Decision 1: InfoTab Enhancement Approach

**Options**:
- A: Create separate InfoTab component file
- B: Keep InfoTab inline in DetailsPane.tsx

**Choice**: B (Keep inline for now)
**Rationale**:
- InfoTab is tightly coupled to DetailsPane state
- 209 lines total for DetailsPane is still reasonable
- Can extract later if file grows beyond 300 lines
- Reduces prop drilling complexity

**Trade-off**: Larger component file, but simpler architecture for MVP

---

### Decision 2: Resizable Implementation

**Options**:
- A: react-resizable-panels library (already in package.json)
- B: Manual drag handle with mouse event handlers
- C: Fixed width (defer resizing to polish phase)

**Choice**: A (react-resizable-panels)
**Rationale**:
- Already installed dependency (zero cost)
- Battle-tested library with smooth UX
- Handles edge cases (min/max, persistence, keyboard a11y)
- Minimal code required (~10 lines)

**Trade-off**: Adds library dependency, but it's already in package.json

---

### Decision 3: State Management for Width

**Options**:
- A: Use existing ui.store.detailsPaneWidth state
- B: Create new local state in DetailsPane
- C: Use react-resizable-panels built-in persistence

**Choice**: A + C hybrid
**Rationale**:
- ui.store already has `detailsPaneWidth: number` field (line 19)
- ui.store already has `setDetailsPaneWidth` action (lines 163-164)
- ui.store already persists to localStorage (line 212)
- react-resizable-panels can sync with Zustand via `onLayout` callback

**Trade-off**: None - best of both worlds (Zustand devtools + library features)

---

### Decision 4: Tags Section Implementation

**Options**:
- A: Fetch collections from API when DetailsPane opens
- B: Include collections in reference detail query
- C: Pass collections as prop from parent

**Choice**: B (Include in reference detail query)
**Rationale**:
- Single query for all reference data (tags, collections, metadata)
- Matches Zotero pattern (item includes all relationships)
- Avoids N+1 query problem
- Simplifies loading states

**Trade-off**: Slightly larger API response, but negligible for <100 collections

---

### Decision 5: Collections Section Click Behavior

**Options**:
- A: Click collection → Filter library view to that collection
- B: Click collection → Navigate to collection in tree
- C: Click collection → Show tooltip with collection path

**Choice**: A (Filter library view)
**Rationale**:
- Most useful for researchers ("show me all refs in this collection")
- Matches Zotero's "Show in Library" behavior
- Can reuse existing library.store.setSelectedCollection filter

**Trade-off**: Doesn't scroll to collection in tree, but that's lower priority

---

### Decision 6: ESC Key Handler Location

**Options**:
- A: Inside DetailsPane component
- B: In library route (parent component)
- C: Global keyboard handler

**Choice**: B (In library route)
**Rationale**:
- library.tsx already manages DetailsPane open/close state
- Keeps keyboard logic centralized with other library shortcuts
- Easier to document all library keyboard shortcuts in one place

**Trade-off**: Props drilling for close handler, but we already pass onClose

---

## Deviations from Zotero

### 1. Collections Display Format

**Zotero**: Shows full collection path hierarchy ("My Library > Papers > ML Papers")
**Ours**: Shows flat collection names with filter links
**Rationale**: MVP simplification - tree paths require recursive collection lookup
**Future**: Phase 2 can add full path display when collection tree is complete

---

### 2. Edit Mode Toggle

**Zotero**: Each field has inline edit toggle
**Ours**: Single "Edit" button opens ReferenceModal
**Rationale**: Reuses existing ReferenceModal component, consistent UX with create flow
**Future**: Phase 2 can add inline editing if user research shows value

---

### 3. Tag Removal

**Zotero**: Click X on tag → Immediately removes from item
**Ours**: Click X → Opens confirmation dialog (TBD based on UX testing)
**Rationale**: Prevent accidental removal (tags might be used in filters/projects)
**Future**: Can add "Undo" toast instead of confirmation if users prefer speed

---

## Implementation Checklist

### Backend (0 hours - No backend changes needed)

Session 9 is frontend-only. Backend APIs already exist from Session 6-7.

**Verify existing endpoints**:
- ✅ `GET /api/bibliography/references/:id` - Fetch reference details
- ✅ `PATCH /api/bibliography/references/:id` - Update reference (for tag removal)
- ✅ Ensure response includes: `tags[]`, `collections[]`, `dateAdded`, `dateModified`

---

### Frontend (2-3 hours)

#### Phase 1: Enhance InfoTab (45 min)

- [ ] Add "Edit" button to InfoTab header
  - [ ] Import Button component
  - [ ] Wire to `library.store.setEditReference(referenceId)`
  - [ ] Position top-right of Info section
  - [ ] Use "Edit" icon from @heroicons/react

- [ ] Add Tags section
  - [ ] Fetch tags from reference query
  - [ ] Render as colored pills (use tag.color if available)
  - [ ] Add X button on hover for each tag
  - [ ] Wire X button to tag removal mutation
  - [ ] Handle empty state ("No tags")
  - [ ] Apply color from DesignSystem.md (9 colors)

- [ ] Add Collections section
  - [ ] Fetch collections from reference query
  - [ ] Render as list with collection names
  - [ ] Make each collection name clickable
  - [ ] Wire click to `library.store.setSelectedCollection(collectionId)`
  - [ ] Add folder icon from @heroicons/react
  - [ ] Handle empty state ("Not in any collection")

- [ ] Add Metadata footer
  - [ ] Display "Created: [date]" (format: "MMM D, YYYY")
  - [ ] Display "Modified: [date]" (format: "MMM D, YYYY")
  - [ ] Display "Source: [source]" (e.g., "Imported from BibTeX")
  - [ ] Style as subtle gray text at bottom of Info tab
  - [ ] Use date-fns for formatting

#### Phase 2: Add Resizable Width (30 min)

- [ ] Install/verify react-resizable-panels in package.json
- [ ] Wrap library route content in PanelGroup
  - [ ] Set direction="horizontal"
  - [ ] Handle 2 panels: main content + DetailsPane

- [ ] Configure main content Panel
  - [ ] Set defaultSize={70} (70% of width)
  - [ ] Set minSize={50} (don't shrink main content too much)

- [ ] Add PanelResizeHandle between panels
  - [ ] Style with visible divider line
  - [ ] Add hover state for better UX

- [ ] Configure DetailsPane Panel
  - [ ] Set defaultSize={30} (30% of width)
  - [ ] Set minSize={20} (minimum 320px equivalent)
  - [ ] Set maxSize={50} (maximum 50% of viewport)
  - [ ] Wire onLayout callback to persist width

- [ ] Sync with ui.store
  - [ ] Read initial width from ui.store.detailsPaneWidth
  - [ ] Call setDetailsPaneWidth on resize
  - [ ] Verify localStorage persistence works

#### Phase 3: Keyboard & Wiring (15 min)

- [ ] Add ESC key handler in library.tsx
  - [ ] Listen for keydown event
  - [ ] Check if key === 'Escape'
  - [ ] Call `setDetailsPaneOpen(false)` and `setActiveReference(null)`
  - [ ] Cleanup listener on unmount

- [ ] Verify auto-open on row click
  - [ ] Test: Click row → DetailsPane opens
  - [ ] Test: Click different row → DetailsPane updates
  - [ ] Test: Click same row → DetailsPane stays open
  - [ ] Verify activeReferenceId state updates correctly

- [ ] Add keyboard accessibility
  - [ ] Tab navigation works in DetailsPane
  - [ ] Focus returns to table when DetailsPane closes
  - [ ] Screen reader announcements for tab changes

---

### Tests (30 min - Deferred to /session-test)

Tests will be written in `/session-test 9` following the testing skill guidelines:

- [ ] Unit tests for InfoTab components
  - [ ] Edit button click calls setEditReference
  - [ ] Tag removal calls mutation
  - [ ] Collection click calls setSelectedCollection
  - [ ] Metadata footer formats dates correctly

- [ ] Integration tests for DetailsPane
  - [ ] Resize handle changes width
  - [ ] Width persists to localStorage
  - [ ] ESC key closes pane
  - [ ] Tab switching updates URL/state

- [ ] E2E tests for complete workflow
  - [ ] Click reference → DetailsPane opens
  - [ ] Click Edit → ReferenceModal opens
  - [ ] Remove tag → Tag disappears + library updates
  - [ ] Click collection → Library filters to collection
  - [ ] Resize → Width persists after reload

---

### Documentation

- [ ] Update CHANGELOG.md with Session 9 entry
  - [ ] List: InfoTab enhancement, resizable width, ESC handler
  - [ ] Note: DetailsPane now production-ready

- [ ] Mark Session 9 complete in checklist
  - [ ] File: `docs/02-delivery/checklist/sessions-06-10.md`
  - [ ] Change `- [ ]` to `- [x]` for all Session 9 tasks

- [ ] Update STATUS.md (if exists)
  - [ ] Current Session: Session 9 (Complete)
  - [ ] Next Session: Session 10 (PDF Upload)

---

## Definition of Done

### Functional Requirements
- ✅ Edit button in Info tab opens ReferenceModal with correct reference
- ✅ Tags display as colored pills with working remove buttons
- ✅ Clicking tag X removes tag from reference
- ✅ Collections section shows all collections containing reference
- ✅ Clicking collection name filters library view to that collection
- ✅ Metadata footer displays Created/Modified/Source timestamps
- ✅ Date formatting is readable (e.g., "Nov 16, 2025")

### Interaction Requirements
- ✅ DetailsPane width is resizable via drag handle
- ✅ Minimum width: 320px (20% of typical viewport)
- ✅ Maximum width: 50% of viewport
- ✅ Width persists to localStorage across page reloads
- ✅ ESC key closes DetailsPane and clears active reference
- ✅ Clicking reference row auto-opens DetailsPane (verify existing)

### Quality Requirements
- ✅ All tests passing (unit + integration + E2E)
- ✅ No TypeScript errors
- ✅ No console warnings
- ✅ Accessible (keyboard navigation, screen readers)
- ✅ Responsive (works on various screen sizes)

### Documentation Requirements
- ✅ CHANGELOG.md updated with Session 9 completion
- ✅ Session 9 checklist tasks marked complete
- ✅ Code comments explain any deviations from Zotero

---

## References

### Zotero
- `/home/mahdi/Desktop/bibliography/zotero/chrome/content/zotero/elements/itemPane.js` - Item pane UI structure
- `/home/mahdi/Desktop/bibliography/zotero/chrome/content/zotero/xpcom/data/item.js` - Item data model
- `/home/mahdi/Desktop/bibliography/zotero/resource/schema/userdata.sql` - Database schema (items, tags, collections)

### Editor Patterns
- `/home/mahdi/Desktop/bibliography/editor_frontend/src/components/ui/Button.tsx` - Button component
- `/home/mahdi/Desktop/bibliography/editor_frontend/src/store/ui.store.ts` - UI state patterns

### Specifications
- `/home/mahdi/Desktop/bibliography/docs/01-specification/frontend/ComponentsSpec.md` (lines 225-320) - DetailsPane spec
- `/home/mahdi/Desktop/bibliography/docs/01-specification/frontend/DesignSystem.md` - Colors, spacing, typography
- `/home/mahdi/Desktop/bibliography/docs/02-delivery/checklist/sessions-06-10.md` (lines 185-223) - Session 9 tasks

### External Documentation
- react-resizable-panels: https://www.npmjs.com/package/react-resizable-panels
- @headlessui/react Tabs: https://headlessui.com/react/tabs
- date-fns formatting: https://date-fns.org/docs/format

---

**Plan Status**: ✅ Approved
**Ready to Execute**: Use `/session-execute 9` to begin implementation
**Confidence Score**: 1.00 (100%) - All research complete, no blockers, clear path forward
