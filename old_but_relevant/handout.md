# PDF Reader & Annotations - Implementation Handout

## What Was Completed

### 1. PDF Reader Modal (Zotero-style)
A full-screen modal that opens when double-clicking a reference with a PDF.

**Features implemented:**
- Full-screen dark modal with react-pdf rendering
- Zoom controls: 0.5x to 3.0x (buttons + keyboard `+`/`-`)
- Page navigation: prev/next buttons + direct page input
- Download PDF and Open in New Tab actions
- Close via button or Escape key
- Smart double-click behavior:
  - Reference WITH PDF → Opens PDF reader
  - Reference WITHOUT PDF → Opens edit modal

**Files:**
- `bibliography_frontend/src/features/library/components/PdfReaderModal.tsx`
- `bibliography_frontend/src/features/library/store/library.store.ts` (added `pdfReaderReferenceId`)
- `bibliography_frontend/src/routes/library.tsx` (modal integration)

### 2. Annotation API (Backend)
Complete REST API for storing PDF annotations.

**Endpoints:**
```
GET    /api/bibliography/references/:referenceId/annotations
POST   /api/bibliography/references/:referenceId/annotations
GET    /api/bibliography/annotations/:id
PATCH  /api/bibliography/annotations/:id
DELETE /api/bibliography/annotations/:id
```

**Data model:**
```typescript
{
  type: 'highlight' | 'note',
  content: string,           // Note text or highlighted text
  page: number,
  position: { x, y, width, height },
  color: string,             // Hex color for highlights
  referenceId: ObjectId,
  userId: string
}
```

**Files:**
- `bibliography_backend/src/models/Annotation.ts`
- `bibliography_backend/src/services/AnnotationService.ts`
- `bibliography_backend/src/controllers/AnnotationController.ts`
- `bibliography_backend/src/routes/annotations.ts`
- `shared/src/schemas.ts` (Zod validation)

### 3. Frontend API Hooks (Ready for UI)
TanStack Query hooks prepared for annotation UI:
- `bibliography_frontend/src/features/library/api/annotations.queries.ts`
- `bibliography_frontend/src/features/library/api/annotations.mutations.ts`

### 4. Test Coverage (45 tests)
| Layer | Tests | File |
|-------|-------|------|
| Unit | 20 | `PdfReaderModal.test.tsx` |
| Integration | 17 | `annotations.test.ts` |
| E2E | 8 | `pdf-reader-modal.spec.ts` |

---

## What's Next

### Phase 1: Annotation UI (Priority: HIGH)
Build the interactive annotation layer on top of the PDF reader.

**Option A: react-pdf-highlighter** (Recommended)
```bash
pnpm --filter bibliography-frontend add react-pdf-highlighter
```
- Battle-tested library for PDF annotations
- Supports text selection → highlight creation
- Sidebar for annotation list
- Click annotation → scroll to position

**Option B: Custom implementation**
- More control but more work
- Use `canvas` overlay on react-pdf
- Handle text selection manually

**Tasks:**
1. [ ] Install react-pdf-highlighter
2. [ ] Create `AnnotationLayer.tsx` component
3. [ ] Add highlight creation flow (select text → choose color → save)
4. [ ] Add note creation flow (click position → type note → save)
5. [ ] Build annotation sidebar with list view
6. [ ] Implement click-to-navigate (click annotation → jump to page)
7. [ ] Add annotation editing (change color, edit text)
8. [ ] Add annotation deletion with confirmation

### Phase 2: PDF Search (Priority: MEDIUM)
Add text search within PDFs.

**Approach:**
```typescript
// react-pdf exposes text content
const textContent = await page.getTextContent();
// Search through textContent.items
```

**Tasks:**
1. [ ] Add search input to PDF reader toolbar
2. [ ] Implement text extraction from all pages
3. [ ] Highlight matching text
4. [ ] Navigate between matches (prev/next)
5. [ ] Show match count

### Phase 3: Multi-page Navigation (Priority: LOW)
For PDFs with many pages, add:
- Thumbnail sidebar
- Page overview/grid view
- Keyboard navigation (Page Up/Down)

---

## Architecture Notes

### State Flow
```
User double-clicks row
  → ReferenceTable.onDoubleClick
  → if hasPdf: setPdfReaderReferenceId(id)
  → library.tsx renders PdfReaderModal when id is set
  → Modal fetches reference via useReferenceQuery
  → PDF loads via react-pdf Document/Page
```

### Annotation Flow (to implement)
```
User selects text in PDF
  → react-pdf-highlighter fires onSelectionFinished
  → Show highlight color picker
  → User picks color → createAnnotationMutation
  → Backend saves to MongoDB
  → Query invalidation → annotation appears in sidebar
```

### Key Integration Points
- `PdfReaderModal.tsx:350-372` - Where Document/Page render (add annotation layer here)
- `annotations.queries.ts` - Hooks ready to use
- `library.store.ts` - Add annotation-related state if needed

---

## Commands Reference

```bash
# Run all tests
pnpm test

# Run specific test suites
pnpm --filter bibliography-frontend test:unit -- PdfReaderModal
pnpm --filter bibliography-backend test:integration -- annotations
pnpm exec playwright test e2e/pdf-reader-modal.spec.ts

# Dev servers
pnpm dev

# Type check
pnpm --filter bibliography-frontend tsc --noEmit
pnpm --filter bibliography-backend tsc --noEmit
```

---

## Resources

- [react-pdf-highlighter](https://github.com/agentcooper/react-pdf-highlighter) - Annotation library
- [react-pdf docs](https://react-pdf.org/) - PDF rendering
- [Zotero reader source](https://github.com/zotero/zotero/tree/main/chrome/content/zotero/reader) - Reference implementation
- Project spec: `docs/01-specification/Spec.md` Section 2.6 (PDF Viewer)
