# Bibliography Manager — Functional Specification (Unified)

**Last Updated**: 2025-01-08
**Version**: 2.0 (Unified Frontend + Backend)
**Status**: Complete specification for MVP development

---

## Document Purpose

This unified specification combines frontend and backend requirements for the bibliography manager. It serves as the single source of truth for what the system does, how users interact with it, and how data flows through the architecture.

**Audience**: Developers (frontend & backend), QA engineers, product team

**Related Documents**:
- **Roadmap.md** — Phased development timeline (MVP → Phase 3)
- **UnifiedImplementationChecklist.md** — Session-by-session task breakdown
- **RecommendedLibraries.md** — Approved libraries for MVP and future phases
- **ComponentsSpec.md** (frontend_plan/) — Detailed UI component specifications
- **DesignSystem.md** (frontend_plan/) — Colors, typography, CVA patterns
- **APIDesignSystem.md** (backend_plan/) — API endpoint details, validation schemas
- **ServiceLayerSpec.md** (backend_plan/) — Service layer architecture
- **zotero.md** (backend_plan/) — Zotero implementation reference

---

## 1. Project Overview

### 1.1 Vision

Build a modern, elegant bibliography management system that combines the collaborative power of Overleaf with the organizational capabilities of Zotero. This is part of a larger research ecosystem — a standalone bibliography manager (MVP) designed for future integration with a collaborative LaTeX editor.

**Think**: Overleaf + Zotero combined, but more elegant and tightly integrated.

---

**⚠️ ARCHITECTURE CLARIFICATION**:

The term "standalone bibliography manager" refers to the **product strategy** (MVP is separate from editor UI), **NOT** the deployment architecture.

**Backend Architecture**: Microservices pattern
- `bibliography-service` is one of 5+ services (auth-service, document-service, latex-service, bibliography-service, api-gateway)
- Runs on port 8005 with separate Docker container and MongoDB database
- API Gateway routes `/api/bibliography/*` requests to bibliography-service
- Services trust gateway auth headers (`x-user-id`), do not validate JWT directly
- Each service is independently deployable and scalable

**Frontend Architecture**: Standalone React application
- Separate from editor UI in MVP (Session 1-20)
- Shares UI patterns, tech stack (React 19, Tailwind v4, Zustand), and deployment patterns with editor
- Phase 2+ will integrate with editor for collaborative citations and reference picking

**Key Point**: This is a **product organization** decision (UI separation for MVP), not a monolithic backend architecture.

---

### 1.2 Target Users

**Primary**: Individual researchers (PhD students, academics) who need to:
- Import and organize references from various sources (DOI, BibTeX, databases)
- Manage large libraries (10,000+ references)
- Export citations for LaTeX documents
- Collaborate with team members (Phase 2)

**Secondary**: Research teams collaborating on shared bibliographies

### 1.3 Team Context

- **You (Bibliography Team)**: Building this standalone manager (frontend + backend)
- **Editor Team**: Building the collaborative LaTeX editor (separate codebase)
- **Integration**: Phase 2 will connect bibliography to editor via API Gateway
- **Philosophy**: Match Zotero's functionality with modern tech stack

### 1.4 Tech Stack Alignment

**Critical**: Tech stack MUST match the editor's existing architecture for future integration.

**Frontend**:
- React 19, TypeScript 5.8, Vite 6 (with SWC transpiler)
- TanStack Router 1.x (routing), Zustand 5 (UI state), TanStack React Query 5 (server state)
- Tailwind CSS 4 + CSS custom properties, CVA (styling), react-hook-form + Zod (forms)
- TanStack React Table 8, Headless UI 2, Heroicons 2
- framer-motion (animations), react-resizable-panels (layout), react-pdf (PDF viewing)
- Storybook 9 (component development)

**Backend**:
- Node.js 22+, Express 4, TypeScript 5.8
- MongoDB (Mongoose 8), Redis 4 (Phase 2)
- Zod (validation MVP, Zod in Phase 2), Winston (logging), Multer (file upload)
- Inversify (dependency injection - advanced DI pattern)

**Why these exact versions?** Code sharing, team consistency, future integration simplicity.

### 1.5 MVP Success Criteria

- [ ] Import references via DOI, BibTeX, CSL JSON, RIS
- [ ] Manual create/edit references
- [ ] Organize in nested collections (parent/child hierarchy)
- [ ] Tag references with colored tags (9 max)
- [ ] Automatic duplicate detection on import (3-stage Zotero algorithm)
- [ ] Search and filter references in real-time
- [ ] Export to BibTeX format
- [ ] Upload and view PDFs (react-pdf viewer with zoom/navigation)
- [ ] Link collections to projects (editor integration prep)
- [ ] Soft delete (trash/restore)
- [ ] Responsive, accessible, tested (unit + integration + E2E)

---

## 2. Frontend Requirements

### 2.1 In-Scope (MVP)

#### Library View

**Primary interface** for browsing and managing references.

**Layout** (4-column grid):
```
┌────┬─────────────┬──────────────────────┬──────────────┐
│ A  │  Sidebar    │  Main Pane           │ Details Pane │
│ c  │             │                      │              │
│ t  │ Collections │  Reference Table     │ Info Tab     │
│ i  │   Tree      │  [Sortable columns]  │ [Metadata]   │
│ v  │             │                      │              │
│ i  │ ──────────  │                      │ PDF Tab      │
│ t  │             │                      │ [Viewer]     │
│ y  │ Tag         │                      │              │
│    │ Selector    │                      │ Notes Tab    │
│ B  │             │                      │ [Placeholder]│
│ a  │             │                      │              │
│ r  │ ──────────  │                      │              │
│    │             │                      │              │
│    │ Trash       │                      │              │
└────┴─────────────┴──────────────────────┴──────────────┘
```

**Activity Bar** (left, 64px, always visible):
- Library icon (default view)
- Search icon
- Linked Projects icon
- Duplicates icon (badge shows count)
- Trash icon (bottom, full/empty state)

**Sidebar** (280px default, resizable, persist width):
- **Collections Tree**: Hierarchical nested structure, manual ordering, expand/collapse (persisted), item count badges, right-click menu placeholder
- **Tag Selector**: Search box, tag list with counts, color assignment (9 max), settings menu (rename, delete), click to filter

**Main Pane - Reference Table**:
- **Columns**: Title | Authors | Year | Venue | Tags | Files | DOI
- **Sortable**: Click header to toggle asc/desc
- **Multi-select**: Cmd/Ctrl+Click (individual), Shift+Click (range), checkbox column
- **Row variants**: Default, selected (green border-left 3px), hasPdf (paperclip icon)
- **Actions**: Click → open details, double-click → edit modal, right-click → menu (Phase 1)
- **Keyboard nav**: Arrows move selection

**Details Pane** (right, 360px default, resizable, collapsible):
- **Auto-open**: When reference selected
- **Tabs**: Info (editable metadata) | PDF (iframe viewer) | Notes (placeholder)
- **Width persistence**: localStorage

**Toolbar** (above table):
- **Add** button (green): Create reference modal
- **Import** dropdown: DOI | BibTeX | CSL JSON | RIS
- **Export** dropdown: BibTeX | Selected | Collection | All
- **Search box**: Client-side filter for current view

**MVP Constraints**:
- Single PDF per reference
- No notes editing
- No PDF annotations
- Auto-sorted references within collections (manual ordering in Phase 2)

#### Search & Filters

**Full-screen search interface** with real-time filtering.

**Search Bar**: Text input, debounced 300ms, clear button

**Filter Panel** (left sidebar):
- **Author Filter**: Checkbox list, search box, multi-select (AND logic)
- **Year Range Filter**: Dual-thumb slider, min/max from library
- **Venue Filter**: Checkbox list, search box, counts
- **Tag Filter**: Checkbox list, colored tags, counts
- **Clear All Filters** button

**Results Pane**: Reference table, updates in real-time, shows count

**Backend Integration**: MongoDB aggregation pipeline, pagination (100/page), query params (`?q=...&authors=...&yearMin=...&yearMax=...&tags=...`)

**MVP Constraints**:
- No saved searches
- No full-text PDF search
- Simple AND logic (no boolean operators)

#### Linked Projects

**Manage bibliography-project connections** (for future editor integration).

**Sidebar**: Project list, last modified, expandable (shows linked collections), search projects

**Main Pane**:
- **Collection Toggle Grid**: ON/OFF switch per collection (linked/not linked)
- **Reference Preview**: Read-only list of references from linked collections

**Integration Point** (future): Editor queries `GET /api/bibliography/projects/:projectId/references` for citation autocomplete

**MVP Constraints**:
- No citation insertion (editor handles that)
- No bi-directional link preview
- Collections user-scoped (not shared)

#### Duplicates

**Automatic duplicate detection and resolution.**

**Detection Algorithm** (Zotero 3-stage):
1. **ISBN Match**: Exact match (cleaned ISBN for books)
2. **DOI Match**: Case-insensitive exact match
3. **Title + Creator Match**: Normalized title + ≥1 creator match (lastName + firstInitial), years within ±1, no conflicting DOIs

**Trigger**: Automatic on import (differs from Zotero's manual trigger)

**Duplicates Page**:
- **Sidebar**: Duplicate groups count, rules (read-only), decision history
- **Main Pane**: Duplicate cards (two-column comparison: Existing | New)
  - **Actions**: Keep Existing (green), Merge Fields (dropdown), Keep Both
  - **Diff Highlighting**: Blue text for differing fields
- **Merge Modal**: Field-by-field comparison, radio buttons, preview merged result

**MVP Constraints**:
- One-at-a-time resolution (no bulk)
- No automatic merging rules
- Decision history view-only

#### Reference Details

**Info Tab**: Editable metadata (title, authors, year, venue, DOI, URL), tags section, collections section, metadata footer (dates, source)

**PDF Tab (MVP)**: react-pdf viewer with zoom/navigation controls, or empty state ("No PDF attached", upload button)

**Notes Tab**: Placeholder ("Coming in Phase 2")

**Behavior**: Auto-open on reference click, resizable, ESC to close

#### Import/Export

**Import Modal** (tabs: DOI | File Upload):
- **DOI Tab**: Input → Fetch (Crossref API) → Preview → Add
- **File Tab**: Drag-drop zone, browse button, paste textarea, format auto-detection, preview table, progress bar
- **Formats**: BibTeX (.bib), CSL JSON (.json), RIS (.ris), DOI (Crossref API)
- **Error Handling**: Skip invalid, show summary ("Imported 45 of 50, 5 skipped")

**Export**:
- **BibTeX Export**: Export All | Collection | Selected → downloads `.bib` file
- **Right-click Menu**: Export Collection, Export Selected Items
- **Backend**: `POST /export/bibtex` (body: `{referenceIds: []}`)

**MVP Constraints**:
- BibTeX export only (RIS, CSL JSON in Phase 1)
- No attachment export
- No custom export templates

#### Core Interactions

**Create/Edit Reference Modal**:
- **Structure**: Full-screen overlay, centered card (max-width 800px), close button
- **Form**: react-hook-form + Zod validation
- **Fields**: Type (dropdown), title (required), authors (dynamic array), year, venue, DOI, URL, tags, PDF upload
- **Footer**: Cancel (ghost), Save (green primary)
- **Behavior**: Empty form (create) or pre-filled (edit), mutations trigger duplicate check (create only)

**Trash & Restore**:
- **Trash Collection**: Special non-deletable collection, shows when contains items or user pref
- **Move to Trash**: Delete key, confirmation dialog (match Zotero), soft delete (`deleted: true`, `deletedAt: timestamp`)
- **Restore**: Green button, mutation sets `deleted: false`
- **Permanent Delete**: Delete key in trash, confirmation ("cannot be undone"), hard delete

**Keyboard Shortcuts (Essential MVP)**:
- Cmd/Ctrl+N: New Reference
- Cmd/Ctrl+F: Focus Search
- Delete: Move to Trash
- Cmd/Ctrl+Delete: Force delete (no confirmation)
- Cmd/Ctrl+A: Select All
- Arrows: Navigate selection
- Enter: Open details
- ESC: Close modal/pane

### 2.2 Out of Scope (MVP)

**Deferred to Phase 2**:
- Collaboration/sharing UI
- Notes CRUD with rich text editor
- Advanced PDF features (annotations, highlighting, search within PDF)
- Copy citation in formatted styles (APA, MLA, Chicago)
- Auto-fetch PDFs from open access (Unpaywall, arXiv, PMC)
- Offline support with sync
- Multiple PDF attachments per reference
- Manual reference ordering in collections
- Saved searches
- Full-text PDF search across library
- Bulk duplicate resolution
- Undo/redo
- Advanced import (PubMed, arXiv, browser extension)
- More export formats (RIS, CSL-JSON, Zotero RDF)

**Deferred to Phase 3**:
- Settings screens
- Comprehensive context menus
- Keyboard shortcuts overlay/editor
- Light theme
- Additional languages (French, German, Spanish)
- Advanced filter logic (OR, NOT)
- Smart collections (dynamic rules)
- Citation key customization
- Related items linking
- Statistics dashboard

### 2.3 Architecture

**Component Organization** (feature-based):
```
src/
├── features/
│   ├── library/          # ReferenceTable, TreeView, TagSelector
│   ├── search/           # SearchBar, FilterPanel
│   ├── projects/         # ProjectList, LinkedCollections
│   ├── duplicates/       # DuplicateCard, MergeModal
│   └── auth/             # LoginPage (copy from editor)
├── components/
│   ├── layout/           # AppLayout, ActivityBar, Sidebar
│   └── ui/               # Button, Input, Modal, Table, Tag
├── routes/               # TanStack Router (file-based)
├── store/                # ui.store, auth.store
└── common/               # api/client, types, utils
```

**State Management**:
- **Zustand (UI State)**: Selection, panels, modals, toasts, theme, sorting
- **React Query (Server State)**: References, collections, tags, projects, duplicates (caching, mutations)

### 2.4 Non-Functional Requirements

**Testing**:
- Coverage >80% for critical paths
- Unit (Vitest): Utils, hooks, stores
- Integration (React Testing Library): Workflows (create, import, export)
- E2E (Playwright): Critical journeys (login → import → export)

**Accessibility**:
- WCAG 2.1 Level AA
- Keyboard accessible
- ARIA roles/labels
- Focus indicators
- Contrast 4.5:1 minimum

**Performance**:
- Initial load <3s on 3G
- Time to Interactive <5s
- Virtual scrolling for 10k+ references

**i18n**:
- MVP: English only
- Phase 2: French, German, Spanish
- i18next infrastructure from start

**Browser Support**:
- Chrome 120+, Firefox 120+, Safari 17+, Edge 120+
- No IE11

---

## 3. Backend Requirements

### 3.1 In-Scope (MVP)

#### References

**CRUD Operations**:
- Create, list, update, soft delete, restore from trash
- Canonical storage (lean schema) + `sourceRaw` (provenance)
- Core metadata: title (required), authors, year, venue, DOI, ISBN, URL, tags, collections, citation key
- Single PDF attachment (file upload via Multer)
- Track flags: `hasPdf`, `deleted`, timestamps

**Import Sources**:
- Crossref by DOI (fetch metadata from API)
- BibTeX (regex-based parser)
- CSL JSON (native parsing)
- RIS (line-by-line parser)

**Export**:
- Simple BibTeX template (citation key, title, authors, year, venue)
- Single reference or bulk export

**Duplicate Detection**:
- Inline check on create/import (synchronous for MVP)
- 3-stage algorithm (ISBN → DOI → Title+Creator)
- Uses `fastest-levenshtein` (15.6x faster than hand-rolled)
- Uses `modern-diacritics` for international name normalization
- Persist candidates in `duplicate_candidates` collection

**PDF Handling**:
- Multipart upload (Multer), store at `./data/bibliography/uploads/<uuid>.pdf`
- Metadata: original filename, storage path, size, MIME type
- Download endpoint: `GET /references/:id/pdf`

#### Collections

- Nested collection tree (parent/child via `parentId`)
- References belong to multiple collections (many-to-many)
- Manual ordering via `position` field
- CRUD operations

#### Tags

- User-scoped tags (global per user)
- Color assignment (hex, max 9 colored tags per user)
- Position for colored tags (1-9, keyboard shortcuts)
- Automatic vs user-created flag
- Bind tags to references (array of tag names)

#### Linked Projects

- Bibliography-specific `ProjectLink` model (not editor's project schema)
- Each project has name, optional external ID, set of linked collection IDs
- Link/unlink collections to projects
- Get all references from linked collections (for editor's citation autocomplete)

#### Search & Filters

- MongoDB aggregation pipeline (no external search engine in MVP)
- Full-text search ($text operator on title, abstract)
- Filters: authors (exact match), year range, venues (regex), tags ($in)
- Facet counts (authors, venues, years)
- Pagination (limit + offset, default 100 items)

#### Duplicate Detection

**3-Stage Algorithm** (from Zotero):
1. **ISBN Match**: Clean ISBN (remove hyphens, normalize), exact match
2. **DOI Match**: Case-insensitive exact match
3. **Title + Creator Match**:
   - Normalize title: Remove diacritics, lowercase, remove punctuation, trim
   - Exact title match + ≥1 creator match (lastName + firstInitial)
   - Verify years within ±1 (if both present)
   - Verify no conflicting DOIs/ISBNs

**Data Structure**: Store `DuplicateCandidate` pairs with match reason, confidence (0-1), resolved status

**Resolution Actions**:
- `Keep Existing`: Mark candidate resolved, keep-existing
- `Keep Both`: Mark resolved, keep-both (not duplicates)
- `Merge Fields`: Merge data into existing, delete duplicate (Phase 1 full implementation)

### 3.2 Out of Scope (MVP)

- Full collaboration/sharing flows (invite, roles enforcement)
- Notes CRUD, PDF annotation
- Bulk operations (multi-select toolbar backend)
- External storage (S3), CDN
- Real-time WebSocket updates
- Advanced duplicate merge UX
- Full-text PDF search (PDF text extraction)
- Elasticsearch/Atlas Search (using MongoDB $text for MVP)
- Background job queue (duplicate detection inline for MVP)

### 3.3 Architecture

**Service Pattern** (IoC/DI with Inversify):
```
src/
├── controllers/         # HTTP handlers (thin layer)
├── services/            # Business logic (ReferenceService, DuplicateService, etc.)
├── models/              # Mongoose schemas
├── routes/              # Express routes
├── middleware/          # Auth, validation, errors
├── utils/               # Logger, helpers
└── config/              # Inversify container, TYPES bindings
```

**Dependency Injection**:
- Inversify container for all services
- `@injectable()` decorators
- `TYPES` constants for bindings
- Constructor injection: `constructor(@inject(TYPES.IDuplicateService) private duplicateService: IDuplicateService)`

**Separation of Concerns**:
- **Controllers**: Handle HTTP, call services, format responses
- **Services**: Business logic, database operations, external APIs
- **Models**: Mongoose schemas, validation, indexes
- **Middleware**: Trust gateway auth, error handling, validation (Zod)

**Authentication**:
- Trust API Gateway headers (`x-user-id`)
- No JWT validation in service (gateway handles it)
- Middleware: `trustGatewayAuth` (extracts userId from header)

**Logging**:
- Winston structured JSON logging
- Levels: error, warn, info, debug
- File transports + console
- Log all operations with context (userId, referenceId, etc.)

**Error Handling**:
- Centralized error middleware
- Custom error classes (NotFoundError, ValidationError)
- Return `{ success: boolean, message: string, data?: any }`

### 3.4 Non-Functional Requirements

**Testing**:
- Unit tests (all services, >80% coverage)
- Integration tests (all endpoints with mongodb-memory-server)
- Performance testing (index verification, query optimization)

**Validation**:
- Zod schemas for all request bodies (MVP)
- Zod migration in Phase 2 (shared schemas with frontend)

**Database**:
- MongoDB with Mongoose ODM
- Indexes: userId, deleted, doi, title (text), collectionIds, tags
- Timestamps: createdAt, updatedAt (automatic)

**Environment**:
```env
PORT=8005
MONGODB_URL=mongodb://localhost:27017/bibliography
REDIS_URL=redis://localhost:6379  # Phase 2
UPLOAD_PATH=./data/bibliography/uploads
CROSSREF_API_URL=https://api.crossref.org
NODE_ENV=development
TRUST_GATEWAY_AUTH=true
```

**Docker**:
- Dockerfile matching other services
- docker-compose with distinct port (8005)
- Volume for uploads: `./data/bibliography/uploads`

---

## 4. Data Models (Unified)

### 4.1 Reference

**Primary model** for storing bibliographic metadata.

```typescript
interface Reference {
  _id: ObjectId
  userId: string                    // Owner

  // Required fields
  type: 'article' | 'book' | 'chapter' | 'conference' | 'thesis' | 'other'
  title: string                     // REQUIRED (only required field per Zotero)

  // Optional metadata
  authors: Array<{
    given: string                   // First name
    family: string                  // Last name
    full: string                    // Auto-generated: "Family, Given"
  }>
  year: number
  venue: string                     // Journal/conference name
  doi: string
  isbn: string                      // For books, duplicate detection
  url: string
  abstract: string                  // Phase 2

  // Organization
  tags: string[]                    // Array of tag names
  collectionIds: ObjectId[]         // Many-to-many with collections

  // Citation
  citationKey: string               // Auto-generated: lastName + year + titleWord

  // Attachment (MVP: single PDF)
  hasPdf: boolean
  pdf: {
    storedPath: string              // E.g., ./data/bibliography/uploads/abc123.pdf
    originalName: string            // User's original filename
    size: number                    // Bytes
    mimeType: string                // E.g., application/pdf
    uploadedAt: Date
  } | null

  // Provenance
  sourceRaw: {
    provider: 'doi' | 'bibtex' | 'csl-json' | 'ris' | 'manual'
    payload: any                    // Original metadata from source
  }

  // Soft delete
  deleted: boolean                  // Default: false
  deletedAt: Date | null

  // Timestamps
  createdAt: Date                   // Mongoose automatic
  updatedAt: Date                   // Mongoose automatic
}
```

**Indexes**:
- `{ userId: 1, deleted: 1 }` — List user's references
- `{ userId: 1, collectionIds: 1 }` — Filter by collection
- `{ userId: 1, tags: 1 }` — Filter by tag
- `{ doi: 1 }` — Duplicate detection (DOI match)
- `{ isbn: 1 }` — Duplicate detection (ISBN match)
- `{ title: 'text', abstract: 'text' }` — Full-text search

**Validation** (Zod MVP, Zod Phase 2):
```typescript
const createReferenceSchema = Joi.object({
  type: Joi.string().valid('article', 'book', 'chapter', 'conference', 'thesis', 'other').required(),
  title: Joi.string().min(1).required(),
  authors: Joi.array().items(Joi.object({
    given: Joi.string().allow('').optional(),
    family: Joi.string().allow('').optional()
  })).optional(),
  year: Joi.number().integer().min(1000).max(2100).optional(),
  venue: Joi.string().optional(),
  doi: Joi.string().regex(/^10\.\d{4,}\/\S+$/).optional(),
  isbn: Joi.string().optional(),
  url: Joi.string().uri().optional(),
  tags: Joi.array().items(Joi.string()).optional()
})
```

### 4.2 Collection

**Hierarchical organization** of references.

```typescript
interface Collection {
  _id: ObjectId
  userId: string
  name: string
  parentId: ObjectId | null         // For nesting (null = root level)
  position: number                  // Manual ordering within parent
  color: string | null              // Hex color (e.g., #04E39E) - Phase 1
  deleted: boolean                  // Soft delete
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}
```

**Indexes**:
- `{ userId: 1, parentId: 1, position: 1 }` — Tree traversal
- `{ userId: 1, deleted: 1 }` — Filter deleted collections

**Validation**:
```typescript
const createCollectionSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  parentId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  position: Joi.number().integer().min(0).optional()
})
```

### 4.3 Tag

**User-scoped tags** for categorization and filtering.

```typescript
interface Tag {
  _id: ObjectId
  userId: string
  name: string                      // UNIQUE per user
  color: string | null              // Hex color, max 9 colored tags per user
  position: number | null           // 1-9 for colored tags (keyboard shortcut position)
  automatic: boolean                // Auto-created from import vs user-created
  usageCount: number                // Phase 1: count of references with this tag
  createdAt: Date
  updatedAt: Date
}
```

**Indexes**:
- `{ userId: 1, name: 1 }` — Unique constraint
- `{ userId: 1, color: 1 }` — Find colored tags

**Validation**:
```typescript
const createTagSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  color: Joi.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  position: Joi.number().integer().min(1).max(9).optional()
})

const updateTagColorSchema = Joi.object({
  color: Joi.string().regex(/^#[0-9A-Fa-f]{6}$/).allow(null).required(),
  position: Joi.number().integer().min(1).max(9).allow(null).required()
})
```

**Max Colored Tags Enforcement**:
```typescript
// In TagService.updateColor
const coloredTagsCount = await Tag.countDocuments({
  userId,
  color: { $ne: null },
  name: { $ne: name }  // Exclude current tag
})

if (coloredTagsCount >= 9) {
  throw new Error('MAX_COLORED_TAGS: Cannot have more than 9 colored tags')
}
```

### 4.4 ProjectLink

**Bibliography-specific project model** (not the editor's project schema).

```typescript
interface ProjectLink {
  _id: ObjectId
  userId: string
  projectId: string                 // Editor's project ID (or local ID if standalone)
  referenceId?: ObjectId            // Optional: Link individual reference to project
  collectionId?: ObjectId           // Optional: Link entire collection to project
  createdAt: Date
  updatedAt: Date
}
```

**Validation Hook** (exactly one of referenceId or collectionId must be set):
```typescript
ProjectLinkSchema.pre('save', function(next) {
  const hasRef = !!this.referenceId
  const hasColl = !!this.collectionId
  if (hasRef === hasColl) {
    next(new Error('ProjectLink must have exactly one of referenceId or collectionId'))
  } else {
    next()
  }
})
```

**Indexes**:
- `{ userId: 1, projectId: 1 }` — List project links
- `{ userId: 1, collectionId: 1 }` — Find collections linked to projects
- `{ userId: 1, referenceId: 1 }` — Find references linked to projects

**Validation**:
```typescript
const linkCollectionSchema = Joi.object({
  collectionId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
})

const linkReferenceSchema = Joi.object({
  referenceId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
})
```

### 4.5 DuplicateCandidate

**Tracking potential duplicates** for user resolution.

```typescript
interface DuplicateCandidate {
  _id: ObjectId
  userId: string
  existingReferenceId: ObjectId    // Original/existing reference
  duplicateReferenceId: ObjectId   // Potential duplicate (new import)
  matchReason: 'isbn' | 'doi' | 'title-creator'
  confidence: number               // 0-1 score (1.0 for ISBN/DOI, 0.85-1.0 for title+creator)
  resolved: boolean                // User has made a decision
  resolution: 'keep-existing' | 'merge' | 'keep-both' | null
  resolvedAt: Date | null
  createdAt: Date
}
```

**Indexes**:
- `{ userId: 1, resolved: 1 }` — List pending duplicates
- `{ userId: 1, existingReferenceId: 1 }` — Find duplicates for reference
- `{ userId: 1, duplicateReferenceId: 1 }` — Check if reference is a duplicate

**Validation**:
```typescript
const resolveDuplicateSchema = Joi.object({
  duplicateId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  action: Joi.string().valid('keep-existing', 'keep-both', 'merge').required()
})
```

---

## 5. Integration Points

### 5.1 Frontend ↔ Backend API

**Base URL**: `VITE_API_BASE_URL` environment variable (default: `http://localhost:8005/api/bibliography`)

**Authentication**:
1. User logs in via auth service (or dedicated bibliography login)
2. Frontend receives JWT token
3. Store token in localStorage + auth.store
4. **API Client**: Fetch-based `apiClient` class automatically injects token in all requests:
   ```typescript
   // src/common/api/client.ts
   class ApiClient {
     async get<T>(url: string) { /* auto-injects Authorization header */ }
     async post<T>(url: string, data: any) { /* auto-injects Authorization header */ }
   }
   ```
5. API Gateway validates JWT, forwards `x-user-id` header to bibliography service
6. Bibliography service trusts `x-user-id` (no JWT validation)

**Error Handling**:
- Backend returns: `{ success: boolean, message: string, data?: any, code?: string }`
- Frontend shows toast on error
- 401 → Redirect to login
- 429 → Rate limit error (show retry-after)
- 500 → Generic error toast

### 5.2 Backend ↔ Crossref API

**DOI Import**:
- Endpoint: `https://api.crossref.org/works/{doi}`
- User agent: `Bibliography-Manager/1.0 (mailto:user@example.com)`
- Rate limiting: Public polite pool (max 50 req/sec)
- Mapping: Crossref JSON → Reference schema
- Store original payload in `sourceRaw.payload`

**Error Handling**:
- 404: DOI not found → Return error to frontend
- 429: Rate limited → Retry with exponential backoff
- 500: Crossref error → Return error to frontend

### 5.3 Backend ↔ Editor (Future Phase 2)

**Citation Insertion Flow**:
1. User in editor types `\cite{` → autocomplete triggered
2. Editor sends: `GET /api/bibliography/projects/:projectId/references`
3. Bibliography service returns all references from linked collections
4. Editor shows dropdown with reference titles
5. User selects → Editor inserts `\cite{citationKey}`

**Live Sync** (WebSocket, Phase 2):
- Event: `reference:updated` → Editor refetches project references
- Ensures bibliography changes reflect in editor citations

### 5.4 Frontend ↔ Editor (Future Phase 2)

**Shared Components** (potential optimization):
- Extract common UI components to `@bibliography/ui` package
- Editor imports: `import { Button, Modal } from '@bibliography/ui'`
- Reduces duplication, ensures consistency

**Shared Types** (with Zod, Phase 2):
- Create `@bibliography/types` package
- Share Zod schemas between frontend and backend
- Type inference for all requests/responses

---

## 6. Open Items & Product Questions

### For Backend Team
- [ ] Confirm API Gateway auth header format (`x-user-id` vs `Authorization: Bearer`)
- [ ] Verify duplicate detection runs automatically on import (implemented: YES)
- [ ] Clarify PDF storage path (`./data/bibliography/uploads/` confirmed)
- [ ] Confirm pagination limits (100 per page reasonable?)

### For Editor Team
- [ ] Timeline for bibliography-editor integration (Phase 2 target)
- [ ] Auth flow: Shared login page or separate?
- [ ] Can we reuse any editor components directly (or just copy patterns)?
- [ ] Project model: Use editor's project schema or bibliography's ProjectLink?

### For Design Team
- [ ] Confirm dark theme colors match Figma exactly (especially accent green #04E39E)
- [ ] Empty state designs (no references, no search results, etc.)
- [ ] Loading state preferences (spinners vs skeletons for MVP)

### For Product
- [ ] Prioritization: Manual collection ordering in Phase 1 or Phase 2? (Current: Phase 2)
- [ ] Confirm offline support deferred to Phase 2 (Current: YES)
- [ ] Should we add analytics/telemetry to MVP? (Mixpanel, PostHog?)
- [ ] Trash retention period? (Current: No auto-purge, user manually empties)
- [ ] Group Libraries data source? (Current: Stub returns empty array)

### Technical Decisions Pending
- [ ] Import error reporting: Partial failure handling strategy (Current: Skip invalid, show summary)
- [ ] Citation format: Use `citation-js` or `citeproc`? (Phase 2 decision)
- [ ] Search upgrade: Elasticsearch or MongoDB Atlas Search? (Phase 2 decision)
- [ ] Storage upgrade: AWS S3, MinIO, or other? (Phase 2 decision)
- [ ] Background jobs: BullMQ, Temporal, or manual queue? (Phase 2 decision)

---

## 7. Handover Notes

### For Developers Starting Work

**Before Starting**:
1. Read **root CLAUDE.md** — Project overview, team context, coding philosophy
2. Read **Roadmap.md** — Phased timeline, understand where you are (Phase 0 MVP)
3. Read **this Spec.md** — Full feature requirements
4. Check **UnifiedImplementationChecklist.md** — Session-by-session tasks

**Reference Codebases**:
- **Editor patterns**: `/home/mahdi/Desktop/bibliography/editor_frontend/` and `/home/mahdi/Desktop/bibliography/editor_backend/services/`
- **Zotero reference**: `zotero/`

**Always Follow**:
- ✅ Check editor first (copy patterns)
- ✅ Check Zotero second (UI/UX reference)
- ✅ Document deviations from Zotero (code comments)
- ✅ Write tests (comprehensive coverage)
- ✅ Match tech stack exactly

### For QA Team

**Test Environments**:
- Local: `http://localhost:5173` (frontend), `http://localhost:8005` (backend)
- Staging: TBD
- Production: TBD

**Test Accounts**:
- Create test users via auth service (or seed script)
- Test data: Seed script with 2 references, nested collections

**Critical Paths to Test**:
1. Import DOI → View details → Add to collection → Export BibTeX
2. Import BibTeX with duplicates → Resolve → Verify merged
3. Delete reference → Trash → Restore → Verify in library
4. Create reference → Upload PDF → View in PDF tab
5. Search by title → Filter by year → Export selected

**Browsers to Test**:
- Chrome 120+, Firefox 120+, Safari 17+, Edge 120+

**Accessibility to Verify**:
- Keyboard navigation (Tab, Enter, ESC, Arrows)
- Screen reader (VoiceOver, NVDA)
- Color contrast (Lighthouse audit)

### For Deployment Team

**Environment Variables** (see `.env.example`):
```env
# Frontend
VITE_API_BASE_URL=http://localhost:8005/api/bibliography

# Backend
PORT=8005
MONGODB_URL=mongodb://localhost:27017/bibliography
REDIS_URL=redis://localhost:6379  # Phase 2
UPLOAD_PATH=./data/bibliography/uploads
CROSSREF_API_URL=https://api.crossref.org
NODE_ENV=development
TRUST_GATEWAY_AUTH=true
```

**Docker**:
- Bibliography service in `docker-compose.yml` (port 8005)
- Volume: `./data/bibliography/uploads`
- Health check: `GET /api/bibliography/health`

**Database**:
- MongoDB database: `bibliography`
- Collections: `references`, `collections`, `tags`, `projectlinks`, `duplicatecandidates`
- Indexes created automatically by Mongoose (see data models above)

**Backup Strategy** (Phase 3):
- Daily automated backups
- 30-day retention
- Disaster recovery plan

---

## 8. Glossary

**For Non-Developer Team Members:**

- **React Query (TanStack Query)**: Library that manages server data (fetching, caching, updating). Automatically refetches when data becomes stale.
- **Zustand**: Lightweight state management. Think of it as a global store where components can read/write shared state.
- **CVA (class-variance-authority)**: Tool for creating component variants with Tailwind. Example: Button can be "primary" or "secondary" variant.
- **TanStack Router**: Type-safe routing library. Ensures URLs and navigation are correct at compile-time.
- **TanStack Table**: Headless table component. Handles sorting, filtering, selection without imposing UI.
- **Headless UI**: Accessible components without styling (Modal, Dropdown, Tabs). We add our own Tailwind styles.
- **Debounce**: Delay action until user stops typing. Example: Search updates 300ms after last keystroke (reduces API calls).
- **Optimistic Update**: Show UI change immediately, before server confirms. Example: Delete reference → remove from table instantly, revert if server errors.
- **Lazy Loading**: Load code only when needed. Example: Search page code downloads when user navigates to /search.
- **Virtual Scrolling**: Render only visible rows in large tables. Example: 10,000 references, but only 20 rendered at a time.
- **Soft Delete**: Mark as deleted (flag) without removing from database. Allows restore/undo.
- **Hard Delete**: Permanently remove from database. Cannot be undone.
- **CSL JSON**: Citation Style Language JSON format. Standard for academic references, Zotero native format.
- **BibTeX**: Citation format for LaTeX documents. Most common in academic writing.
- **RIS**: Citation format used by many databases (PubMed, Web of Science, etc.).
- **Crossref**: API service that provides metadata for DOIs.
- **DOI**: Digital Object Identifier. Unique ID for academic papers (e.g., 10.1234/example).
- **ISBN**: International Standard Book Number. Unique ID for books.
- **Mongoose**: MongoDB ODM (Object Document Mapper). Maps JavaScript objects to MongoDB documents.
- **Joi**: Validation library. Defines schemas for request bodies (MVP approach).
- **Zod**: Type-safe schema validation. Frontend validation + Phase 2 backend migration.
- **Inversify**: Dependency injection framework. Manages service dependencies (advanced IoC pattern).
- **Multer**: Express middleware for handling multipart/form-data (file uploads).
- **Winston**: Logging library. Structured JSON logging for production.

---

**Document Metadata**:
- Version: 2.0 (Unified)
- Date: 2025-01-08
- Author: Claude (Anthropic)
- Status: Complete specification for MVP development
- Next Steps: Begin implementation using UnifiedImplementationChecklist.md

---

**End of Specification**
