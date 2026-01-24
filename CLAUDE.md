# Bibliography Manager - AI Agent Context

## Current Status: PRE-BETA QA PHASE

**Launch**: Beta in 1 week
**Priority**: Manual QA testing to ensure platform is useful and usable
**Focus**: Bug finding, workflow validation, usability testing

---

## Project Overview

A collaborative LaTeX editor with integrated bibliography management - combining the power of **Overleaf** (LaTeX editing) with **Zotero** (reference management) in a single web platform.

**Vision**: Overleaf + Zotero combined, more elegant and tightly integrated.

---

## Project Structure

```
bibliography/
├── frontend-v2/              # React frontend (Vite + TypeScript)
├── backend/                  # Microservices backend
│   └── services/
│       ├── api-gateway/      # Port 8000 - Routing & auth
│       ├── auth-service/     # Port 8001 - JWT auth
│       ├── document-service/ # Port 8002 - LaTeX documents
│       ├── collaboration-service/ # Port 8003 - Real-time
│       ├── latex-service/    # Port 8004 - Compilation
│       └── bibliography-service/ # Port 8005 - References
├── docs/                     # Documentation
│   ├── QA-MANUAL-TESTING.md  # 131 manual test cases
│   └── QA-CLAUDE-AUTOMATION.md # Future automation guide
└── old_but_relevant/         # Legacy reference files
```

---

## QA Documentation (READ FIRST)

Before any work, read:
1. **`docs/QA-MANUAL-TESTING.md`** - 131 test cases for beta launch
2. **`docs/QA-CLAUDE-AUTOMATION.md`** - Future automation patterns

### Test Case Summary

| Feature Area | Test Cases | Priority |
|--------------|------------|----------|
| Authentication | 6 | High |
| Project Management | 8 | High |
| LaTeX Editor | 12 | Critical |
| LaTeX Compilation | 8 | Critical |
| PDF Preview | 10 | Critical |
| Bibliography Manager | 15 | Critical |
| Collections | 10 | High |
| Tags | 8 | Medium |
| PDF Annotations | 8 | Medium |
| Editor-Bibliography Integration | 10 | Critical |
| Version Control | 8 | High |
| Cross-Feature Workflows | 6 | Critical |
| Competitor Workflows | 17 | High |
| Usability Checklist | 15 | High |
| **TOTAL** | **131** | |

---

## MVP Feature Scope

### In Scope (Must Work for Beta)

| Feature | Status |
|---------|--------|
| PDF import + metadata extraction | Must work |
| Nested collections | Must work |
| Tags with colors (9 max) | Must work |
| Reference in multiple collections | Must work |
| PDF annotations (highlights + comments) | Must work |
| LaTeX editor + compile | Must work |
| Version history (auto + manual) | Must work |
| Citation insertion | Must work |
| BibTeX export | Must work |
| DOI import (CrossRef) | Must work |
| Search + filter | Must work |

### Not in MVP (Don't Test)

| Feature | Planned For |
|---------|-------------|
| Browser extension | Future |
| Watch folders | Future |
| Word/Google Docs plugin | Future |
| Mobile app | Future |
| Real-time collaboration | Phase 2 |
| Track changes | Phase 2 |
| Template library | Future |
| Offline support | Phase 2 |
| Citation style selection (7000+) | Future |
| Group libraries | Phase 2 |

---

## Critical User Workflows

These **must pass** for beta launch:

### 1. Write LaTeX Paper with Citations
```
Login → Create project → Write LaTeX → Import PDF →
Link bibliography → Insert citation → Compile → View PDF
```

### 2. Organize Research Library
```
Navigate to Bibliography → Create collection →
Upload PDFs → Add to collection → Create tags →
Tag papers → Filter → Open PDF → Highlight → Add notes
```

### 3. Version Control Recovery
```
Open project → Edit → Compile (auto-version) →
Delete content → Open history → Preview version → Restore
```

---

## Tech Stack

### Frontend (`frontend-v2/`)
- React 19 + TypeScript
- Vite 7.2
- Redux Toolkit + React Query
- Tailwind CSS 4.1 + Ant Design 6.0
- Monaco Editor (LaTeX)
- react-pdf + react-pdf-highlighter
- Dockview (VS Code-like layouts)

### Backend (`backend/services/`)
- Node.js 22+ TypeScript
- Express.js
- MongoDB + Mongoose
- Inversify (DI)
- Winston (logging)
- Jest (testing)

---

## Development Setup

```bash
# Frontend
cd frontend-v2
npm install
npm run dev           # http://localhost:5173

# Backend (Docker)
cd backend
docker-compose up     # All services
```

---

## QA Workflow for Agents

When asked to help with QA:

### 1. Manual Testing Assistance
```
1. Read docs/QA-MANUAL-TESTING.md
2. Follow test cases step by step
3. Report bugs using the Bug Report Template
4. Mark test cases as Pass/Fail
```

### 2. Bug Investigation
```
1. Get reproduction steps from user
2. Check console for errors
3. Check network requests
4. Trace to source code
5. Propose fix
```

### 3. Bug Report Format
```markdown
## Bug Report

**Feature Area**: [e.g., Bibliography Manager]
**Severity**: Critical / High / Medium / Low

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]

**Expected**: [What should happen]
**Actual**: [What happened]
**Console Errors**: [If any]
```

---

## Key Files by Feature

### LaTeX Editor
- `frontend-v2/src/container/MonacoEditor/`
- `frontend-v2/src/container/editor/EditorLayout.tsx`
- `backend/services/document-service/`
- `backend/services/latex-service/`

### PDF Preview
- `frontend-v2/src/container/pdfPreview/PdfPreview.tsx`
- `frontend-v2/src/utils/synctexService.ts`

### Bibliography Manager
- `frontend-v2/src/container/BibliographyContentLayout/`
- `frontend-v2/src/container/BibliographyCollectionReferencesPage/`
- `backend/services/bibliography-service/`

### Collections & Tags
- `frontend-v2/src/container/BibliographyContentLayout/BibliographyLibrary/`
- `backend/services/bibliography-service/src/models/Collection.ts`
- `backend/services/bibliography-service/src/models/Tag.ts`

### PDF Annotations
- `frontend-v2/src/container/bibliographyPDFAnnotationTab/`
- `backend/services/bibliography-service/src/models/Annotation.ts`

### Version Control
- `frontend-v2/src/container/VersionHistoryPanel/`
- `backend/services/document-service/src/routes/versions.ts`

### Authentication
- `frontend-v2/src/container/loginPage/`
- `backend/services/auth-service/`

---

## Competitor Reference

Users coming from these platforms expect certain workflows:

### From Zotero
- Drag PDF → metadata extracted
- Nested collections
- Multiple tags per reference
- PDF annotation with highlights

### From Mendeley
- Column customization
- BibTeX export
- Bulk operations
- Keyboard shortcuts

### From Overleaf
- Real-time PDF preview
- Version history with restore
- Citation insertion from sidebar
- Error links to source line

See `docs/QA-MANUAL-TESTING.md` Section 6 for competitor-specific test cases.

---

## Coding Philosophy

- Trust TypeScript types (no runtime checks for typed data)
- Use Zod only at system boundaries
- Write clean, minimal code
- Don't over-engineer
- Fix bugs, don't add workarounds

---

## Quick Commands

```bash
# Frontend
cd frontend-v2 && npm run dev      # Dev server
cd frontend-v2 && npm run build    # Build

# Backend
cd backend && docker-compose up    # All services
cd backend && npm test             # Run tests

# Individual service
cd backend/services/bibliography-service && npm run dev
```

---

## Priority During Beta QA

1. **Find bugs** - Use `docs/QA-MANUAL-TESTING.md` test cases
2. **Report clearly** - Use bug report template
3. **Fix critical issues** - Anything blocking core workflows
4. **Document known issues** - For beta user communication

---

**Last Updated**: December 2024
**Status**: Pre-Beta QA Phase
**Focus**: Manual testing, bug fixing, usability validation
