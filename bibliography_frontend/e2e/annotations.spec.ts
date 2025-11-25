/**
 * E2E Tests: PDF Annotations (Zotero-style)
 *
 * Tests the annotation system:
 * - Text selection shows HighlightPopover with colors
 * - Creating annotation persists to backend
 * - Annotation sidebar shows all annotations
 * - Delete annotation with confirmation
 *
 * Uses worker isolation pattern for parallel test execution
 */

import { test, expect } from './fixtures/workerFixtures';
import { FIXTURE_PATHS } from './fixtures/paths';

test.describe('PDF Annotations', () => {
  test.beforeEach(async ({ page, workerUserId }) => {
    // 1. Route all requests with worker-specific user ID
    // Need to intercept both backend (8005) and frontend (5173) origins
    // because react-pdf fetches PDF from frontend origin which gets proxied
    await page.route('http://localhost:8005/api/bibliography/**', async (route) => {
      await route.continue({
        headers: { ...route.request().headers(), 'x-user-id': workerUserId },
      });
    });
    await page.route('http://localhost:5173/api/bibliography/**', async (route) => {
      await route.continue({
        headers: { ...route.request().headers(), 'x-user-id': workerUserId },
      });
    });

    // 2. Navigate to library
    await page.goto('http://localhost:5173/library');
    await page.waitForLoadState('networkidle');

    // 3. Clean up test data
    await page.request.delete(
      'http://localhost:8005/api/bibliography/references/test-cleanup',
      { headers: { 'x-user-id': workerUserId, 'x-test-cleanup': 'true' } }
    );

    // 4. Reload to show empty state
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  /**
   * Helper: Create a reference with PDF and open the PDF reader modal
   */
  async function createReferenceWithPdfAndOpenModal(
    page: import('@playwright/test').Page,
    title: string
  ) {
    // Create reference
    await page.getByRole('button', { name: 'New Reference' }).click();
    await page.getByLabel('Title').fill(title);
    await page.getByTestId('author-0-family-input').fill('AnnotationTestAuthor');

    // Upload PDF with text content
    const pdfDropZone = page.locator('text=Drop PDF here or click to browse');
    const fileChooserPromise = page.waitForEvent('filechooser');
    await pdfDropZone.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(FIXTURE_PATHS.pdfs.smallTest);

    await expect(page.getByText('small-test.pdf')).toBeVisible();
    await page.getByRole('button', { name: /create/i }).click();

    // Wait for toast and reference to appear (matches working pdf-reader-modal.spec.ts pattern)
    await expect(page.getByText('Reference created successfully')).toBeVisible();
    await expect(page.getByRole('cell', { name: title, exact: true })).toBeVisible();

    // Double-click to open PDF reader modal
    await page.getByRole('cell', { name: title, exact: true }).dblclick();

    // Wait for modal heading (HeadlessUI transition starts with opacity:0)
    await expect(page.getByRole('heading', { name: title })).toBeVisible({ timeout: 10000 });
  }

  test('toggle annotations sidebar button shows/hides sidebar', async ({ page }) => {
    await createReferenceWithPdfAndOpenModal(page, 'AnnotSidebar');

    // Click toggle button to show sidebar
    await page.getByRole('button', { name: /toggle annotations sidebar/i }).click();

    // Verify sidebar is visible with header
    await expect(page.getByRole('heading', { name: /annotations/i, level: 3 })).toBeVisible();
    await expect(page.getByText('No annotations yet')).toBeVisible();
    await expect(page.getByText('Select text to create a highlight')).toBeVisible();

    // Click toggle again to hide sidebar
    await page.getByRole('button', { name: /toggle annotations sidebar/i }).click();

    // Verify sidebar is hidden (heading should not be visible)
    await expect(page.getByRole('heading', { name: /annotations/i, level: 3 })).not.toBeVisible();
  });

  test('text selection in PDF shows HighlightPopover with color options', async ({ page }) => {
    await createReferenceWithPdfAndOpenModal(page, 'AnnotPopover');

    // Wait for PDF content to load
    await page.waitForSelector('.react-pdf__Page__textContent', { timeout: 10000 });

    // Double-click on PDF text to select a word (triggers text selection)
    await page.locator('.react-pdf__Page__textContent').first().dblclick({ force: true });

    // Verify HighlightPopover appears with color buttons
    await expect(page.getByRole('button', { name: /highlight in yellow/i })).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByRole('button', { name: /highlight in red/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /highlight in blue/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /highlight in purple/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /highlight in green/i })).toBeVisible();

    // Verify cancel button is present
    await expect(page.getByRole('button', { name: /cancel|✕/i })).toBeVisible();
  });

  test('clicking color button creates annotation and shows in sidebar', async ({ page }) => {
    await createReferenceWithPdfAndOpenModal(page, 'AnnotCreate');

    // Open sidebar first
    await page.getByRole('button', { name: /toggle annotations sidebar/i }).click();
    await expect(page.getByRole('heading', { name: /annotations \(0\)/i, level: 3 })).toBeVisible();

    // Wait for PDF content to load
    await page.waitForSelector('.react-pdf__Page__textContent', { timeout: 10000 });

    // Double-click to select text and show popover
    await page.locator('.react-pdf__Page__textContent').first().dblclick({ force: true });

    // Wait for popover to appear
    await expect(page.getByRole('button', { name: /highlight in yellow/i })).toBeVisible({
      timeout: 5000,
    });

    // Click yellow color button to create annotation
    await page.getByRole('button', { name: /highlight in yellow/i }).click();

    // Verify sidebar updates to show 1 annotation
    await expect(page.getByRole('heading', { name: /annotations \(1\)/i, level: 3 })).toBeVisible({
      timeout: 5000,
    });

    // Verify annotation item appears in sidebar
    await expect(page.getByText('Page 1')).toBeVisible();

    // Verify the annotation was created - sidebar already shows (1) from earlier assertion
    // The toggle button with badge is visible in the header
    await expect(page.getByRole('button', { name: /toggle annotations sidebar/i })).toBeVisible();
  });

  test('delete annotation from sidebar shows confirmation and removes it', async ({ page }) => {
    await createReferenceWithPdfAndOpenModal(page, 'AnnotDelete');

    // Open sidebar
    await page.getByRole('button', { name: /toggle annotations sidebar/i }).click();

    // Wait for PDF content
    await page.waitForSelector('.react-pdf__Page__textContent', { timeout: 10000 });

    // Create an annotation
    await page.locator('.react-pdf__Page__textContent').first().dblclick({ force: true });
    await expect(page.getByRole('button', { name: /highlight in yellow/i })).toBeVisible({
      timeout: 5000,
    });
    await page.getByRole('button', { name: /highlight in yellow/i }).click();

    // Wait for annotation to appear in sidebar
    await expect(page.getByRole('heading', { name: /annotations \(1\)/i, level: 3 })).toBeVisible({
      timeout: 5000,
    });

    // Set up dialog handler for confirmation
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Delete this annotation');
      await dialog.accept();
    });

    // Click delete button on annotation
    await page.getByRole('button', { name: /delete annotation/i }).click();

    // Verify annotation is removed
    await expect(page.getByRole('heading', { name: /annotations \(0\)/i, level: 3 })).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText('No annotations yet')).toBeVisible();

    // Verify toast notification appears
    await expect(page.getByText('Annotation deleted')).toBeVisible();
  });

  test('cancel delete keeps annotation', async ({ page }) => {
    await createReferenceWithPdfAndOpenModal(page, 'AnnotCancel');

    // Open sidebar
    await page.getByRole('button', { name: /toggle annotations sidebar/i }).click();

    // Wait for PDF content
    await page.waitForSelector('.react-pdf__Page__textContent', { timeout: 10000 });

    // Create an annotation
    await page.locator('.react-pdf__Page__textContent').first().dblclick({ force: true });
    await expect(page.getByRole('button', { name: /highlight in yellow/i })).toBeVisible({
      timeout: 5000,
    });
    await page.getByRole('button', { name: /highlight in yellow/i }).click();

    // Wait for annotation
    await expect(page.getByRole('heading', { name: /annotations \(1\)/i, level: 3 })).toBeVisible({
      timeout: 5000,
    });

    // Set up dialog handler to DISMISS (cancel)
    page.on('dialog', async (dialog) => {
      await dialog.dismiss();
    });

    // Click delete button
    await page.getByRole('button', { name: /delete annotation/i }).click();

    // Verify annotation is still there
    await expect(page.getByRole('heading', { name: /annotations \(1\)/i, level: 3 })).toBeVisible();
    await expect(page.getByText('Page 1')).toBeVisible();
  });

  test('cancel button on HighlightPopover dismisses popover', async ({ page }) => {
    await createReferenceWithPdfAndOpenModal(page, 'AnnotDismiss');

    // Wait for PDF content
    await page.waitForSelector('.react-pdf__Page__textContent', { timeout: 10000 });

    // Double-click to show popover
    await page.locator('.react-pdf__Page__textContent').first().dblclick({ force: true });
    await expect(page.getByRole('button', { name: /highlight in yellow/i })).toBeVisible({
      timeout: 5000,
    });

    // Click cancel button
    await page.getByRole('button', { name: /cancel|✕/i }).click();

    // Verify popover is dismissed
    await expect(page.getByRole('button', { name: /highlight in yellow/i })).not.toBeVisible();
  });

  test('annotations persist after closing and reopening modal', async ({ page }) => {
    await createReferenceWithPdfAndOpenModal(page, 'AnnotPersist');

    // Open sidebar
    await page.getByRole('button', { name: /toggle annotations sidebar/i }).click();

    // Wait for PDF content
    await page.waitForSelector('.react-pdf__Page__textContent', { timeout: 10000 });

    // Create an annotation
    await page.locator('.react-pdf__Page__textContent').first().dblclick({ force: true });
    await expect(page.getByRole('button', { name: /highlight in yellow/i })).toBeVisible({
      timeout: 5000,
    });
    await page.getByRole('button', { name: /highlight in yellow/i }).click();

    // Wait for annotation
    await expect(page.getByRole('heading', { name: /annotations \(1\)/i, level: 3 })).toBeVisible({
      timeout: 5000,
    });

    // Close modal
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Reopen modal
    await page.getByRole('cell', { name: 'AnnotPersist', exact: true }).dblclick();
    await expect(page.getByRole('heading', { name: 'AnnotPersist' })).toBeVisible({
      timeout: 10000,
    });

    // Wait for PDF content to load (popover bug is fixed, safe to wait now)
    await page.waitForSelector('.react-pdf__Page__textContent', { timeout: 10000 });

    // Verify persistence: The annotation badge on toggle button should show "1"
    // This proves the annotations were fetched successfully after modal reopen
    const toggleBtn = page.getByRole('button', { name: /toggle annotations sidebar/i });
    await expect(toggleBtn).toContainText('1');

    // Also verify the SVG annotation layer rendered the highlight
    // (AnnotationLayer renders SVG rects with the annotation color)
    await expect(page.locator('svg rect[fill="#ffd400"]').first()).toBeVisible();
  });

  test('multiple annotations can be created with different colors', async ({ page }) => {
    await createReferenceWithPdfAndOpenModal(page, 'AnnotMulti');

    // Open sidebar
    await page.getByRole('button', { name: /toggle annotations sidebar/i }).click();

    // Wait for PDF content
    await page.waitForSelector('.react-pdf__Page__textContent', { timeout: 10000 });

    // Create first annotation (yellow)
    await page.locator('.react-pdf__Page__textContent').first().dblclick({ force: true });
    await expect(page.getByRole('button', { name: /highlight in yellow/i })).toBeVisible({
      timeout: 5000,
    });
    await page.getByRole('button', { name: /highlight in yellow/i }).click();
    await expect(page.getByRole('heading', { name: /annotations \(1\)/i, level: 3 })).toBeVisible({
      timeout: 5000,
    });

    // Wait a moment for state to settle
    await page.waitForTimeout(500);

    // Create second annotation (red) - click on a different area
    await page.locator('.react-pdf__Page__textContent').first().dblclick({
      force: true,
      position: { x: 150, y: 100 },
    });
    await expect(page.getByRole('button', { name: /highlight in red/i })).toBeVisible({
      timeout: 5000,
    });
    await page.getByRole('button', { name: /highlight in red/i }).click();

    // Verify both annotations exist
    await expect(page.getByRole('heading', { name: /annotations \(2\)/i, level: 3 })).toBeVisible({
      timeout: 5000,
    });
  });
});
