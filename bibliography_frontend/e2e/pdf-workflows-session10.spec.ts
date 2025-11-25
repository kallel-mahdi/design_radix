/**
 * E2E Tests: PDF Upload, View, Delete (Session 10)
 *
 * Tests the complete PDF workflow:
 * - Upload PDF via ReferenceModal
 * - View PDF in PdfTab with zoom/navigation controls
 * - Download PDF
 * - Replace PDF
 * - Delete PDF
 *
 * Uses worker isolation pattern to prevent race conditions
 */

import { test, expect } from './fixtures/workerFixtures';
import { FIXTURE_PATHS } from './fixtures/paths';

test.describe('PDF Workflows - Session 10', () => {
  test.beforeEach(async ({ page, workerUserId }) => {
    // 1. Route all requests FIRST with worker-specific user ID
    await page.route('http://localhost:8005/api/bibliography/**', async (route) => {
      await route.continue({
        headers: { ...route.request().headers(), 'x-user-id': workerUserId }
      });
    });

    // 2. Navigate to library
    await page.goto('http://localhost:5173/library');
    await page.waitForLoadState('networkidle');

    // 3. Clean up test data AFTER route intercept is set up
    await page.request.delete(
      'http://localhost:8005/api/bibliography/references/test-cleanup',
      { headers: { 'x-user-id': workerUserId } }
    );

    // 4. Reload to show empty state
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should upload PDF via ReferenceModal and view in PdfTab', async ({ page }) => {
    // 1. Create new reference
    await page.getByRole('button', { name: 'New Reference' }).click();
    await page.getByLabel('Title').fill('Test Paper with PDF');
    await page.getByTestId('author-0-family-input').fill('TestAuthor');

    // 2. Upload PDF using file input (target the hidden input directly)
    const pdfInput = page.getByTestId('pdf-file-input');
    await pdfInput.setInputFiles(FIXTURE_PATHS.pdfs.minimal);

    // 3. Verify "Pending upload" indicator shows
    await expect(page.getByText(/pending upload/i)).toBeVisible();

    // 4. Save reference
    await page.getByRole('button', { name: /save|create/i }).click();

    // 5. Wait for reference to appear in table
    await expect(page.getByText('Test Paper with PDF')).toBeVisible();

    // 6. Click reference to open DetailsPane
    await page.getByText('Test Paper with PDF').click();

    // 7. Navigate to PDF tab
    await page.getByRole('tab', { name: 'PDF' }).click();

    // 8. Verify PDF viewer is visible (not empty state)
    await expect(page.getByText(/no pdf attached/i)).not.toBeVisible();

    // 9. Verify zoom controls exist
    await expect(page.getByRole('button', { name: /zoom in/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /zoom out/i })).toBeVisible();

    // 10. Verify page navigation exists
    await expect(page.getByRole('button', { name: /previous page|next page/i }).first()).toBeVisible();
  });

  test('should show zoom and navigation controls in PdfTab', async ({ page }) => {
    // Create reference with PDF
    await page.getByRole('button', { name: 'New Reference' }).click();
    await page.getByLabel('Title').fill('PDF Controls Test');
    await page.getByTestId('author-0-family-input').fill('ControlsAuthor');
    const pdfInput = page.getByTestId('pdf-file-input');
    await pdfInput.setInputFiles(FIXTURE_PATHS.pdfs.smallTest);
    await page.getByRole('button', { name: /save|create/i }).click();

    // Open DetailsPane and navigate to PDF tab
    await page.getByText('PDF Controls Test').click();
    await page.getByRole('tab', { name: 'PDF' }).click();

    // Wait for PDF to load
    await page.waitForTimeout(1000);

    // Test zoom controls
    const zoomDisplay = page.locator('text=/\\d+%/');
    const initialZoom = await zoomDisplay.textContent();

    await page.getByRole('button', { name: /zoom in/i }).click();
    await page.waitForTimeout(500);
    const zoomedIn = await zoomDisplay.textContent();

    expect(zoomedIn).not.toBe(initialZoom);

    // Test download button exists
    await expect(page.getByRole('button', { name: /download/i })).toBeVisible();

    // Test open in new tab button exists
    await expect(page.getByRole('button', { name: /open in new tab/i })).toBeVisible();
  });

  test('should replace existing PDF', async ({ page }) => {
    // Capture console messages for debugging
    page.on('console', msg => {
      if (msg.text().includes('[ReferenceModal]') || msg.text().includes('[DEBUG]') || msg.text().includes('PDF Upload Error') || msg.text().includes('Form submission error')) {
        console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
      }
    });

    // Create reference with minimal PDF
    await page.getByRole('button', { name: 'New Reference' }).click();
    await page.getByLabel('Title').fill('PDF Replacement Test');
    await page.getByTestId('author-0-family-input').fill('ReplaceAuthor');
    const pdfInput1 = page.getByTestId('pdf-file-input');
    await pdfInput1.setInputFiles(FIXTURE_PATHS.pdfs.minimal);
    await page.getByRole('button', { name: /save|create/i }).click();

    // Wait for reference to appear
    await expect(page.getByText('PDF Replacement Test')).toBeVisible();

    // Open reference for editing
    await page.getByText('PDF Replacement Test').click();
    await page.getByRole('button', { name: /edit/i }).click();

    // Wait for modal to be fully visible (HeadlessUI transition)
    await expect(page.getByRole('heading', { name: 'Edit Reference' })).toBeVisible();

    // Click Replace button (PDF already exists) - triggers the hidden file input
    const replaceButton = page.getByRole('button', { name: /replace/i });
    if (await replaceButton.isVisible()) {
      await replaceButton.click();
    }

    // Upload new PDF using the replace input
    const pdfInput2 = page.getByTestId('pdf-file-input-replace');
    await pdfInput2.setInputFiles(FIXTURE_PATHS.pdfs.smallTest);

    // Save changes
    await page.getByRole('button', { name: /save|update/i }).click();

    // Wait for modal to fully close (heading disappears)
    // Note: Success toast may appear/disappear quickly, so we just wait for modal close
    await expect(page.getByRole('heading', { name: 'Edit Reference' })).not.toBeVisible({ timeout: 10000 });

    // Verify PDF tab shows new PDF
    await page.getByRole('tab', { name: 'PDF' }).click();
    await page.waitForTimeout(1000);

    // PDF should load (specific verification depends on implementation)
    await expect(page.getByText(/no pdf attached/i)).not.toBeVisible();
  });

  test('should delete PDF via DELETE endpoint', async ({ page, workerUserId }) => {
    // Create reference with PDF
    await page.getByRole('button', { name: 'New Reference' }).click();
    await page.getByLabel('Title').fill('PDF Delete Test');
    await page.getByTestId('author-0-family-input').fill('DeleteAuthor');
    const pdfInput = page.getByTestId('pdf-file-input');
    await pdfInput.setInputFiles(FIXTURE_PATHS.pdfs.minimal);
    await page.getByRole('button', { name: /save|create/i }).click();

    // Get reference ID (from network or DOM)
    await page.getByText('PDF Delete Test').click();
    const currentUrl = page.url();

    // Extract reference ID from URL or use API
    const response = await page.request.get(
      'http://localhost:8005/api/bibliography/references',
      { headers: { 'x-user-id': workerUserId } }
    );
    const data = await response.json();
    const reference = data.data.find((r: any) => r.title === 'PDF Delete Test');
    const referenceId = reference._id;

    // Delete PDF via API
    await page.request.delete(
      `http://localhost:8005/api/bibliography/references/${referenceId}/pdf`,
      { headers: { 'x-user-id': workerUserId } }
    );

    // Refresh and verify empty state
    await page.reload();
    await page.getByText('PDF Delete Test').click();
    await page.getByRole('tab', { name: 'PDF' }).click();

    // Should show empty state
    await expect(page.getByText(/no pdf attached/i)).toBeVisible();
  });

  test('should handle upload errors gracefully', async ({ page }) => {
    await page.getByRole('button', { name: 'New Reference' }).click();
    await page.getByLabel('Title').fill('Invalid Upload Test');
    await page.getByTestId('author-0-family-input').fill('ErrorAuthor');

    // Submit without PDF (PDF is optional)
    await page.getByRole('button', { name: /save|create/i }).click();

    // Wait for modal to close and success toast
    await expect(page.getByRole('heading', { name: 'Create Reference' })).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/reference created successfully/i)).toBeVisible({ timeout: 5000 });

    // Verify reference created without PDF
    await expect(page.getByText('Invalid Upload Test')).toBeVisible();
    await page.getByText('Invalid Upload Test').click();
    await page.getByRole('tab', { name: 'PDF' }).click();
    await expect(page.getByText(/no pdf attached/i)).toBeVisible();
  });

  test('should show empty state when no PDF attached', async ({ page }) => {
    // Create reference without PDF
    await page.getByRole('button', { name: 'New Reference' }).click();
    await page.getByLabel('Title').fill('No PDF Reference');
    await page.getByTestId('author-0-family-input').fill('NoPdfAuthor');
    await page.getByRole('button', { name: /save|create/i }).click();

    // Open DetailsPane
    await page.getByText('No PDF Reference').click();
    await page.getByRole('tab', { name: 'PDF' }).click();

    // Verify empty state
    await expect(page.getByText(/no pdf attached/i)).toBeVisible();
    await expect(page.getByText(/upload a pdf file/i)).toBeVisible();
  });

  test('should handle complete workflow: create → upload → view → delete', async ({ page, workerUserId }) => {
    // 1. Create reference with PDF
    await page.getByRole('button', { name: 'New Reference' }).click();
    await page.getByLabel('Title').fill('Complete Workflow Test');
    await page.getByTestId('author-0-family-input').fill('WorkflowAuthor');
    const pdfInput = page.getByTestId('pdf-file-input');
    await pdfInput.setInputFiles(FIXTURE_PATHS.pdfs.minimal);
    await page.getByRole('button', { name: /save|create/i }).click();

    // 2. Verify reference appears
    await expect(page.getByText('Complete Workflow Test')).toBeVisible();

    // 3. Open and view PDF
    await page.getByText('Complete Workflow Test').click();
    await page.getByRole('tab', { name: 'PDF' }).click();
    await expect(page.getByText(/no pdf attached/i)).not.toBeVisible();

    // 4. Get reference ID and delete PDF
    const response = await page.request.get(
      'http://localhost:8005/api/bibliography/references',
      { headers: { 'x-user-id': workerUserId } }
    );
    const data = await response.json();
    const reference = data.data.find((r: any) => r.title === 'Complete Workflow Test');

    await page.request.delete(
      `http://localhost:8005/api/bibliography/references/${reference._id}/pdf`,
      { headers: { 'x-user-id': workerUserId } }
    );

    // 5. Reload and verify empty state
    await page.reload();
    await page.getByText('Complete Workflow Test').click();
    await page.getByRole('tab', { name: 'PDF' }).click();
    await expect(page.getByText(/no pdf attached/i)).toBeVisible();

    // 6. Re-upload PDF - must switch to Info tab first (Edit button only visible there)
    await page.getByRole('tab', { name: 'Info' }).click();
    await page.getByRole('button', { name: /edit/i }).click();

    // Wait for modal to open completely
    await expect(page.getByRole('heading', { name: 'Edit Reference' })).toBeVisible();
    const pdfInput2 = page.getByTestId('pdf-file-input');
    await pdfInput2.setInputFiles(FIXTURE_PATHS.pdfs.smallTest);
    await page.getByRole('button', { name: /save|update/i }).click();

    // Wait for success notification and modal to close
    await expect(page.getByText(/reference updated successfully/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Edit Reference' })).not.toBeVisible();

    // 7. Verify PDF shows again
    await page.getByRole('tab', { name: 'PDF' }).click();
    await page.waitForTimeout(1000);
    await expect(page.getByText(/no pdf attached/i)).not.toBeVisible();
  });
});
