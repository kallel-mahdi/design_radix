# Session 10: PDF Upload Bug Report

## Executive Summary

Manual Playwright exploration revealed a **critical bug** preventing PDF uploads from working in both create and edit reference workflows. The bug has been identified and a fix has been proposed.

---

## Bug Details

### Issue
**Title:** PDF upload fails with "Multipart: Boundary not found" error
**Severity:** Critical (blocks all PDF upload functionality)
**Status:** Identified, awaiting fix

### Symptoms
1. ✅ Reference creation works
2. ✅ Reference editing works
3. ❌ PDF upload during creation fails with 500 error
4. ❌ PDF upload during edit fails with 500 error
5. User sees two toasts:
   - ✅ "Reference created/updated successfully"
   - ❌ "Server error. Please try again later."

### Error Messages
```
Backend (500 Error):
POST http://localhost:8005/api/bibliography/references/:id/upload-pdf
Status: 500 Internal Server Error

Frontend (Console):
Form submission error: {message: Multipart: Boundary not found, code: Error, details: Object}
Location: ReferenceModal.tsx:191
```

### Root Cause
**File:** `bibliography_frontend/src/features/library/api/pdf.mutations.ts`
**Lines:** 54-56

```typescript
// BUGGY CODE:
const response = await apiClient.post<PdfUploadResponse>(
  `/references/${referenceId}/upload-pdf`,
  formData,
  {
    headers: {
      'Content-Type': 'multipart/form-data',  // ← BUG!
    },
  }
);
```

**Explanation:**
When using `FormData` with fetch/axios, the browser automatically sets the `Content-Type` header with the correct multipart boundary:
```
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryXXXXXXXX
```

By manually setting `'Content-Type': 'multipart/form-data'`, we **override** this auto-generated header and remove the boundary parameter. The backend's Multer middleware then cannot parse the multipart data because it doesn't know where form parts begin/end.

### The Fix

**Remove the explicit `Content-Type` header:**

```typescript
// FIXED CODE:
const response = await apiClient.post<PdfUploadResponse>(
  `/references/${referenceId}/upload-pdf`,
  formData
  // No headers option - browser handles Content-Type automatically!
);
```

---

## Playwright Manual Testing Results

### Test Environment
- Frontend: `http://localhost:5173/library`
- Backend: `http://localhost:8005/api/bibliography`
- Browser: Chromium (Playwright MCP)
- Date: 2025-11-17

### Workflows Tested

#### 1. Create Reference with PDF Upload
**Steps:**
1. Click "New Reference" button ✅
2. Fill title: "Test PDF Upload Paper" ✅
3. Click PDF upload zone ✅
4. Select `minimal.pdf` (293 B) ✅
5. Verify "Pending upload" indicator shows ✅
6. Fill author last name: "TestAuthor" ✅
7. Click "Create" button ✅

**Results:**
- Reference created successfully ✅
- PDF upload failed with 500 error ❌
- Reference appears in table without PDF ✅
- Files column empty (as expected due to upload failure) ✅

#### 2. View Reference Details
**Steps:**
1. Click on "Test PDF Upload Paper" row ✅
2. DetailsPane opens on right side ✅
3. Info tab shows reference metadata ✅
4. Click PDF tab ✅

**Results:**
- Empty state displayed correctly ✅
- Shows "No PDF attached" heading ✅
- Shows "Upload a PDF file for this reference to view it here." message ✅

#### 3. Edit Reference and Upload PDF
**Steps:**
1. Double-click on "Test PDF Upload Paper" row ✅
2. Edit modal opens with populated fields ✅
3. Modal title shows "Edit Reference" ✅
4. Click PDF upload zone ✅
5. Select `small-test.pdf` (739 B) ✅
6. Verify "Pending upload" indicator shows file details ✅
7. Click "Save Changes" button ✅

**Results:**
- Reference updated successfully ✅
- PDF upload failed with 500 error ❌
- Same multipart boundary error in console ❌

### Components Verified Working

✅ **ReferenceModal** - Opens correctly in create/edit modes
✅ **PdfUploadZone** - File selection works, shows pending upload state
✅ **PdfTab** - Empty state renders correctly
✅ **DetailsPane** - Opens on row click, tabs work
✅ **Reference CRUD** - Create and update operations succeed

### Components With Bugs

❌ **pdf.mutations.ts** - Incorrect Content-Type header breaks upload

---

## Testing Status

### Backend Tests
- ✅ **Unit Tests:** 13 tests in `ReferenceService.test.ts` (all passing)
  - uploadPdf metadata saving
  - File replacement
  - User isolation
  - Null returns
- ✅ **Integration Tests:** 14 tests in `pdf-upload.test.ts` (12 passing, 2 skipped)
  - Upload endpoint validation
  - Download endpoint (1 skipped - sendFile path issue)
  - Delete endpoint
  - Invalid MIME type (1 skipped - Multer error handling)

### Frontend Tests
- 📋 **E2E Tests:** 7 test scaffolds in `pdf-workflows-session10.spec.ts`
  - Upload via ReferenceModal
  - View in PdfTab with zoom controls
  - Replace PDF
  - Delete PDF
  - Error handling
  - Empty state
  - Complete workflow
  - **Status:** Created but not runnable until bug fix applied

---

## Next Steps

### 1. Apply Bug Fix
```bash
cd bibliography_frontend
# Edit src/features/library/api/pdf.mutations.ts
# Remove lines 53-57 (headers option)
```

### 2. Verify Fix Works
```bash
# Start dev servers
pnpm dev

# Manual test:
# 1. Create reference with PDF → should succeed
# 2. Edit reference with PDF → should succeed
# 3. View PDF in PdfTab → should show react-pdf viewer
```

### 3. Run Test Suite
```bash
# Backend tests
cd ../bibliography_backend
pnpm test:unit  # Should pass all 45 tests
pnpm test:integration  # Should pass 14 tests (2 skipped acceptable)

# Frontend E2E tests
cd ../bibliography_frontend
pnpm test:e2e e2e/pdf-workflows-session10.spec.ts  # Should pass all 7 tests
```

### 4. Additional E2E Tests Needed (Post-Fix)
- [ ] Test PDF viewer zoom in/out functionality
- [ ] Test PDF viewer page navigation (multi-page PDFs)
- [ ] Test PDF download button
- [ ] Test "Open in new tab" button
- [ ] Test PDF replacement (verify old file deleted)
- [ ] Test concurrent uploads (race conditions)
- [ ] Test large PDF uploads (>1MB)

---

## Impact Assessment

### Current Impact
- **Critical:** PDF upload feature completely non-functional
- **User Experience:** Confusing (shows success + error toast simultaneously)
- **Data Integrity:** No impact (references created correctly, just missing PDFs)

### Post-Fix Impact
- **Immediate:** All PDF upload/view/delete functionality will work
- **Testing:** E2E tests can be executed and verified
- **MVP Delivery:** Session 10 can be marked as complete

---

## Lessons Learned

1. **FormData + Content-Type:** Never manually set Content-Type when using FormData - let the browser handle it
2. **Error Detection:** Manual Playwright exploration caught the bug that unit/integration tests missed (they use mocked files)
3. **Test Strategy:** E2E tests with real file uploads would have caught this immediately
4. **Two-Phase Testing:** Always test with real browser + network before marking features complete

---

## References

- **Multipart Form Data Spec:** https://www.rfc-editor.org/rfc/rfc2046#section-5.1
- **Fetch API + FormData:** https://developer.mozilla.org/en-US/docs/Web/API/FormData
- **Multer Documentation:** https://github.com/expressjs/multer#readme
- **React Query File Uploads:** https://tanstack.com/query/latest/docs/react/guides/mutations#mutation-side-effects

---

**Report Generated:** 2025-11-17 01:30 UTC
**Author:** Claude (Playwright MCP Manual Testing)
**Session:** 10 - PDF Upload & Viewer
