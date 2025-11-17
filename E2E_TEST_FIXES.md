# E2E Test Fixes for Session 10

## Problem
All 7 E2E tests in `pdf-workflows-session10.spec.ts` are failing because they don't fill the required author field.

## Root Cause
The ReferenceModal form validates that at least one author field must be filled. The tests only fill the title but skip the author, causing form validation to block submission.

## Fix: Add Author Field to All Tests

Apply these changes to `/home/mahdi/Desktop/bibliography/bibliography_frontend/e2e/pdf-workflows-session10.spec.ts`:

### Test 1: "should upload PDF via ReferenceModal and view in PdfTab" (line 37)

**BEFORE:**
```typescript
test('should upload PDF via ReferenceModal and view in PdfTab', async ({ page }) => {
  // 1. Create new reference
  await page.getByRole('button', { name: 'New Reference' }).click();
  await page.getByLabel('Title').fill('Test Paper with PDF');

  // 2. Upload PDF using file input
  const pdfUploadZone = page.locator('[data-testid="pdf-upload-zone"], .pdf-upload-zone, input[type="file"][accept*="pdf"]').first();
  await pdfUploadZone.setInputFiles(FIXTURE_PATHS.pdfs.minimal);
```

**AFTER:**
```typescript
test('should upload PDF via ReferenceModal and view in PdfTab', async ({ page }) => {
  // 1. Create new reference
  await page.getByRole('button', { name: 'New Reference' }).click();
  await page.getByLabel('Title').fill('Test Paper with PDF');
  await page.getByTestId('author-0-family-input').fill('TestAuthor');  // ADD THIS LINE

  // 2. Upload PDF using file input
  const pdfUploadZone = page.locator('[data-testid="pdf-upload-zone"], .pdf-upload-zone, input[type="file"][accept*="pdf"]').first();
  await pdfUploadZone.setInputFiles(FIXTURE_PATHS.pdfs.minimal);
```

### Test 2: "should show zoom and navigation controls in PdfTab" (line 72)

**BEFORE:**
```typescript
test('should show zoom and navigation controls in PdfTab', async ({ page }) => {
  // Create reference with PDF
  await page.getByRole('button', { name: 'New Reference' }).click();
  await page.getByLabel('Title').fill('PDF Controls Test');
  const pdfInput = page.locator('input[type="file"][accept*="pdf"]').first();
  await pdfInput.setInputFiles(FIXTURE_PATHS.pdfs.smallTest);
```

**AFTER:**
```typescript
test('should show zoom and navigation controls in PdfTab', async ({ page }) => {
  // Create reference with PDF
  await page.getByRole('button', { name: 'New Reference' }).click();
  await page.getByLabel('Title').fill('PDF Controls Test');
  await page.getByTestId('author-0-family-input').fill('ControlsAuthor');  // ADD THIS LINE
  const pdfInput = page.locator('input[type="file"][accept*="pdf"]').first();
  await pdfInput.setInputFiles(FIXTURE_PATHS.pdfs.smallTest);
```

### Test 3: "should replace existing PDF" (line 104)

**BEFORE:**
```typescript
test('should replace existing PDF', async ({ page }) => {
  // Create reference with minimal PDF
  await page.getByRole('button', { name: 'New Reference' }).click();
  await page.getByLabel('Title').fill('PDF Replacement Test');
  const pdfInput1 = page.locator('input[type="file"][accept*="pdf"]').first();
  await pdfInput1.setInputFiles(FIXTURE_PATHS.pdfs.minimal);
```

**AFTER:**
```typescript
test('should replace existing PDF', async ({ page }) => {
  // Create reference with minimal PDF
  await page.getByRole('button', { name: 'New Reference' }).click();
  await page.getByLabel('Title').fill('PDF Replacement Test');
  await page.getByTestId('author-0-family-input').fill('ReplaceAuthor');  // ADD THIS LINE
  const pdfInput1 = page.locator('input[type="file"][accept*="pdf"]').first();
  await pdfInput1.setInputFiles(FIXTURE_PATHS.pdfs.minimal);
```

### Test 4: "should delete PDF via DELETE endpoint" (line 134)

**BEFORE:**
```typescript
test('should delete PDF via DELETE endpoint', async ({ page, workerUserId }) => {
  // Create reference with PDF
  await page.getByRole('button', { name: 'New Reference' }).click();
  await page.getByLabel('Title').fill('PDF Delete Test');
  const pdfInput = page.locator('input[type="file"][accept*="pdf"]').first();
  await pdfInput.setInputFiles(FIXTURE_PATHS.pdfs.minimal);
```

**AFTER:**
```typescript
test('should delete PDF via DELETE endpoint', async ({ page, workerUserId }) => {
  // Create reference with PDF
  await page.getByRole('button', { name: 'New Reference' }).click();
  await page.getByLabel('Title').fill('PDF Delete Test');
  await page.getByTestId('author-0-family-input').fill('DeleteAuthor');  // ADD THIS LINE
  const pdfInput = page.locator('input[type="file"][accept*="pdf"]').first();
  await pdfInput.setInputFiles(FIXTURE_PATHS.pdfs.minimal);
```

### Test 5: "should handle upload errors gracefully" (line 170)

**BEFORE:**
```typescript
test('should handle upload errors gracefully', async ({ page }) => {
  // Try to upload non-PDF file (create temp text file)
  await page.getByRole('button', { name: 'New Reference' }).click();
  await page.getByLabel('Title').fill('Invalid Upload Test');
```

**AFTER:**
```typescript
test('should handle upload errors gracefully', async ({ page }) => {
  // Try to upload non-PDF file (create temp text file)
  await page.getByRole('button', { name: 'New Reference' }).click();
  await page.getByLabel('Title').fill('Invalid Upload Test');
  await page.getByTestId('author-0-family-input').fill('ErrorAuthor');  // ADD THIS LINE
```

### Test 6: "should show empty state when no PDF attached" (line 185)

**BEFORE:**
```typescript
test('should show empty state when no PDF attached', async ({ page }) => {
  // Create reference without PDF
  await page.getByRole('button', { name: 'New Reference' }).click();
  await page.getByLabel('Title').fill('No PDF Reference');
  await page.getByRole('button', { name: /save|create/i }).click();
```

**AFTER:**
```typescript
test('should show empty state when no PDF attached', async ({ page }) => {
  // Create reference without PDF
  await page.getByRole('button', { name: 'New Reference' }).click();
  await page.getByLabel('Title').fill('No PDF Reference');
  await page.getByTestId('author-0-family-input').fill('NoPdfAuthor');  // ADD THIS LINE
  await page.getByRole('button', { name: /save|create/i }).click();
```

### Test 7: "should handle complete workflow: create → upload → view → delete" (line 200)

**BEFORE:**
```typescript
test('should handle complete workflow: create → upload → view → delete', async ({ page, workerUserId }) => {
  // 1. Create reference with PDF
  await page.getByRole('button', { name: 'New Reference' }).click();
  await page.getByLabel('Title').fill('Complete Workflow Test');
  const pdfInput = page.locator('input[type="file"][accept*="pdf"]').first();
  await pdfInput.setInputFiles(FIXTURE_PATHS.pdfs.minimal);
```

**AFTER:**
```typescript
test('should handle complete workflow: create → upload → view → delete', async ({ page, workerUserId }) => {
  // 1. Create reference with PDF
  await page.getByRole('button', { name: 'New Reference' }).click();
  await page.getByLabel('Title').fill('Complete Workflow Test');
  await page.getByTestId('author-0-family-input').fill('WorkflowAuthor');  // ADD THIS LINE
  const pdfInput = page.locator('input[type="file")[accept*="pdf"]').first();
  await pdfInput.setInputFiles(FIXTURE_PATHS.pdfs.minimal);
```

## Expected Results After Fix

After applying these 7 one-line additions:
- ✅ All E2E tests should pass (reference creation succeeds)
- ✅ PDF uploads should work (Content-Type bug already fixed)
- ✅ PDF viewer should display correctly in PdfTab
- ✅ Complete workflow tests should execute successfully

## Verification Steps

```bash
cd bibliography_frontend

# Run specific PDF workflow tests
pnpm test:e2e e2e/pdf-workflows-session10.spec.ts

# Expected output:
# ✅ 7 passed (or 7/7)
```

## Additional Notes

- The Content-Type bug has already been fixed in `src/features/library/api/pdf.mutations.ts`
- Backend integration tests are all passing (14 tests, 12 passing, 2 skipped)
- The only remaining issue is these missing author fields in E2E tests
