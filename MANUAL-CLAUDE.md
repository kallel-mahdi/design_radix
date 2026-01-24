# Manual QA Testing Guide - Beta Launch

**Version**: 1.0
**Last Updated**: December 2024
**Status**: MVP Closed Beta

---

## Table of Contents

1. [Overview & Purpose](#1-overview--purpose)
2. [Test Environment Setup](#2-test-environment-setup)
3. [MVP Feature Scope](#3-mvp-feature-scope)
4. [Critical User Workflows](#4-critical-user-workflows)
5. [Feature Test Cases](#5-feature-test-cases)
6. [Competitor-Inspired Workflows](#6-competitor-inspired-workflows)
7. [Usability Checklist](#7-usability-checklist)
8. [Bug Report Template](#8-bug-report-template)
9. [Testing Summary](#9-testing-summary)

---

## 1. Overview & Purpose

This document provides exhaustive manual QA test cases for the Bibliography Manager + LaTeX Editor platform before beta launch.

**Goals**:
- Ensure all core workflows function correctly
- Verify the platform is useful and usable for researchers
- Catch critical bugs before beta users encounter them
- Document known limitations for beta feedback

**Target Testers**: Internal team, early beta users

**Platform**: Collaborative LaTeX editor with integrated bibliography management (Overleaf + Zotero combined)

---

## 2. Test Environment Setup

### Prerequisites

1. **Browser**: Chrome (recommended), Firefox, Safari, Edge
2. **Network**: Stable internet connection
3. **Test Account**: Create a fresh account for testing
4. **Test Data**:
   - 2-3 sample PDF papers (academic papers with DOIs)
   - A simple LaTeX document for compilation testing
   - BibTeX file with 5-10 references

### Environment URLs

| Environment | URL | Notes |
|-------------|-----|-------|
| Production | TBD | Beta launch |
| Staging | TBD | Pre-release testing |
| Local Dev | `http://localhost:5173` | Developer testing |

### Before Each Test Session

- [ ] Clear browser cache (or use incognito)
- [ ] Verify backend services are running
- [ ] Note browser version and OS
- [ ] Have console (F12) ready for error logging

---

## 3. MVP Feature Scope

### Included in MVP (Test These)

| Feature | Status | Notes |
|---------|--------|-------|
| PDF import + metadata extraction | In Scope | Core workflow |
| Nested collections | In Scope | Tree structure |
| Tags with colors | In Scope | 9 color slots |
| Reference belongs to multiple collections | In Scope | Supported |
| PDF annotations | In Scope | Highlights + comments |
| LaTeX editor + compile | In Scope | Monaco + PDF preview |
| Version history | In Scope | Auto + manual versions |
| Citation insertion | In Scope | Linked bibliography |
| BibTeX export | In Scope | For external use |
| DOI import | In Scope | CrossRef integration |
| Search + filter | In Scope | Full-text + facets |

### NOT in MVP (Skip or Mark N/A)

| Feature | Status | Planned For |
|---------|--------|-------------|
| Browser extension | Not in MVP | Future |
| Watch folders | Not in MVP | Future |
| Word/Google Docs plugin | Not in MVP | Future |
| Mobile app | Not in MVP | Future |
| Real-time collaboration | Not in MVP | Phase 2 |
| Track changes | Not in MVP | Phase 2 |
| Template library | Not in MVP | Future |
| Offline support | Not in MVP | Phase 2 |
| Citation style selection (7000+) | Not in MVP | Limited styles |
| Group libraries | Not in MVP | Phase 2 |

---

## 4. Critical User Workflows

These are the **must-pass** workflows for beta launch. If any of these fail, the feature area needs immediate attention.

### Workflow 1: Write LaTeX Paper with Citations

**Persona**: Researcher writing a paper

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Login to the platform | Dashboard loads | |
| 2 | Create new project "My Paper" | Project created, editor opens | |
| 3 | Create main.tex file | File appears in file tree | |
| 4 | Write basic LaTeX content | Syntax highlighting works | |
| 5 | Click Compile | PDF preview shows document | |
| 6 | Navigate to Bibliography | Library page loads | |
| 7 | Upload a PDF paper | Metadata extracted automatically | |
| 8 | Return to editor | Editor loads | |
| 9 | Link bibliography collection | References appear in sidebar | |
| 10 | Double-click reference | `\cite{key}` inserted | |
| 11 | Compile again | PDF shows citation | |

**Critical**: Steps 5, 7, 10, 11 are absolute must-pass.

---

### Workflow 2: Organize Research Library

**Persona**: Student organizing papers for thesis

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Navigate to Bibliography | Library loads | |
| 2 | Create collection "Thesis Research" | Collection appears in tree | |
| 3 | Create sub-collection "Chapter 1" | Nested under parent | |
| 4 | Upload 3 PDF papers | All metadata extracted | |
| 5 | Add papers to "Chapter 1" collection | Papers appear in collection | |
| 6 | Create tag "Important" | Tag created with color | |
| 7 | Tag 2 papers as "Important" | Tags appear on papers | |
| 8 | Filter by "Important" tag | Only tagged papers show | |
| 9 | Search for paper by title | Paper found | |
| 10 | Open paper PDF | PDF viewer opens | |
| 11 | Highlight text in PDF | Highlight saved | |
| 12 | Add note to highlight | Note persists after refresh | |

**Critical**: Steps 4, 5, 9, 11, 12 are absolute must-pass.

---

### Workflow 3: Version Control Recovery

**Persona**: Researcher who made a mistake

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1 | Open existing project | Editor loads | |
| 2 | Make significant edit | Content changes | |
| 3 | Compile | Version auto-created | |
| 4 | Open Version History | History panel shows | |
| 5 | See new version listed | Version appears with timestamp | |
| 6 | Delete half the document | Content deleted | |
| 7 | Click previous version | Preview mode shows old content | |
| 8 | Restore previous version | Content restored | |
| 9 | Compile | PDF shows restored content | |

**Critical**: Steps 5, 7, 8 are absolute must-pass.

---

## 5. Feature Test Cases

### A. Authentication (6 test cases)

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| A1 | Register new account | 1. Go to register page<br>2. Fill valid email/password<br>3. Submit | Account created, redirected to dashboard | |
| A2 | Login with valid credentials | 1. Go to login<br>2. Enter valid credentials<br>3. Submit | Logged in, dashboard loads | |
| A3 | Login with invalid credentials | 1. Go to login<br>2. Enter wrong password<br>3. Submit | Error message shown, not logged in | |
| A4 | Logout | 1. Click user menu<br>2. Click logout | Logged out, redirected to login | |
| A5 | Session persistence | 1. Login<br>2. Refresh page | Still logged in | |
| A6 | Password recovery | 1. Click "Forgot password"<br>2. Enter email | Reset email sent (if implemented) | |

---

### B. Project Management (8 test cases)

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| B1 | Create new project | 1. Click "New Project"<br>2. Enter name<br>3. Confirm | Project created, editor opens | |
| B2 | Rename project | 1. Right-click project<br>2. Select Rename<br>3. Enter new name | Name updated | |
| B3 | Delete project | 1. Right-click project<br>2. Select Delete<br>3. Confirm | Project removed from list | |
| B4 | Open existing project | 1. Click project in list | Editor loads with files | |
| B5 | Create folder in file tree | 1. Right-click in file tree<br>2. New Folder<br>3. Enter name | Folder created | |
| B6 | Create file in file tree | 1. Right-click folder<br>2. New File<br>3. Enter name.tex | File created | |
| B7 | Rename/delete file | 1. Right-click file<br>2. Rename or Delete | File renamed/removed | |
| B8 | Import from Overleaf | 1. Click Import<br>2. Select Overleaf<br>3. Authorize | Project imported (if implemented) | |

---

### C. LaTeX Editor (12 test cases)

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| C1 | Open file in editor | 1. Click .tex file in tree | File content loads in editor | |
| C2 | Edit LaTeX content | 1. Type in editor | Text appears, no lag | |
| C3 | Auto-save | 1. Edit content<br>2. Wait 3 seconds | "Saved" indicator shows | |
| C4 | Manual save | 1. Press Ctrl+S | File saved immediately | |
| C5 | Syntax highlighting | 1. Type `\section{Test}` | Command highlighted differently | |
| C6 | Citation autocomplete | 1. Type `\cite{`<br>2. Wait for suggestions | Reference suggestions appear | |
| C7 | Reference autocomplete | 1. Type `\ref{`<br>2. Wait for suggestions | Label suggestions appear | |
| C8 | Math preview on hover | 1. Type `$E=mc^2$`<br>2. Hover over formula | KaTeX preview shows | |
| C9 | Multiple files in tabs | 1. Open 3+ files | All appear as tabs | |
| C10 | Switch between files | 1. Click different tabs | Content switches | |
| C11 | Copy/paste large content | 1. Paste 1000+ lines | Content pasted without crash | |
| C12 | Undo/redo | 1. Type text<br>2. Ctrl+Z<br>3. Ctrl+Y | Undo works, redo works | |

---

### D. LaTeX Compilation (8 test cases)

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| D1 | Compile simple document | 1. Write basic LaTeX<br>2. Click Compile | PDF preview shows document | |
| D2 | Compile with bibliography | 1. Add `\cite{}`<br>2. Include .bib<br>3. Compile | PDF shows citations | |
| D3 | Compile with images | 1. Add `\includegraphics`<br>2. Upload image<br>3. Compile | Image appears in PDF | |
| D4 | Compile with errors | 1. Write invalid LaTeX<br>2. Compile | Error panel shows errors | |
| D5 | Click error to jump | 1. See error<br>2. Click error | Editor jumps to error line | |
| D6 | PDF updates after recompile | 1. Edit document<br>2. Compile again | PDF reflects changes | |
| D7 | Compile timeout handling | 1. Create infinite loop (if possible)<br>2. Compile | Timeout error shown, not stuck | |
| D8 | Large document compilation | 1. Create 50+ page document<br>2. Compile | Compiles (may be slow) | |

---

### E. PDF Preview (10 test cases)

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| E1 | PDF renders correctly | 1. Compile document<br>2. View preview | PDF shows correctly | |
| E2 | Zoom in | 1. Click zoom in or use Ctrl++ | PDF zooms in | |
| E3 | Zoom out | 1. Click zoom out or use Ctrl+- | PDF zooms out | |
| E4 | Page navigation | 1. Use page controls or scroll | Navigate between pages | |
| E5 | SyncTeX: PDF to editor | 1. Click location in PDF | Editor jumps to source line | |
| E6 | SyncTeX: editor to PDF | 1. Click in editor<br>2. Use sync shortcut | PDF highlights location | |
| E7 | Toggle SyncTeX | 1. Toggle sync on/off | Sync enabled/disabled | |
| E8 | Large PDF loading | 1. Compile 100+ page document | PDF loads (may be slow) | |
| E9 | PDF download | 1. Click download button | PDF file downloads | |
| E10 | Print preview | 1. Click print or Ctrl+P | Print dialog opens | |

---

### F. Bibliography Manager (15 test cases)

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| F1 | View all references | 1. Navigate to Bibliography | All references listed | |
| F2 | Create reference manually | 1. Click Add<br>2. Fill form<br>3. Save | Reference created | |
| F3 | Edit reference metadata | 1. Click reference<br>2. Edit fields<br>3. Save | Changes saved | |
| F4 | Delete reference | 1. Select reference<br>2. Delete<br>3. Confirm | Reference removed | |
| F5 | Import PDF with metadata | 1. Upload PDF<br>2. Wait for extraction | Title, authors, DOI extracted | |
| F6 | Import from DOI | 1. Click Add by DOI<br>2. Enter DOI<br>3. Submit | Reference created from DOI | |
| F7 | Import BibTeX file | 1. Click Import<br>2. Select .bib file | References imported | |
| F8 | Search by title | 1. Type title in search | Matching references shown | |
| F9 | Search by author | 1. Type author name | Matching references shown | |
| F10 | Filter by year | 1. Select year range | Only matching years shown | |
| F11 | Filter by venue | 1. Select venue | Only matching venue shown | |
| F12 | Filter by tags | 1. Select tag(s) | Only tagged references shown | |
| F13 | Sort by columns | 1. Click column header | References sorted | |
| F14 | Pagination | 1. Navigate through pages | Pagination works | |
| F15 | View reference details | 1. Click reference | Details panel opens | |

---

### G. Collections (10 test cases)

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| G1 | Create collection | 1. Click New Collection<br>2. Enter name | Collection created | |
| G2 | Rename collection | 1. Right-click collection<br>2. Rename | Name updated | |
| G3 | Delete collection | 1. Right-click collection<br>2. Delete<br>3. Confirm | Collection removed | |
| G4 | Create nested collection | 1. Right-click parent<br>2. Add Subcollection | Subcollection appears nested | |
| G5 | Add reference to collection | 1. Select reference<br>2. Add to collection | Reference appears in collection | |
| G6 | Remove reference from collection | 1. Select reference in collection<br>2. Remove | Reference removed (not deleted) | |
| G7 | Drag reference between collections | 1. Drag reference<br>2. Drop on collection | Reference moved | |
| G8 | View collection references | 1. Click collection | Only collection refs shown | |
| G9 | Expand/collapse tree | 1. Click chevron | Collection expands/collapses | |
| G10 | Collection color | 1. Right-click<br>2. Change color | Color updated | |

---

### H. Tags (8 test cases)

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| H1 | Create tag | 1. Click Add Tag<br>2. Enter name | Tag created | |
| H2 | Rename tag | 1. Right-click tag<br>2. Rename | Name updated | |
| H3 | Delete tag | 1. Right-click tag<br>2. Delete | Tag removed from all refs | |
| H4 | Assign tag to reference | 1. Select reference<br>2. Add tag | Tag appears on reference | |
| H5 | Remove tag from reference | 1. Click X on tag | Tag removed | |
| H6 | Tag color selection | 1. Create tag<br>2. Select color | Color applies (9 max) | |
| H7 | Filter by tag | 1. Click tag in sidebar | Only tagged refs shown | |
| H8 | Multiple tags per reference | 1. Add 3+ tags to ref | All tags displayed | |

---

### I. PDF Annotations (8 test cases)

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| I1 | Open PDF in reader | 1. Click reference PDF icon | PDF reader modal opens | |
| I2 | Highlight text | 1. Select text<br>2. Click highlight | Yellow highlight applied | |
| I3 | Add comment to highlight | 1. Click highlight<br>2. Add comment | Comment saved | |
| I4 | Edit annotation comment | 1. Click annotation<br>2. Edit comment | Changes saved | |
| I5 | Delete annotation | 1. Click annotation<br>2. Delete | Annotation removed | |
| I6 | View annotations list | 1. Open annotations panel | All annotations listed | |
| I7 | Click annotation to jump | 1. Click annotation in list | PDF jumps to location | |
| I8 | Annotations persist | 1. Add annotation<br>2. Close/reopen | Annotation still there | |

---

### J. Editor-Bibliography Integration (10 test cases)

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| J1 | Link collection to project | 1. Open editor<br>2. Link bibliography | Collection linked | |
| J2 | View linked references | 1. Open bibliography sidebar | References appear | |
| J3 | Search within linked refs | 1. Type in sidebar search | Refs filtered | |
| J4 | Insert citation | 1. Double-click reference | `\cite{key}` inserted | |
| J5 | Correct citation key | 1. Insert citation<br>2. Check key | Key matches ref (e.g., smith2024) | |
| J6 | BibTeX file updated | 1. Insert citation<br>2. Check .bib file | Entry added to .bib | |
| J7 | Multiple citations | 1. Insert 5+ citations | All work correctly | |
| J8 | Unlink collection | 1. Click unlink | Collection unlinked | |
| J9 | Switch linked collection | 1. Link different collection | New refs appear | |
| J10 | Compile with bibliography | 1. Add citations<br>2. Compile | PDF shows bibliography | |

---

### K. Version Control (8 test cases)

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| K1 | Auto-version on compile | 1. Compile document | Version created automatically | |
| K2 | Create manual version | 1. Click "Create Version"<br>2. Add label | Version with label created | |
| K3 | View version history | 1. Open history panel | Versions listed with timestamps | |
| K4 | Preview version | 1. Click version | Preview mode shows old content | |
| K5 | Compare versions (diff) | 1. Select two versions<br>2. Compare | Diff view shows changes | |
| K6 | Restore version | 1. Preview version<br>2. Click Restore | Content restored | |
| K7 | Version metadata | 1. View version details | Shows timestamp, type, author | |
| K8 | Many versions load | 1. Create 20+ versions<br>2. Open history | All versions load | |

---

### L. Cross-Feature Workflows (6 test cases)

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| L1 | Full paper workflow | Create project → Write LaTeX → Import PDF → Cite → Compile | Complete paper with citations | |
| L2 | Import to cite workflow | Import PDF → Metadata extracted → Add to collection → Cite in editor | Citation inserted correctly | |
| L3 | Version recovery workflow | Create version → Edit → Compare → Restore | Content restored | |
| L4 | Search and tag workflow | Search refs → Filter → Add tag → Filter by tag | Tag filtering works | |
| L5 | Multi-tab workflow | Open 3+ files → Edit each → Compile | All files saved, PDF correct | |
| L6 | Large project | 10+ files, 50+ refs | Platform performs acceptably | |

---

## 6. Competitor-Inspired Workflows

### From Zotero Users (6 test cases)

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| Z1 | Drag PDF from desktop | 1. Drag PDF file onto library | Metadata extracted automatically | |
| Z2 | Deep collection nesting | 1. Create 3 levels of collections | All levels work correctly | |
| Z3 | Ref in multiple collections | 1. Add same ref to 2+ collections | Ref appears in both | |
| Z4 | PDF annotation + comment | 1. Highlight<br>2. Add comment | Both saved and visible | |
| Z5 | Multiple tags on ref | 1. Add 5+ tags to one ref | All tags displayed | |
| Z6 | Combined filtering | 1. Filter by tag<br>2. Also filter by collection | Both filters apply | |

### From Mendeley Users (5 test cases)

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| M1 | Column customization | 1. Show/hide table columns | Columns update | |
| M2 | PDF resume position | 1. Open PDF at page 5<br>2. Close<br>3. Reopen | Opens at page 5 (if implemented) | |
| M3 | Bulk drag refs | 1. Select 5+ refs<br>2. Drag to collection | All refs moved | |
| M4 | BibTeX export | 1. Select refs<br>2. Export BibTeX | .bib file downloads | |
| M5 | Keyboard shortcuts | 1. Test documented shortcuts | Shortcuts work | |

### From Overleaf Users (6 test cases)

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| O1 | Real-time PDF preview | 1. Type in editor<br>2. Compile | PDF updates in side panel | |
| O2 | Version history complete | 1. Make 10 edits<br>2. Check history | All versions recorded | |
| O3 | Restore works | 1. Restore old version | Content fully restored | |
| O4 | Citation from sidebar | 1. Click ref in sidebar | Citation inserted | |
| O5 | Error links to source | 1. Create error<br>2. Click error | Editor jumps to line | |
| O6 | Collaborator view | 1. Share project<br>2. Other user opens | Both can view (if implemented) | |

---

## 7. Usability Checklist

Check these items across the entire application:

| Area | Check | Pass/Fail | Notes |
|------|-------|-----------|-------|
| **Loading States** | Loading spinners show (not blank screens) | | |
| **Error Messages** | Errors are clear and actionable | | |
| **Button States** | Hover/active states visible | | |
| **Keyboard** | Tab navigation works | | |
| **Keyboard** | Documented shortcuts work | | |
| **Responsive** | Works on 1280x720 screen | | |
| **Theme** | Dark theme is consistent (no jarring colors) | | |
| **Panels** | Resizing works smoothly | | |
| **Drag & Drop** | Visual feedback during drag | | |
| **Text Overflow** | Long text truncates with ellipsis | | |
| **Empty States** | Helpful messages when no data | | |
| **Forms** | Validation errors clear | | |
| **Modals** | Close on Escape key | | |
| **Modals** | Close on backdrop click | | |
| **Performance** | No obvious lag (< 1s response) | | |

---

## 8. Bug Report Template

When you find a bug, use this template:

```markdown
## Bug Report

**Date**: YYYY-MM-DD
**Tester**: [Your Name]
**Environment**: [Browser/Version, OS]

**Feature Area**: [Authentication / Editor / Bibliography / etc.]
**Severity**: [Critical / High / Medium / Low]

### Description
[Brief description of the bug]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happened]

### Screenshots
[Attach screenshots if applicable]

### Console Errors
```
[Paste any console errors here]
```

### Additional Context
[Any other relevant information]
```

### Severity Guide

| Severity | Definition | Example |
|----------|------------|---------|
| **Critical** | App unusable, data loss | Compile crashes, files deleted |
| **High** | Feature broken, no workaround | PDF won't open, citations don't insert |
| **Medium** | Feature broken, workaround exists | Filter doesn't work, can search instead |
| **Low** | Minor issue, cosmetic | Misaligned button, typo |

---

## 9. Testing Summary

### Test Execution Tracker

| Feature Area | Total Tests | Passed | Failed | Blocked | Notes |
|--------------|-------------|--------|--------|---------|-------|
| Authentication | 6 | | | | |
| Project Management | 8 | | | | |
| LaTeX Editor | 12 | | | | |
| LaTeX Compilation | 8 | | | | |
| PDF Preview | 10 | | | | |
| Bibliography Manager | 15 | | | | |
| Collections | 10 | | | | |
| Tags | 8 | | | | |
| PDF Annotations | 8 | | | | |
| Editor-Bib Integration | 10 | | | | |
| Version Control | 8 | | | | |
| Cross-Feature | 6 | | | | |
| Zotero Workflows | 6 | | | | |
| Mendeley Workflows | 5 | | | | |
| Overleaf Workflows | 6 | | | | |
| Usability | 15 | | | | |
| **TOTAL** | **131** | | | | |

### Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | | | |
| Dev Lead | | | |
| Product Owner | | | |

---

**Document End**

*This QA document covers 131 manual test cases across 16 feature areas, designed to ensure the platform is ready for beta launch.*
