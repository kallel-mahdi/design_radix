# Manual QA Testing Guide - MVP Closed Beta

**Product**: Citable (Collaborative LaTeX editor + integrated bibliography manager)  
**Document Version**: 1.1  
**Last Updated**: December 23, 2025  
**Testing Type**: Manual QA (no E2E automation yet)  

---

## Table of Contents

0. [Change Log](#0-change-log)  
1. [Overview & Purpose](#1-overview--purpose)  
2. [Test Environment Setup](#2-test-environment-setup)  
3. [MVP Feature Scope](#3-mvp-feature-scope)  
4. [Critical User Workflows](#4-critical-user-workflows)  
5. [Frontend Container Smoke Tests](#5-frontend-container-smoke-tests)  
6. [Feature Test Cases](#6-feature-test-cases)  
7. [Competitor-Inspired Workflows](#7-competitor-inspired-workflows)  
8. [Usability, Accessibility, Compatibility](#8-usability-accessibility-compatibility)  
9. [API Endpoint Coverage (Manual)](#9-api-endpoint-coverage-manual)  
10. [Risk Assessment & Priorities](#10-risk-assessment--priorities)  
11. [Bug Report Template](#11-bug-report-template)  
12. [Test Execution Tracker](#12-test-execution-tracker)  
13. [Known Limitations & Gaps](#13-known-limitations--gaps)  

---

## 0. Change Log

**v1.1 (December 23, 2025)** — updated based on current `frontend-v2/` and `backend/services/*/` code:
- Updated Authentication to include **Invite Code** registration and **Request Access / Waitlist**.
- Updated Projects to include **New Project modal**, **.zip import**, and **Main File Selection**.
- Updated Editor UI to match current controls (**Files/Outline split**, **File Search**, **Library Links**, **Version History**).
- Updated Compilation/PDF Preview UI to match current toolbar (**Recompile**, **Problems**, **Download PDF**).
- Updated Bibliography UI to match current implementation (**Collections tree CRUD**, **All references**, **Reference details + NOTES**, **PDF annotations tab**).
- Added a **Container Smoke Test** table so every container has explicit coverage.
- Added an **API Endpoint Coverage** appendix mapping endpoints to UI or direct checks.

---

## 1. Overview & Purpose

This document provides exhaustive manual QA test cases for Citable before beta launch.

**Goals**:
- Ensure must-have workflows work end-to-end
- Catch high-severity defects (data loss, broken compile/PDF, broken import)
- Verify expected “Overleaf-like” editing and “Zotero-like” bibliography workflows

**Target testers**: Internal team, early beta users  

---

## 2. Test Environment Setup

### Prerequisites

1. **Browser**: Chrome (recommended), Firefox, Safari, Edge
2. **Network**: Stable connection
3. **Test account**: Invite code for registration (format: `CITABLE-XXXX-XXXX`)
4. **Test data**:
   - **PDFs**
     - 2–3 academic PDFs with clear metadata (title/authors/DOI visible)
     - 1 PDF with no DOI (partial metadata is OK)
     - 1 large PDF (50+ pages)
     - 1 corrupted/invalid PDF
   - **Project import (`.zip`)**
     - 1 `.zip` with multi-file LaTeX project + image
     - 1 `.zip` with multiple candidate main files (should trigger “Select Main File”)
     - 1 `.zip` missing `\\documentclass` / `\\begin{document}` (should fail or warn clearly)
   - **LaTeX error fixtures**
     - 1 doc with a known error (e.g., missing brace)
     - 1 doc that compiles but produces warnings

### Environment URLs

| Environment | URL | Notes |
|-------------|-----|-------|
| Local Dev | `http://localhost:5173` | Typical dev |
| Staging | TBD | Pre-release testing |
| Production | TBD | Beta launch |

### Before Each Test Session

- [ ] Clear cache (or use incognito)
- [ ] Note OS + browser version
- [ ] Keep DevTools open (Console + Network filtered by `/api/`)
- [ ] Ensure services are healthy (Gateway, Auth, Document, Bibliography, LaTeX)

---

## 3. MVP Feature Scope

### In Scope (Must Test)

| Area | MVP Feature |
|------|------------|
| Access | Invite-code registration, login, request access/waitlist |
| Projects | List/search, create blank project, import project `.zip`, select main file |
| Editor | Docked layout, files tree CRUD + drag/drop, outline, file search |
| Compile/PDF | Recompile, Problems panel, PDF render + download |
| Versions | List, create snapshot, preview, compare (diff tabs) |
| Bibliography | Collections tree, references list, import PDF, reference details editing |
| Annotations | Highlight/underline, notes list, jump-to-page from notes |
| Linked Library | “Library Links” tree + open linked PDFs (when linked collections exist) |

### Out of Scope / N/A for MVP

| Feature | Notes |
|---------|------|
| Real-time collaboration UI | Not present in current frontend |
| Track changes UI | Not present in current frontend |
| Tag color management UI | Backend exists; UI not present |
| Duplicates resolution UI | Backend exists; UI not present |
| BibTeX import/export UI | Backend exists; UI not present |

---

## 4. Critical User Workflows

### Workflow 1: Create Project → Edit → Compile → Fix Errors

| Step | Action | Expected |
|------|--------|----------|
| 1 | Login | Dashboard loads |
| 2 | Projects → **New Project** → Create | Editor opens |
| 3 | Open `main.tex`, edit content, click **Save** | Saved indicator updates |
| 4 | Click **Recompile** | PDF renders |
| 5 | Add a LaTeX error, Recompile | Problems badge shows issues |
| 6 | Open **Problems** panel | Errors are listed |
| 7 | Click an error | Editor navigates to correct line |
| 8 | Fix, Recompile | PDF updates; issues clear |

**Must-pass**: steps 4–8.

---

### Workflow 2: Bibliography → Import PDF → Annotate → Jump from Notes

| Step | Action | Expected |
|------|--------|----------|
| 1 | Bibliography → create collection | Appears in tree |
| 2 | Open collection → **Import** PDF | Reference appears |
| 3 | Open reference details | INFO PDF + NOTES tabs visible |
| 4 | Open PDF annotation tab and add highlight + note | Persists after refresh |
| 5 | Reference details → NOTES tab → click a note | Opens PDF at correct page |

**Must-pass**: steps 2–5.

---

### Workflow 3: Version Snapshot → Preview → Compare

| Step | Action | Expected |
|------|--------|----------|
| 1 | Editor → Version History | List loads |
| 2 | Create Version | Snapshot created and appears |
| 3 | Preview a version | Preview tabs open |
| 4 | Compare a version | Diff tabs open |

**Must-pass**: steps 2–4.

---

## 5. Frontend Container Smoke Tests

Run once per test cycle (or before sign-off) to ensure **every container** is covered.

| Container | Smoke steps | Expected |
|----------|-------------|----------|
| `homePage` | Load dashboard; navigate via cards | No crash; correct routing |
| `projectsPage` | Load list; search; open New Project modal | No crash; modal ok |
| `loginPage` | Submit empty; submit invalid creds | Inline errors + server error |
| `registerPage` | Validate invite code format | “Invalid invite code format” shown |
| `requestAccessPage` | Submit; verify success state | “You’re on the list!” shown |
| `editor` | Load editor route; switch sidebar items | Stable layout |
| `EditorPanel` | Open/close tabs; confirm close if changed | Modal appears only when needed |
| `MonacoEditor` | Type; Save; verify Saved/Unsaved | Works; no freeze |
| `FileBrowsing` | Create/rename/delete/move; upload image | Tree updates + persists |
| `DocumentOutline` | Add section; click outline item | Outline updates; navigates |
| `FileSearchPanel` | Search and open result | Opens correct file |
| `pdfPreview` | Recompile; Problems; download | PDF renders; no UI break |
| `CompilationErrorsPanel` | Trigger errors; click error | Navigates to line |
| `VersionHistoryPanel` | Create snapshot; preview; compare | Tabs open |
| `BibliographyContentLayout` | Switch Library vs Filters | Correct header/content |
| `BibliographyAllReferencesPage` | Search; open details; delete cancel | Expected behavior |
| `BibliographyCollectionReferencesPage` | Import PDF; open details | Reference appears |
| `bibliographyPDFAnnotationTab` | Highlight/underline; comment; delete | Persists |
| `linkedBibliography` | Open linked PDF node | PDF tab opens |

---

## 6. Feature Test Cases

### A. Authentication & Access

| ID | Test Case | Steps | Expected | Status |
|----|-----------|-------|----------|--------|
| A1 | Login required fields | Submit empty | “Email is required” and “Password is required” | |
| A2 | Login invalid credentials | Wrong password | Error shown; remain logged out | |
| A3 | Login success | Valid credentials | Redirect to dashboard | |
| A4 | Register invite format validation | Invalid invite code | “Invalid invite code format” shown | |
| A5 | Register success | Valid invite + form | Account created | |
| A6 | Request Access required fields | Submit empty | Field errors shown | |
| A7 | Request Access success | Submit valid form | Success screen shown | |
| A8 | Session persistence | Refresh after login | Still logged in | |

---

### B. Projects

| ID | Test Case | Steps | Expected | Status |
|----|-----------|-------|----------|--------|
| B1 | Projects list loads | Open Projects | List loads (or empty state) | |
| B2 | Search projects | Use “Search projects…” | Results filter | |
| B3 | Create blank project | New Project → name → Create | Editor opens; `main.tex` exists | |
| B4 | Import `.zip` | New Project → select `.zip` → Create | Import starts; files appear | |
| B5 | Main file selection | Import ambiguous `.zip` | “Select Main File” modal; Continue works | |

---

### C. Editor Shell

| ID | Test Case | Steps | Expected | Status |
|----|-----------|-------|----------|--------|
| C1 | Sidebar: File Browser | Click file icon | Files/Outline sections visible | |
| C2 | Sidebar: File Search | Click search icon | Search input shown | |
| C3 | Sidebar: Library Links | Click bibliography icon | “LIBRARY LINKS” panel | |
| C4 | Sidebar: Version History | Click history icon | List loads | |
| C5 | Dock layout stability | Resize panels; refresh | No blank panels | |
| C6 | Collapse/expand Files section | In File Browser panel, toggle “Files” | Collapses/expands without layout glitches | |
| C7 | Resize Files vs Outline | Drag the divider between Files and Outline | Heights update smoothly; no stuck cursor | |

---

### D. File Browser (Project Files)

| ID | Test Case | Steps | Expected | Status |
|----|-----------|-------|----------|--------|
| D1 | Create folder | Click New Folder; name on blur/Enter | Folder created | |
| D2 | Create file | Click New File; name on blur/Enter | File created | |
| D3 | Rename file/folder | Select node → Rename → Enter | Name updated; persists | |
| D4 | Delete file/folder | Select → Delete → Confirm | Removed; correct modal text | |
| D5 | Drag-drop move file | Drag file into folder | File moves; persists | |
| D6 | Drag-drop move folder | Drag folder into folder | Hierarchy updates; persists | |
| D7 | Upload image | Upload File; select `.png` | Upload succeeds; file usable | |

---

### E. Monaco Editor

| ID | Test Case | Steps | Expected | Status |
|----|-----------|-------|----------|--------|
| E1 | Open file in editor | Click `.tex` file | Content loads | |
| E2 | Unsaved indicator | Type | Status shows “Unsaved” | |
| E3 | Save button | Click Save | Status shows “Saved” | |
| E4 | Close tab with changes | Modify → close tab | “Close Tab” confirm appears | |
| E5 | Close tab without changes | Open → close | Closes without confirm | |
| E6 | Large paste | Paste 1000+ lines | No crash/freeze | |

---

### F. Outline + File Search

| ID | Test Case | Steps | Expected | Status |
|----|-----------|-------|----------|--------|
| F1 | Outline sections | Add `\\section{Intro}` | Outline shows Intro | |
| F2 | Outline figures/tables | Add figure caption | Outline shows caption | |
| F3 | Navigate from outline | Click outline item | Jumps to line | |
| F4 | Outline equations | Add equation with `\\label{eq:test}` | Outline shows label | |
| F5 | File search debounce | Type quickly | Results update without spam | |
| F6 | Open search result | Click result | Correct file opens | |

---

### G. Compile & PDF Preview

| ID | Test Case | Steps | Expected | Status |
|----|-----------|-------|----------|--------|
| G1 | Recompile | Click Recompile | “Compiling…” then PDF renders | |
| G2 | Problems panel toggle | Click Problems icon | Panel opens/closes | |
| G3 | Error badge counts | Introduce errors/warnings | Badge count updates | |
| G4 | Click error navigates | Click an error | Editor jumps to line | |
| G5 | No PDF state | Open never-compiled project | “No PDF available” message | |
| G6 | Download compiled PDF | Click download icon | PDF file downloads | |
| G7 | Large PDF performance | Compile large doc | Renders; usable scrolling | |
| G8 | Unparseable failure state | Force compile failure without parseable errors | “No errors to display” state shown | |

---

### H. Version History

| ID | Test Case | Steps | Expected | Status |
|----|-----------|-------|----------|--------|
| H1 | Load versions | Open Version History | List loads | |
| H2 | Create snapshot | Create Version | New version appears | |
| H3 | Preview snapshot | Preview a version | Preview tabs open | |
| H4 | Compare with current | Compare → current | Diff tabs open | |
| H5 | Compare with previous | Compare → previous | Diff tabs open | |
| H6 | Load more | Load more versions | Pagination works | |

---

### I. Bibliography: Collections + References

| ID | Test Case | Steps | Expected | Status |
|----|-----------|-------|----------|--------|
| I1 | Create collection | Library → plus → name | Created | |
| I2 | Create nested collection | Select parent → plus | Nested created | |
| I3 | Rename collection | Select → rename | Renamed | |
| I4 | Delete collection | Select → delete → confirm | Deleted; no crash | |
| I5 | All references search | All references → Search | Filters by title | |
| I6 | Import PDF | Collection page → Import → select PDF | Reference appears | |
| I7 | Filters sidebar shows values | Switch Bibliography sidebar to Filters | Year range + Venue/Tags/Authors lists visible | |
| I8 | Filters affect results | Select a venue/author/tag filter | All references list updates accordingly | |

---

### J. Reference Details + NOTES

| ID | Test Case | Steps | Expected | Status |
|----|-----------|-------|----------|--------|
| J1 | INFO PDF fields render | Open details | Item type/title/authors/year/venue/doi/tags/collections shown | |
| J2 | Add/remove author | Add Author; remove | Form updates | |
| J3 | Add/remove tag | Add Tag; remove | Form updates | |
| J4 | Update reference persists | Change title; Update | Persists after refresh | |
| J5 | NOTES tab loading state | Open NOTES | “Loading annotations…” then notes list | |
| J6 | NOTES jump-to-page | Click a note | Opens PDF at that page | |
| J7 | Assign collections to reference | In details, select multiple Collections and Update | Reference appears in those collections | |

---

### K. PDF Annotations (Bibliography)

| ID | Test Case | Steps | Expected | Status |
|----|-----------|-------|----------|--------|
| K1 | Create highlight | Select highlight mode; select text | Highlight saved | |
| K2 | Create underline | Select underline mode; select text | Underline saved | |
| K3 | Change color | Select color; create highlight | New highlight uses color | |
| K4 | Add note/comment | Add comment | Note persists | |
| K5 | Delete annotation | Delete highlight | Removed after refresh | |
| K6 | Area selection | Alt + drag | Area annotation created (if supported) | |
| K7 | Loading state | Slow network | Shows progress % | |
| K8 | Error state | Broken worker/network | “Error loading PDF” shown | |

---

### L. Linked Library (Editor “Library Links”)

| ID | Test Case | Steps | Expected | Status |
|----|-----------|-------|----------|--------|
| L1 | Linked tree loads | Editor → Library Links | Tree renders when linked collections exist | |
| L2 | Open linked PDF | Click PDF node | Opens PDF tab in preview | |
| L3 | Toggle annotations overlay | Linked PDF view toggle | Overlay appears | |
| L4 | Open in bibliography | Click “Open in Bibliography Section” | Navigates and selects reference | |

---

## 7. Competitor-Inspired Workflows

These tests reflect expectations users bring from Zotero/Mendeley/Overleaf.

### Zotero-style expectations

| ID | Test Case | Steps | Expected | Status |
|----|-----------|-------|----------|--------|
| Z1 | PDF metadata retrieval | Import PDF | At least title/authors/DOI when available | |
| Z2 | Duplicate import behavior | Import same PDF twice | Clear behavior (prevent or explicitly allow) | |
| Z3 | Deep nesting | Create 3 nested collections | Works without glitches | |
| Z4 | Annotation persistence | Highlight + note; refresh | Still present | |
| Z5 | Link library to writing | Linked PDF opens from editor | Works | |

### Mendeley-style expectations

| ID | Test Case | Steps | Expected | Status |
|----|-----------|-------|----------|--------|
| M1 | Large library usability | 100+ references | List/filter remain usable | |
| M2 | Notes list readability | Many notes | Readable; navigable | |
| M3 | Resume position (nice-to-have) | Open PDF at page 5; reopen | If not supported, document limitation | |

### Overleaf-style expectations

| ID | Test Case | Steps | Expected | Status |
|----|-----------|-------|----------|--------|
| O1 | Compile feedback clarity | Recompile | Clear state + result | |
| O2 | Error-to-source navigation | Click error | Jumps to correct location | |
| O3 | Versioning parity | Create snapshot; preview; compare | Works reliably | |
| O4 | SyncTeX behavior | Double-click PDF | Jumps to source when mapping available | |

### Competitor Research Links (for QA context)

- Zotero: “Retrieve Metadata for PDFs” docs — https://www.zotero.org/support/retrieve_metadata_for_pdfs  
- Zotero: “Duplicate Detection” docs — https://www.zotero.org/support/duplicate_detection  
- Overleaf: “Project history & versioning” docs — https://www.overleaf.com/learn/how-to/Using_the_history_feature  
- Overleaf: “Errors in Overleaf” docs — https://www.overleaf.com/learn/how-to/Errors_in_Overleaf  
- Overleaf: “SyncTeX errors in Overleaf” docs — https://www.overleaf.com/learn/how-to/SyncTeX_errors  

---

## 8. Usability, Accessibility, Compatibility

### Usability checklist

| Area | Check | Pass/Fail | Notes |
|------|-------|-----------|-------|
| Loading | No blank screens; spinners/messages appear | | |
| Errors | Messages actionable (not vague) | | |
| Modals | Escape/backdrop close; focus management | | |
| Keyboard | Tab navigation (no traps) | | |
| DnD | Clear feedback during drag/drop | | |
| Performance | No major lag during typing/scrolling | | |

### Browser compatibility (minimum)

| Browser | Check |
|--------|-------|
| Chrome | Baseline |
| Firefox | PDF rendering + uploads |
| Safari | PDF rendering + drag/drop + file inputs |
| Edge | Baseline |

---

## 9. API Endpoint Coverage (Manual)

Goal: every endpoint has a manual verification path (UI-driven where possible; direct call when UI has no coverage).

### Auth Service (via API Gateway `/api/auth/*`)

- `POST /api/auth/register` — covered by Register flow (invite code validation)
- `POST /api/auth/login` — covered by Login flow
- `GET /api/auth/profile` — covered by session persistence checks
- `POST /api/auth/waitlist/join` — covered by Request Access flow
- API-only / verify with Postman/curl (no UI): `POST /api/auth/logout`, `POST /api/auth/refresh-token`, `POST /api/auth/verify-token`, password reset endpoints, admin invite endpoints

### Document Service (via API Gateway `/api/*`)

- Projects:
  - `GET /api/projects`, `POST /api/projects` — Projects page + New Project
  - `GET /api/projects/:id`, `PATCH /api/projects/:id` — verify project fields, linked collections
  - `GET /api/projects/:id/structure` — File Browser tree
  - `POST /api/projects/:id/folders`, `POST /api/projects/:id/files` — create file/folder
  - `PUT /api/projects/:id/folders/:folderId/rename` — rename folder
  - `PUT /api/projects/:id/folders/:folderId/move`, `PUT /api/projects/:id/files/:fileId/move` — drag/drop move
  - `DELETE /api/projects/:id/folders/:folderId`, `DELETE /api/projects/:id/files/:fileId` — delete
  - `POST /api/projects/:id/upload` — upload image
  - `GET /api/projects/:id/search?q=` — File Search panel
  - `GET /api/projects/:id/linked-collections`, `PUT /api/projects/:id/linked-collections` — linking UI may be missing; validate via API when needed
- Documents (editor file content):
  - `GET /api/documents/:id` — open file content
  - `PUT /api/documents/:id` — Save button
  - API-only: `GET /api/documents`, `POST /api/documents`, collaborator/cursor endpoints (if UI not present)
- Import:
  - `POST /api/projects/import/overleaf` and related progress/status endpoints — API exists; validate only if UI exposes
- Comments / CRDT:
  - `/api/comments/*`, `/api/crdt/*` — backend exists; validate only if UI exposes
- LaTeX helper endpoints:
  - `/api/latex/validate`, `/api/latex/autocomplete` — backend exists; validate only if UI exposes
- Compile/PDF:
  - `POST /api/projects/:id/compile` — Recompile button
  - `GET /api/projects/:id/pdf` — PDF preview fetch
- Versions:
  - `GET /api/versions/projects/:projectId` — Version History list
  - `POST /api/versions/projects/:projectId` — Create Version
  - `GET /api/versions/projects/:projectId/:versionNumber` — Preview version content
  - `GET /api/versions/documents/:documentId/compare` — Diff tabs

### Bibliography Service (via API Gateway `/api/bibliography/*`)

- Collections: `GET/POST/PATCH/DELETE /api/bibliography/collections` — Library tree UI
- References:
  - `GET /api/bibliography/references` — All references UI
  - `POST /api/bibliography/references/with-pdf` — Import PDF from collection page
  - `PATCH /api/bibliography/references/:id` — Update from details panel
  - `DELETE /api/bibliography/references/:id` — Delete via UI
  - API-only (no UI): `/from-url`, `/import-bibtex`, `/export-bibtex`, `/import-pdfs`, `/scan-batch-pdfs`, `/check-duplicate`, `/authors`, `/venues`
- Annotations:
  - `GET/POST /api/bibliography/references/:referenceId/annotations` — notes list + creation
  - `PATCH/DELETE /api/bibliography/annotations/:id` — update/delete
- Linked library structure:
  - `GET /api/bibliography/projects/:projectId/collection-structure` — Library Links tree
- API-only / verify with Postman/curl (no UI):
  - Tags: `GET/POST/PATCH/DELETE /api/bibliography/tags`, rename/color endpoints
  - Duplicates: `GET /api/bibliography/duplicates`, `POST /api/bibliography/duplicates/:id/resolve`
  - PDFs: `POST /api/bibliography/pdfs/extract-metadata`, annotated PDF download endpoint

### LaTeX Service (direct in dev; usually behind document-service)

- `POST /compile`, `POST /compile-project`, `POST /compile-project-v2`, `GET /pdf/:projectId`, `POST /validate`

---

## 10. Risk Assessment & Priorities

### Highest-risk areas (test first)

1. Project import + main file selection (complex edge cases)
2. Compile pipeline + error parsing + error-to-source navigation
3. PDF rendering and annotation persistence/performance
4. Version snapshot/preview/compare (multi-file behavior)
5. File browser drag/drop + rename/delete (data loss risk)

### Suggested test order

1. Auth → create project → compile
2. File browser + outline + search
3. Bibliography import → details update → annotate → notes jump
4. Version snapshot → preview → compare
5. Large data + browser sweep

---

## 11. Bug Report Template

```markdown
## Bug Report

**Date**: YYYY-MM-DD
**Tester**: [Your Name]
**Environment**: [Browser/Version, OS]
**Feature Area**: [Auth / Projects / Editor / Compile / Bibliography / Versions / etc.]
**Severity**: [Critical / High / Medium / Low]

### Description

### Steps to Reproduce
1.
2.
3.

### Expected Behavior

### Actual Behavior

### Screenshots / Video

### Console / Network Errors
```

**Severity guide**

| Severity | Definition | Example |
|----------|------------|---------|
| Critical | App unusable or data loss | Deleting wrong file, compile breaks all projects |
| High | Feature broken, no workaround | Import PDF always fails |
| Medium | Workaround exists | Filter broken but search works |
| Low | Cosmetic/minor | Misaligned icon |

---

## 12. Test Execution Tracker

| Feature Area | Total Tests | Passed | Failed | Blocked | Notes |
|--------------|-------------|--------|--------|---------|-------|
| Authentication & Access | 8 | | | | |
| Projects | 5 | | | | |
| Editor Shell | 7 | | | | |
| File Browser | 7 | | | | |
| Monaco Editor | 6 | | | | |
| Outline + Search | 6 | | | | |
| Compile & PDF Preview | 8 | | | | |
| Version History | 6 | | | | |
| Bibliography Core | 8 | | | | |
| Reference Details + Notes | 7 | | | | |
| PDF Annotations | 8 | | | | |
| Linked Library | 4 | | | | |
| Competitor Parity | 12 | | | | |
| Usability/Accessibility/Compatibility | 12 | | | | |
| **TOTAL** | **104** | | | | |

### Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | | | |
| Dev Lead | | | |
| Product Owner | | | |

---

## 13. Known Limitations & Gaps

Track these explicitly during beta:

1. Linked library “link/unlink collections” UX may be incomplete (modal exists but may not be reachable in editor UI).
2. Tags backend supports colors/positions; UI currently treats tags as free-text strings.
3. BibTeX import/export endpoints exist; no UI coverage.
4. Duplicates endpoints exist; no UI coverage.
5. Bibliography PDF annotation tab references an external PDF worker URL; restricted networks may break it.
