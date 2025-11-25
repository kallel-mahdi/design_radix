# Bibliography Manager - Figma Design Parity Findings

**Date**: 2025-11-25
**Target**: Zotero Feature Parity + Figma Design Match
**Handoff Document**: For implementation agent to execute

---

## Executive Summary

This document analyzes the gap between the current implementation and the Figma designs (13 frames). The goal is Zotero feature parity with the UI specified in Figma. Key findings:

1. **Activity Bar**: Has 5 icons, Figma shows 7 (missing Tags, Sharing, Notifications)
2. **Filters Panel**: Not implemented (Figma Frame 19)
3. **Notes Tab**: Placeholder only (Figma Frames 31-32)
4. **Sharing**: Not implemented (Figma Frames 34, 37)
5. **Settings**: Not implemented (Figma Frames 38-40)
6. **Tag System**: Already correct - uses 9 colored pills (better than Figma's single green)

---

## Part 1: Figma Frame-by-Frame Analysis

### Frame 33 - Library View (Main)
**File**: `Screenshot 2025-10-29 004036.png`

| Element | Status | Current Location | Notes |
|---------|--------|------------------|-------|
| Activity Bar (left) | PARTIAL | `ActivityBar.tsx` | Has 5 icons, needs 7 |
| Sidebar - Collections Tree | DONE | `TreeView.tsx` | Nested, expandable |
| Sidebar - Tags Section | DONE | `TagSelector.tsx` | 9 colored tags |
| Search Bar | DONE | `SearchBar.tsx` | In sidebar header |
| Reference Table | DONE | `ReferenceTable.tsx` | All columns present |
| Table Columns: Title | DONE | | Sortable |
| Table Columns: Authors | DONE | | First author + et al |
| Table Columns: Year | DONE | | Sortable |
| Table Columns: Venue | PARTIAL | | Field exists, display needs verification |
| Table Columns: Tags | DONE | | Colored pills |
| Table Columns: Files (PDF icon) | DONE | | Shows attachment indicator |
| Table Columns: DOI | DONE | | Clickable link |
| Details Pane (right) | DONE | `DetailsPane.tsx` | Collapsible, 3 tabs |
| Details Pane - Empty State | DONE | | Shows when no reference selected |

**Gaps**:
- [ ] Venue column display needs verification
- [ ] Activity Bar needs 2 more icons (Tags, Sharing/Notifications)

---

### Frame 29 - Details Info Tab
**File**: `Screenshot 2025-10-29 004058.png`

| Element | Status | Current Location | Notes |
|---------|--------|------------------|-------|
| Tab Header (Info/PDF/Notes) | DONE | `DetailsPane.tsx:111-127` | |
| Title Display | DONE | | Large, bold |
| Authors Field | DONE | | Comma-separated |
| Year Field | DONE | | In grid layout |
| Type Field | DONE | | Capitalized |
| DOI with Link | DONE | | External link icon |
| Abstract | DONE | | Full text display |
| Tags (removable) | DONE | | With X button |
| Add Tag Button | DONE | `TagPicker.tsx` | Plus button dropdown |
| Collections List | DONE | | Clickable to filter |
| PDF Attachment Indicator | DONE | | Document icon |
| Citation Key | DONE | | Code formatted |
| Edit Button | DONE | | Top right |
| Created/Modified Dates | DONE | | Footer |
| Source Provider | DONE | | Footer |

**Status**: FULLY IMPLEMENTED

---

### Frame 30 - Details PDF Tab
**File**: `Screenshot 2025-10-29 004117.png`

| Element | Status | Current Location | Notes |
|---------|--------|------------------|-------|
| PDF Preview Iframe | DONE | `PdfTab.tsx` | Native browser viewer |
| Empty State (no PDF) | DONE | | Upload prompt |
| PDF Upload Zone | DONE | `PdfUploadZone.tsx` | Drag-drop |
| View in Reader Button | DONE | | Opens PdfReaderModal |
| Download Button | DONE | | Direct download |

**Status**: FULLY IMPLEMENTED

---

### Frame 31 - Details Notes Tab (Empty)
**File**: `Screenshot 2025-10-29 004144.png`

| Element | Status | Current Location | Notes |
|---------|--------|------------------|-------|
| Empty State Message | PARTIAL | `DetailsPane.tsx:304-309` | Shows "Phase 2" message |
| "No notes have been added" Text | MISSING | | Need proper empty state |
| Add Note Button | MISSING | | Not implemented |

**Gaps**:
- [ ] Replace Phase 2 message with proper empty state matching Figma
- [ ] Add "Add Note" button (can be disabled for MVP)

---

### Frame 32 - Details Notes Tab (With Notes)
**File**: `Screenshot 2025-10-29 004205.png`

| Element | Status | Current Location | Notes |
|---------|--------|------------------|-------|
| Note Card | MISSING | | Not implemented |
| Note Content Display | MISSING | | |
| Note Timestamp | MISSING | | |
| Edit Note Button | MISSING | | |
| Delete Note Button | MISSING | | |
| Add Note Button | MISSING | | |

**Status**: NOT IMPLEMENTED (Phase 2 feature, but UI should exist)

**Decision**: Defer to Phase 2, but update empty state to match Figma

---

### Frame 19 - Filters Panel
**File**: `Screenshot 2025-10-29 004237.png`

| Element | Status | Notes |
|---------|--------|-------|
| Search Bar | DONE | Already in SearchBar.tsx |
| AUTHOR Section | MISSING | Checkbox list with counts |
| YEAR RANGE Slider | MISSING | 2000-2024 range |
| VENUE Section | MISSING | Checkbox list |
| TAGS Section | PARTIAL | TagSelector exists, but not in filter panel format |
| "Manage Filter" Button | MISSING | |
| Checkbox with Count Badge | MISSING | e.g., "Author Name (12)" |

**Status**: NOT IMPLEMENTED

**Implementation Notes**:
- This is a major feature addition
- Requires backend aggregation endpoints for counts
- Could reuse TagSelector pattern
- Year range slider needs new component (use headlessui Slider or similar)

---

### Frame 35 - Projects Panel
**File**: `Screenshot 2025-10-29 004303.png`

| Element | Status | Current Location | Notes |
|---------|--------|------------------|-------|
| Projects Route | DONE | `routes/projects.tsx` | |
| Expandable Project List | PARTIAL | | Basic list exists |
| LINKED COLLECTIONS Section | MISSING | | Toggle switches |
| Collection Toggle ON/OFF | MISSING | | |
| Project-Collection Linking | MISSING | | |

**Status**: PARTIALLY IMPLEMENTED

**Gaps**:
- [ ] Add "LINKED COLLECTIONS" section with toggles
- [ ] Backend: project-collection linking API

---

### Frame 36 - Duplicates Panel
**File**: `Screenshot 2025-10-29 004318.png`

| Element | Status | Current Location | Notes |
|---------|--------|------------------|-------|
| Duplicates Route | DONE | `routes/duplicates.tsx` | |
| "Duplicate groups" Header | PARTIAL | | |
| Two-Column Card Layout | MISSING | | Side-by-side comparison |
| Field Comparison View | MISSING | | Highlights differences |
| "Keep Existing" Button | MISSING | | |
| "Merge Fields" Button | MISSING | | |
| Master Item Selection | MISSING | | Radio/checkbox to select primary |

**Status**: PARTIALLY IMPLEMENTED - Needs UI rework

**Gaps**:
- [ ] Two-column comparison card component
- [ ] Field-by-field diff highlighting
- [ ] Keep/Merge action buttons
- [ ] Backend: merge endpoint

---

### Frame 34 - Sharing Empty State
**File**: `Screenshot 2025-10-29 004347.png`

| Element | Status | Notes |
|---------|--------|-------|
| Sharing Route | MISSING | No routes/sharing.tsx |
| "Invite collaborator" Input | MISSING | Email input field |
| "START COLLABORATING" Message | MISSING | Empty state text |
| Role Selector Dropdown | MISSING | |
| Invite Button | MISSING | |

**Status**: NOT IMPLEMENTED (Phase 2)

---

### Frame 37 - Sharing with Collaborators
**File**: `Screenshot 2025-10-29 004409.png`

| Element | Status | Notes |
|---------|--------|-------|
| Collaborators Table | MISSING | |
| Name Column | MISSING | |
| Role Column | MISSING | Editor/Viewer |
| Status Column | MISSING | Active/Pending |
| Actions Column | MISSING | Remove button |
| Invite Section | MISSING | |

**Status**: NOT IMPLEMENTED (Phase 2)

---

### Frame 38 - Settings Menu
**File**: `Screenshot 2025-10-29 004450.png`

| Element | Status | Notes |
|---------|--------|-------|
| Settings Popup Menu | MISSING | |
| "General" Option | MISSING | |
| "Project Defaults" Option | MISSING | |
| "Shortcuts" Option | MISSING | |
| "Storage/Sync" Option | MISSING | |

**Status**: NOT IMPLEMENTED

**Implementation Notes**:
- Settings icon already in Activity Bar design
- Each option opens a modal (see Frames 39-40)

---

### Frame 39 - General Settings Modal
**File**: `Screenshot 2025-10-29 004521.png`

| Element | Status | Notes |
|---------|--------|-------|
| Settings Modal | MISSING | |
| "Collapse Details pane" Toggle | MISSING | |
| "Auto-detect duplicates" Toggle | MISSING | |
| "Show citation preview" Toggle | MISSING | |
| Save/Cancel Buttons | MISSING | |

**Status**: NOT IMPLEMENTED

---

### Frame 40 - Project Default Settings Modal
**File**: `Screenshot 2025-10-29 004545.png`

| Element | Status | Notes |
|---------|--------|-------|
| Project Defaults Modal | MISSING | |
| Bibliography Style Dropdown | MISSING | APA, Chicago, etc. |
| Default Cite Command Dropdown | MISSING | \cite, \citep, etc. |
| Natbib Preamble Button | MISSING | Copy LaTeX code |

**Status**: NOT IMPLEMENTED

---

## Part 2: Activity Bar Icon Analysis

### Current Implementation (5 icons)
```
ActivityBar.tsx:38-48

1. Library (BookOpenIcon)
2. Search (MagnifyingGlassIcon)
3. Projects (LinkIcon)
4. Duplicates (ExclamationTriangleIcon)
5. Trash (TrashIcon) - at bottom
```

### Figma Design (7 icons)
Based on Frame 33, the Activity Bar should have:

1. Library - book icon
2. Search - magnifying glass
3. Projects - folder/link icon
4. Duplicates - warning triangle
5. **Tags** - tag icon (MISSING)
6. **Sharing/Notifications** - bell or share icon (MISSING)
7. Trash - at bottom

### Recommendation
Add 2 more icons to Activity Bar:
- `TagIcon` from heroicons for Tags view
- `ShareIcon` or `BellIcon` for Sharing/Notifications

**Update `ActivityBar.tsx`**:
```typescript
import { TagIcon, ShareIcon } from '@heroicons/react/24/outline';

// Add to items array:
{ id: 'tags' as const, icon: TagIcon, label: 'Tags' },
{ id: 'sharing' as const, icon: ShareIcon, label: 'Sharing' },
```

**Update `activeView` type** in `ActivityBarProps`:
```typescript
activeView: 'library' | 'search' | 'projects' | 'duplicates' | 'tags' | 'sharing' | 'trash';
```

---

## Part 3: Editor Components to Borrow

### Already Borrowed
| Component | Source | Destination | Status |
|-----------|--------|-------------|--------|
| Button | `editor_frontend/src/components/ui/Button.tsx` | `bibliography_frontend/src/components/ui/Button.tsx` | DONE |
| Card | `editor_frontend/src/components/ui/Card.tsx` | `bibliography_frontend/src/components/ui/Card.tsx` | DONE |
| Input | `editor_frontend/src/components/ui/Input.tsx` | `bibliography_frontend/src/components/ui/Input.tsx` | DONE |
| Modal | `editor_frontend/src/components/ui/Modal.tsx` | `bibliography_frontend/src/components/ui/Modal.tsx` | DONE |
| LoadingSpinner | `editor_frontend/src/components/ui/LoadingSpinner.tsx` | `bibliography_frontend/src/components/ui/LoadingSpinner.tsx` | DONE |
| GlobalCursor | `editor_frontend/src/components/ui/GlobalCursor.tsx` | `bibliography_frontend/src/components/ui/GlobalCursor.tsx` | DONE |
| Resizable | `editor_frontend/src/components/ui/Resizable.tsx` | `bibliography_frontend/src/components/ui/Resizable.tsx` | DONE |

### Can Be Borrowed (Unused)
| Component | Source | Use Case | Priority |
|-----------|--------|----------|----------|
| EmptyState | `editor_frontend/src/components/layout/EmptyState.tsx` | Already have custom version | LOW |
| SearchBar | `editor_frontend/src/components/layout/SearchBar.tsx` | Already have custom version | LOW |

### Need to Create (No Editor Equivalent)
| Component | Use Case | Priority |
|-----------|----------|----------|
| FilterPanel | Frame 19 - Advanced filtering | MEDIUM |
| RangeSlider | Year range in filters | MEDIUM |
| DuplicateComparisonCard | Frame 36 - Side-by-side comparison | HIGH |
| SettingsModal | Frame 39-40 - Settings dialogs | LOW |
| CollaboratorsTable | Frame 37 - Sharing view | LOW (Phase 2) |
| NotesCard | Frame 32 - Notes display | LOW (Phase 2) |
| CheckboxWithCount | Filter checkboxes with badge | MEDIUM |

---

## Part 4: Skills/Agents Issues

### Critical Issues to Fix

#### 1. Missing Agent: `auto-error-resolver`
**Impact**: CRITICAL - `tsc-check.sh` hook references this agent

**Location**: `.claude/hooks/tsc-check.sh:32-35`
```bash
echo "🤖 Spawning auto-error-resolver agent..."
# Note: The agent should be created at .claude/agents/auto-error-resolver.md
```

**Fix**: Create `.claude/agents/auto-error-resolver.md` with TypeScript error resolution instructions

#### 2. Broken Agent: `code-architecture-reviewer`
**Impact**: MEDIUM - References non-existent files

**Location**: `.claude/agents/code-architecture-reviewer.md`

**Issues**:
- References `PROJECT_KNOWLEDGE.md` (doesn't exist)
- References `BEST_PRACTICES.md` (doesn't exist)

**Fix**: Update to reference actual documentation:
- `docs/01-specification/Spec.md`
- `docs/01-specification/frontend/ComponentsSpec.md`
- `docs/01-specification/backend/APIDesignSystem.md`

#### 3. Hook Detection Issue: `post-tool-use-tracker.sh`
**Impact**: LOW - Doesn't detect bibliography_backend/frontend directories

**Location**: `.claude/hooks/post-tool-use-tracker.sh:31-38`

**Fix**: Add detection for `bibliography_backend` and `bibliography_frontend` directories

### Skills Status

| Skill | Status | Notes |
|-------|--------|-------|
| bibliography-planning-docs | GOOD | Comprehensive |
| bibliography-frontend-guidelines | GOOD | React 19/Tailwind patterns |
| bibliography-backend-guidelines | GOOD | Express/Mongoose patterns |
| bibliography-confidence | FAIR | References non-existent Context7 MCP |
| bibliography-testing-skill | ADEQUATE | Missing MSW mocking patterns |
| skill-developer | EXCELLENT | Complete guide |

---

## Part 5: Implementation Priority Matrix

### P0 - Must Have for Figma Parity (This Sprint)

| Task | Effort | Impact | Dependencies |
|------|--------|--------|--------------|
| Activity Bar: Add Tags + Sharing icons | 1h | HIGH | Update type definitions |
| Notes Tab: Update empty state to match Figma | 30m | MEDIUM | None |
| Venue Column: Verify display | 30m | LOW | Check data population |

### P1 - High Priority (Next Sprint)

| Task | Effort | Impact | Dependencies |
|------|--------|--------|--------------|
| Duplicates View: Two-column comparison cards | 4h | HIGH | Backend merge API |
| Duplicates View: Keep/Merge buttons | 2h | HIGH | UI component |
| Projects: Linked Collections toggles | 3h | MEDIUM | Backend API |

### P2 - Medium Priority

| Task | Effort | Impact | Dependencies |
|------|--------|--------|--------------|
| Filters Panel: Full implementation | 8h | HIGH | Backend aggregation APIs |
| Settings Menu + General Settings Modal | 4h | MEDIUM | State persistence |
| Settings: Project Defaults Modal | 2h | LOW | Backend config API |

### P3 - Phase 2 Features (Defer)

| Task | Effort | Notes |
|------|--------|-------|
| Sharing: Full implementation | 16h+ | Collaboration infrastructure |
| Notes: Full implementation | 8h+ | Rich text editor integration |
| "To Read" smart collection | 4h | User requested Phase 2 |

---

## Part 6: Tag System Analysis (CORRECT)

The current tag implementation is **better than Figma's design**:

### Figma Design
- Single green color (`#4CAF50`)
- All tags look identical
- No visual differentiation

### Current Implementation (Zotero-style)
```typescript
// TagColorPickerModal.tsx
const TAG_COLORS = [
  '#FF6B6B', // red (position 1)
  '#4ECDC4', // teal (position 2)
  '#45B7D1', // blue (position 3)
  '#FFA07A', // salmon (position 4)
  '#98D8C8', // mint (position 5)
  '#F7DC6F', // yellow (position 6)
  '#BB8FCE', // purple (position 7)
  '#85C1E2', // light blue (position 8)
  '#F8B88B', // peach (position 9)
];
```

### Features Already Working
- 9 distinct colors (max)
- Keyboard shortcuts 1-9 to toggle tag filters
- White text on colored background (high contrast)
- Color picker modal for assignment
- Prevents duplicate color assignment
- Random color selection for new tags

**Decision**: KEEP current implementation (superior to Figma)

---

## Part 7: Files Reference

### Key Frontend Files
```
bibliography_frontend/src/
├── components/
│   ├── layout/
│   │   ├── ActivityBar.tsx      # Navigation icons (needs 2 more)
│   │   ├── AppLayout.tsx        # Main layout shell
│   │   ├── DetailsPane.tsx      # Reference details (Info/PDF/Notes tabs)
│   │   ├── SearchBar.tsx        # Search input
│   │   └── Sidebar.tsx          # Not used (legacy?)
│   └── ui/
│       ├── Button.tsx           # CVA variants
│       ├── Card.tsx             # Container component
│       ├── Tag.tsx              # Colored tag pills
│       ├── Modal.tsx            # Dialog wrapper
│       └── ...
├── features/library/
│   ├── components/
│   │   ├── ReferenceTable.tsx   # Main table view
│   │   ├── TreeView.tsx         # Collections tree
│   │   ├── TagSelector.tsx      # Tag filter panel
│   │   ├── TagColorPickerModal.tsx  # 9-color assignment
│   │   ├── PdfTab.tsx           # PDF viewer tab
│   │   └── ...
│   ├── api/                     # React Query hooks
│   └── store/                   # Zustand stores
└── routes/
    ├── library.tsx              # Main view
    ├── search.tsx               # Search results
    ├── projects.tsx             # Projects view
    ├── duplicates.tsx           # Duplicates view
    └── trash.tsx                # Trash view
```

### Key Backend Files
```
bibliography_backend/src/
├── controllers/
│   ├── ReferenceController.ts
│   ├── CollectionController.ts
│   └── TagController.ts
├── services/
│   ├── ReferenceService.ts
│   ├── CollectionService.ts
│   ├── TagService.ts
│   └── DuplicateService.ts
├── models/
│   ├── Reference.ts
│   ├── Collection.ts
│   └── Tag.ts
└── routes/
    ├── references.ts
    ├── collections.ts
    └── tags.ts
```

---

## Part 8: Quick Start Checklist

For the implementing agent, start with these tasks in order:

### Task 1: Activity Bar Icons (30 min)
1. Open `bibliography_frontend/src/components/layout/ActivityBar.tsx`
2. Import `TagIcon` and `ShareIcon` from heroicons
3. Add entries to `items` array
4. Update type definition for `activeView`
5. Update `useUIStore` if needed

### Task 2: Notes Tab Empty State (15 min)
1. Open `bibliography_frontend/src/components/layout/DetailsPane.tsx`
2. Line 304-309: Replace Phase 2 message
3. Add proper empty state matching Figma Frame 31
4. Consider adding disabled "Add Note" button

### Task 3: Create Tags Route (1 hr)
1. Create `bibliography_frontend/src/routes/tags.tsx`
2. Show all tags with colors and counts
3. Allow bulk tag management
4. Link from Activity Bar

### Task 4: Create Sharing Route Placeholder (30 min)
1. Create `bibliography_frontend/src/routes/sharing.tsx`
2. Implement empty state matching Figma Frame 34
3. Add "Coming in Phase 2" message if needed

---

## Appendix A: Figma Screenshot Mapping

| Screenshot File | Frame | Description |
|-----------------|-------|-------------|
| 004036.png | 33 | Library View (Main) |
| 004058.png | 29 | Details Info Tab |
| 004117.png | 30 | Details PDF Tab |
| 004144.png | 31 | Details Notes Tab (Empty) |
| 004205.png | 32 | Details Notes Tab (With Notes) |
| 004237.png | 19 | Filters Panel |
| 004303.png | 35 | Projects Panel |
| 004318.png | 36 | Duplicates Panel |
| 004347.png | 34 | Sharing Empty State |
| 004409.png | 37 | Sharing with Collaborators |
| 004450.png | 38 | Settings Menu |
| 004521.png | 39 | General Settings Modal |
| 004545.png | 40 | Project Default Settings Modal |

---

## Appendix B: Backend API Gaps

For full Figma parity, these backend endpoints need implementation:

| Endpoint | Purpose | Priority |
|----------|---------|----------|
| `GET /references/stats/authors` | Author counts for filter panel | P2 |
| `GET /references/stats/venues` | Venue counts for filter panel | P2 |
| `GET /references/stats/years` | Year distribution for slider | P2 |
| `POST /duplicates/:id/merge` | Merge duplicate references | P1 |
| `GET /projects/:id/collections` | Linked collections | P1 |
| `POST /projects/:id/collections` | Link collection to project | P1 |
| `DELETE /projects/:id/collections/:collectionId` | Unlink collection | P1 |

---

*End of FINDINGS.md*
