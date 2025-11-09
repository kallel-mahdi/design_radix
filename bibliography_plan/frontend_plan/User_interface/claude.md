NOTE (2025-10-29): Backend services use API Gateway trusted headers (`trustGatewayAuth`) and do not perform JWT validation directly in MVP. Any mentions of "JWT authentication" below are superseded by gateway-only auth for this release.

I've completed a comprehensive analysis of all 13 mockup images and the design prompt. Here's the breakdown:

  ---
  1. GLOBAL UPDATES: Deviations from Original Prompt

  What matches:
  - Dark theme with neon green accent (#04E39E)
  - 4-panel layout (activity bar, sidebar, main pane, details pane)
  - Clean sans-serif typography
  - Line icons with thin strokes

  What's different:
  - No status bar at bottom (prompt specified "N selected • Sync OK • Duplicates 3 • Offline queue 2")
  - Background colors appear more uniform rather than distinct #0F1115 vs #171A21 surfaces
  - No visible badges/counters on activity icons (except Settings submenu)
  - All tags use the same green color rather than diverse color coding

  ---
  2. VIEW-BY-VIEW BREAKDOWN

  bibliography1_1.png - Library (Empty Details)

  - Activity: Library (folder icon, active)
  - Sidebar: Collection tree - "My Library" (45) with nested folders: On-Policy Methods (12), Offline RL (8), Exploration (15), To Read (10)
  - Main pane: Table with Add/Import/Export toolbar, showing 3 references with columns: Title | Authors | Year | Venue | Tags | Files | DOI
  - Right pane: Empty state - "Select a reference to view details"

  bibliography_2_1.png - Library (Info Tab)

  - Second reference selected (green border highlight)
  - Right pane: Details panel with tabs: Info (active) | PDF | Notes
    - Shows: Title, Authors, Year, Venue, DOI/URL for selected reference

  bibliography_2_2.png - Library (PDF Tab)

  - Same selection
  - Right pane: PDF tab active, showing "PDF VIEWER - Click to open PDF in viewer" with placeholder

  bibliography_2_3.png - Library (Notes Tab, Empty)

  - Right pane: Notes tab active, empty state - "NOTES - No notes have been added"

  bibliography_2_4.png - Library (Notes Tab, with Content)

  - Right pane: Notes tab showing: "Key finding: plasticity loss correlates with performance degradation" dated 12/03/2024

  bibliography_3_1.png - Search/Filters View

  - Activity: Search (magnifying glass icon)
  - Sidebar: "FILTERS" with:
    - AUTHOR checkboxes (Juliani, A., Ash, J., etc.)
    - YEAR RANGE slider (2020-2024)
    - VENUE checkboxes (ICML, NeurIPS, ICLR, CoRL, arXiv)
    - TAGS checkboxes (deep-rl, on-policy, offline-rl, exploration, theory)
    - "Manage Filter" button (green)
  - Main pane: Search bar + filtered results table

  bibliography_4_1.png - Linked Projects View

  - Activity: Linked Projects (chain icon)
  - Sidebar: "PROJECTS"
    - Expandable list: "Thesis - Chapter 3" (expanded), "Survey Paper", "ICML 2025 Submission"
    - LINKED COLLECTIONS section with toggles:
        - "On-Policy Methods" (ON - green)
      - "Offline RL" (ON - green)
      - "Exploration" (OFF - gray)
  - Main pane: References from linked collections

  bibliography_5_1.png - Duplicates View

  - Activity: Duplicates (warning triangle)
  - Sidebar: "DUPLICATES" menu - "Duplicate groups" (active), "Rules (read-only)", "Decision history"
  - Main pane: 2 duplicate group cards, each showing:
    - WARNING badge + tag ("deep-rl")
    - Two reference entries (existing vs duplicate marked in blue/cyan)
    - Metadata: Authors, Year, DOI
    - Actions: "Keep Existing" (green) | "Merge Fields" (gray)

  bibliography_6_1.png - Sharing (Empty State)

  - Activity: Sharing (users icon)
  - Sidebar: "SHARING" - "Owned" (active), "Shared with me"
  - Main pane:
    - "Invite collaborator" section: Email field + Role dropdown ("Viewer") + "Invite" button
    - Empty state: "START COLLABORATING - You haven't invited anyone yet"

  bibliography_6_2.png - Sharing (With Collaborators)

  - Same invite section at top
  - Table: Title (name/email) | Role (dropdown) | Status | Action
    - 3 collaborators: Alice Chen, Bob Smith, Carol White - all with "Viewer" role

  bibliography_7_1.png - Settings (Menu Visible)

  - Activity: Settings (gear icon at bottom)
  - Sidebar: Shows settings submenu overlay: "General", "Project Defaults", "Shortcuts", "Storage/Sync"

  bibliography_7_2.png - General Settings Modal

  - Modal dialog with 3 toggle options:
    a. "Collapse Details pane by default" (ON, with red dot indicator)
    b. "Auto-detect duplicates" (ON)
    c. "Show citation preview" (OFF)
  - Actions: Cancel | Save settings

  bibliography_7_3.png - Project Default Modal

  - Form fields:
    - "Bibliography Style (.bst)" dropdown: "Unsrtnat"
    - "Default Cite Command" dropdown: "\citep"
    - "Insert natbib preamble" button
  - Actions: Cancel | Save settings

  ---
  3. COMPONENT INVENTORY

  Buttons: Primary green fill (Add, Invite, Save), Ghost/outlined (Import, Export, Cancel), Icon buttons (X close)

  Inputs: Dark text fields, search bars, dropdowns with chevron icons

  Selection: Checkboxes (square, green), Toggle switches (pill-shaped, green/gray), Tree expand/collapse arrows

  Data Display: Multi-column table with green border highlight for selection, row hover states

  Tags/Chips: Small rounded rectangles with green text (plasticity, deep-rl, on-policy, etc.)

  Navigation: Vertical activity bar with icon states, Horizontal tabs with green underline, Expandable tree with item counts

  Cards: Large rounded containers for duplicate groups with badges, metadata, action buttons

  Modals: Centered overlay with green border, header with close X, form content, action footer

  Empty States: Icon + descriptive text (centered layout)

  File Indicators: Paperclip icon in Files column

  Status Indicators: Red dot (unclear purpose), "(Duplicate)" blue/cyan text labels

  ---
  4. MVP PRIORITIES

  MUST HAVE (v1.0):

  1. Core CRUD for references (add, edit, delete, import via DOI/PDF)
  2. Collection organization (nested folders)
  3. Basic metadata (title, authors, year, venue, DOI, tags)
  4. Reference table with sort/filter
  5. Tag management
  6. Library view with details pane (Info tab minimum)
  7. Search/Filter view (author, year, venue, tag filters)
  8. Linked Projects (create, link collections, toggle on/off)
  9. Duplicate detection (DOI match, Title+Year match) with Keep/Dismiss actions
  10. MongoDB schemas + file upload for PDFs
  11. JWT authentication

  DEFER to v1.5-v2.0:

  - PDF viewer with annotations
  - Notes system (create/edit notes)
  - Merge fields for duplicates
  - Export .bib files
  - Bulk operations
  - Collaboration/sharing (invite users, roles)
  - Settings UI
  - Status bar
  - Context menus
  - Keyboard shortcuts

  ---
  5. COPY & TERMINOLOGY

  Activity Labels: LIBRARY, SEARCH, PROJECTS, DUPLICATES, SHARING, SETTINGS

  Sidebar Headers: COLLECTION, FILTERS, PROJECTS, LINKED COLLECTIONS, DUPLICATES, SHARING

  Action Buttons: Add, Import, Export, Invite, Keep Existing, Merge Fields, Cancel, Save settings, Insert natbib preamble, Manage Filter

  Table Columns: Title | Authors | Year | Venue | Tags | Files | DOI | Role | Status | Action

  Tab Names: Info | PDF | Notes

  Form Labels:
  - Email address
  - Viewer (role)
  - Bibliography Style (.bst)
  - Default Cite Command
  - Collapse Details pane by default
  - Auto-detect duplicates
  - Show citation preview

  Placeholder Text: "Search references...", "Email address"

  Empty States:
  - "Select a reference to view details"
  - "START COLLABORATING - You haven't invited anyone yet"
  - "PDF VIEWER - Click to open PDF in viewer"
  - "NOTES - No notes have been added"

  Sample Data:
  - Projects: "Thesis - Chapter 3", "Survey Paper", "ICML 2025 Submission"
  - Collaborators: Alice Chen, Bob Smith, Carol White
  - Tags: deep-rl, plasticity, on-policy, policy-evaluation, data-efficiency

  ---
  6. COLLABORATION & DUPLICATES FLOWS

  Collaboration Flow:

  1. Click Sharing icon → View "Owned" libraries
  2. Enter email + select role (Viewer/Editor/Owner/Commenter) → Click "Invite"
  3. Manage in table: view name/email, change role via dropdown, view status, remove via action

  Backend needs: User model, Collaborator model (libraryId, userId, role, status: pending/active), permission middleware, email invitations, audit logs

  Duplicates Flow:

  1. System detects on import (DOI match or Title+Year fuzzy match)
  2. Click Duplicates icon → View duplicate groups
  3. Each card shows: existing reference + duplicate (blue text), metadata comparison
  4. Actions: "Keep Existing" (discard duplicate) or "Merge Fields" (combine metadata)
  5. Resolved duplicates → "Decision history"

  Backend needs: DuplicateGroup model (originalRefId, duplicateRefId, matchType, status, resolution), detection algorithm (DOI exact + fuzzy title matching),
  decision history tracking

  ---
  7. BACKEND REQUIREMENTS (TypeScript + Express + MongoDB)

  Data Models:

  User: _id, email, name, passwordHash, timestamps

  Reference: _id, userId, title, authors[], year, venue, doi, url, tags[], pdfPath, hasPdf, cited, citedInProjects[], notes[], timestamps

  Collection: _id, userId, name, parentId, referenceIds[], color, icon, position, timestamps

  Project: _id, userId, name, linkedCollections[], settings{bibliographyStyle, defaultCiteCommand, includeNatbib}, timestamps

  DuplicateGroup: _id, userId, originalRefId, duplicateRefId, matchType, confidence, status, resolution{action, resolvedBy, resolvedAt, mergedData}, createdAt

  Collaborator: _id, libraryId, userId, email, role, status, invitedBy, invitedAt, acceptedAt, revokedAt

  Settings: _id, userId, general{}, projectDefaults{}, shortcuts{}, storage{}

  Key API Endpoints:

  Auth: POST /auth/register, /auth/login, GET /auth/me

  References: GET/POST /references, GET/PUT/DELETE /references/:id, POST /references/import, POST/GET /references/:id/pdf

  Collections: GET/POST /collections, GET/PUT/DELETE /collections/:id, POST /collections/:id/references

  Projects: GET/POST /projects, GET/PUT/DELETE /projects/:id, PUT /projects/:id/collections, GET /projects/:id/references, GET /projects/:id/export

  Tags: GET /tags, POST /tags, DELETE /tags/:name

  Duplicates: GET /duplicates, POST /duplicates/detect, PUT /duplicates/:id/resolve, GET /duplicates/history

  Collaboration: GET/POST /collaborators, PUT/DELETE /collaborators/:id, GET /shared

  Settings: GET/PUT /settings

  Search: GET /search (query params: q, authors[], yearMin, yearMax, venues[], tags[])

  Technical Needs:

  - JWT authentication middleware
  - Role-based access control for shared resources
  - File upload handling (multipart/form-data) to local filesystem or S3
  - MongoDB text indexes on title, authors
  - Aggregation pipelines for faceted search
  - Duplicate detection algorithm (DOI exact match + fuzzy title+year matching)
  - DOI lookup integration (CrossRef API)
  - BibTeX parsing/generation
  - PDF metadata extraction
  - Rate limiting, validation, error handling

  ---
  8. OPEN QUESTIONS & AMBIGUITIES

  Missing from mockups but in prompt:
  1. Status bar at bottom (N selected, Sync OK, Duplicates count, Offline queue)
  2. Bulk selection UI (Shift-range, Cmd toggle) and bulk toolbar (Move, Tag, Merge, Delete)
  3. Context menus (right-click actions)
  4. Cited indicator (✓ chip in table for cited references)
  5. Peek PDF (Space key for quick preview)
  6. Trash location in collection tree
  7. Group Libraries section

  UI/UX clarifications needed:
  8. Red dot in Settings modal (bibliography_7_2.png) - what does it indicate?
  9. All role dropdown options (assumed: Owner/Editor/Commenter/Viewer)
  10. All .bst style options (plainnat, abbrvnat, unsrtnat, custom?)
  11. All cite command options (\citep, \citet, \cite, etc.)
  12. Can table columns be resorted, resized, reordered?
  13. Are collection counters real-time?
  14. In Linked Projects, does table show ONLY linked references or all with highlighting?
  15. Merge Fields UI - what modal/flow appears when clicked?
  16. Can multiple files be attached per reference?

  Technical questions:
  17. Offline-first functionality needed for v1?
  18. Sync mechanism - to where? Real-time or manual?
  19. Real-time collaboration updates?
  20. PDF viewer implementation (custom or library like PDF.js)?
  21. Search for large libraries - client-side, server-side pagination, or Elasticsearch?
  22. Import sources supported - PDF upload, BibTeX, DOI, browser extension?
  23. Export formats - .bib only or also CSV/JSON/PDF?

  Data/business logic:
  24. Can one reference be in multiple collections? (Appears yes)
  25. Are tags per-user or global?
  26. When does duplicate detection run - immediate, background job, or manual?
  27. Permission inheritance - if collection is shared, are all refs in it shared?
  28. Natbib preamble button - where does it insert to?
  29. Author name normalization - auto-formatted or user-entered?
  30. Year range slider default - dynamic to current year or fixed?
  31. Are venues standardized dropdown or freeform text?
  32. Can users customize tag colors?

  ---
  Summary

  The mockups are clean, consistent, and well-designed. The core MVP should focus on:
  1. Reference management (CRUD, import, metadata)
  2. Collections (organize with nested folders)
  3. Search/filters (author, year, venue, tags)
  4. Linked projects (link collections, toggle on/off)
  5. Duplicate detection (DOI + fuzzy title matching, keep/dismiss)

  Defer to v2: PDF viewer, notes, collaboration, bulk ops, settings UI, export.

  The backend needs solid data models, JWT auth, file upload, search/filter aggregations, and duplicate detection algorithms. MongoDB + Express is appropriate
  for this stack.

  Let me know which open questions you'd like to resolve first, or if you want me to start drafting the backend architecture document!
