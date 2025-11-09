# Bibliography Manager Frontend - Context for AI Agents

## You Are Here: Frontend Development

This document provides **frontend-specific context** for AI agents working on the bibliography manager UI.

**IMPORTANT**: Read the **root CLAUDE.md** (`/home/mahdi/Desktop/bibliography/CLAUDE.md`) FIRST for:
- Overall project vision and team structure
- Architecture principles (separation of concerns, microservices, tech stack)
- Code reuse strategy (editor patterns → bibliography patterns)
- Coding philosophy (trust types, minimal defensive coding)
- Common tasks workflow

**Then read the unified documentation**:
- **Spec.md** (`bibliography_plan/Spec.md`) - Complete frontend + backend specification
- **Roadmap.md** (`bibliography_plan/Roadmap.md`) - Phased development timeline
- **UnifiedImplementationChecklist.md** (`bibliography_plan/UnifiedImplementationChecklist.md`) - 20 sessions combining frontend + backend

This file provides **frontend-specific patterns** not covered in the root documentation.

---

## Frontend Quick Reference

**Your Primary Documentation**:
1. **Spec.md** - MUST READ FIRST - Complete feature specifications
2. **Roadmap.md** - Phased development timeline (MVP → Phase 3)
3. **ComponentsSpec.md** - Detailed component specs with code examples
4. **DesignSystem.md** - Colors, typography, spacing, CVA patterns
5. **ImplementationChecklist.md** - Session-by-session tasks (20 sessions for MVP)

**Your Reference Codebases**:
- **Editor Frontend**: `/home/mahdi/Desktop/bibliography/editor_frontend/` - COPY PATTERNS FROM HERE
- **Zotero UI**: `/home/mahdi/Desktop/bibliography/zotero/chrome/content/zotero/` - UI/UX REFERENCE

**Your Target**: `/home/mahdi/Desktop/bibliography/bibliography_frontend/` (you will create this)

---

## Tech Stack (MUST MATCH EDITOR)

```json
{
  "framework": "React 19",
  "language": "TypeScript 5.8",
  "build": "Vite 6",
  "routing": "TanStack Router 1.x (file-based, type-safe)",
  "state-ui": "Zustand 5 (lightweight global state)",
  "state-server": "TanStack React Query 5 (server data, caching)",
  "styling": "Tailwind CSS 4 + CVA (class-variance-authority)",
  "forms": "react-hook-form 7 + Zod 3 (validation)",
  "tables": "TanStack React Table 8",
  "headless-ui": "@headlessui/react 2 (Menu, Dialog, Tabs, etc.)",
  "icons": "@heroicons/react 2 (outline style)",
  "i18n": "i18next 25 + react-i18next 15",
  "testing": "Vitest 3 (unit) + React Testing Library 16 (integration) + Playwright 1.x (E2E)"
}
```

**Why these exact versions?** To match editor and enable code sharing.

---

## Where to Find Patterns

### Editor Frontend Structure

```
/home/mahdi/Desktop/bibliography/editor_frontend/src/
├── features/
│   └── task-management/           # YOUR BLUEPRINT
│       ├── api/
│       │   └── taskManagement.queries.ts   # React Query patterns → COPY
│       ├── components/
│       │   ├── TaskCard/                   # → Adapt to ReferenceCard
│       │   ├── TaskModal/                  # → Adapt to ReferenceModal
│       │   └── TaskManagementPage/         # → Adapt to LibraryPage
│       ├── hooks/                          # Custom hooks pattern
│       ├── store/
│       │   └── taskManagement.store.ts     # Zustand pattern → COPY
│       └── types/                          # TypeScript types
├── components/
│   ├── charts/                   # Placeholder (ignore)
│   ├── forms/                    # Placeholder (ignore)
│   ├── layout/                   # Empty (you'll build)
│   └── ui/                       # Placeholder README only (you'll build primitives)
├── store/
│   └── ui.store.ts               # COPY THIS - global UI state pattern
├── routes/                       # TanStack Router - COPY pattern
├── common/
│   ├── api/
│   │   └── client.ts             # COPY THIS - axios wrapper with auth
│   ├── events.ts                 # COPY THIS - event bus
│   ├── types.ts
│   └── utils.ts
└── styles/
    └── tailwind.css
```

### What to Copy Directly

**1. TaskCard → ReferenceCard**
- **File**: `editor_frontend/src/features/task-management/components/TaskCard/TaskCard.tsx`
- **Copy**:
  - CVA variant structure (variant, priority, status, size)
  - Props interface pattern
  - Hover states (edit/delete buttons appear on hover)
  - Badge styling
  - Checkbox selection
- **Adapt**:
  - Replace task fields with reference fields (title, authors, year, venue, tags, DOI)
  - Change variants: selected, hasPdf (instead of task statuses)
  - Update colors to bibliography design system (accent green #04E39E)

**2. TaskModal → ReferenceModal**
- **File**: `editor_frontend/src/features/task-management/components/TaskModal/TaskModal.tsx`
- **Copy**:
  - Modal structure (Headless UI Dialog)
  - Form setup (react-hook-form + Zod)
  - Create vs Edit mode logic
  - Mutation integration (useCreateTaskMutation → useCreateReferenceMutation)
- **Adapt**:
  - Reference form fields (see Spec.md section 2.7)
  - Zod schema for references (title required, DOI validation, URL validation)
  - Dynamic author array (add/remove authors)

**3. Zustand Stores**
- **File**: `editor_frontend/src/store/ui.store.ts`
- **Copy**:
  - Store structure (state + actions)
  - LocalStorage persistence pattern
  - Theme management (dark/light/system)
  - Modal management (modals object with IDs)
  - Toast notifications
- **Adapt**:
  - Add bibliography-specific state (activeView, sidebarWidth, detailsPaneWidth, detailsPaneTab)

**4. API Client**
- **File**: `editor_frontend/src/common/api/client.ts`
- **Copy**:
  - Axios instance setup
  - Request interceptor (inject auth token)
  - Response interceptor (handle errors, show toasts)
  - AuthManager class (token storage)
- **Adapt**:
  - Update baseURL to `VITE_API_BASE_URL` (bibliography endpoint)

**5. React Query Patterns**
- **File**: `editor_frontend/src/features/task-management/api/taskManagement.queries.ts`
- **Copy**:
  - Query key factory pattern
  - useQuery hook structure
  - useMutation with optimistic updates
  - Query invalidation on success
  - Toast notifications
- **Adapt**:
  - Reference queries (useReferencesQuery, useCreateReferenceMutation, etc.)
  - Collection queries
  - Tag queries

---

## Zotero UI Patterns (Reference Only)

### Where to Look in Zotero

```
/home/mahdi/Desktop/bibliography/zotero/chrome/content/zotero/
├── components/              # React components (newer)
│   ├── tagSelector.jsx      # Tag selector UI → REFERENCE for TagSelector component
│   └── collectionTree.jsx   # Collections tree → REFERENCE for TreeView
├── zoteroPane.xhtml         # Main layout → REFERENCE for AppLayout
├── itemTree.jsx             # Reference table → REFERENCE for ReferenceTable
└── (many .js files)         # Older XUL-based UI (ignore, outdated)
```

### What to Learn from Zotero

**TagSelector** (`components/tagSelector.jsx`):
- Max 9 colored tags (enforce this limit)
- Tag settings menu (rename, delete, assign color)
- Search box for filtering tags
- Drag-drop for tag assignment (Phase 1)

**CollectionTree** (`components/collectionTree.jsx`):
- Expand/collapse state persistence
- Nested structure (parentCollectionID)
- Manual ordering (position field)
- Right-click context menu (Phase 1)

**ItemTree** (`itemTree.jsx`):
- Multi-select patterns (Cmd/Ctrl+Click, Shift+Click)
- Keyboard navigation (Arrow keys)
- Column sorting (click header to toggle)

**Keyboard Shortcuts** (see ComponentsSpec.md for full list):
- Zotero uses Cmd/Ctrl+1-9 for column sorting
- Cmd/Ctrl+N for new item
- Delete for move to trash
- Cmd/Ctrl+Delete for force delete (no confirmation)
- Essential set in MVP, comprehensive in Phase 1

---

## Component Development Workflow

### Step-by-Step Process

**Example: Implementing ReferenceTable**

**1. Read Spec** (2 minutes)
```bash
# Open Spec.md, find section 2.1 Library View
# Subsection: Main Pane - Reference Table
# Note: Columns, sortable, multi-select, row states
```

**2. Check ComponentsSpec** (5 minutes)
```bash
# Open ComponentsSpec.md, find section 2.1 ReferenceTable
# Read props interface, TanStack Table setup, CVA variants, accessibility
# Copy code example
```

**3. Check Editor Pattern** (10 minutes)
```bash
cd /home/mahdi/Desktop/bibliography/editor_frontend/src/features/task-management/components
# Read TaskList.tsx (minimal) - not a full table
# Read TaskCard.tsx for row styling patterns
# Note: They don't have a full table implementation
# Conclusion: Build from TanStack Table directly using ComponentsSpec.md example
```

**4. Check Zotero** (5 minutes)
```bash
cd /home/mahdi/Desktop/bibliography/zotero/chrome/content/zotero
# Read itemTree.jsx
# Note multi-select logic (lines 983-985, 1039-1047)
# Note keyboard navigation
# Note column sorting
```

**5. Check DesignSystem** (3 minutes)
```bash
# Open DesignSystem.md
# Find table row CVA variants
# Find spacing for table (px-3 py-2 for cells)
# Find border colors
```

**6. Implement** (60-90 minutes)
```bash
# Create src/features/library/components/ReferenceTable.tsx
# Set up TanStack Table with columns
# Add CVA row variants (selected, hasPdf)
# Implement multi-select logic
# Wire to library.store for selection state
# Add keyboard navigation (useEffect for arrow keys)
```

**7. Test** (30 minutes)
```bash
# Unit test: Selection logic (select, deselect, toggle, selectAll)
# Integration test: Render table, click row, verify selection
# E2E test: (Session 20) Full flow with real data
```

**8. Document** (5 minutes)
```typescript
/**
 * ReferenceTable - Main library table component
 *
 * Adapted from editor TaskCard selection patterns.
 * Multi-select follows Zotero patterns (Cmd/Ctrl+Click, Shift+range).
 * Uses TanStack React Table for sorting and column management.
 *
 * @see ComponentsSpec.md section 2.1 for full specification
 */
```

---

## State Management Guide

### When to Use Zustand vs React Query

**Zustand (UI State)**:
- Selection state (selectedReferenceIds Set)
- Panel widths (sidebarWidth, detailsPaneWidth)
- Active items (activeReferenceId, activeCollectionId)
- Modal open/close (isCreateModalOpen, isEditModalOpen)
- Filter state (activeTagNames)
- Sort/view mode (sortBy, sortOrder, viewMode)
- Theme (dark/light)

**React Query (Server State)**:
- All API data (references, collections, tags, projects, duplicates)
- Caching (5 minute staleTime default)
- Optimistic updates (mutations)
- Automatic refetching
- Loading/error states

**Example**:
```typescript
// Zustand: UI selection
const { selectedReferenceIds, selectReference } = useLibraryStore()

// React Query: Server data
const { data: references, isLoading } = useReferencesQuery({ collectionId })

// Combined: Select reference from server data
const handleRowClick = (referenceId: string) => {
  selectReference(referenceId) // Update Zustand
  // React Query automatically provides data for details pane
}
```

### Store Structure (from Spec.md)

**Global**: `src/store/ui.store.ts`, `src/store/auth.store.ts`
**Feature**: `src/features/library/store/library.store.ts`, `src/features/search/store/search.store.ts`, etc.

**Persistence** (LocalStorage):
- sidebarWidth
- detailsPaneWidth
- theme
- expandedCollectionIds (tree state)

**NOT Persisted**:
- Selection (cleared on refresh)
- Active reference (cleared on refresh)
- Modals (always start closed)

---

## Design System Usage

### Quick Reference (from DesignSystem.md)

**Colors**:
```tsx
// Background
className="bg-bg-dark"           // #0F1115 - Primary background
className="bg-bg-surface"        // #171A21 - Cards, sidebar
className="bg-bg-hover"          // #1F2330 - Hover states

// Text
className="text-text-primary"   // #E6E8EC - High contrast
className="text-text-secondary" // #9CA3AF - Medium contrast
className="text-text-muted"     // #6B7280 - Low contrast, hints

// Accent (neon green from Figma)
className="bg-accent"            // #04E39E - Primary accent
className="hover:bg-accent-hover" // #2AF4B4 - Lighter on hover
className="border-accent"        // Green borders for selection

// Semantic
className="text-red-500"         // Danger/errors
className="text-yellow-500"      // Warnings
className="text-green-500"       // Success
```

**Typography**:
```tsx
className="text-xl font-semibold"   // Page titles (24px)
className="text-lg font-semibold"   // Section headers (20px)
className="text-base"               // Body text (16px)
className="text-sm"                 // Small text (14px)
className="text-xs"                 // Tiny text, labels (12px)
```

**Spacing** (8px grid):
```tsx
className="p-4"      // 16px padding (cards)
className="p-6"      // 24px padding (modals)
className="gap-3"    // 12px gap (buttons)
className="space-y-4" // 16px vertical spacing (forms)
```

**CVA Button Example**:
```tsx
import { cva } from 'class-variance-authority'

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded font-medium transition-colors focus:ring-2 focus:ring-accent",
  {
    variants: {
      variant: {
        primary: "bg-accent text-black hover:bg-accent-hover",
        secondary: "bg-gray-700 text-white hover:bg-gray-600",
        ghost: "text-gray-300 hover:bg-gray-800",
        danger: "bg-red-600 text-white hover:bg-red-700"
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg"
      }
    },
    defaultVariants: { variant: "primary", size: "md" }
  }
)

// Usage
<button className={buttonVariants({ variant: "primary", size: "md" })}>
  Save
</button>
```

---

## Testing Strategy

### Session 19 (ImplementationChecklist.md)

**Unit Tests** (Vitest):
```typescript
// Test utils
import { validateDOI, normalizeTitle, parseAuthorName } from '@/common/utils'

describe('validateDOI', () => {
  it('returns true for valid DOI', () => {
    expect(validateDOI('10.1234/example')).toBe(true)
  })

  it('returns false for invalid DOI', () => {
    expect(validateDOI('not-a-doi')).toBe(false)
  })
})

// Test Zustand store
import { useLibraryStore } from '@/features/library/store/library.store'

describe('library.store', () => {
  it('selects reference', () => {
    const { selectReference, selectedReferenceIds } = useLibraryStore.getState()
    selectReference('ref-123')
    expect(selectedReferenceIds.has('ref-123')).toBe(true)
  })
})
```

**Integration Tests** (React Testing Library):
```typescript
import { render, screen, userEvent } from '@testing-library/react'
import { ReferenceModal } from './ReferenceModal'

test('creates reference with title only', async () => {
  render(<ReferenceModal isOpen={true} mode="create" />)

  await userEvent.type(screen.getByLabelText('Title'), 'My Paper')
  await userEvent.click(screen.getByText('Save'))

  expect(await screen.findByText('Reference created successfully')).toBeInTheDocument()
})
```

**E2E Tests** (Playwright):
```typescript
test('full user journey', async ({ page }) => {
  await page.goto('http://localhost:5173')

  // Import DOI
  await page.click('button:has-text("Import")')
  await page.fill('input[placeholder*="DOI"]', '10.1234/example')
  await page.click('button:has-text("Fetch")')
  await page.click('button:has-text("Add to Library")')

  // Verify in table
  await expect(page.locator('table')).toContainText('My Paper Title')

  // Export
  await page.click('button:has-text("Export")')
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('text=Export All')
  ])
  expect(download.suggestedFilename()).toContain('.bib')
})
```

---

## Common Gotchas & Solutions

### 1. TypeScript Errors with TanStack Router

**Problem**: Route params not typed
**Solution**: Use `validateSearch` in route definition
```typescript
// routes/search.tsx
export const Route = createFileRoute('/search')({
  component: SearchPage,
  validateSearch: (search: Record<string, unknown>) => ({
    q: search.q as string | undefined,
    yearMin: search.yearMin ? Number(search.yearMin) : undefined
  })
})
```

### 2. Zustand Not Re-Rendering

**Problem**: Component doesn't update when store changes
**Solution**: Use selector to subscribe to specific state slice
```typescript
// ❌ Wrong - subscribes to entire store
const store = useLibraryStore()

// ✅ Correct - subscribes only to selectedReferenceIds
const selectedReferenceIds = useLibraryStore(state => state.selectedReferenceIds)
```

### 3. React Query Not Refetching

**Problem**: Data stale after mutation
**Solution**: Invalidate queries in onSuccess
```typescript
const createMutation = useCreateReferenceMutation()

useMutation({
  mutationFn: createReference,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: referenceKeys.lists() })
  }
})
```

### 4. CVA Variants Not Applying

**Problem**: Tailwind classes not in bundle
**Solution**: Add content paths to tailwind.config.js
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // All source files
  ],
  // ...
}
```

### 5. Headless UI Menu Not Closing

**Problem**: Menu stays open after click
**Solution**: Ensure Menu.Item wraps button, not vice versa
```tsx
// ❌ Wrong
<button>
  <Menu.Item>...</Menu.Item>
</button>

// ✅ Correct
<Menu.Item>
  {({ active }) => (
    <button className={active && 'bg-gray-800'}>...</button>
  )}
</Menu.Item>
```

---

## Accessibility Checklist

Every component must have:
- [ ] ARIA roles (`role="table"`, `role="button"`, etc.)
- [ ] ARIA labels (`aria-label="Close modal"`)
- [ ] ARIA states (`aria-expanded`, `aria-selected`, `aria-checked`)
- [ ] Keyboard navigation (Tab, Enter, ESC, Arrows)
- [ ] Focus indicators (`:focus-visible:ring-2 ring-accent`)
- [ ] Color contrast ≥4.5:1 (WCAG AA)
- [ ] Screen reader text (`<span className="sr-only">Loading</span>`)

**Test with**:
- Lighthouse (target: 90+ accessibility score)
- axe DevTools (0 violations)
- Keyboard only (unplug mouse, test navigation)
- VoiceOver or NVDA (screen reader testing)

---

## Quick Commands

```bash
# Start dev server
cd /home/mahdi/Desktop/bibliography/bibliography_frontend
npm run dev

# Run tests
npm run test              # Vitest (unit + integration)
npm run test:ui          # Vitest UI
npx playwright test      # E2E tests
npx playwright test --ui # E2E with UI

# Build
npm run build
npm run preview          # Preview production build

# Lint
npm run lint
npm run lint:fix
```

---

## Next Steps

**Session 1** (ImplementationChecklist.md):
1. Create `bibliography_frontend/` folder
2. Run `npm create vite@latest bibliography_frontend -- --template react-ts`
3. Install all dependencies (see Session 1 checklist)
4. Configure Tailwind with custom colors
5. Set up ESLint + Prettier
6. Create folder structure (`src/features/`, `src/components/`, `src/store/`, `src/routes/`)
7. First commit

**Then follow ImplementationChecklist.md sessions 2-20** for MVP completion.

---

**Remember**:
- ✅ ALWAYS check editor_frontend first
- ✅ ALWAYS read ComponentsSpec.md before building components
- ✅ ALWAYS use DesignSystem.md colors/spacing
- ✅ ALWAYS write tests (comprehensive coverage)
- ✅ ALWAYS document deviations from Zotero
- ❌ NEVER skip TypeScript strict mode
- ❌ NEVER mix state in Zustand that belongs in React Query

---

**Last Updated**: 2025-01-08
**Status**: Ready for Session 1
**Your First Task**: Create `bibliography_frontend/` and run Session 1 checklist
