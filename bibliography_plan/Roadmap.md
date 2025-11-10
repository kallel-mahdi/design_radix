# Bibliography Manager — Development Roadmap

**Last Updated**: 2025-01-08
**Status**: Unified roadmap (Frontend + Backend)

---

## Overview

This roadmap outlines the phased development timeline for the complete bibliography manager (frontend + backend). Development is organized into 4 phases, prioritizing core functionality (MVP) before adding advanced features and production polish.

**Total Estimated Time**: 11-12 weeks (full-time equivalent)

---

## Phase 0: MVP — Core Bibliography Management

**Duration**: 4 weeks
**Frontend**: 165-200 hours | **Backend**: 80-120 hours | **Total**: 245-320 hours

**Goal**: Deliver a functional bibliography manager with essential features for reference management, organization, and basic import/export.

**Target Users**: Individual researchers who need to manage references, organize them in collections, and export to BibTeX for LaTeX documents.

**Success Criteria**:
- Can import references via DOI, BibTeX, CSL JSON, RIS
- Can manually create/edit references
- Can organize references in nested collections
- Can tag and color-code tags (9 max)
- Can detect and resolve duplicates automatically on import
- Can search and filter references in real-time
- Can export references to BibTeX format
- Can upload and view PDFs (simple iframe viewer)
- Can link collections to projects (for future editor integration)
- Responsive, accessible, tested (unit + integration + E2E)

---

### Week 1: Foundation & Setup

**Focus**: Project infrastructure, database models, core UI layout, UI primitives

#### Frontend Deliverables (35-40 hours)
- [x] Vite + React 19 project setup
- [x] TanStack Router configuration (file-based routes)
- [x] Tailwind CSS 4 setup with dark theme extension
- [x] ESLint + Prettier configuration (match editor)
- [x] `AppLayout` component (4-column grid: ActivityBar | Sidebar | MainPane | DetailsPane)
- [x] `ActivityBar` component (6 icons, active state, badge support)
- [x] Sidebar container (resizable, persist width to localStorage)
- [x] Routing structure (`/library`, `/search`, `/projects`, `/duplicates`)
- [x] UI primitives: Button, Input, Modal, Checkbox, Toggle, Tag (with CVA variants)
- [x] Global Zustand stores: `ui.store.ts` (theme, panels, modals, toasts), `auth.store.ts`

**Testing**: Manual QA of layout responsiveness, theme switching

#### Backend Deliverables (15-20 hours)
- [x] Project setup & infrastructure (Winston logger, error handling, Docker)
- [x] Mongoose models: Reference, Collection, Tag, ProjectLink, DuplicateCandidate
- [x] Database indexes (userId, deleted, doi, etc.)
- [x] Health check endpoint
- [x] Basic route scaffolding
- [x] Trust gateway auth middleware

**Testing**: Health check passes, models compile, Docker up successfully

---

### Week 2: Library View & Reference CRUD

**Focus**: Reference table, details pane, create/edit functionality, API integration

#### Frontend Deliverables (45-55 hours)
- [x] `ReferenceTable` component (TanStack React Table)
  - Sortable columns: Title | Authors | Year | Venue | Tags | Files | DOI
  - Multi-select (Cmd/Ctrl+Click, Shift+Click range, checkbox column)
  - CVA row variants (default, selected, hasPdf)
  - Keyboard navigation (arrows)
- [x] `ReferenceCard` component (adapt from editor TaskCard)
  - Metadata display with badges
  - Edit/delete buttons
- [x] `ReferenceModal` component (adapt from editor TaskModal)
  - react-hook-form + Zod validation
  - Fields: type, title (required), authors (dynamic array), year, venue, DOI, URL, tags
  - Create vs Edit mode
- [x] `TreeView` + `TreeNode` components (recursive collection tree)
  - Expand/collapse state (persist to localStorage)
  - Item count badges
  - Manual ordering (position field)
  - Right-click menu placeholder (Phase 1)
- [x] `TagSelector` component
  - Tag list with search box
  - Click to filter references
  - Color picker integration (9 max colors)
  - Settings menu (gear icon)
- [x] `DetailsPane` component
  - Tabs: Info | PDF | Notes
  - Auto-open on reference click
  - Info tab: Editable metadata (inline or modal)
  - PDF tab: iframe viewer (`<iframe src={pdfUrl}>`)
  - Notes tab: Placeholder ("Coming in Phase 2")
  - Resizable width (persist)
- [x] `library.store.ts`: Selection, active reference, sorting, modals
- [x] API integration: `references.queries.ts`, `collections.queries.ts`, `tags.queries.ts`
  - useReferencesQuery, useCreateReferenceMutation, useUpdateReferenceMutation, useDeleteReferenceMutation
  - useCollectionsQuery, useCreateCollectionMutation
  - useTagsQuery, useSetTagColorMutation
- [x] `apiClient.ts`: Axios wrapper with auth injection, error handling (copy from editor)

**Testing**:
- Unit: Zod schema validation
- Integration: Create reference → Save → Verify in table, Edit reference → Update → Verify
- E2E: Full CRUD flow

#### Backend Deliverables (20-30 hours)
- [x] `ReferenceService`: CRUD operations (create, getById, list, update, softDelete, restore)
- [x] `ReferenceController`: HTTP handlers for all Reference routes
- [x] Reference routes with Joi validation
- [x] `CollectionService`: Tree structure queries, position management
- [x] `CollectionController` + routes
- [x] `TagService`: CRUD, max 9 colored tags enforcement, rename cascade
- [x] `TagController` + routes (including `PATCH /tags/:name/color`)
- [x] Citation key generation (lastName + year + titleWord)

**Testing**:
- Unit: Service methods (create, update, list with filters)
- Integration: Full API endpoints (POST, GET, PATCH, DELETE)

---

### Week 3: Search, Import/Export, Projects, Duplicates (Backend)

**Focus**: Advanced search with filters, multi-format import, BibTeX export, project linking, duplicate detection

#### Frontend Deliverables (40-50 hours)
- [x] `SearchPage` layout
- [x] `SearchBar` component (real-time debounced search, 300ms)
- [x] `FilterPanel` component
  - `AuthorFilter`: Checkbox list with search, multi-select
  - `YearRangeFilter`: Dual-thumb slider + manual input
  - `VenueFilter`: Checkbox list with counts
  - `TagFilter`: Checkbox list with colored tags
  - Clear All Filters button
- [x] `SearchResults` component (reuses ReferenceTable)
- [x] `search.store.ts`: Query, debounced query, filters state
- [x] `useSearchQuery` hook with debouncing
- [x] `ProjectsPage` layout
- [x] `ProjectList` component (expandable, shows linked collections)
- [x] `LinkedCollections` component (ON/OFF toggles per collection)
- [x] `ProjectReferences` component (read-only reference preview)
- [x] `projects.store.ts`: Selected project, linked collections
- [x] `projects.queries.ts`: useProjectsQuery, useLinkCollectionMutation, useUnlinkCollectionMutation
- [x] `ImportModal` component
  - Tabs: DOI | File Upload
  - DOI tab: Input + Fetch button → Preview → Add
  - File tab: Drag-drop zone + browse button + paste textarea
  - Format auto-detection (BibTeX, CSL JSON, RIS)
  - Preview table with select all/none
  - Progress bar for large imports
  - Error handling: Skip invalid, show summary
- [x] Import mutations: useImportDoiMutation, useImportBibTeXMutation, useImportCSLJSONMutation, useImportRISMutation
- [x] `ExportBibTeX` functionality
  - Toolbar dropdown: Export All | Export Collection | Export Selected
  - Right-click menu integration
  - useExportBibTeXMutation
  - Blob download

**Testing**:
- Unit: Debounce hook, filter state management
- Integration: Search flow, Import BibTeX → Preview → Import → Verify, Export → Check file
- E2E: Full search + export flow

#### Backend Deliverables (25-35 hours)
- [x] `SearchService`: MongoDB aggregation pipeline for search + filters
  - Full-text search ($text operator)
  - Author filter (exact match array)
  - Year range filter ($gte, $lte)
  - Venue filter (regex, case-insensitive)
  - Tag filter ($in array)
  - Facet counts (authors, venues, years)
- [x] Search routes + controller
- [x] `ProjectLinkService`: Link/unlink collections to projects, nested resolution
- [x] ProjectLink routes + controller (reference AND collection linking)
- [x] `DuplicateService`: 3-stage detection algorithm
  - Stage 1: ISBN match (exact, normalized)
  - Stage 2: DOI match (case-insensitive)
  - Stage 3: Title + Creator match (fuzzy with fastest-levenshtein)
  - Uses `fastest-levenshtein` (15.6x faster than hand-rolled)
  - Uses `modern-diacritics` for international name normalization
- [x] Duplicate detection wired to ReferenceService (async trigger on create)
- [x] `DuplicateController` + routes (list, resolve, refresh)
- [x] Crossref DOI import (API integration)
- [x] BibTeX parser (simple regex-based)
- [x] CSL JSON import (native parsing)
- [x] RIS parser (line-by-line)
- [x] BibTeX exporter (template-based formatting)
- [x] Import/export routes + controllers

**Testing**:
- Unit: Duplicate detection stages (ISBN, DOI, Title+Creator with fixtures)
- Unit: BibTeX parser edge cases
- Integration: Import DOI → Verify reference created, Detect duplicates → Verify candidates
- Integration: Export BibTeX → Verify format

---

### Week 4: PDF Upload, Trash, Duplicates UI, Polish & Testing

**Focus**: Duplicate detection UI, trash/restore, comprehensive testing, bug fixes

#### Frontend Deliverables (45-55 hours)
- [x] `DuplicatesPage` layout
- [x] `DuplicateCard` component
  - Two-column comparison (Existing | New)
  - Diff highlighting (blue text for differences)
  - Actions: Keep Existing (green) | Merge Fields (dropdown)
- [x] `MergeModal` component
  - Field-by-field comparison
  - Radio buttons to select values
  - Preview merged result
  - Merge & Save button
- [x] `duplicates.store.ts`: Active group, counts, merge modal state
- [x] `duplicates.queries.ts`: useDuplicatesQuery, useResolveDuplicateMutation
- [x] Automatic duplicate detection on import (backend integration)
- [x] Badge on Duplicates icon in ActivityBar (shows count)
- [x] `TrashView` component
  - Special collection view (deleted: true)
  - Restore action column
  - Empty Trash button
- [x] Trash/Restore functionality
  - Soft delete (deleted flag + deletedAt timestamp)
  - Confirmation dialogs (match Zotero patterns)
  - useRestoreReferenceMutation
  - Trash icon shows full/empty state
- [x] PDF upload functionality
  - File picker in ReferenceModal
  - useUploadPdfMutation (multipart/form-data)
  - Show filename when uploaded
- [x] Toast notifications (top-right)
  - Success, error, warning, info types
  - Auto-dismiss (3s default)
  - Close button
- [x] Empty states (Icon + text + CTA)
  - No references in library
  - No search results
  - No duplicates
  - No PDF attached
- [x] Loading states (simple spinners for MVP)
- [x] Keyboard shortcuts (essential set)
  - Cmd/Ctrl+N: New Reference
  - Cmd/Ctrl+F: Focus Search
  - Delete: Move to Trash
  - ESC: Close modal/pane
  - Arrows: Navigate selection
- [x] Comprehensive testing
  - Unit tests: Utils, hooks, stores (Vitest)
  - Integration tests: Workflows (React Testing Library)
  - E2E tests: Critical paths (Playwright)
    - Login → Import DOI → View → Add to collection → Export
    - Import duplicate → Resolve → Verify
    - Delete → Trash → Restore
- [x] Bug fixes from testing
- [x] Performance optimization (memoization, query caching)
- [x] Accessibility audit (keyboard nav, ARIA, contrast)

**Testing**:
- All test suites passing
- Coverage: 80%+ for critical paths
- Lighthouse score: 90+ (Performance, Accessibility, Best Practices)

#### Backend Deliverables (20-25 hours)
- [x] Multer configuration for PDF upload
- [x] File validation (MIME type, size limits)
- [x] Storage path management
- [x] PDF upload/download routes + controller
- [x] Duplicate resolution actions (keep-existing, merge, keep-both)
- [x] Trash management (soft delete, restore, permanent delete)
- [x] Unit test suite (all services, >80% coverage)
- [x] Integration test suite (all API endpoints with mongodb-memory-server)
- [x] Performance testing (index verification, query optimization)
- [x] Logging review (structured JSON, appropriate levels)

**Testing**:
- Unit: All service methods
- Integration: All endpoints (happy path + error cases)
- E2E: Full import → detect → resolve flow

---

**Phase 0 Total**: 245-320 hours (4-5 weeks full-time)

**Deployment**: MVP to staging environment, internal QA by team

---

## Phase 1: Enhanced Interactions & Security

**Duration**: 2 weeks
**Frontend**: 70-90 hours | **Backend**: 60-80 hours | **Total**: 130-170 hours

**Goal**: Add productivity features, security hardening, polish UX, improve discoverability

**Target Users**: Power users who manage large libraries (1000+ references), security-conscious teams

### Frontend Enhancements (70-90 hours)

**Productivity Features**:
- [ ] Comprehensive keyboard shortcuts
  - Document full Zotero shortcut map
  - Implement: Cmd+E (export), Cmd+Shift+I (import), Cmd+Shift+C (copy citation placeholder)
  - Keyboard shortcuts overlay (press ? to show)
  - Custom shortcut configuration (Phase 3)
- [ ] Context menus (right-click)
  - Reference context menu: Edit, Delete, Add to Collection, Remove from Collection, Export, Duplicate Check
  - Collection context menu: New Subcollection, Rename, Delete, Export Collection
  - Tag context menu: Rename, Assign Color, Delete
- [ ] Drag-drop functionality
  - Drag references to collections (add to collection)
  - Drag references to tags (assign tag)
  - Drag to reorder collections (manual position)
  - Drag to reorder authors in edit modal
- [ ] Bulk operations
  - Toolbar appears when multiple references selected
  - Actions: Delete, Add to Collection, Remove from Collection, Add Tags, Remove Tags, Export
  - Bulk duplicate check (select multiple → Find Duplicates)
- [ ] Manual reference ordering within collections
  - Add orderIndex field to collectionItems
  - Drag-drop to reorder in table
  - Sort mode toggle (alphabetical vs manual)
- [ ] Light theme
  - Extend Tailwind config with light mode colors
  - Theme toggle in user menu (top-right)
  - Persist theme preference
- [ ] Collection tree enhancements
  - Drag-drop to move collections (nest/unnest)
  - Collection icons (different icons for collection types, Phase 2)
  - Collection color customization (Phase 2)
- [ ] Reference table enhancements
  - Column visibility toggles (hide/show columns)
  - Column reordering (drag column headers)
  - Column width persistence
  - Compact vs Comfortable view modes
- [ ] Tag management improvements
  - Dedicated Tag Manager modal (full CRUD)
  - Tag merge functionality (combine similar tags)
  - Tag rename (with confirmation, updates all references)
  - Bulk tag operations (delete multiple tags)
- [ ] Additional export formats
  - CSL JSON export (Zotero compatibility)
  - RIS export (database compatibility)
  - JSON export (full data dump)
  - CSV export (spreadsheet integration)

**Performance Optimizations**:
- [ ] Virtual scrolling for 10k+ references (TanStack Virtual)
- [ ] Code splitting (lazy load routes)
- [ ] Image optimization
- [ ] React.memo for expensive components

**Testing**:
- Regression testing (ensure MVP features still work)
- Performance testing (large library benchmark)
- Accessibility re-audit

### Backend Enhancements (60-80 hours)

**Security Hardening**:
- [ ] Input sanitization (`express-mongo-sanitize` wiring)
  - Add middleware before route handlers
  - Prevent NoSQL injection ($, . removal from user input)
- [ ] Helmet CSP configuration
  - Content-Security-Policy for PDF iframe
  - HSTS headers (max-age 31536000, includeSubDomains)
  - X-Frame-Options, X-Content-Type-Options
  - Configure allowlist for iframes (PDF viewer)
- [ ] Rate limiting enhancement
  - Per-endpoint rate limits (import: 10/min, search: 100/min)
  - IP-based limiting for unauthenticated requests
  - Sliding window algorithm
- [ ] HttpOnly cookie JWT storage (upgrade from localStorage)
  - Set httpOnly, secure, sameSite: strict
  - Token refresh flow
  - Logout endpoint (clear cookie)
- [ ] Validation improvements
  - Complete Joi schemas for all endpoints (see APIDesignSystem.md updates)
  - Request payload size limits
  - File upload MIME type enforcement
  - DOI format validation

**API Enhancements**:
- [ ] Pagination improvements
  - Cursor-based pagination for large datasets
  - Total count optimization (avoid full count queries)
  - Page size limits (max 100 items per request)
- [ ] Bulk operations support
  - `POST /references/bulk-delete` (soft delete multiple)
  - `PATCH /references/bulk-update-tags` (add/remove tags from multiple)
  - Transaction support for atomicity
- [ ] Import error reporting
  - Partial failure handling (some succeed, some fail)
  - Detailed error messages per failed item
  - Return success + failure arrays
- [ ] Duplicate grouping improvements
  - Return confidence scores with candidates
  - Group by match type (ISBN, DOI, Title+Creator)
  - Pagination for duplicate list

**Performance**:
- [ ] Query optimization
  - Analyze slow queries (MongoDB profiler)
  - Add missing indexes based on usage
  - Projection optimization (only return needed fields)
- [ ] Caching strategy
  - Redis integration for frequently accessed data (tags list, collection tree)
  - Cache invalidation on mutations
  - TTL configuration per entity type

**Testing**:
- Security testing (XSS, CSRF, NoSQL injection attempts)
- Load testing (1000 concurrent users)
- Performance benchmarks (p95 latency < 200ms)

**Est. Time**: 60-80 hours

---

**Phase 1 Total**: 130-170 hours (2 weeks full-time)

**Deployment**: Phase 1 to production, beta users invited

---

## Phase 2: Advanced Features & Collaboration

**Duration**: 3 weeks
**Frontend**: 120-150 hours | **Backend**: 100-120 hours | **Total**: 220-270 hours

**Goal**: Add collaboration, advanced PDF features, notes, offline support, citation formatting

**Target Users**: Teams collaborating on research projects, users needing offline access, users requiring formatted citations

### Frontend Enhancements (120-150 hours)

**Collaboration Features**:
- [ ] Sharing/collaboration UI
  - Share collection with team members
  - Invite collaborators (email + role)
  - Collaborator table (Name | Email | Role | Actions)
  - Permission levels: Viewer, Editor, Admin
  - Ownership transfer
  - Shared collections indicator (icon)
- [ ] Real-time sync indicators
  - Show when collaborators edit
  - Conflict resolution UI (manual merge)
  - Sync status in status bar

**Notes System**:
- [ ] Notes CRUD
  - Rich text editor (TipTap or similar)
  - Create/edit/delete notes on references
  - Notes tab in DetailsPane (full implementation)
  - Notes sync across collaborators
  - Notes search (full-text)

**Advanced PDF Viewer**:
- [ ] Enhance react-pdf viewer (MVP has basic version, Phase 2 adds advanced features)
  - Search within PDF (highlight matches)
  - Page thumbnails sidebar
  - Full-screen mode
  - Persistent scroll position
  - Annotations and highlighting (TODO in Phase 2.5)
- [ ] Auto-fetch PDFs from open access
  - Unpaywall API integration (check for OA versions)
  - arXiv API (auto-fetch preprints)
  - PubMed Central (PMC OA papers)
  - "Check for PDF" button in DetailsPane
  - Auto-attach if found, show license info

**Offline Support**:
- [ ] Service Worker for offline caching
- [ ] IndexedDB for local data storage
- [ ] Read-only offline mode (view cached data)
- [ ] Sync queue for offline changes
- [ ] Conflict resolution on reconnect (last-write-wins or manual merge)

**Multiple Attachments**:
- [ ] Array of attachments per reference (PDFs, supplements)
- [ ] Attachment list in DetailsPane
- [ ] Rename attachments
- [ ] Primary attachment designation

**Citation Formatting**:
- [ ] Citation format selector (APA, MLA, Chicago, Harvard)
- [ ] CSL (Citation Style Language) library integration
- [ ] Copy to clipboard button
- [ ] Preview formatted citation

**Advanced Features**:
- [ ] Saved searches
  - Save current search/filter combination
  - Name saved searches
  - Saved searches appear in sidebar (like smart collections)
  - Edit/delete saved searches
- [ ] Full-text PDF search
  - Search results highlight matches in PDF viewer
  - Show matching page previews
- [ ] Bulk duplicate resolution
  - Select multiple duplicate groups
  - Auto-resolve rules (prefer newer, prefer with PDF, etc.)
  - Batch merge with review
- [ ] Advanced import
  - PubMed ID (PMID) import
  - arXiv ID import
  - ISBN import (book metadata)
  - Import from URL (web page metadata extraction)
- [ ] Undo/Redo
  - Global undo/redo stack
  - Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z
  - Undo for: Delete, Edit, Move, Tag operations
  - Visual undo notification with redo option

**Testing**:
- Collaboration workflows (invite, edit shared collection, verify sync)
- Offline testing (disconnect, make changes, reconnect, verify sync)
- PDF viewer testing (large PDFs, search performance)
- Regression suite

**Est. Time**: 120-150 hours

### Backend Enhancements (100-120 hours)

**Zod Migration (Unified Validation)**:
- [ ] Create `bibliography_common` shared package
- [ ] Convert all Joi schemas to Zod (10+ endpoints)
- [ ] Install `zod-express-middleware`
- [ ] Update all routes to use Zod middleware
- [ ] Remove Joi dependency
- [ ] Share schemas between frontend and backend
- [ ] Type inference for all request/response payloads

**Citation Formatting**:
- [ ] `citation-js` integration
  - Install `@citation-js/core` + `@citation-js/plugin-bibtex`
  - Implement CitationFormatter service
  - Support APA, MLA, Chicago, Harvard styles
  - `POST /citations/format` endpoint (accept referenceIds + style)
  - Return formatted citation strings
- [ ] CSL (Citation Style Language) support
  - Integrate `citeproc` library
  - Load CSL style files dynamically
  - Cache formatted citations (Redis)

**Collaboration**:
- [ ] Sharing/collaboration backend
  - SharedCollection model (collectionId, userId, role, permissions)
  - Invite flow (email, token-based confirmation)
  - Permission enforcement (view, edit, admin)
  - Ownership transfer logic
- [ ] WebSocket real-time updates
  - Socket.io or native WebSockets
  - Broadcast reference updates to collaborators
  - Presence indicators (who's online)
  - Optimistic locking for conflict detection
- [ ] Notes CRUD
  - Note model (referenceId, userId, content, createdAt, updatedAt)
  - Rich text storage (HTML or Markdown)
  - Notes endpoints (CRUD)
  - Full-text search in notes

**Advanced Search**:
- [ ] Full-text search upgrade (Elasticsearch or Atlas Search)
  - Migrate from MongoDB $text to Elasticsearch
  - Indexing pipeline (bulk index existing refs, index on create/update)
  - Advanced query DSL (boolean, phrase, fuzzy)
  - Faceted search with counts
  - Search in notes + abstracts + PDFs (Phase 2.5)
- [ ] Saved searches backend
  - SavedSearch model (userId, name, query, filters)
  - CRUD endpoints
  - Execute saved search (returns references)

**PDF Enhancements**:
- [ ] PDF text extraction
  - Use `pdf-parse` library (Node.js)
  - Extract text on upload
  - Store full text in Reference.pdfText field
  - Index for search (Elasticsearch)
- [ ] Multiple PDF attachments
  - Change Reference.pdf from object to array
  - Attachment model (referenceId, filename, path, isPrimary)
  - Upload/download/delete endpoints per attachment
- [ ] Auto-fetch PDFs
  - Unpaywall API integration
  - arXiv API integration
  - PubMed Central API integration
  - `POST /references/:id/auto-fetch-pdf` endpoint
  - License/OA status in response

**Storage Upgrade**:
- [ ] S3 or object storage integration
  - AWS S3 SDK or MinIO
  - Upload PDFs to S3 instead of local volume
  - Signed URLs for download (temporary access)
  - Lifecycle policies (archive old PDFs)
- [ ] File management service
  - Abstract storage layer (local vs S3)
  - Migration script (local → S3)

**Background Jobs**:
- [ ] Job queue (BullMQ or Temporal)
  - Duplicate detection as background job (not inline)
  - Metadata enrichment (fetch DOI metadata for existing refs)
  - PDF text extraction (async)
  - Scheduled tasks (cleanup trash after 30 days)

**Testing**:
- Zod migration verification (all endpoints still work)
- Citation formatting accuracy (compare against Zotero output)
- Collaboration sync testing (multi-user scenarios)
- Elasticsearch indexing performance

**Est. Time**: 100-120 hours

---

**Phase 2 Total**: 220-270 hours (3 weeks full-time)

**Deployment**: Phase 2 to production, full user rollout

---

## Phase 3: Production Polish & Hardening

**Duration**: 2 weeks
**Frontend**: 80-100 hours | **Backend**: 60-80 hours | **Total**: 140-180 hours

**Goal**: Optimize performance, enhance accessibility, full internationalization, production-ready monitoring

**Target Users**: All users, global audience, enterprise deployments

### Frontend Polish (80-100 hours)

**Settings & Configuration**:
- [ ] Settings screens
  - General: Language, theme, default view
  - Shortcuts: Keyboard shortcut customization
  - Storage/Sync: Storage location, sync settings, backup/restore
  - Advanced: Debug mode, reset app data

**Performance Optimization**:
- [ ] Lighthouse audit (target: 95+ all categories)
- [ ] Bundle size analysis + reduction
- [ ] Lazy loading optimizations
- [ ] Image lazy loading with placeholders
- [ ] React Query cache optimization
- [ ] Minimize re-renders (React DevTools Profiler)
- [ ] Web Worker for heavy computations (duplicate detection, search)

**Internationalization**:
- [ ] Full internationalization
  - Complete English translations
  - Add French translations (academic community priority)
  - Add German translations
  - Add Spanish translations
  - Right-to-left (RTL) support (Arabic, Hebrew) - Phase 3.5
  - Number/date formatting per locale
  - Language switcher in settings

**Advanced Accessibility**:
- [ ] Full keyboard navigation (no mouse needed)
- [ ] Screen reader optimization (test with NVDA, JAWS, VoiceOver)
- [ ] High contrast mode
- [ ] Font size customization
- [ ] Reduced motion mode (respect prefers-reduced-motion)
- [ ] ARIA live regions for dynamic updates
- [ ] Skip links (skip to content, skip to navigation)

**UI Polish**:
- [ ] Loading states polish
  - Skeleton screens for all major views
  - Shimmer animation
  - Progressive loading (show partial data, load rest)
  - Optimistic UI for all mutations
  - Retry buttons for failed loads
- [ ] Error boundary
  - Catch React errors gracefully
  - Show error UI with retry option
  - Error reporting to Sentry (optional)
  - Fallback UI for component errors

**Analytics/Telemetry** (optional, with user consent):
- [ ] Usage metrics (which features are used most)
- [ ] Performance metrics (load times, API latency)
- [ ] Error tracking (frontend errors, failed API calls)
- [ ] Privacy-first approach (no PII)
- [ ] Option to opt-out in settings

**Documentation & Onboarding**:
- [ ] User guide (how to import, organize, export)
- [ ] Video tutorials (short screencasts)
- [ ] Keyboard shortcuts reference card (printable PDF)
- [ ] FAQ
- [ ] Troubleshooting guide
- [ ] Welcome screen for new users
- [ ] Interactive tutorial (highlight features)
- [ ] Sample library with example references
- [ ] "Getting Started" checklist
- [ ] Contextual help tooltips (? icons)

**Additional Features**:
- [ ] Status bar (bottom of screen)
  - Reference count (selected / total)
  - Sync status (online/offline, last synced)
  - Duplicate count
  - Quick actions (settings icon)
- [ ] Advanced filters
  - Boolean operators (AND, OR, NOT)
  - Field-specific search (title:foo, author:smith)
  - Date range filters (added, modified)
  - Has PDF filter
  - Has notes filter
  - In collection filter
  - Attachment type filter
- [ ] Browser integration (optional)
  - Browser extension for saving web pages as references
  - Detect DOI on page, save to library
  - Right-click "Save to Bibliography" on links
  - Extension matches Zotero Connector patterns

**Final QA**:
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive testing (tablet, phone)
- [ ] User acceptance testing (UAT) with real researchers

**Testing**:
- All test suites passing
- Performance benchmarks met
- Accessibility WCAG 2.1 AAA compliance
- i18n completeness (no missing translation keys)

**Est. Time**: 80-100 hours

### Backend Hardening (60-80 hours)

**Production Infrastructure**:
- [ ] Service-to-service authentication
  - mTLS or JWT between services
  - Align with broader platform security model
  - API Gateway authentication refinement
- [ ] Monitoring & Observability
  - Prometheus metrics (request count, latency, errors)
  - OpenTelemetry tracing (distributed traces)
  - Grafana dashboards
  - Alerting rules (error rate > threshold, latency spikes)
- [ ] Logging enhancements
  - Centralized logging (Elasticsearch + Kibana or CloudWatch)
  - Log aggregation from all service instances
  - Log retention policies (30 days default)
  - Sensitive data redaction (passwords, tokens)
- [ ] Database optimization
  - Connection pooling tuning
  - Read replicas for heavy read queries (searches, duplicate detection)
  - Backup strategy (daily automated backups, 30-day retention)
  - Disaster recovery plan

**Security Hardening**:
- [ ] Security audit
  - Penetration testing
  - Dependency vulnerability scanning (npm audit, Snyk)
  - OWASP Top 10 compliance verification
  - Code review for security issues
- [ ] Secrets management
  - AWS Secrets Manager or HashiCorp Vault
  - Rotate JWT secret keys
  - Encrypt sensitive data at rest (MongoDB encryption)
- [ ] API security
  - API versioning (v1 prefix)
  - Deprecation warnings for old endpoints
  - Rate limiting per API key (if public API)
  - CORS whitelist enforcement

**Testing & Quality**:
- [ ] Full test suite
  - Unit tests (all services, >90% coverage)
  - Integration tests (all endpoints)
  - Contract tests (API schema validation)
  - Load tests (sustained 10k req/min)
  - Chaos engineering (failure injection)
- [ ] CI/CD pipeline
  - Automated testing on PR
  - Staging deployment on merge to main
  - Production deployment with approval
  - Rollback strategy
- [ ] Performance benchmarks
  - Reference creation: <50ms p95
  - Search query: <200ms p95
  - Import 100 BibTeX entries: <5s
  - Duplicate detection: <100ms per reference

**Documentation**:
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Deployment guide
- [ ] Runbook (common issues, debugging)
- [ ] Architecture diagrams (service dependencies)

**Est. Time**: 60-80 hours

---

**Phase 3 Total**: 140-180 hours (2 weeks full-time)

**Deployment**: Production release, public announcement

---

## Summary Timeline

| Phase | Duration | Frontend | Backend | Total | Focus | Deliverable |
|-------|----------|----------|---------|-------|-------|-------------|
| **Phase 0 (MVP)** | 4 weeks | 165-200h | 80-120h | 245-320h | Core functionality | Functional bibliography manager |
| **Phase 1** | 2 weeks | 70-90h | 60-80h | 130-170h | Enhanced UX & Security | Power user features, security hardening |
| **Phase 2** | 3 weeks | 120-150h | 100-120h | 220-270h | Advanced features | Collaboration, offline, citations |
| **Phase 3** | 2 weeks | 80-100h | 60-80h | 140-180h | Production polish | i18n, performance, monitoring |
| **Total** | **11 weeks** | **435-540h** | **300-400h** | **735-940h** | **Full product** | **Production-ready bibliography manager** |

---

## Dependencies & Blockers

**External Dependencies**:
- Backend API completion (reference CRUD, duplicate detection, import/export) - **Critical for Phase 0**
- API Gateway auth integration - **Critical for Phase 0**
- Design system finalization (Figma mockups) - **Nice to have for Phase 0**
- Editor team coordination for integration - **Critical for Phase 2**

**Potential Blockers**:
- Backend API delays → **Mitigate**: Mock API for frontend development
- Browser compatibility issues (Safari quirks) → **Mitigate**: Early cross-browser testing
- Performance with 10k+ references → **Mitigate**: Virtual scrolling, pagination
- i18n complexity (RTL, pluralization) → **Mitigate**: Start with English, add languages incrementally
- Elasticsearch scaling → **Mitigate**: Use MongoDB Atlas Search as simpler alternative

---

## Success Metrics

### Phase 0 (MVP)
- [ ] All core features implemented (import, organize, export)
- [ ] Test coverage >80% for critical paths (frontend + backend)
- [ ] Lighthouse score >90 (Performance, Accessibility)
- [ ] Zero critical bugs in QA
- [ ] Internal team uses daily for 2 weeks without major issues

### Phase 1
- [ ] Beta users report productivity improvements (survey)
- [ ] <5 bugs per week reported
- [ ] Light theme adoption >30% of users
- [ ] All security hardening complete (XSS, CSRF, NoSQL injection prevented)
- [ ] Rate limiting prevents abuse (no DoS incidents)

### Phase 2
- [ ] Collaboration features used by >50% of team users
- [ ] Offline mode enables usage on planes/trains (user feedback)
- [ ] Advanced PDF viewer rated "useful" or "very useful" by >80% users
- [ ] Citation formatting accuracy 100% (matches Zotero output)
- [ ] Zod migration complete (no Joi dependencies)

### Phase 3
- [ ] Lighthouse score >95 all categories
- [ ] WCAG 2.1 AA compliant (audit passed)
- [ ] >10% of users use non-English language
- [ ] Production uptime >99.9%
- [ ] p95 API latency <200ms
- [ ] Zero security vulnerabilities (Snyk, npm audit)

---

## Post-Launch: Continuous Improvement

**Ongoing**:
- Bug fixes from user reports
- Performance monitoring
- Security updates
- Dependency updates
- Community feature requests

**Future Enhancements** (Phase 4+):
- AI-powered duplicate detection (machine learning model)
- AI reference metadata extraction from PDF
- Smart citation suggestions (based on paper content)
- Integration with citation managers (Mendeley, EndNote import)
- Integration with writing tools (Google Docs, MS Word)
- Mobile app (React Native or PWA)
- API for third-party integrations
- Plugin system (community extensions)
- Advanced statistics/analytics (citation counts, h-index)
- Social features (share collections publicly, follow researchers)

---

**Document Metadata**:
- Version: 2.0 (Unified)
- Date: 2025-01-08
- Author: Claude (Anthropic)
- Status: Active Development Roadmap
- Related: Spec.md, UnifiedImplementationChecklist.md
