# Manual QA Testing Guide - MVP Closed Beta

**Product**: Citable (Collaborative LaTeX editor + integrated bibliography manager)
**Document Version**: 2.0
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
9. [API Endpoint Coverage](#9-api-endpoint-coverage)
10. [Risk Assessment & Priorities](#10-risk-assessment--priorities)
11. [Bug Report Template](#11-bug-report-template)
12. [Test Execution Tracker](#12-test-execution-tracker)
13. [Known Limitations & Gaps](#13-known-limitations--gaps)
14. [Issues to Fix Before Beta](#14-issues-to-fix-before-beta)
15. [Sign-off](#15-sign-off)

---

## 0. Change Log

**v2.0 (December 23, 2025)** — Merged from MANUAL-CHATGPT.md and MANUAL-CLAUDE.md:
- Combined test cases from both documents (175 total tests)
- Added comprehensive container smoke tests (18 containers)
- Enhanced API endpoint coverage section (97+ endpoints mapped)
- Added Issues to Fix Before Beta section
- Expanded competitor workflows (Zotero, Mendeley, Overleaf)
- Added accessibility and browser compatibility checks
- Reorganized for better navigation

**v1.1 (December 23, 2025)** — Updated based on current codebase:
- Updated Authentication to include **Invite Code** registration and **Request Access / Waitlist**
- Updated Projects to include **New Project modal**, **.zip import**, and **Main File Selection**
- Updated Editor UI to match current controls
- Updated Bibliography UI to match current implementation
- Added Container Smoke Test table
- Added API Endpoint Coverage appendix

**v1.0 (December 2024)** — Initial document creation

---

## 1. Overview & Purpose

This document provides **exhaustive manual QA test cases** for Citable before beta launch.

**Goals**:
- Ensure all core workflows function correctly end-to-end
- Catch high-severity defects (data loss, broken compile/PDF, broken import)
- Verify the platform is useful and usable for researchers
- Validate expected "Overleaf-like" editing and "Zotero-like" bibliography workflows
- Document known limitations for beta feedback

**Target Testers**: Internal team, early beta users

**Platform**: Collaborative LaTeX editor with integrated bibliography management (Overleaf + Zotero combined)

**Test Coverage Summary**:

| Category | Test Count |
|----------|------------|
| Container Smoke Tests | 18 |
| Feature Test Cases (A-L) | 120 |
| Competitor Workflows | 17 |
| Usability/Accessibility | 20 |
| **TOTAL** | **175** |

---

## 2. Test Environment Setup

### Prerequisites

1. **Browser**: Chrome (recommended), Firefox, Safari, Edge
2. **Network**: Stable internet connection
3. **Test Account**: Create account with invite code (format: `CITABLE-XXXX-XXXX`)
4. **Test Data**:
   - **PDFs**:
     - 2-3 academic PDFs with clear metadata (title/authors/DOI visible)
     - 1 PDF with no DOI (partial metadata)
     - 1 large PDF (50+ pages)
     - 1 corrupted/invalid PDF
   - **Project Import (.zip)**:
     - 1 `.zip` with multi-file LaTeX project + image
     - 1 `.zip` with multiple candidate main files (triggers "Select Main File")
     - 1 `.zip` missing `\documentclass` / `\begin{document}` (should fail/warn)
   - **LaTeX Error Fixtures**:
     - 1 doc with known error (e.g., missing brace)
     - 1 doc that compiles but produces warnings
   - **BibTeX File**: 5-10 references for import testing

### Environment URLs

| Environment | URL | Notes |
|-------------|-----|-------|
| Local Dev | `http://localhost:5173` | Typical dev |
| Staging | TBD | Pre-release testing |
| Production | TBD | Beta launch |

### Before Each Test Session

- [ ] Clear browser cache (or use incognito)
- [ ] Note OS + browser version
- [ ] Keep DevTools open (Console + Network filtered by `/api/`)
- [ ] Ensure services are healthy (Gateway, Auth, Document, Bibliography, LaTeX)

### Service Health Check

| Service | Port | Health Endpoint |
|---------|------|-----------------|
| API Gateway | 8000 | `/health` |
| Auth Service | 8001 | `/health` |
| Document Service | 8002 | `/health` |
| Collaboration Service | 8003 | `/health` |
| LaTeX Service | 8004 | `/health` |
| Bibliography Service | 8005 | `/api/bibliography/health` |

---

## 3. MVP Feature Scope

### In Scope (Must Test)

| Area | MVP Feature | Priority |
|------|-------------|----------|
| Access | Invite-code registration, login, request access/waitlist | Critical |
| Projects | List/search, create blank project, import project `.zip`, select main file | Critical |
| Editor | Docked layout, files tree CRUD + drag/drop, outline, file search | Critical |
| Compile/PDF | Recompile, Problems panel, PDF render + download | Critical |
| Versions | List, create snapshot, preview, compare (diff tabs) | High |
| Bibliography | Collections tree, references list, import PDF, reference details editing | Critical |
| Annotations | Highlight/underline, notes list, jump-to-page from notes | High |
| Tags | Create/assign tags, filter by tag | Medium |
| Search | Full-text search, filter by year/venue/author | High |
| Linked Library | "Library Links" tree + open linked PDFs | Medium |

### Out of Scope / N/A for MVP

| Feature | Notes | Planned For |
|---------|-------|-------------|
| Real-time collaboration UI | Not present in current frontend | Phase 2 |
| Track changes UI | Not present in current frontend | Phase 2 |
| Tag color management UI | Backend exists; UI not present | Phase 2 |
| Duplicates resolution UI | Backend exists; UI not present | Phase 2 |
| BibTeX import/export UI | Backend exists; UI not present | Phase 2 |
| Browser extension | Not in MVP | Future |
| Watch folders | Not in MVP | Future |
| Word/Google Docs plugin | Not in MVP | Future |
| Mobile app | Not in MVP | Future |
| Offline support | Not in MVP | Phase 2 |
| Citation style selection (7000+) | Limited styles only | Future |
| Group libraries | Not in MVP | Phase 2 |

---

## 4. Critical User Workflows

These are the **must-pass** workflows for beta launch. If any of these fail, the feature area needs immediate attention.

### Workflow 1: Create Project -> Edit -> Compile -> Fix Errors

**Persona**: Researcher writing a paper

| Step | Action | Expected | Priority |
|------|--------|----------|----------|
| 1 | Login | Dashboard loads | Must-pass |
| 2 | Projects -> **New Project** -> Create | Editor opens | Must-pass |
| 3 | Open `main.tex`, edit content, click **Save** | Saved indicator updates | Must-pass |
| 4 | Click **Recompile** | PDF renders | **Critical** |
| 5 | Add a LaTeX error, Recompile | Problems badge shows issues | **Critical** |
| 6 | Open **Problems** panel | Errors are listed | **Critical** |
| 7 | Click an error | Editor navigates to correct line | **Critical** |
| 8 | Fix, Recompile | PDF updates; issues clear | **Critical** |

---

### Workflow 2: Bibliography -> Import PDF -> Annotate -> Jump from Notes

**Persona**: Student organizing research papers

| Step | Action | Expected | Priority |
|------|--------|----------|----------|
| 1 | Bibliography -> create collection | Appears in tree | Must-pass |
| 2 | Open collection -> **Import** PDF | Reference appears | **Critical** |
| 3 | Open reference details | INFO PDF + NOTES tabs visible | Must-pass |
| 4 | Open PDF annotation tab and add highlight + note | Persists after refresh | **Critical** |
| 5 | Reference details -> NOTES tab -> click a note | Opens PDF at correct page | **Critical** |

---

### Workflow 3: Version Snapshot -> Preview -> Compare -> Restore

**Persona**: Researcher who made a mistake

| Step | Action | Expected | Priority |
|------|--------|----------|----------|
| 1 | Editor -> Version History | List loads | Must-pass |
| 2 | Create Version | Snapshot created and appears | **Critical** |
| 3 | Preview a version | Preview tabs open | **Critical** |
| 4 | Compare a version | Diff tabs open | **Critical** |
| 5 | Delete half the document | Content deleted | Must-pass |
| 6 | Restore previous version | Content restored | **Critical** |
| 7 | Compile | PDF shows restored content | Must-pass |

---

## 5. Frontend Container Smoke Tests

Run once per test cycle to ensure **every container** is covered. (18 containers)

| # | Container | Smoke Steps | Expected | Status |
|---|----------|-------------|----------|--------|
| 1 | `homePage` | Load dashboard; navigate via cards | No crash; correct routing | |
| 2 | `projectsPage` | Load list; search; open New Project modal | No crash; modal ok | |
| 3 | `loginPage` | Submit empty; submit invalid creds | Inline errors + server error | |
| 4 | `registerPage` | Validate invite code format | "Invalid invite code format" shown | |
| 5 | `requestAccessPage` | Submit; verify success state | "You're on the list!" shown | |
| 6 | `editor` | Load editor route; switch sidebar items | Stable layout | |
| 7 | `EditorPanel` | Open/close tabs; confirm close if changed | Modal appears only when needed | |
| 8 | `MonacoEditor` | Type; Save; verify Saved/Unsaved | Works; no freeze | |
| 9 | `FileBrowsing` | Create/rename/delete/move; upload image | Tree updates + persists | |
| 10 | `DocumentOutline` | Add section; click outline item | Outline updates; navigates | |
| 11 | `FileSearchPanel` | Search and open result | Opens correct file | |
| 12 | `pdfPreview` | Recompile; Problems; download | PDF renders; no UI break | |
| 13 | `CompilationErrorsPanel` | Trigger errors; click error | Navigates to line | |
| 14 | `VersionHistoryPanel` | Create snapshot; preview; compare | Tabs open | |
| 15 | `BibliographyContentLayout` | Switch Library vs Filters | Correct header/content | |
| 16 | `BibliographyAllReferencesPage` | Search; open details; delete cancel | Expected behavior | |
| 17 | `BibliographyCollectionReferencesPage` | Import PDF; open details | Reference appears | |
| 18 | `bibliographyPDFAnnotationTab` | Highlight/underline; comment; delete | Persists | |
| 19 | `linkedBibliography` | Open linked PDF node | PDF tab opens | |

---

## 6. Feature Test Cases

### A. Authentication & Access (8 test cases)

| ID | Test Case | Steps | Expected | Status |
|----|-----------|-------|----------|--------|
| A1 | Login required fields | Submit empty | "Email is required" and "Password is required" | |
| A2 | Login invalid credentials | Wrong password | Error shown; remain logged out | |
| A3 | Login success | Valid credentials | Redirect to dashboard | |
| A4 | Register invite format validation | Invalid invite code | "Invalid invite code format" shown | |
| A5 | Register success | Valid invite + form | Account created | |
| A6 | Request Access required fields | Submit empty | Field errors shown | |
| A7 | Request Access success | Submit valid form | Success screen shown | |
| A8 | Session persistence | Refresh after login | Still logged in | |

---

### B. Projects (8 test cases)

| ID | Test Case | Steps | Expected | Status |
|----|-----------|-------|----------|--------|
| B1 | Projects list loads | Open Projects | List loads (or empty state) | |
| B2 | Search projects | Use "Search projects..." | Results filter | |
| B3 | Create blank project | New Project -> name -> Create | Editor opens; `main.tex` exists | |
| B4 | Import `.zip` | New Project -> select `.zip` -> Create | Import starts; files appear | |
| B5 | Main file selection | Import ambiguous `.zip` | "Select Main File" modal; Continue works | |
| B6 | Rename project | Right-click project -> Rename | Name updated | |
| B7 | Delete project | Right-click project -> Delete -> Confirm | Project removed from list | |
| B8 | Open existing project | Click project in list | Editor loads with files | |

---

### C. Editor Shell (10 test cases)

| ID | Test Case | Steps | Expected | Status |
|----|-----------|-------|----------|--------|
| C1 | Sidebar: File Browser | Click file icon | Files/Outline sections visible | |
| C2 | Sidebar: File Search | Click search icon | Search input shown | |
| C3 | Sidebar: Library Links | Click bibliography icon | "LIBRARY LINKS" panel | |
| C4 | Sidebar: Version History | Click history icon | List loads | |
| C5 | Dock layout stability | Resize panels; refresh | No blank panels | |
| C6 | Collapse/expand Files section | Toggle "Files" | Collapses/expands without glitches | |
| C7 | Resize Files vs Outline | Drag the divider | Heights update smoothly | |
| C8 | Multiple files in tabs | Open 3+ files | All appear as tabs | |
| C9 | Switch between files | Click different tabs | Content switches | |
| C10 | Close tab with changes | Modify -> close tab | "Close Tab" confirm appears | |

---

### D. File Browser (8 test cases)

| ID | Test Case | Steps | Expected | Status |
|----|-----------|-------|----------|--------|
| D1 | Create folder | Click New Folder; name on blur/Enter | Folder created | |
| D2 | Create file | Click New File; name on blur/Enter | File created | |
| D3 | Rename file/folder | Select node -> Rename -> Enter | Name updated; persists | |
| D4 | Delete file/folder | Select -> Delete -> Confirm | Removed; correct modal text | |
| D5 | Drag-drop move file | Drag file into folder | File moves; persists | |
| D6 | Drag-drop move folder | Drag folder into folder | Hierarchy updates; persists | |
| D7 | Upload image | Upload File; select `.png` | Upload succeeds; file usable | |
| D8 | Open file in editor | Click `.tex` file in tree | Content loads in editor | |

---

### E. Monaco Editor (10 test cases)

| ID | Test Case | Steps | Expected | Status |
|----|-----------|-------|----------|--------|
| E1 | Edit LaTeX content | Type in editor | Text appears, no lag | |
| E2 | Unsaved indicator | Type | Status shows "Unsaved" | |
| E3 | Save button | Click Save | Status shows "Saved" | |
| E4 | Auto-save | Edit content; wait 3 seconds | "Saved" indicator shows | |
| E5 | Manual save | Press Ctrl+S | File saved immediately | |
| E6 | Syntax highlighting | Type `\section{Test}` | Command highlighted differently | |
| E7 | Citation autocomplete | Type `\cite{`; wait for suggestions | Reference suggestions appear | |
| E8 | Reference autocomplete | Type `\ref{`; wait for suggestions | Label suggestions appear | |
| E9 | Math preview on hover | Type `$E=mc^2$`; hover over formula | KaTeX preview shows | |
| E10 | Copy/paste large content | Paste 1000+ lines | Content pasted without crash | |

---

### F. Outline + File Search (6 test cases)

| ID | Test Case | Steps | Expected | Status |
|----|-----------|-------|----------|--------|
| F1 | Outline sections | Add `\section{Intro}` | Outline shows Intro | |
| F2 | Outline figures/tables | Add figure caption | Outline shows caption | |
| F3 | Navigate from outline | Click outline item | Jumps to line | |
| F4 | Outline equations | Add equation with `\label{eq:test}` | Outline shows label | |
| F5 | File search debounce | Type quickly | Results update without spam | |
| F6 | Open search result | Click result | Correct file opens | |

---

### G. Compile & PDF Preview (12 test cases)

| ID | Test Case | Steps | Expected | Status |
|----|-----------|-------|----------|--------|
| G1 | Recompile | Click Recompile | "Compiling..." then PDF renders | |
| G2 | Problems panel toggle | Click Problems icon | Panel opens/closes | |
| G3 | Error badge counts | Introduce errors/warnings | Badge count updates | |
| G4 | Click error navigates | Click an error | Editor jumps to line | |
| G5 | No PDF state | Open never-compiled project | "No PDF available" message | |
| G6 | Download compiled PDF | Click download icon | PDF file downloads | |
| G7 | Large PDF performance | Compile large doc | Renders; usable scrolling | |
| G8 | Unparseable failure state | Force compile failure | "No errors to display" state | |
| G9 | Zoom in | Click zoom in or use Ctrl++ | PDF zooms in | |
| G10 | Zoom out | Click zoom out or use Ctrl+- | PDF zooms out | |
| G11 | SyncTeX: PDF to editor | Click location in PDF | Editor jumps to source line | |
| G12 | SyncTeX: editor to PDF | Click in editor; use sync shortcut | PDF highlights location | |

---

### H. Version History (8 test cases)

| ID | Test Case | Steps | Expected | Status |
|----|-----------|-------|----------|--------|
| H1 | Load versions | Open Version History | List loads | |
| H2 | Create snapshot | Create Version | New version appears | |
| H3 | Preview snapshot | Preview a version | Preview tabs open | |
| H4 | Compare with current | Compare -> current | Diff tabs open | |
| H5 | Compare with previous | Compare -> previous | Diff tabs open | |
| H6 | Restore version | Preview version -> Click Restore | Content restored | |
| H7 | Load more | Load more versions | Pagination works | |
| H8 | Version metadata | View version details | Shows timestamp, type, author | |

---

### I. Bibliography: Collections + References (12 test cases)

| ID | Test Case | Steps | Expected | Status |
|----|-----------|-------|----------|--------|
| I1 | Create collection | Library -> plus -> name | Created | |
| I2 | Create nested collection | Select parent -> plus | Nested created | |
| I3 | Rename collection | Select -> rename | Renamed | |
| I4 | Delete collection | Select -> delete -> confirm | Deleted; no crash | |
| I5 | All references search | All references -> Search | Filters by title | |
| I6 | Import PDF | Collection page -> Import -> select PDF | Reference appears | |
| I7 | Filters sidebar shows values | Switch to Filters | Year range + Venue/Tags/Authors visible | |
| I8 | Filters affect results | Select a venue/author/tag | All references list updates | |
| I9 | View all references | Navigate to All References | All references listed | |
| I10 | Create reference manually | Click Add -> Fill form -> Save | Reference created | |
| I11 | Sort by columns | Click column header | References sorted | |
| I12 | Pagination | Navigate through pages | Pagination works | |

---

### J. Reference Details + NOTES (10 test cases)

| ID | Test Case | Steps | Expected | Status |
|----|-----------|-------|----------|--------|
| J1 | INFO PDF fields render | Open details | Type/title/authors/year/venue/doi/tags visible | |
| J2 | Add/remove author | Add Author; remove | Form updates | |
| J3 | Add/remove tag | Add Tag; remove | Form updates | |
| J4 | Update reference persists | Change title; Update | Persists after refresh | |
| J5 | NOTES tab loading state | Open NOTES | "Loading annotations..." then notes list | |
| J6 | NOTES jump-to-page | Click a note | Opens PDF at that page | |
| J7 | Assign collections | Select multiple Collections and Update | Reference appears in collections | |
| J8 | Delete reference | Click Delete -> Confirm | Reference removed | |
| J9 | Edit reference metadata | Edit fields -> Save | Changes saved | |
| J10 | Reference belongs to multiple collections | Add ref to 2+ collections | Ref appears in both | |

---

### K. PDF Annotations (10 test cases)

| ID | Test Case | Steps | Expected | Status |
|----|-----------|-------|----------|--------|
| K1 | Create highlight | Select highlight mode; select text | Highlight saved | |
| K2 | Create underline | Select underline mode; select text | Underline saved | |
| K3 | Change color | Select color; create highlight | New highlight uses color | |
| K4 | Add note/comment | Add comment | Note persists | |
| K5 | Edit annotation comment | Click annotation -> Edit comment | Changes saved | |
| K6 | Delete annotation | Delete highlight | Removed after refresh | |
| K7 | Area selection | Alt + drag | Area annotation created (if supported) | |
| K8 | Loading state | Slow network | Shows progress % | |
| K9 | Error state | Broken worker/network | "Error loading PDF" shown | |
| K10 | View annotations list | Open annotations panel | All annotations listed | |

---

### L. Linked Library (8 test cases)

| ID | Test Case | Steps | Expected | Status |
|----|-----------|-------|----------|--------|
| L1 | Linked tree loads | Editor -> Library Links | Tree renders when linked | |
| L2 | Open linked PDF | Click PDF node | Opens PDF tab in preview | |
| L3 | Toggle annotations overlay | Linked PDF view toggle | Overlay appears | |
| L4 | Open in bibliography | Click "Open in Bibliography" | Navigates and selects reference | |
| L5 | Link collection to project | Open editor -> Link bibliography | Collection linked | |
| L6 | View linked references | Open bibliography sidebar | References appear | |
| L7 | Insert citation | Double-click reference | `\cite{key}` inserted | |
| L8 | Unlink collection | Click unlink | Collection unlinked | |

---

## 7. Competitor-Inspired Workflows

These tests reflect expectations users bring from Zotero/Mendeley/Overleaf.

### Zotero-style Expectations (6 test cases)

| ID | Test Case | Steps | Expected | Status |
|----|-----------|-------|----------|--------|
| Z1 | PDF metadata retrieval | Import PDF | At least title/authors/DOI when available | |
| Z2 | Duplicate import behavior | Import same PDF twice | Clear behavior (prevent or allow) | |
| Z3 | Deep nesting | Create 3 nested collections | Works without glitches | |
| Z4 | Annotation persistence | Highlight + note; refresh | Still present | |
| Z5 | Link library to writing | Linked PDF opens from editor | Works | |
| Z6 | Combined filtering | Filter by tag + collection | Both filters apply | |

### Mendeley-style Expectations (5 test cases)

| ID | Test Case | Steps | Expected | Status |
|----|-----------|-------|----------|--------|
| M1 | Large library usability | 100+ references | List/filter remain usable | |
| M2 | Notes list readability | Many notes | Readable; navigable | |
| M3 | Bulk drag refs | Select 5+ refs -> Drag to collection | All refs moved | |
| M4 | BibTeX export | Select refs -> Export BibTeX | .bib file downloads | |
| M5 | Keyboard shortcuts | Test documented shortcuts | Shortcuts work | |

### Overleaf-style Expectations (6 test cases)

| ID | Test Case | Steps | Expected | Status |
|----|-----------|-------|----------|--------|
| O1 | Compile feedback clarity | Recompile | Clear state + result | |
| O2 | Error-to-source navigation | Click error | Jumps to correct location | |
| O3 | Versioning parity | Create snapshot; preview; compare | Works reliably | |
| O4 | SyncTeX behavior | Double-click PDF | Jumps to source when available | |
| O5 | Version history complete | Make 10 edits -> Check history | All versions recorded | |
| O6 | Restore works | Restore old version | Content fully restored | |

### Competitor Research Links

- Zotero: [Retrieve Metadata for PDFs](https://www.zotero.org/support/retrieve_metadata_for_pdfs)
- Zotero: [Duplicate Detection](https://www.zotero.org/support/duplicate_detection)
- Overleaf: [Project history & versioning](https://www.overleaf.com/learn/how-to/Using_the_history_feature)
- Overleaf: [Errors in Overleaf](https://www.overleaf.com/learn/how-to/Errors_in_Overleaf)
- Overleaf: [SyncTeX errors](https://www.overleaf.com/learn/how-to/SyncTeX_errors)

---

## 8. Usability, Accessibility, Compatibility

### Usability Checklist (15 checks)

| Area | Check | Pass/Fail | Notes |
|------|-------|-----------|-------|
| Loading | No blank screens; spinners/messages appear | | |
| Loading | Long operations show progress | | |
| Errors | Messages actionable (not vague) | | |
| Errors | User can recover from errors | | |
| Modals | Escape key closes modals | | |
| Modals | Backdrop click closes modals | | |
| Modals | Focus management correct | | |
| Keyboard | Tab navigation works (no traps) | | |
| Keyboard | Documented shortcuts work | | |
| DnD | Clear feedback during drag/drop | | |
| Performance | No major lag during typing/scrolling | | |
| Empty States | Helpful messages when no data | | |
| Text | Long text truncates with ellipsis | | |
| Forms | Validation errors clear | | |
| Theme | Dark theme is consistent | | |

### Accessibility Basics (5 checks)

| Check | Expected | Pass/Fail | Notes |
|-------|----------|-----------|-------|
| Keyboard navigation | All features accessible via keyboard | | |
| Focus indicators | Visible focus rings on interactive elements | | |
| Screen reader | Main areas have ARIA labels | | |
| Color contrast | Text readable against background | | |
| Alt text | Images have alt text (editor output) | | |

### Browser Compatibility

| Browser | Baseline | PDF Rendering | File Upload | DnD | Status |
|---------|----------|---------------|-------------|-----|--------|
| Chrome (latest) | Required | Required | Required | Required | |
| Firefox (latest) | Required | Required | Required | Required | |
| Safari (latest) | Required | Test | Test | Test | |
| Edge (latest) | Required | Required | Required | Required | |

### Screen Size Testing

| Size | Expected | Status |
|------|----------|--------|
| 1920x1080 (desktop) | Full layout | |
| 1366x768 (laptop) | Usable layout | |
| 1280x720 (small laptop) | Minimum usable | |
| < 1280 width | May be degraded | |

---

## 9. API Endpoint Coverage

Goal: Every endpoint has a manual verification path (UI-driven where possible).

### Auth Service (`/api/auth/*`)

| Endpoint | UI Coverage | Manual Check |
|----------|-------------|--------------|
| `POST /api/auth/register` | Register flow (invite code) | A4, A5 |
| `POST /api/auth/login` | Login flow | A2, A3 |
| `GET /api/auth/profile` | Session persistence | A8 |
| `POST /api/auth/waitlist/join` | Request Access flow | A6, A7 |
| `POST /api/auth/logout` | API-only | Postman/curl |
| `POST /api/auth/refresh-token` | API-only | Postman/curl |

### Document Service (`/api/*`)

| Endpoint | UI Coverage | Manual Check |
|----------|-------------|--------------|
| `GET /api/projects` | Projects page | B1 |
| `POST /api/projects` | New Project modal | B3 |
| `GET /api/projects/:id` | Open project | B8 |
| `PATCH /api/projects/:id` | Project settings | - |
| `DELETE /api/projects/:id` | Delete project | B7 |
| `GET /api/projects/:id/structure` | File Browser tree | D1-D8 |
| `POST /api/projects/:id/folders` | Create folder | D1 |
| `POST /api/projects/:id/files` | Create file | D2 |
| `PUT /api/projects/:id/folders/:folderId/rename` | Rename folder | D3 |
| `PUT /api/projects/:id/files/:fileId/move` | Drag-drop move | D5 |
| `DELETE /api/projects/:id/files/:fileId` | Delete file | D4 |
| `POST /api/projects/:id/upload` | Upload image | D7 |
| `GET /api/projects/:id/search?q=` | File Search | F5, F6 |
| `GET /api/documents/:id` | Open file content | E1 |
| `PUT /api/documents/:id` | Save button | E3 |
| `POST /api/projects/:id/compile` | Recompile button | G1 |
| `GET /api/projects/:id/pdf` | PDF preview | G1 |

### Versions Service (`/api/versions/*`)

| Endpoint | UI Coverage | Manual Check |
|----------|-------------|--------------|
| `GET /api/versions/projects/:projectId` | Version History list | H1 |
| `POST /api/versions/projects/:projectId` | Create Version | H2 |
| `GET /api/versions/projects/:projectId/:versionNumber` | Preview version | H3 |
| `GET /api/versions/documents/:documentId/compare` | Diff tabs | H4, H5 |

### Bibliography Service (`/api/bibliography/*`)

| Endpoint | UI Coverage | Manual Check |
|----------|-------------|--------------|
| `GET /api/bibliography/collections` | Library tree | I1-I4 |
| `POST /api/bibliography/collections` | Create collection | I1, I2 |
| `PATCH /api/bibliography/collections/:id` | Rename collection | I3 |
| `DELETE /api/bibliography/collections/:id` | Delete collection | I4 |
| `GET /api/bibliography/references` | All references | I9 |
| `POST /api/bibliography/references/with-pdf` | Import PDF | I6 |
| `PATCH /api/bibliography/references/:id` | Update reference | J4 |
| `DELETE /api/bibliography/references/:id` | Delete reference | J8 |
| `GET /api/bibliography/references/:id/annotations` | Notes list | J5 |
| `POST /api/bibliography/references/:id/annotations` | Create annotation | K1-K4 |
| `PATCH /api/bibliography/annotations/:id` | Edit annotation | K5 |
| `DELETE /api/bibliography/annotations/:id` | Delete annotation | K6 |
| `GET /api/bibliography/projects/:projectId/collection-structure` | Library Links | L1 |

### API-Only Endpoints (No UI Coverage)

These require direct API testing via Postman/curl:

| Service | Endpoints |
|---------|-----------|
| Auth | `POST /logout`, `POST /refresh-token`, password reset |
| Bibliography | `POST /references/from-url`, `POST /references/import-bibtex`, `GET /references/export-bibtex` |
| Bibliography | `POST /references/import-pdfs`, `POST /references/scan-batch-pdfs` |
| Bibliography | `GET /duplicates`, `POST /duplicates/:id/resolve` |
| Bibliography | Tags CRUD: `GET/POST/PATCH/DELETE /tags` |
| Bibliography | `POST /pdfs/extract-metadata` |

---

## 10. Risk Assessment & Priorities

### Highest-Risk Areas (Test First)

| Priority | Area | Risk | Impact |
|----------|------|------|--------|
| 1 | Project import + main file selection | Complex edge cases | Data loss |
| 2 | Compile pipeline + error parsing | Core functionality | Unusable app |
| 3 | PDF rendering and annotation persistence | User data | Data loss |
| 4 | Version snapshot/preview/compare | Multi-file behavior | Data loss |
| 5 | File browser drag/drop + rename/delete | Data loss risk | User frustration |

### Suggested Test Order

1. **Auth -> Create project -> Compile** (Critical path)
2. **File browser + outline + search** (Editor functionality)
3. **Bibliography import -> details update -> annotate -> notes jump** (Bibliography flow)
4. **Version snapshot -> preview -> compare** (Recovery path)
5. **Large data + browser sweep** (Performance/compatibility)

### Test Time Estimates

| Phase | Tests | Estimated Time |
|-------|-------|----------------|
| Container Smoke Tests | 18 | 30-45 min |
| Critical Workflows | 3 | 20-30 min |
| Feature Tests (A-L) | 120 | 3-4 hours |
| Competitor Workflows | 17 | 45-60 min |
| Usability/Accessibility | 20 | 30-45 min |
| **Total** | **175+** | **5-7 hours** |

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
[Brief description of the bug]

### Steps to Reproduce
1.
2.
3.

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happened]

### Screenshots / Video
[Attach screenshots if applicable]

### Console / Network Errors
```
[Paste any console errors here]
```

### Additional Context
[Any other relevant information]
```

### Severity Guide

| Severity | Definition | Example |
|----------|------------|---------|
| **Critical** | App unusable or data loss | Deleting wrong file, compile breaks all projects |
| **High** | Feature broken, no workaround | Import PDF always fails |
| **Medium** | Workaround exists | Filter broken but search works |
| **Low** | Cosmetic/minor | Misaligned icon, typo |

---

## 12. Test Execution Tracker

| Feature Area | Total Tests | Passed | Failed | Blocked | Notes |
|--------------|-------------|--------|--------|---------|-------|
| Container Smoke Tests | 18 | | | | |
| Authentication & Access | 8 | | | | |
| Projects | 8 | | | | |
| Editor Shell | 10 | | | | |
| File Browser | 8 | | | | |
| Monaco Editor | 10 | | | | |
| Outline + Search | 6 | | | | |
| Compile & PDF Preview | 12 | | | | |
| Version History | 8 | | | | |
| Bibliography Core | 12 | | | | |
| Reference Details + Notes | 10 | | | | |
| PDF Annotations | 10 | | | | |
| Linked Library | 8 | | | | |
| Zotero Workflows | 6 | | | | |
| Mendeley Workflows | 5 | | | | |
| Overleaf Workflows | 6 | | | | |
| Usability | 15 | | | | |
| Accessibility | 5 | | | | |
| Browser Compatibility | 4 | | | | |
| Screen Sizes | 4 | | | | |
| **TOTAL** | **~175** | | | | |

---

## 13. Known Limitations & Gaps

Track these explicitly during beta:

| Area | Limitation | Workaround |
|------|------------|------------|
| Linked Library | Link/unlink collections UI may be incomplete | Use API directly |
| Tags | Backend supports colors/positions; UI treats tags as free-text | Phase 2 feature |
| BibTeX | Import/export endpoints exist; no UI coverage | Use API directly |
| Duplicates | Detection endpoints exist; no resolution UI | Manual cleanup |
| PDF Annotations | External PDF worker URL; restricted networks may fail | Requires open network |
| Real-time Collab | Backend exists; no frontend implementation | Phase 2 |
| Track Changes | Not implemented | Phase 2 |
| Mobile | Not optimized | Use desktop browser |

---

## 14. Issues to Fix Before Beta

Based on codebase exploration, these debug artifacts should be removed:

| File | Issue | Priority |
|------|-------|----------|
| `bibliographyPDFAnnotationTab` | Loading text shows "zzzz" instead of proper message | High |
| `loginPage` | Contains `console.log` debug statements | Medium |
| `registerPage` | Contains `console.log` debug statements | Medium |
| `FileBrowsingPanel` | Contains `console.log` debug statements | Medium |

---

## 15. Sign-off

### Test Completion Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | | | |
| Dev Lead | | | |
| Product Owner | | | |

### Beta Launch Checklist

- [ ] All Critical workflow tests passed
- [ ] All container smoke tests passed
- [ ] No Critical or High severity bugs open
- [ ] Known limitations documented
- [ ] Debug artifacts removed (Section 14)
- [ ] API endpoints verified
- [ ] Browser compatibility verified

---

**Document End**

*This QA document covers 175 manual test cases across 20 feature areas, designed to ensure the platform is ready for MVP closed beta launch.*
