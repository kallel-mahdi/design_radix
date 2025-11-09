# Bibliography Manager Frontend — Component Specifications

## Overview

This document provides detailed specifications for all components in the bibliography manager frontend. Each component includes TypeScript interfaces, CVA variants, accessibility requirements, and code examples.

**Component Categories**:
1. **Layout Components**: Application structure (ActivityBar, Sidebar, MainPane, DetailsPane, AppLayout)
2. **Core Feature Components**: Feature-specific components (ReferenceTable, TreeView, TagSelector, etc.)
3. **UI Primitives**: Reusable base components (Button, Input, Modal, etc.)

**Design Patterns**:
- **CVA for variants**: Use class-variance-authority for type-safe component variants
- **Headless UI**: Leverage @headlessui/react for accessible patterns (Menu, Tabs, Combobox)
- **Composition**: Build complex components from simpler primitives
- **Accessibility-first**: ARIA attributes, keyboard navigation, screen reader support built-in

---

## 1. Layout Components

### 1.1 ActivityBar

**Purpose**: Vertical navigation bar (left edge, always visible) with 6 main views

**File**: `src/components/layout/ActivityBar.tsx`

**Props Interface**:
```typescript
interface ActivityBarProps {
  activeView: 'library' | 'search' | 'projects' | 'duplicates'
  onViewChange: (view: ActivityBarProps['activeView']) => void
  duplicatesCount?: number  // Badge count for duplicates
  trashNotEmpty?: boolean   // Show trash as full/empty
  className?: string
}
```

**UI Structure**:
```
┌────┐
│ 📚 │ Library (top)
│ 🔍 │ Search
│ 🔗 │ Projects
│ ⚠️ │ Duplicates (with badge)
│    │ (spacer)
│ 🗑️ │ Trash (bottom)
└────┘
```

**Icons** (@heroicons/react/24/outline):
- Library: `BookOpenIcon`
- Search: `MagnifyingGlassIcon`
- Projects: `LinkIcon`
- Duplicates: `ExclamationTriangleIcon`
- Trash: `TrashIcon`

**CVA Variants**:
```typescript
const activityBarItemVariants = cva(
  "w-16 h-16 flex items-center justify-center relative transition-colors",
  {
    variants: {
      active: {
        true: "bg-accent/10 border-l-2 border-accent text-accent",
        false: "text-gray-400 hover:text-gray-300 hover:bg-gray-800"
      }
    }
  }
)
```

**Badge** (for Duplicates count):
```tsx
{duplicatesCount > 0 && (
  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
    {duplicatesCount > 99 ? '99+' : duplicatesCount}
  </span>
)}
```

**Accessibility**:
- `role="navigation"` on container
- `aria-label="Main Navigation"`
- Each icon button: `aria-label="View {name}"`, `aria-current="page"` if active
- Keyboard: Tab to focus, Enter/Space to activate, Arrow keys to navigate

**Code Example**:
```tsx
import { BookOpenIcon, MagnifyingGlassIcon, LinkIcon, ExclamationTriangleIcon, TrashIcon } from '@heroicons/react/24/outline'
import { cva } from 'class-variance-authority'
import { clsx } from 'clsx'

const items = [
  { id: 'library', icon: BookOpenIcon, label: 'Library' },
  { id: 'search', icon: MagnifyingGlassIcon, label: 'Search' },
  { id: 'projects', icon: LinkIcon, label: 'Projects' },
  { id: 'duplicates', icon: ExclamationTriangleIcon, label: 'Duplicates', badge: duplicatesCount },
]

export const ActivityBar: React.FC<ActivityBarProps> = ({
  activeView,
  onViewChange,
  duplicatesCount = 0,
  className
}) => {
  return (
    <nav className={clsx("w-16 bg-bg-dark border-r border-border flex flex-col", className)} aria-label="Main Navigation">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onViewChange(item.id as any)}
          className={activityBarItemVariants({ active: activeView === item.id })}
          aria-label={`View ${item.label}`}
          aria-current={activeView === item.id ? 'page' : undefined}
        >
          <item.icon className="w-6 h-6" />
          {item.badge > 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {item.badge > 99 ? '99+' : item.badge}
            </span>
          )}
        </button>
      ))}
      <div className="flex-1" /> {/* Spacer */}
      <button className={activityBarItemVariants({ active: false })} aria-label="View Trash">
        <TrashIcon className={clsx("w-6 h-6", trashNotEmpty && "text-red-400")} />
      </button>
    </nav>
  )
}
```

---

### 1.2 Sidebar

**Purpose**: Left sidebar containing TreeView (collections) and TagSelector (tags)

**File**: `src/components/layout/Sidebar.tsx`

**Props Interface**:
```typescript
interface SidebarProps {
  width: number              // Controlled width (280 default)
  onWidthChange: (width: number) => void
  className?: string
  children: React.ReactNode  // Contains TreeView + TagSelector
}
```

**Features**:
- **Resizable**: Drag right edge to resize (100-600px range)
- **Persist width**: Save to localStorage on change
- **Collapsible**: Optional collapse button (Phase 1)

**Resizable Implementation**:
```tsx
import { useState, useRef, useEffect } from 'react'

const Sidebar: React.FC<SidebarProps> = ({ width, onWidthChange, children, className }) => {
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const newWidth = Math.max(100, Math.min(600, e.clientX - 64)) // 64 = ActivityBar width
      onWidthChange(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isResizing, onWidthChange])

  return (
    <aside
      ref={sidebarRef}
      className={clsx("bg-bg-surface border-r border-border relative flex flex-col", className)}
      style={{ width: `${width}px` }}
      aria-label="Sidebar"
    >
      {children}
      {/* Resize handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1 hover:w-2 hover:bg-accent cursor-col-resize transition-all"
        onMouseDown={handleMouseDown}
        aria-label="Resize sidebar"
      />
    </aside>
  )
}
```

**Accessibility**:
- `role="complementary"` or `<aside>`
- Resize handle: `aria-label="Resize sidebar"`, keyboard accessible (left/right arrows, Phase 1)

---

### 1.3 DetailsPane

**Purpose**: Right sidebar showing reference details with tabs (Info | PDF | Notes)

**File**: `src/components/layout/DetailsPane.tsx`

**Props Interface**:
```typescript
interface DetailsPaneProps {
  isOpen: boolean
  onClose: () => void
  referenceId: string | null
  activeTab: 'info' | 'pdf' | 'notes'
  onTabChange: (tab: DetailsPaneProps['activeTab']) => void
  width: number
  onWidthChange: (width: number) => void
  className?: string
}
```

**Features**:
- Auto-opens when reference selected
- Resizable (drag left edge)
- Closable (X button or ESC key)
- Tabs using @headlessui/react Tab component

**Implementation**:
```tsx
import { Tab } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { InfoTab, PdfTab, NotesTab } from '@/features/library/components/DetailsPane'

const DetailsPane: React.FC<DetailsPaneProps> = ({
  isOpen,
  onClose,
  referenceId,
  activeTab,
  onTabChange,
  width,
  onWidthChange,
  className
}) => {
  if (!isOpen || !referenceId) return null

  const tabIndex = ['info', 'pdf', 'notes'].indexOf(activeTab)

  return (
    <aside
      className={clsx("bg-bg-surface border-l border-border flex flex-col", className)}
      style={{ width: `${width}px` }}
      aria-label="Reference Details"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Reference Details</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-300"
          aria-label="Close details pane"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <Tab.Group selectedIndex={tabIndex} onChange={(index) => onTabChange(['info', 'pdf', 'notes'][index])}>
        <Tab.List className="flex border-b border-border">
          {['Info', 'PDF', 'Notes'].map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                clsx(
                  "px-4 py-2 text-sm font-medium transition-colors",
                  selected
                    ? "border-b-2 border-accent text-accent"
                    : "text-gray-400 hover:text-gray-300"
                )
              }
            >
              {tab}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="flex-1 overflow-auto">
          <Tab.Panel><InfoTab referenceId={referenceId} /></Tab.Panel>
          <Tab.Panel><PdfTab referenceId={referenceId} /></Tab.Panel>
          <Tab.Panel><NotesTab /></Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* Resize handle (left edge) */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 hover:w-2 hover:bg-accent cursor-col-resize"
        onMouseDown={(e) => handleResizeStart(e)}
      />
    </aside>
  )
}
```

**Accessibility**:
- Tabs: Keyboard navigation (Left/Right arrows), `aria-selected`
- Close button: `aria-label="Close details pane"`
- ESC key closes pane

---

### 1.4 AppLayout

**Purpose**: Root layout orchestrator (4-column grid)

**File**: `src/components/layout/AppLayout.tsx`

**Props Interface**:
```typescript
interface AppLayoutProps {
  children: React.ReactNode  // Outlet for route content
}
```

**Layout Structure**:
```tsx
const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { activeView, setActiveView } = useUIStore()
  const { sidebarWidth, setSidebarWidth, detailsPaneOpen, detailsPaneWidth } = useUIStore()

  return (
    <div className="h-screen flex bg-bg-primary text-text-primary">
      {/* Activity Bar */}
      <ActivityBar activeView={activeView} onViewChange={setActiveView} />

      {/* Sidebar */}
      <Sidebar width={sidebarWidth} onWidthChange={setSidebarWidth}>
        <TreeView />
        <TagSelector />
      </Sidebar>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>

      {/* Details Pane */}
      {detailsPaneOpen && (
        <DetailsPane
          width={detailsPaneWidth}
          onWidthChange={setDetailsPaneWidth}
          {...detailsPaneProps}
        />
      )}
    </div>
  )
}
```

---

## 2. Core Feature Components

### 2.1 ReferenceTable

**Purpose**: Sortable, selectable table of references (main library view)

**File**: `src/features/library/components/ReferenceTable.tsx`

**Props Interface**:
```typescript
interface ReferenceTableProps {
  references: Reference[]
  selectedIds: Set<string>
  onSelectionChange: (ids: Set<string>) => void
  onReferenceClick: (id: string) => void
  onReferenceDoubleClick: (id: string) => void
  sortBy: 'title' | 'year' | 'authors' | 'dateAdded'
  sortOrder: 'asc' | 'desc'
  onSort: (by: ReferenceTableProps['sortBy']) => void
  className?: string
}
```

**Columns**:
1. Checkbox (select)
2. Title
3. Authors (comma-separated, max 3 shown)
4. Year
5. Venue
6. Tags (pills, max 3 shown)
7. Files (paperclip icon if PDF attached)
8. DOI (clickable link)

**TanStack Table Setup**:
```tsx
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, ColumnDef } from '@tanstack/react-table'

const columns: ColumnDef<Reference>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
        aria-label="Select all references"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        aria-label={`Select ${row.original.title}`}
      />
    ),
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
      <span className="font-medium text-text-primary">{row.original.title}</span>
    ),
  },
  {
    accessorKey: 'authors',
    header: 'Authors',
    cell: ({ row }) => {
      const authors = row.original.authors.slice(0, 3).map(a => a.family).join(', ')
      const extra = row.original.authors.length > 3 ? ` et al.` : ''
      return <span className="text-text-secondary">{authors}{extra}</span>
    },
  },
  // ... more columns
]

const table = useReactTable({
  data: references,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  state: { sorting: [{ id: sortBy, desc: sortOrder === 'desc' }], rowSelection: selectedIds },
  onRowSelectionChange: (updater) => {
    // Update Zustand store with new selection
  },
})
```

**Row CVA Variants**:
```typescript
const rowVariants = cva(
  "border-b border-border hover:bg-gray-800/50 cursor-pointer transition-colors",
  {
    variants: {
      selected: {
        true: "bg-accent/5 border-l-2 border-accent",
        false: ""
      },
      hasPdf: {
        true: "",
        false: ""
      }
    }
  }
)
```

**Multi-Select Logic**:
```tsx
const handleRowClick = (e: React.MouseEvent, referenceId: string) => {
  if (e.metaKey || e.ctrlKey) {
    // Cmd/Ctrl+Click: Toggle individual selection
    const newSelection = new Set(selectedIds)
    if (newSelection.has(referenceId)) {
      newSelection.delete(referenceId)
    } else {
      newSelection.add(referenceId)
    }
    onSelectionChange(newSelection)
  } else if (e.shiftKey) {
    // Shift+Click: Range selection
    // Find range between last selected and current
    // (implementation omitted for brevity)
  } else {
    // Normal click: Single selection + open details pane
    onSelectionChange(new Set([referenceId]))
    onReferenceClick(referenceId)
  }
}
```

**Accessibility**:
- Table: `role="table"`, `aria-label="References"`
- Headers: `role="columnheader"`, `aria-sort="ascending|descending|none"`
- Rows: `role="row"`, `aria-selected="true|false"`
- Cells: `role="cell"`
- Keyboard:
  - Arrow keys: Navigate cells
  - Space: Select row
  - Enter: Open details
  - Cmd/Ctrl+A: Select all

---

### 2.2 TreeView (Collections)

**Purpose**: Recursive tree for nested collections

**File**: `src/features/library/components/TreeView.tsx`

**Props Interface**:
```typescript
interface TreeViewProps {
  collections: Collection[]  // Flat array, parent-child via parentId
  activeCollectionId: string | null
  onCollectionClick: (id: string) => void
  onCollectionContextMenu: (id: string, event: React.MouseEvent) => void
  className?: string
}

interface TreeNodeProps {
  collection: Collection
  level: number
  isExpanded: boolean
  onToggle: (id: string) => void
  isActive: boolean
  onClick: () => void
  onContextMenu: (event: React.MouseEvent) => void
  children?: React.ReactNode  // Nested TreeNodes
}
```

**Recursive Structure**:
```tsx
const TreeNode: React.FC<TreeNodeProps> = ({
  collection,
  level,
  isExpanded,
  onToggle,
  isActive,
  onClick,
  onContextMenu,
  children
}) => {
  const hasChildren = React.Children.count(children) > 0

  return (
    <div>
      <div
        className={clsx(
          "flex items-center px-2 py-1 cursor-pointer hover:bg-gray-800 rounded",
          isActive && "bg-accent/10 text-accent"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={onClick}
        onContextMenu={onContextMenu}
        role="treeitem"
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={isActive}
      >
        {hasChildren && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(collection.id) }}
            className="w-4 h-4 mr-1"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <ChevronRightIcon className={clsx("w-4 h-4 transition-transform", isExpanded && "rotate-90")} />
          </button>
        )}
        {!hasChildren && <span className="w-4 mr-1" />}
        <FolderIcon className="w-4 h-4 mr-2 text-gray-400" />
        <span className="flex-1 truncate">{collection.name}</span>
        <span className="text-xs text-gray-500">{collection.itemCount}</span>
      </div>
      {isExpanded && hasChildren && (
        <div role="group">{children}</div>
      )}
    </div>
  )
}

const TreeView: React.FC<TreeViewProps> = ({ collections, activeCollectionId, onCollectionClick, onCollectionContextMenu }) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const buildTree = (parentId: string | null, level: number): React.ReactNode => {
    return collections
      .filter(c => c.parentId === parentId)
      .sort((a, b) => a.position - b.position)
      .map(collection => (
        <TreeNode
          key={collection.id}
          collection={collection}
          level={level}
          isExpanded={expandedIds.has(collection.id)}
          onToggle={(id) => {
            const newExpanded = new Set(expandedIds)
            if (newExpanded.has(id)) newExpanded.delete(id)
            else newExpanded.add(id)
            setExpandedIds(newExpanded)
          }}
          isActive={collection.id === activeCollectionId}
          onClick={() => onCollectionClick(collection.id)}
          onContextMenu={(e) => onCollectionContextMenu(collection.id, e)}
        >
          {buildTree(collection.id, level + 1)}
        </TreeNode>
      ))
  }

  return (
    <div className="flex-1 overflow-auto p-2" role="tree" aria-label="Collections">
      {buildTree(null, 0)}
    </div>
  )
}
```

**Accessibility**:
- `role="tree"` on container
- `role="treeitem"` on each node
- `aria-expanded` for expandable nodes
- `aria-selected` for active collection
- Keyboard:
  - Arrow Up/Down: Navigate siblings
  - Arrow Right: Expand node
  - Arrow Left: Collapse node or move to parent
  - Enter: Select collection
  - `*` (asterisk): Expand all siblings

**Persistence**: Save expanded state to localStorage on change

---

### 2.3 TagSelector

**Purpose**: Tag list with search, color assignment, filtering

**File**: `src/features/library/components/TagSelector.tsx`

**Props Interface**:
```typescript
interface TagSelectorProps {
  tags: Tag[]                // All tags with counts
  activeTags: string[]       // Currently filtering by these tags
  onTagClick: (name: string) => void
  onTagColorChange: (name: string, color: string | null) => void
  onTagRename: (oldName: string, newName: string) => void
  onTagDelete: (name: string) => void
  height: number
  onHeightChange: (height: number) => void
  collapsed: boolean
  onToggleCollapsed: () => void
  className?: string
}

interface Tag {
  name: string
  count: number       // References with this tag
  color: string | null  // Hex color or null (max 9 colored tags)
}
```

**UI Structure**:
```
┌─────────────────────────┐
│ Tags            ⚙️ [▼]  │  Header with settings menu + collapse
├─────────────────────────┤
│ 🔍 Search tags...       │  Search box
├─────────────────────────┤
│ ● Machine Learning (42) │  Tag (colored)
│   Deep Learning (23)    │  Tag (no color)
│ ● Computer Vision (15)  │  Tag (colored)
│   ...                   │
└─────────────────────────┘
```

**Tag Item**:
```tsx
const TagItem: React.FC<{ tag: Tag; active: boolean; onClick: () => void; onContextMenu: (e: React.MouseEvent) => void }> = ({
  tag,
  active,
  onClick,
  onContextMenu
}) => {
  return (
    <button
      className={clsx(
        "w-full flex items-center px-3 py-1 text-sm hover:bg-gray-800 rounded",
        active && "bg-accent/10"
      )}
      onClick={onClick}
      onContextMenu={onContextMenu}
      aria-label={`Filter by tag: ${tag.name}`}
      aria-pressed={active}
    >
      {tag.color && (
        <span
          className="w-2 h-2 rounded-full mr-2"
          style={{ backgroundColor: tag.color }}
          aria-hidden="true"
        />
      )}
      <span className="flex-1 truncate text-left">{tag.name}</span>
      <span className="text-xs text-gray-500 ml-2">{tag.count}</span>
    </button>
  )
}
```

**Settings Menu** (Headless UI Menu):
```tsx
<Menu as="div" className="relative">
  <Menu.Button aria-label="Tag settings">
    <Cog6ToothIcon className="w-5 h-5" />
  </Menu.Button>
  <Menu.Items className="absolute right-0 mt-2 w-56 bg-bg-surface border border-border rounded shadow-lg">
    <Menu.Item>
      {({ active }) => (
        <button className={clsx("w-full px-4 py-2 text-left", active && "bg-gray-800")}>
          Show Automatic Tags
        </button>
      )}
    </Menu.Item>
    {/* More menu items */}
  </Menu.Items>
</Menu>
```

**Color Picker Modal** (Phase 1):
- Opens when user right-clicks tag → "Assign Color"
- Shows color palette (9 colors matching Zotero)
- Position indicator (1-9 for keyboard shortcuts)
- "Remove Color" option

**Accessibility**:
- Search box: `aria-label="Search tags"`
- Tag buttons: `aria-pressed` for active state
- Settings menu: Keyboard accessible (Enter to open, arrows to navigate)
- Resizable vertical split (grippy handle)

**Zotero Pattern**: Max 9 colored tags, enforced in color picker

---

### 2.4 ReferenceModal (Create/Edit)

**Purpose**: Form for creating or editing a reference

**File**: `src/features/library/components/ReferenceModal.tsx`

**Props Interface**:
```typescript
interface ReferenceModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  referenceId?: string  // For edit mode
  initialData?: Partial<ReferenceFormData>
  onSuccess?: (reference: Reference) => void
}

interface ReferenceFormData {
  type: 'article' | 'book' | 'chapter' | 'conference' | 'thesis' | 'other'
  title: string         // Only required field
  authors: Array<{ given: string; family: string }>
  year: number | null
  venue: string
  doi: string
  url: string
  tags: string[]
  pdf: File | null
}
```

**Zod Validation Schema**:
```typescript
import { z } from 'zod'

const ReferenceSchema = z.object({
  type: z.enum(['article', 'book', 'chapter', 'conference', 'thesis', 'other']),
  title: z.string().min(1, "Title is required"),
  authors: z.array(z.object({
    given: z.string().optional(),
    family: z.string().optional()
  })).optional(),
  year: z.number().int().min(1000).max(2100).nullable(),
  venue: z.string().optional(),
  doi: z.string().regex(/^10\.\d{4,}\/\S+$/, "Invalid DOI format").or(z.literal('')).optional(),
  url: z.string().url("Invalid URL").or(z.literal('')).optional(),
  tags: z.array(z.string()).optional()
})

type ReferenceFormData = z.infer<typeof ReferenceSchema>
```

**Form Implementation** (react-hook-form):
```tsx
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const ReferenceModal: React.FC<ReferenceModalProps> = ({ isOpen, onClose, mode, referenceId, initialData }) => {
  const { register, handleSubmit, control, formState: { errors } } = useForm<ReferenceFormData>({
    resolver: zodResolver(ReferenceSchema),
    defaultValues: initialData || { type: 'article', authors: [{ given: '', family: '' }] }
  })

  const { fields: authorFields, append: addAuthor, remove: removeAuthor } = useFieldArray({
    control,
    name: 'authors'
  })

  const createMutation = useCreateReferenceMutation()
  const updateMutation = useUpdateReferenceMutation()

  const onSubmit = async (data: ReferenceFormData) => {
    if (mode === 'create') {
      await createMutation.mutateAsync(data)
    } else {
      await updateMutation.mutateAsync({ id: referenceId!, data })
    }
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Header>
          <h2>{mode === 'create' ? 'New Reference' : 'Edit Reference'}</h2>
        </Modal.Header>

        <Modal.Body className="space-y-4">
          {/* Reference Type */}
          <div>
            <label htmlFor="type">Type</label>
            <select {...register('type')} id="type" className="input">
              <option value="article">Journal Article</option>
              <option value="book">Book</option>
              <option value="chapter">Book Chapter</option>
              <option value="conference">Conference Paper</option>
              <option value="thesis">Thesis</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Title (required) */}
          <div>
            <label htmlFor="title">Title *</label>
            <input {...register('title')} id="title" className="input" />
            {errors.title && <span className="text-red-500 text-sm">{errors.title.message}</span>}
          </div>

          {/* Authors (dynamic array) */}
          <div>
            <label>Authors</label>
            {authorFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 mb-2">
                <input
                  {...register(`authors.${index}.given`)}
                  placeholder="Given name"
                  className="input flex-1"
                />
                <input
                  {...register(`authors.${index}.family`)}
                  placeholder="Family name"
                  className="input flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeAuthor(index)}
                  className="btn-ghost"
                  aria-label="Remove author"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addAuthor({ given: '', family: '' })}
              className="btn-secondary"
            >
              + Add Author
            </button>
          </div>

          {/* Year */}
          <div>
            <label htmlFor="year">Year</label>
            <input
              {...register('year', { valueAsNumber: true })}
              id="year"
              type="number"
              className="input"
            />
            {errors.year && <span className="text-red-500 text-sm">{errors.year.message}</span>}
          </div>

          {/* Venue */}
          <div>
            <label htmlFor="venue">Journal/Conference</label>
            <input {...register('venue')} id="venue" className="input" />
          </div>

          {/* DOI */}
          <div>
            <label htmlFor="doi">DOI</label>
            <input {...register('doi')} id="doi" placeholder="10.1234/example" className="input" />
            {errors.doi && <span className="text-red-500 text-sm">{errors.doi.message}</span>}
          </div>

          {/* URL */}
          <div>
            <label htmlFor="url">URL</label>
            <input {...register('url')} id="url" type="url" className="input" />
            {errors.url && <span className="text-red-500 text-sm">{errors.url.message}</span>}
          </div>

          {/* Tags (autocomplete, Phase 1) */}
          <div>
            <label htmlFor="tags">Tags</label>
            <input {...register('tags')} id="tags" placeholder="Comma-separated tags" className="input" />
          </div>

          {/* PDF Upload */}
          <div>
            <label htmlFor="pdf">PDF Attachment</label>
            <input type="file" accept=".pdf" id="pdf" className="input" />
          </div>
        </Modal.Body>

        <Modal.Footer>
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button
            type="submit"
            className="btn-primary"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}
```

**Accessibility**:
- Form labels associated with inputs
- Error messages announced to screen readers (`aria-live="polite"`)
- Focus management (first field focused on open, trap focus in modal)
- Keyboard: Tab through fields, Enter to submit, ESC to cancel

---

### 2.5 DuplicateCard

**Purpose**: Two-column comparison of potential duplicates

**File**: `src/features/duplicates/components/DuplicateCard.tsx`

**Props Interface**:
```typescript
interface DuplicateCardProps {
  existingReference: Reference
  duplicateReference: Reference
  matchReason: 'isbn' | 'doi' | 'title-creator'
  onKeepExisting: () => void
  onMerge: () => void
  onKeepBoth: () => void
  className?: string
}
```

**UI Layout**:
```
┌────────────────────────────────────────────────────┐
│ ⚠️ WARNING - Potential Duplicate Detected          │
│ Matched on: DOI                                    │
├─────────────────────┬──────────────────────────────┤
│ Existing Reference  │ New Import                   │
├─────────────────────┼──────────────────────────────┤
│ Title: Machine...   │ Title: Machine Learning...   │  (blue if different)
│ Authors: Smith, J.  │ Authors: John Smith, Jane... │  (blue if different)
│ Year: 2023          │ Year: 2023                   │  (same)
│ DOI: 10.1234/ex     │ DOI: 10.1234/ex              │  (same - match reason)
│ PDF: ✓              │ PDF: ✗                       │
├─────────────────────┴──────────────────────────────┤
│ [Keep Existing]  [Merge Fields ▾]  [Keep Both]    │
└────────────────────────────────────────────────────┘
```

**Diff Highlighting**:
```tsx
const FieldComparison: React.FC<{ label: string; existing: string; duplicate: string }> = ({
  label,
  existing,
  duplicate
}) => {
  const isDifferent = existing !== duplicate

  return (
    <div className="grid grid-cols-2 gap-4 py-2 border-b border-border">
      <div>
        <span className="text-xs text-gray-500">{label}</span>
        <p className={clsx(isDifferent && "text-blue-400")}>{existing || '—'}</p>
      </div>
      <div>
        <span className="text-xs text-gray-500">{label}</span>
        <p className={clsx(isDifferent && "text-blue-400")}>{duplicate || '—'}</p>
      </div>
    </div>
  )
}
```

**Actions**:
- **Keep Existing** (green button): Delete duplicate, mark as resolved
- **Merge Fields** (dropdown): Opens MergeModal for field-by-field selection
- **Keep Both** (ghost button): Mark as "not duplicates", unlink

**Accessibility**:
- Warning icon: `aria-label="Warning: Potential duplicate"`
- Action buttons: Clear labels, keyboard accessible
- Card: `role="article"` or `<article>`

---

## 3. UI Primitives

### 3.1 Button

**Purpose**: Reusable button with variants, sizes, loading state

**File**: `src/components/ui/Button.tsx`

**Props Interface**:
```typescript
import { VariantProps } from 'class-variance-authority'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean
  children: React.ReactNode
  className?: string
}
```

**CVA Variants**:
```typescript
import { cva } from 'class-variance-authority'

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
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
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
)
```

**Implementation**:
```tsx
import { clsx } from 'clsx'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

export const Button: React.FC<ButtonProps> = ({
  variant,
  size,
  loading,
  disabled,
  children,
  className,
  ...props
}) => {
  return (
    <button
      className={clsx(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  )
}
```

**Usage**:
```tsx
<Button variant="primary" size="md">Save</Button>
<Button variant="danger" loading>Deleting...</Button>
<Button variant="ghost" size="sm" onClick={handleCancel}>Cancel</Button>
```

---

### 3.2 Modal

**Purpose**: Accessible modal dialog with backdrop, focus trap

**File**: `src/components/ui/Modal.tsx`

**Props Interface**:
```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  size?: 'small' | 'medium' | 'large' | 'full'
  children: React.ReactNode
  className?: string
}
```

**Implementation** (Headless UI Dialog):
```tsx
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

const sizeClasses = {
  small: 'max-w-md',
  medium: 'max-w-2xl',
  large: 'max-w-4xl',
  full: 'max-w-full mx-4'
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, size = 'medium', children, className }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        </Transition.Child>

        {/* Modal panel */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={clsx(
                "w-full bg-bg-surface rounded-lg shadow-xl border border-accent/50 overflow-hidden",
                sizeClasses[size],
                className
              )}>
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

// Subcomponents for composition
Modal.Header = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-b border-border flex items-center justify-between">
    {children}
  </div>
)

Modal.Body = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={clsx("px-6 py-4", className)}>{children}</div>
)

Modal.Footer = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
    {children}
  </div>
)
```

**Usage**:
```tsx
<Modal isOpen={isOpen} onClose={onClose} size="large">
  <Modal.Header>
    <h2>Modal Title</h2>
  </Modal.Header>
  <Modal.Body>
    <p>Modal content here</p>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="ghost" onClick={onClose}>Cancel</Button>
    <Button variant="primary" onClick={handleSave}>Save</Button>
  </Modal.Footer>
</Modal>
```

**Accessibility**:
- Focus trap (can't tab outside modal)
- ESC to close
- `aria-modal="true"`
- Focus returns to trigger element on close
- Body scroll locked when open

---

### 3.3 Tag (Pill Component)

**Purpose**: Colored tag pill with optional remove button

**File**: `src/components/ui/Tag.tsx`

**Props Interface**:
```typescript
interface TagProps {
  label: string
  color?: string | null  // Hex color or null
  onRemove?: () => void
  className?: string
}
```

**CVA Variants**:
```typescript
const tagVariants = cva(
  "inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full",
  {
    variants: {
      hasColor: {
        true: "text-white",
        false: "bg-gray-700 text-gray-300"
      }
    }
  }
)
```

**Implementation**:
```tsx
export const Tag: React.FC<TagProps> = ({ label, color, onRemove, className }) => {
  const style = color ? { backgroundColor: color } : undefined

  return (
    <span
      className={clsx(tagVariants({ hasColor: !!color }), className)}
      style={style}
    >
      <span>{label}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="hover:bg-black/20 rounded-full p-0.5"
          aria-label={`Remove tag ${label}`}
        >
          <XMarkIcon className="w-3 h-3" />
        </button>
      )}
    </span>
  )
}
```

---

### 3.4 EmptyState

**Purpose**: Placeholder for empty views

**File**: `src/components/ui/EmptyState.tsx`

**Props Interface**:
```typescript
interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}
```

**Implementation**:
```tsx
export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action, className }) => {
  return (
    <div className={clsx("flex flex-col items-center justify-center py-12 text-center", className)}>
      {Icon && <Icon className="w-16 h-16 text-gray-600 mb-4" />}
      <h3 className="text-lg font-medium text-gray-300 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-4 max-w-sm">{description}</p>}
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
```

**Usage**:
```tsx
<EmptyState
  icon={FolderOpenIcon}
  title="No references yet"
  description="Import your first reference to get started"
  action={{ label: "Import References", onClick: openImportModal }}
/>
```

---

## 4. Zotero Keyboard Shortcut Reference

**For Phase 2 implementation** - Full Zotero shortcut map:

| Shortcut | Action | Context |
|----------|--------|---------|
| **General** |
| Cmd/Ctrl+N | New Item | Global |
| Cmd/Ctrl+Shift+N | New Collection | Sidebar focused |
| Cmd/Ctrl+Shift+I | Import | Global |
| Cmd/Ctrl+Shift+Alt+I | Import from Clipboard | Global |
| Cmd/Ctrl+F | Focus Search Box | Global |
| Cmd/Ctrl+Shift+F | Advanced Search | Global |
| Cmd/Ctrl+W | Close Window | Global |
| **Editing** |
| Cmd/Ctrl+Z | Undo | Global |
| Cmd/Ctrl+Shift+Z | Redo | Global |
| Cmd/Ctrl+X | Cut | Text field |
| Cmd/Ctrl+C | Copy | Text field or item |
| Cmd/Ctrl+V | Paste | Text field |
| Cmd/Ctrl+A | Select All | Table or text |
| **Items** |
| Delete/Backspace | Move to Trash | Item(s) selected |
| Cmd/Ctrl+Delete | Force Move to Trash | Item(s) selected (no confirmation) |
| Enter/Return | Edit Item | Item selected |
| Cmd/Ctrl+Shift+C | Copy Citation | Item(s) selected |
| Cmd/Ctrl+Shift+A | Copy Bibliography | Item(s) selected |
| Cmd/Ctrl+E | Export | Item(s) or collection selected |
| **Navigation** |
| Arrow Up/Down | Navigate items | Table focused |
| Arrow Left/Right | Navigate collections | Tree focused |
| Home/End | First/Last item | Table focused |
| Page Up/Down | Scroll page | Table focused |
| **Sorting** (Zotero uses Cmd/Ctrl+1-9) |
| Cmd/Ctrl+1 | Sort by Title | Table focused |
| Cmd/Ctrl+2 | Sort by Creator | Table focused |
| Cmd/Ctrl+3 | Sort by Year | Table focused |
| Cmd/Ctrl+4 | Sort by Date Added | Table focused |
| **Selection** |
| Cmd/Ctrl+Click | Toggle selection | Table |
| Shift+Click | Range selection | Table |
| Cmd/Ctrl+A | Select all visible | Table |
| **Panels** |
| Cmd/Ctrl+Shift+T | Toggle Tag Selector | Global |
| Cmd/Ctrl+Shift+P | Toggle Item Pane | Global |
| Cmd/Ctrl+Shift+H | Toggle Collections Pane | Global |

**Implementation Note**: Use `useHotkeys` hook or similar library for keyboard shortcut management.

---

**Document Metadata**:
- Version: 1.0
- Date: 2025-01-08
- Author: Claude (Anthropic)
- Status: Draft for Review
- Related: Spec.md, DesignSystem.md, ImplementationChecklist.md
