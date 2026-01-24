# Comprehensive QA Document Review Prompt

Use this prompt with GPT-5.2 or Claude to exhaustively review and update the QA documentation.

---

## PROMPT START

You are a senior QA engineer tasked with creating exhaustive manual testing documentation for a collaborative LaTeX editor with integrated bibliography management. Your goal is to:

1. **Read all frontend and backend code** to understand every implemented feature
2. **Review and update** the existing QA document to cover ALL functionality
3. **Research competitor workflows** (Zotero, Mendeley, Overleaf) to ensure we test what users expect
4. **Make the document exhaustive** - no feature should be untested

---

## PROJECT CONTEXT

### What This Platform Is

A web-based platform combining:
- **Overleaf** functionality: LaTeX document editing, compilation, PDF preview, version control
- **Zotero** functionality: Reference management, PDF import, metadata extraction, collections, tags, annotations

**Current Status**: MVP closed beta launching in 1 week
**Testing Type**: Manual QA (no E2E automation yet)
**Goal**: Ensure basic workflows work and platform is useful/usable

### Project Structure

```
/home/mahdi/Desktop/bibliography/
├── frontend-v2/              # React frontend
│   └── src/
│       ├── container/        # 68 feature containers (MAIN CODE)
│       ├── components/       # Reusable UI components
│       ├── redux/            # State management
│       ├── react-query/      # API integration
│       ├── context/          # React contexts
│       ├── types/            # TypeScript definitions
│       └── utils/            # Utilities
├── backend/
│   └── services/
│       ├── api-gateway/      # Port 8000
│       ├── auth-service/     # Port 8001
│       ├── document-service/ # Port 8002
│       ├── collaboration-service/ # Port 8003
│       ├── latex-service/    # Port 8004
│       └── bibliography-service/ # Port 8005
└── docs/
    ├── QA-MANUAL-TESTING.md  # Current QA doc (UPDATE THIS)
    └── QA-CLAUDE-AUTOMATION.md # Future automation guide
```

---

## YOUR TASKS

### Task 1: Explore Frontend Code Exhaustively

Read these directories in `frontend-v2/src/`:

**Container Components (Main Features)**:
```
container/
├── editor/                    # LaTeX editor layout
├── MonacoEditor/              # Code editor with LaTeX support
├── pdfPreview/                # PDF rendering + SyncTeX
├── BibliographyContentLayout/ # Bibliography main layout
├── BibliographyCollectionReferencesPage/  # Reference table
├── BibliographyAllReferencesPage/         # All references view
├── bibliographyPDFAnnotationTab/          # PDF annotations
├── VersionHistoryPanel/       # Version control UI
├── CompilationErrorsPanel/    # LaTeX error display
├── FileBrowsing/              # File tree navigator
├── FileSearchPanel/           # Project-wide search
├── DocumentOutline/           # LaTeX document outline
├── linkedBibliography/        # Bibliography in editor
├── projectsPage/              # Projects list
├── homePage/                  # Dashboard
├── loginPage/                 # Authentication
├── registerPage/              # Registration
└── requestAccessPage/         # Waitlist
```

**For each container, identify**:
- What user actions are possible
- What UI elements exist (buttons, forms, modals)
- What error states can occur
- What loading states exist
- What edge cases should be tested

**API Integration** - Check `react-query/`:
```
react-query/
├── auth/           # Login, register, profile
├── editor/         # Document, compile endpoints
├── bibliography/   # References, collections, annotations
├── project/        # Project CRUD
└── versions/       # Version control
```

**State Management** - Check `redux/`:
```
redux/
├── editor/slice.ts       # Editor state
└── bibliography/slice.ts # Bibliography state
```

### Task 2: Explore Backend Code Exhaustively

Read these services in `backend/services/`:

**Bibliography Service** (main focus):
```
bibliography-service/src/
├── controllers/    # Request handlers
├── models/         # Database schemas (Reference, Collection, Tag, Annotation, etc.)
├── routes/         # API endpoints
├── services/       # Business logic
├── middleware/     # Auth, validation
└── utils/          # Helpers
```

**For each endpoint, identify**:
- HTTP method and path
- Request parameters/body
- Response format
- Validation rules
- Error responses
- Edge cases

**Other Services to Review**:
- `auth-service/` - Registration, login, tokens
- `document-service/` - Document CRUD, versions
- `latex-service/` - Compilation
- `collaboration-service/` - Real-time features

### Task 3: Research Competitor Workflows

Search online for:

**Zotero Workflows** (reference manager):
- How users import references (browser extension, PDF drag, DOI, BibTeX)
- How users organize (collections, tags, related items)
- How users annotate PDFs
- How users cite in documents
- Keyboard shortcuts users expect
- Common complaints/pain points

**Mendeley Workflows** (reference manager):
- PDF import and metadata extraction
- Notebook feature (collating highlights)
- Social/discovery features
- Word plugin workflow
- Common complaints/pain points

**Overleaf Workflows** (LaTeX editor):
- Project creation and template selection
- Real-time collaboration patterns
- Version history usage
- Bibliography integration (.bib files)
- Compilation error handling
- PDF sync (SyncTeX)
- Common complaints/pain points

### Task 4: Update QA Document

The current QA document is at: `docs/QA-MANUAL-TESTING.md`

**Review and Update**:

1. **Add Missing Test Cases**
   - For every feature you find in code that isn't in the QA doc, add it
   - Be specific with steps (not vague)
   - Include edge cases

2. **Remove Non-Existent Features**
   - If a test case references something not implemented, remove it or mark as N/A

3. **Add Implementation Details**
   - Add actual button names, menu paths from the code
   - Add actual error messages from the code
   - Add actual field names from forms

4. **Add Competitor-Expected Workflows**
   - Add test cases for workflows Zotero/Mendeley/Overleaf users expect
   - Mark which are implemented vs not

5. **Add Edge Cases**
   - Empty states (no references, no collections, no projects)
   - Large data (100+ references, 50+ page PDFs)
   - Invalid inputs (corrupt PDFs, invalid DOIs)
   - Network failures
   - Session expiry

6. **Add Accessibility Tests**
   - Keyboard navigation
   - Screen reader compatibility
   - Color contrast
   - Focus indicators

7. **Add Browser Compatibility**
   - Chrome, Firefox, Safari, Edge
   - Different screen sizes

---

## CURRENT QA DOCUMENT

Here is the current QA document to review and update:

```markdown
# Manual QA Testing Guide - Beta Launch

**Version**: 1.0
**Last Updated**: December 2024
**Status**: MVP Closed Beta

## Table of Contents

1. Overview & Purpose
2. Test Environment Setup
3. MVP Feature Scope
4. Critical User Workflows
5. Feature Test Cases
6. Competitor-Inspired Workflows
7. Usability Checklist
8. Bug Report Template
9. Testing Summary

## Current Test Coverage

| Feature Area | Test Cases |
|--------------|------------|
| Authentication | 6 |
| Project Management | 8 |
| LaTeX Editor | 12 |
| LaTeX Compilation | 8 |
| PDF Preview | 10 |
| Bibliography Manager | 15 |
| Collections | 10 |
| Tags | 8 |
| PDF Annotations | 8 |
| Editor-Bibliography Integration | 10 |
| Version Control | 8 |
| Cross-Feature Workflows | 6 |
| Competitor Workflows (Zotero) | 6 |
| Competitor Workflows (Mendeley) | 5 |
| Competitor Workflows (Overleaf) | 6 |
| Usability Checklist | 15 |
| TOTAL | 131 |
```

---

## FRONTEND FEATURES DISCOVERED (from previous exploration)

### LaTeX Editor (~11,138 lines, 68 components)
- Monaco Editor with LaTeX syntax highlighting
- Citation autocomplete (\cite{})
- Reference autocomplete (\ref{})
- KaTeX math preview on hover
- Multi-file tabs
- Dockview-based resizable panels

### PDF Preview
- react-pdf rendering
- SyncTeX bidirectional sync
- Zoom in/out
- Page navigation
- PDF download

### Bibliography Manager
- Reference table with columns
- Search by title, author
- Filter by year, venue, tags
- Sort by columns
- Pagination
- Reference details panel

### Collections
- Tree structure (nested)
- Drag-and-drop organization
- Collection colors
- Add/remove references

### Tags
- 9 color slots maximum
- Multiple tags per reference
- Filter by tag

### PDF Annotations
- Highlight text
- Add comments to highlights
- View annotations list
- Jump to annotation location

### Version Control
- Auto-version on compile
- Manual version creation
- Version preview
- Version diff (character-level)
- Restore to version

### Editor-Bibliography Integration
- Link collection to project
- View references in sidebar
- Double-click to insert citation
- BibTeX file generation

---

## BACKEND FEATURES DISCOVERED (from previous exploration)

### Bibliography Service (14 services)
- ReferenceService - CRUD, filtering, search
- CollectionService - Tree operations
- TagService - Color slots
- AnnotationService - PDF highlights
- DuplicateService - Zotero-style detection
- PdfMetadataService - DOI/arXiv extraction
- CrossrefService - DOI lookup
- OpenAlexService - Alternative lookup
- BibTeXService - Import/export
- BatchImportService - Bulk PDF import
- UrlImportService - ArXiv/DOI URLs
- SearchService - Full-text with facets
- ProjectService - Editor integration
- DocumentServiceClient - Cross-service calls

### API Endpoints
- `/api/bibliography/references` - Full CRUD + filtering
- `/api/bibliography/collections` - Tree CRUD
- `/api/bibliography/tags` - Tag CRUD
- `/api/bibliography/annotations` - Annotation CRUD
- `/api/bibliography/duplicates` - Detection/merge
- `/api/bibliography/search` - Full-text search
- `/api/bibliography/projects` - Project links

### Database Models
- Reference (110+ lines) - Core bibliography entry
- Collection - Tree structure with parent
- Tag - Color-coded labels
- Annotation - PDF highlights
- ProjectLink - Editor integration
- DuplicateCandidate - Flagged duplicates

---

## MVP SCOPE (from project context)

### In Scope (Must Test)
- PDF import + metadata extraction
- Nested collections
- Tags with colors (9 max)
- Reference in multiple collections
- PDF annotations
- LaTeX editor + compile
- Version history
- Citation insertion
- BibTeX export
- DOI import
- Search + filter

### Out of Scope (Skip)
- Browser extension
- Watch folders
- Word/Google Docs plugin
- Mobile app
- Real-time collaboration
- Track changes
- Template library
- Offline support
- 7000+ citation styles
- Group libraries

---

## OUTPUT FORMAT

After your review, provide:

1. **Summary of Changes**
   - New test cases added
   - Test cases removed/modified
   - Features found in code but not in QA doc
   - Features in QA doc but not in code

2. **Updated QA Document**
   - Complete markdown document
   - All test cases with specific steps
   - Organized by feature area
   - Include edge cases
   - Include competitor workflows

3. **Risk Assessment**
   - High-risk areas (complex features)
   - Features with insufficient test coverage
   - Recommended testing priorities

4. **Known Limitations**
   - Features not fully implemented
   - Features with known bugs
   - Areas needing more test cases

---

## RESEARCH QUERIES TO RUN

Search for these topics online:

1. "Zotero user workflow reference management 2024"
2. "Mendeley user workflow PDF annotation 2024"
3. "Overleaf user workflow LaTeX collaboration 2024"
4. "Academic reference manager usability testing"
5. "LaTeX editor QA testing checklist"
6. "PDF annotation testing best practices"
7. "SyncTeX testing methodology"
8. "Bibliography management user expectations"
9. "Zotero common complaints pain points"
10. "Overleaf common issues bugs"

---

## FINAL CHECKLIST

Before submitting your updated QA document, verify:

- [ ] Every container component has test cases
- [ ] Every API endpoint has test cases
- [ ] Every database model operation is tested
- [ ] Edge cases are covered (empty, large, invalid)
- [ ] Error states are tested
- [ ] Loading states are verified
- [ ] Competitor workflows are included
- [ ] Accessibility basics are checked
- [ ] Browser compatibility is noted
- [ ] Bug report template is included
- [ ] Test execution tracker is included
- [ ] Priorities are clearly marked

---

## PROMPT END

Now begin by:
1. Reading the frontend code in `frontend-v2/src/container/`
2. Reading the backend code in `backend/services/`
3. Searching online for competitor workflows
4. Updating the QA document with your findings
