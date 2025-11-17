# PDF Upload Bug Fix - Session 10

## Critical Bug Found

**Issue**: PDF upload fails with "No file provided" (400 error) because the FormData is being corrupted by `JSON.stringify()`.

## Root Cause Analysis

### The Problem
In `/home/mahdi/Desktop/bibliography/bibliography_frontend/src/features/library/api/pdf.mutations.ts`:

**CURRENT CODE (BROKEN):**
```typescript
export function useUploadPdfMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ referenceId, file }: UploadPdfVariables): Promise<PdfUploadResponse> => {
      const formData = new FormData();
      formData.append('file', file);

      // Using apiClient.post() - THIS IS THE BUG!
      const response = await apiClient.post<PdfUploadResponse>(
        `/references/${referenceId}/upload-pdf`,
        formData  // ← Gets JSON.stringify'd, destroying the file data!
      );

      return response.data;
    },
    // ... rest of mutation config
  });
}
```

### Why It Fails

1. `apiClient.post()` calls `JSON.stringify(body)` on line 326 of `client.ts`
2. `JSON.stringify(formData)` converts FormData to string `"[object FormData]"`
3. Backend receives malformed request body (no file field)
4. Multer can't parse the file, `req.file` is undefined
5. Controller returns 400 "No file provided"

### The Solution Exists!

The API client already has a dedicated `uploadFile()` method (lines 352-378 in `client.ts`) that:
- Properly handles FormData
- Removes Content-Type header (lets browser set boundary)
- Doesn't JSON.stringify the body

## The Fix

### Change Required in `pdf.mutations.ts`

**File**: `/home/mahdi/Desktop/bibliography/bibliography_frontend/src/features/library/api/pdf.mutations.ts`

**BEFORE (Lines 45-58):**
```typescript
export function useUploadPdfMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ referenceId, file }: UploadPdfVariables): Promise<PdfUploadResponse> => {
      const formData = new FormData();
      formData.append('file', file);

      // Let browser auto-set Content-Type with boundary parameter
      // DO NOT manually set 'Content-Type': 'multipart/form-data' - it breaks the boundary!
      const response = await apiClient.post<PdfUploadResponse>(
        `/references/${referenceId}/upload-pdf`,
        formData
      );

      return response.data;
    },
```

**AFTER (Fixed):**
```typescript
export function useUploadPdfMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ referenceId, file }: UploadPdfVariables): Promise<PdfUploadResponse> => {
      // Use apiClient.uploadFile() instead of post() to avoid JSON.stringify
      const response = await apiClient.uploadFile<PdfUploadResponse>(
        `/references/${referenceId}/upload-pdf`,
        file  // Pass file directly, uploadFile() creates FormData internally
      );

      return response.data;
    },
```

**Changes**:
1. Remove manual FormData creation (uploadFile handles this)
2. Change `apiClient.post()` to `apiClient.uploadFile()`
3. Pass `file` directly instead of `formData`
4. Remove outdated Content-Type comment (uploadFile already handles this correctly)

## Verification Steps

After applying the fix:

1. **Manual Browser Test**:
   ```bash
   # Open browser
   http://localhost:5173/library

   # Create reference with PDF
   # Expected: Success notification, reference appears in table with PDF
   ```

2. **E2E Tests**:
   ```bash
   cd /home/mahdi/Desktop/bibliography/bibliography_frontend
   pnpm test:e2e e2e/pdf-workflows-session10.spec.ts

   # Expected: All 7 tests pass
   ```

3. **Backend Logs**:
   ```bash
   # Check backend logs for successful PDF upload
   grep "PDF uploaded successfully" ../bibliography_backend/*.log
   ```

## Impact

**Before Fix**:
- ❌ All PDF uploads fail with 400 "No file provided"
- ❌ References created but PDFs not attached
- ❌ All 7 E2E tests fail

**After Fix**:
- ✅ PDF uploads work correctly
- ✅ References created with PDFs attached
- ✅ All 7 E2E tests pass

## Testing Status

**Integration Tests**: ✅ Already passing (14 tests, 12 passing, 2 skipped)
**E2E Tests**: ⏳ Pending fix deployment
**Manual Testing**: ⏳ Pending fix deployment

## Timeline

1. **Bug Discovered**: 2025-01-17 via manual Playwright testing
2. **Root Cause Identified**: JSON.stringify corrupting FormData in apiClient.post()
3. **Fix Designed**: Use existing apiClient.uploadFile() method
4. **Fix Ready**: Awaiting deployment

## Related Issues

- Content-Type boundary bug (FIXED in previous commit)
- Missing author fields in E2E tests (FIXED in previous commit)
- This is the final blocker for Session 10 completion
