# Session 10 Plan: PDF Upload & Viewer

**Created**: 2025-01-16
**Status**: Approved
**Estimated Time**: 3-4 hours

---

## Research Findings

### Zotero Frontend (Attachment UI Patterns)
- **File**: `zotero/chrome/content/zotero/elements/attachmentsBox.js`
- **Finding**: AttachmentsBox component with "Add File" dropdown, attachment rows showing filename/size/icon, preview box with zoom controls
- **Decision**: Adapt pattern for single PDF - integrate upload into ReferenceModal, show PdfTab with react-pdf viewer

### Zotero Backend (Storage Logic)
- **File**: `zotero/chrome/content/zotero/xpcom/attachments.js`
- **Finding**: Link modes (imported=0, URL=1, linked=2), UUID-based storage in local directory, metadata tracking (contentType, path, filename)
- **Decision**: Use imported mode only (MVP scope), store at `./data/bibliography/uploads/{uuid}.pdf`, track metadata in Reference schema

### Zotero Database (Attachment Schema)
- **File**: `zotero/resource/schema/userdata.sql` (lines 202-240)
- **Finding**: `itemAttachments` table with itemID, parentItemID, linkMode, contentType, path, filename
- **Decision**: MongoDB equivalent - embed PDF metadata in Reference document (originalName, storedPath, size, mimeType, uploadedAt), add `hasPdf: boolean` flag

### Editor Frontend (File Upload Pattern)
- **File**: `editor_frontend/src/features/projects/components/FileUpload.tsx`
- **Finding**: FileDropZone component with drag-over state detection, visual feedback, file input ref, progress display with status icons
- **Decision**: Copy drag-drop pattern, adapt for single PDF upload, show filename/size preview before save

### Editor Backend (Multer Configuration)
- **File**: `editor_backend/services/document-service/src/routes/projects.ts` (lines 14-33)
- **Finding**: Multer setup with memory storage, fileFilter for MIME validation, 10MB limit
- **Decision**: Use disk storage (not memory - PDFs are large), UUID filenames, 50MB limit, filter for `application/pdf` only

### WebSearch Verification (react-pdf v9 Best Practices)
- **Query**: "react-pdf v9 zoom controls page navigation best practices 2025"
- **Finding**: No prebuilt toolbar in react-pdf - must build custom controls; lazy loading recommended for performance; keyboard navigation for accessibility (arrows, space, page up/down); text layer for screen readers
- **Decision**: Build custom toolbar with zoom in/out buttons, page navigation (prev/next + input), download/open-in-tab buttons; implement keyboard shortcuts in Phase 2

### WebSearch Verification (Multer UUID Strategy)
- **Query**: "multer disk storage uuid filename node.js best practices"
- **Finding**: Timestamp-based filenames risk collisions with horizontal scaling; use `uuid.v4()` + file extension; server-side MIME validation; create upload directory if not exists
- **Decision**: Implement `multer.diskStorage` with `filename: uuid.v4() + '.pdf'`, ensure `./data/bibliography/uploads/` exists, validate MIME type in fileFilter

---

## Architecture Decisions

### Decision 1: Storage Strategy
**Options**:
- A: Memory storage (editor uses this for small files)
- B: Disk storage with UUID filenames

**Choice**: B (Disk storage)
**Rationale**: PDFs can be 10-50MB, memory storage risks OOM errors. UUID prevents filename conflicts with horizontal scaling (WebSearch: timestamp collisions likely at scale).
**Trade-off**: Requires filesystem management (cleanup, backup), but better for production and allows CDN offloading in future.

### Decision 2: File Size Limit
**Options**:
- A: 10MB (checklist suggestion)
- B: 50MB (API spec says this)

**Choice**: B (50MB)
**Rationale**: Academic papers with high-resolution figures often exceed 10MB. API spec explicitly says 50MB max.
**Trade-off**: Larger uploads = slower network, more storage, but necessary for real-world academic PDFs.

### Decision 3: Upload UX
**Options**:
- A: File input only (simpler implementation)
- B: Drag-and-drop + file input (better UX)

**Choice**: B (User confirmed)
**Rationale**: Better UX matches Zotero pattern. Editor has reusable FileDropZone component to copy. Professional feel.
**Trade-off**: More complex implementation (~30 mins extra), but worth it for polished MVP.

### Decision 4: Viewer Library
**Options**:
- A: iframe (browser native, zero bundle size, Spec.md MVP suggestion)
- B: react-pdf (custom controls, better UX, ComponentsSpec.md recommendation)

**Choice**: B (User confirmed)
**Rationale**: MVP quality requires zoom/navigation controls for usability. react-pdf v9.2.0 already in dependencies. Better accessibility with text layer.
**Trade-off**: +500KB bundle size, more implementation complexity, but necessary for professional PDF viewer experience.

### Decision 5: Upload Flow Integration
**Options**:
- A: Separate "Add File" action after reference creation (Zotero pattern)
- B: Integrate upload into ReferenceModal save flow

**Choice**: B (Integrated flow)
**Rationale**: Simpler UX for single-PDF constraint - create reference and upload PDF in one action. Optimistic update shows hasPdf immediately.
**Trade-off**: Can't defer PDF upload to later, but this matches single-PDF MVP scope.

---

## Deviations from Zotero

### 1. Single PDF per Reference
**Zotero**: Supports multiple attachments of various types (PDF, EPUB, HTML snapshots, web pages, notes)
**Ours**: Single PDF only in MVP
**Rationale**: MVP scope constraint from Spec.md section 2.1. Simplifies data model (embedded pdf object vs separate attachments collection).
**Future**: Phase 2 can add multiple attachments - will require schema migration to separate Attachment collection with referenceId FK.

### 2. No Linked Files/URLs
**Zotero**: 4 link modes - imported file (0), imported URL (1), linked file (2), linked URL (3)
**Ours**: Imported file only (link mode 0 equivalent)
**Rationale**: Simplify MVP storage, avoid external file path issues and broken links. Server-controlled storage ensures availability.
**Future**: Phase 2 can add linked file support for users with existing local PDF libraries.

### 3. Automatic Upload on Reference Save
**Zotero**: Manual "Add File" action separate from item creation (right-click → Attach File)
**Ours**: Upload integrated into ReferenceModal save flow with drag-drop zone
**Rationale**: Simpler UX for single-PDF constraint. Encourages PDF attachment at creation time.
**Future**: Keep this pattern even in Phase 2 (better UX than Zotero's separate action).

### 4. No PDF Annotations in MVP
**Zotero**: Built-in PDF annotation tools (highlight, comment, area selection) in preview pane
**Ours**: Read-only viewer with zoom/navigation/download only
**Rationale**: MVP scope - annotations are Phase 3 feature (per roadmap). Focus on core upload/view/delete first.
**Future**: Phase 3 adds react-pdf-annotator or similar library for highlighting/notes.

---

## Implementation Checklist

### Backend (1.5-2 hours)

#### Setup & Configuration (15 mins)
- [ ] Install dependencies: `pnpm add uuid` and `pnpm add -D @types/uuid`
- [ ] Create upload directory: `mkdir -p ./data/bibliography/uploads/`
- [ ] Add to `.gitignore`: `data/bibliography/uploads/*.pdf` (ignore uploaded files, keep directory)
- [ ] Add to `.gitkeep`: `data/bibliography/uploads/.gitkeep` (ensure directory tracked)

#### File Upload Utility (20 mins)
- [ ] Create `src/utils/fileUpload.ts`:
  - Import multer, uuid, path, fs
  - Ensure upload directory exists: `if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })`
  - Configure multer.diskStorage:
    - destination: `./data/bibliography/uploads/`
    - filename: `uuid.v4() + '.pdf'`
  - Configure multer instance:
    - storage: diskStorage config
    - limits: `{ fileSize: 50 * 1024 * 1024, files: 1 }` (50MB, single file)
    - fileFilter: validate `file.mimetype === 'application/pdf'`, reject others
  - Export `upload` middleware: `export const uploadPdf = upload.single('file')`

#### Data Model (10 mins)
- [ ] Update `src/models/Reference.ts`:
  - Add pdf schema field:
    ```typescript
    pdf: {
      type: {
        originalName: { type: String, required: true },
        storedPath: { type: String, required: true },
        size: { type: Number, required: true },
        mimeType: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now }
      },
      required: false
    }
    ```
  - Add virtual field `hasPdf`: `schema.virtual('hasPdf').get(function() { return !!this.pdf })`
  - Ensure virtual fields serialized in toJSON: `schema.set('toJSON', { virtuals: true })`

#### API Endpoints (40 mins)
- [ ] Update `src/routes/references.ts`:
  - Import uploadPdf middleware from fileUpload.ts
  - Add POST `/references/:id/upload-pdf` route:
    - Middleware: `uploadPdf` (multer), `authMiddleware` (user validation)
    - Controller: `ReferenceController.uploadPdf`
  - Add GET `/references/:id/pdf` route:
    - Middleware: `authMiddleware`
    - Controller: `ReferenceController.downloadPdf`
  - Add DELETE `/references/:id/pdf` route:
    - Middleware: `authMiddleware`
    - Controller: `ReferenceController.deletePdf`

- [ ] Create `src/controllers/ReferenceController.uploadPdf`:
  - Extract referenceId from params, userId from req.user
  - Validate file exists: `if (!req.file) return res.status(400).json({ error: 'FILE_UPLOAD_ERROR', message: 'No file provided' })`
  - Call `ReferenceService.uploadPdf(referenceId, userId, req.file)`
  - Return 200: `{ success: true, message: 'PDF uploaded successfully', data: { hasPdf: true, pdf: {...} } }`
  - Error handling: 400 (invalid file), 404 (reference not found), 403 (unauthorized)

- [ ] Create `src/controllers/ReferenceController.downloadPdf`:
  - Extract referenceId, userId
  - Call `ReferenceService.getPdfPath(referenceId, userId)`
  - Stream file: `res.setHeader('Content-Type', 'application/pdf')`, `res.setHeader('Content-Disposition', 'inline; filename="..."')`, `res.sendFile(absolutePath)`
  - Error handling: 404 (no PDF or reference not found), 403 (unauthorized)

- [ ] Create `src/controllers/ReferenceController.deletePdf`:
  - Extract referenceId, userId
  - Call `ReferenceService.deletePdf(referenceId, userId)`
  - Return 204 No Content
  - Error handling: 404 (reference not found), 403 (unauthorized)

#### Service Layer (25 mins)
- [ ] Update `src/services/ReferenceService.ts`:
  - Add `uploadPdf(referenceId: string, userId: string, file: Express.Multer.File)`:
    - Find reference by ID and userId (ensure ownership)
    - If not found: throw NotFoundError
    - If old PDF exists: delete old file from disk (`fs.unlinkSync(reference.pdf.storedPath)`)
    - Update reference.pdf: `{ originalName: file.originalname, storedPath: file.path, size: file.size, mimeType: file.mimetype, uploadedAt: new Date() }`
    - Save and return updated reference

  - Add `getPdfPath(referenceId: string, userId: string)`:
    - Find reference by ID and userId
    - If not found or no PDF: throw NotFoundError
    - Return `{ storedPath: reference.pdf.storedPath, originalName: reference.pdf.originalName }`

  - Add `deletePdf(referenceId: string, userId: string)`:
    - Find reference by ID and userId
    - If not found: throw NotFoundError
    - If PDF exists: delete file from disk, set `reference.pdf = undefined`, save
    - Return void

#### Testing (Deferred to /session-test)
- [ ] Backend integration tests: `tests/integration/pdf.test.ts`
  - POST /upload-pdf: valid PDF → 200, hasPdf: true
  - POST /upload-pdf: invalid MIME → 400 FILE_UPLOAD_ERROR
  - POST /upload-pdf: >50MB file → 400 FILE_UPLOAD_ERROR
  - POST /upload-pdf: non-existent reference → 404
  - POST /upload-pdf: wrong user → 403
  - GET /pdf: returns PDF blob with correct headers
  - DELETE /pdf: removes file and metadata → 204
  - DELETE /pdf: idempotent (deleting twice doesn't error)

---

### Frontend (1.5-2 hours)

#### PDF Viewer Component (40 mins)
- [ ] Create `src/features/library/components/PdfTab.tsx`:
  - Import react-pdf: `import { Document, Page, pdfjs } from 'react-pdf'`
  - Set worker in useEffect: `pdfjs.GlobalWorkerOptions.workerSrc = \`//cdnjs.cloudflare.com/ajax/libs/pdf.js/\${pdfjs.version}/pdf.worker.min.js\``
  - Props: `reference: Reference | null`
  - State: `numPages: number | null`, `pageNumber: number` (default 1), `scale: number` (default 1.0)
  - Render logic:
    - If `!reference?.hasPdf`: Show empty state with "No PDF attached" message and upload CTA
    - If `reference.hasPdf`: Render PDF viewer
  - PDF viewer structure:
    - Document component: `<Document file={pdfUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>`
    - Page component: `<Page pageNumber={pageNumber} scale={scale} />`
  - Controls (toolbar above Document):
    - Zoom out button: `onClick={() => setScale(s => Math.max(0.5, s - 0.25))}`
    - Zoom in button: `onClick={() => setScale(s => Math.min(3.0, s + 0.25))}`
    - Scale display: `{Math.round(scale * 100)}%`
    - Page navigation: Previous (disabled if page=1), Next (disabled if page=numPages), Page input with total
    - Download button: `<a href={pdfUrl} download={reference.pdf.originalName}>`
    - Open in new tab button: `onClick={() => window.open(pdfUrl)}`
  - PDF URL: `const pdfUrl = \`/api/bibliography/references/\${reference._id}/pdf\``
  - Loading state: Show spinner while Document loading

#### Upload Zone Component (30 mins)
- [ ] Create `src/features/library/components/PdfUploadZone.tsx`:
  - Copy FileDropZone pattern from `editor_frontend/src/features/projects/components/FileUpload.tsx`
  - Props: `onFileSelected: (file: File) => void`, `currentPdf?: { originalName: string, size: number }`
  - State: `isDragOver: boolean`, `selectedFile: File | null`
  - Drag event handlers:
    - onDragOver: `e.preventDefault()`, `setIsDragOver(true)`
    - onDragLeave: `setIsDragOver(false)`
    - onDrop: `e.preventDefault()`, extract file from `e.dataTransfer.files[0]`, validate MIME type, call `onFileSelected(file)`
  - File input ref for click-to-upload: `<input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileChange} hidden />`
  - UI structure:
    - If `currentPdf` exists: Show current filename, size, "Replace PDF" button
    - Else: Show drop zone with dashed border, "Drop PDF here or click to browse" text
    - If `selectedFile` but not uploaded yet: Show filename, size, checkmark icon (pending upload on save)
  - Visual feedback: Change border color on drag-over (border-accent)

#### Extend Reference Modal (20 mins)
- [ ] Update `src/features/library/components/ReferenceModal.tsx`:
  - Import PdfUploadZone component
  - Add state: `selectedPdfFile: File | null`
  - Add PdfUploadZone below notes field in form:
    ```tsx
    <PdfUploadZone
      onFileSelected={(file) => setSelectedPdfFile(file)}
      currentPdf={reference?.pdf}
    />
    ```
  - Update save handler:
    - If `selectedPdfFile` exists: Call `uploadPdfMutation.mutate({ referenceId, file: selectedPdfFile })`
    - Else: Normal save flow
  - Show upload progress indicator during mutation

#### API Integration (20 mins)
- [ ] Create `src/features/library/api/pdf.mutations.ts`:
  - `useUploadPdfMutation()`:
    - useMutation with mutationFn: `({ referenceId, file }) => { const formData = new FormData(); formData.append('file', file); return api.post(\`/references/\${referenceId}/upload-pdf\`, formData) }`
    - onMutate (optimistic update): Set cache `hasPdf: true` for reference
    - onSuccess: Invalidate references query, show success toast
    - onError: Revert optimistic update, show error toast

  - `useDeletePdfMutation()`:
    - useMutation with mutationFn: `(referenceId) => api.delete(\`/references/\${referenceId}/pdf\`)`
    - onMutate (optimistic): Set cache `hasPdf: false`, `pdf: undefined`
    - onSuccess: Invalidate references query
    - onError: Revert, show error toast

#### Wiring in DetailsPane (10 mins)
- [ ] Update `src/components/layout/DetailsPane.tsx`:
  - Import PdfTab component
  - Replace empty Tab.Panel for PDF tab (currently shows "PDF viewer coming soon"):
    ```tsx
    <Tab.Panel>
      <PdfTab reference={selectedReference} />
    </Tab.Panel>
    ```
  - Pass delete mutation if needed in PdfTab props

#### Testing (Deferred to /session-test)
- [ ] Frontend unit tests: `src/features/library/__tests__/PdfTab.test.tsx`
  - Renders empty state when hasPdf=false
  - Renders Document when hasPdf=true
  - Zoom in/out updates scale state
  - Page navigation works (prev/next, input)
  - Download button has correct href
  - Open-in-tab calls window.open with correct URL

- [ ] Integration test: `src/features/library/__tests__/PdfUpload.test.tsx`
  - File selection via input updates selectedFile state
  - Drag-drop updates selectedFile state
  - MIME validation rejects non-PDF files
  - Upload mutation sends FormData with file
  - Optimistic update sets hasPdf immediately

- [ ] E2E test: `e2e/pdf-workflows.spec.ts`
  - Create reference → upload PDF via ReferenceModal → PdfTab shows viewer
  - Zoom and navigate PDF pages
  - Download PDF via button
  - Delete PDF → returns to empty state

---

### Documentation (10 mins)
- [ ] Update `CHANGELOG.md`:
  - Add entry: "Session 10 (2025-01-16): PDF Upload & Viewer - Single PDF per reference with react-pdf viewer, zoom/navigation controls, drag-drop upload"
- [ ] Mark session 10 complete in `docs/02-delivery/checklist/sessions-06-10.md`:
  - Change status from ⏳ Pending to ✅ Complete
- [ ] Add inline code comments for deviations:
  - In `Reference.ts`: `// MVP: Single PDF only (Zotero supports multiple attachments)`
  - In `fileUpload.ts`: `// Imported files only - no linked files/URLs (Zotero has 4 link modes)`

---

## Definition of Done

- ✅ Backend: 3 PDF endpoints (POST upload, GET download, DELETE) functional with proper validation
- ✅ Frontend: PdfTab displays react-pdf viewer with zoom in/out, page navigation (prev/next/input), download, open-in-tab
- ✅ Upload: Drag-drop + file input both work, optimistic update shows hasPdf: true immediately
- ✅ Storage: PDFs saved to `./data/bibliography/uploads/{uuid}.pdf` with .gitignore entry
- ✅ Validation: MIME type (application/pdf only), file size (50MB max), ownership (userId match)
- ✅ UX: Empty state when no PDF ("No PDF attached" message), loading state during upload/load (spinner)
- ✅ Error handling: Proper error messages for invalid MIME, file too large, unauthorized access
- ✅ Manual verification steps pass:
  1. Create reference → upload PDF via drag-drop → save → PdfTab shows viewer with zoom/nav controls
  2. Zoom in/out changes scale visibly
  3. Navigate pages with prev/next buttons and page input
  4. Download button downloads PDF with original filename
  5. Open-in-tab opens PDF in new browser tab
  6. Delete PDF → PdfTab returns to empty state with upload CTA
  7. Upload PDF >50MB → shows error message
  8. Try to upload .docx file → shows "invalid file type" error

---

## References

**Zotero**:
- Attachments UI: `zotero/chrome/content/zotero/elements/attachmentsBox.js` (add file menu, attachment rows)
- Attachment preview: `zotero/chrome/content/zotero/elements/attachmentPreviewBox.js` (zoom controls pattern)
- Storage logic: `zotero/chrome/content/zotero/xpcom/attachments.js` (link modes, UUID storage)
- Schema: `zotero/resource/schema/userdata.sql` (itemAttachments table, lines 202-240)

**Editor**:
- FileUpload component: `editor_frontend/src/features/projects/components/FileUpload.tsx` (drag-drop pattern, progress display)
- Multer setup: `editor_backend/services/document-service/src/routes/projects.ts` (lines 14-33, memory storage config)

**Specs**:
- Session checklist: `docs/02-delivery/checklist/sessions-06-10.md` (lines 226-277)
- API design: `docs/01-specification/backend/APIDesignSystem.md` (PDF endpoints, lines 1001-1046)
- Component spec: `docs/01-specification/frontend/ComponentsSpec.md` (PdfTab specification)
- Spec overview: `docs/01-specification/Spec.md` (MVP scope, single PDF constraint)
- Testing guide: `docs/03-quality/TESTING.md` (60/30/10 split)

**WebSearch Verification**:
- react-pdf v9 best practices: Custom controls required (no prebuilt toolbar), lazy loading for performance, keyboard navigation for accessibility, text layer for screen readers
- Multer UUID patterns: Avoid timestamp collisions with `uuid.v4()`, use disk storage for large files, server-side MIME validation, ensure upload directory exists

**Package Dependencies**:
- Frontend: `bibliography_frontend/package.json` (react-pdf v9.2.0, pdfjs-dist v4.4.168 already installed)
- Backend: Need to add `uuid` package for filename generation
