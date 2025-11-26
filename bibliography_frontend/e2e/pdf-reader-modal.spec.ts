/**
 * E2E Tests: PDF Reader Modal (Zotero-style)
 *
 * Tests the full-screen PDF reader:
 * - Double-click opens modal when reference has PDF
 * - Double-click opens edit modal when no PDF
 * - Close button and Escape key close the modal
 *
 * Uses worker isolation pattern for parallel test execution
 */

import { test, expect } from './fixtures/workerFixtures';
import { FIXTURE_PATHS } from './fixtures/paths';

test.describe('PDF Reader Modal', () => {
  test.beforeEach(async ({ setupLibrary }) => {
    // Use centralized setup (routing, cleanup, collection creation)
    await setupLibrary();
  });

  test('double-click on reference WITH PDF opens PDF reader modal', async ({ page }) => {
    // Create reference with PDF
    await page.getByRole('button', { name: 'New Reference' }).click();
    await expect(page.getByTestId('reference-title-input')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('reference-title-input').fill('PDF Reader Test');
    await page.getByTestId('author-0-family-input').fill('TestAuthor');

    // Upload PDF - click on drop zone then set file
    const pdfDropZone = page.locator('text=Drop PDF here or click to browse');
    const fileChooserPromise = page.waitForEvent('filechooser');
    await pdfDropZone.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(FIXTURE_PATHS.pdfs.minimal);

    // Wait for upload preview to show
    await expect(page.getByText('minimal.pdf')).toBeVisible();

    // Save the reference
    await page.getByRole('button', { name: /create/i }).click();

    // Wait for toast and reference to appear
    await expect(page.getByText('Reference created successfully')).toBeVisible();
    await expect(page.getByRole('cell', { name: 'PDF Reader Test', exact: true })).toBeVisible();

    // Double-click on the reference row
    await page.getByRole('cell', { name: 'PDF Reader Test', exact: true }).dblclick();

    // Verify PDF reader modal opens with correct title
    // Wait for heading first (HeadlessUI transition starts with opacity:0)
    await expect(page.getByRole('heading', { name: 'PDF Reader Test' })).toBeVisible();

    // Verify zoom controls are present
    await expect(page.getByRole('button', { name: /zoom in/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /zoom out/i })).toBeVisible();

    // Verify page navigation is present
    await expect(page.getByRole('button', { name: /previous page/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /next page/i })).toBeVisible();

    // Verify close button is present (use exact to avoid toast close button)
    await expect(page.getByRole('button', { name: 'Close', exact: true })).toBeVisible();
  });

  test('close button closes PDF reader modal', async ({ page }) => {
    // Create reference with PDF
    await page.getByRole('button', { name: 'New Reference' }).click();
    await expect(page.getByTestId('reference-title-input')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('reference-title-input').fill('Close Button Test');
    await page.getByTestId('author-0-family-input').fill('CloseAuthor');

    const pdfDropZone = page.locator('text=Drop PDF here or click to browse');
    const fileChooserPromise = page.waitForEvent('filechooser');
    await pdfDropZone.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(FIXTURE_PATHS.pdfs.minimal);

    await expect(page.getByText('minimal.pdf')).toBeVisible();
    await page.getByRole('button', { name: /create/i }).click();
    await expect(page.getByRole('cell', { name: 'Close Button Test', exact: true })).toBeVisible();

    // Double-click to open modal
    await page.getByRole('cell', { name: 'Close Button Test', exact: true }).dblclick();
    // Wait for heading (HeadlessUI transition completes)
    await expect(page.getByRole('heading', { name: 'Close Button Test' })).toBeVisible();

    // Click close button (use exact to avoid toast close button)
    await page.getByRole('button', { name: 'Close', exact: true }).click();

    // Verify modal is closed
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('Escape key closes PDF reader modal', async ({ page }) => {
    // Create reference with PDF
    await page.getByRole('button', { name: 'New Reference' }).click();
    await expect(page.getByTestId('reference-title-input')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('reference-title-input').fill('Escape Test');
    await page.getByTestId('author-0-family-input').fill('EscapeAuthor');

    const pdfDropZone = page.locator('text=Drop PDF here or click to browse');
    const fileChooserPromise = page.waitForEvent('filechooser');
    await pdfDropZone.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(FIXTURE_PATHS.pdfs.minimal);

    await expect(page.getByText('minimal.pdf')).toBeVisible();
    await page.getByRole('button', { name: /create/i }).click();
    await expect(page.getByRole('cell', { name: 'Escape Test', exact: true })).toBeVisible();

    // Double-click to open modal
    await page.getByRole('cell', { name: 'Escape Test', exact: true }).dblclick();
    // Wait for heading (HeadlessUI transition completes)
    await expect(page.getByRole('heading', { name: 'Escape Test' })).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Verify modal is closed
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('double-click on reference WITHOUT PDF opens edit modal', async ({ page }) => {
    // Create reference without PDF
    await page.getByRole('button', { name: 'New Reference' }).click();
    await expect(page.getByTestId('reference-title-input')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('reference-title-input').fill('No PDF Reference');
    await page.getByTestId('author-0-family-input').fill('NoPdfAuthor');
    await page.getByRole('button', { name: /create/i }).click();

    // Wait for reference to appear
    await expect(page.getByRole('cell', { name: 'No PDF Reference', exact: true })).toBeVisible();

    // Double-click on the reference row
    await page.getByRole('cell', { name: 'No PDF Reference', exact: true }).dblclick();

    // Verify edit modal opens (not PDF reader)
    // Wait for heading first (HeadlessUI transition starts with opacity:0)
    await expect(page.getByRole('heading', { name: 'Edit Reference' })).toBeVisible();
  });

  test('zoom in button increases zoom percentage', async ({ page }) => {
    // Create reference with PDF
    await page.getByRole('button', { name: 'New Reference' }).click();
    await expect(page.getByTestId('reference-title-input')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('reference-title-input').fill('ZoomInButtonTest');
    await page.getByTestId('author-0-family-input').fill('ZoomAuthor');

    const pdfDropZone = page.locator('text=Drop PDF here or click to browse');
    const fileChooserPromise = page.waitForEvent('filechooser');
    await pdfDropZone.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(FIXTURE_PATHS.pdfs.minimal);

    await expect(page.getByText('minimal.pdf')).toBeVisible();
    await page.getByRole('button', { name: /create/i }).click();
    await expect(page.getByRole('cell', { name: 'ZoomInButtonTest', exact: true })).toBeVisible();

    // Open PDF reader modal - use same pattern as passing tests
    await page.getByRole('cell', { name: 'ZoomInButtonTest', exact: true }).dblclick();
    await expect(page.getByRole('heading', { name: 'ZoomInButtonTest' })).toBeVisible({ timeout: 10000 });

    // Verify initial zoom is 100%
    await expect(page.getByText('100%')).toBeVisible();

    // Click zoom in
    await page.getByRole('button', { name: /zoom in/i }).click();

    // Verify zoom increased to 125%
    await expect(page.getByText('125%')).toBeVisible();
  });

  test('zoom out button decreases zoom percentage', async ({ page }) => {
    // Create reference with PDF
    await page.getByRole('button', { name: 'New Reference' }).click();
    await expect(page.getByTestId('reference-title-input')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('reference-title-input').fill('ZoomOutButtonTest');
    await page.getByTestId('author-0-family-input').fill('ZoomOutAuthor');

    const pdfDropZone = page.locator('text=Drop PDF here or click to browse');
    const fileChooserPromise = page.waitForEvent('filechooser');
    await pdfDropZone.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(FIXTURE_PATHS.pdfs.minimal);

    await expect(page.getByText('minimal.pdf')).toBeVisible();
    await page.getByRole('button', { name: /create/i }).click();
    await expect(page.getByRole('cell', { name: 'ZoomOutButtonTest', exact: true })).toBeVisible();

    // Open PDF reader modal - use same pattern as passing tests
    await page.getByRole('cell', { name: 'ZoomOutButtonTest', exact: true }).dblclick();
    await expect(page.getByRole('heading', { name: 'ZoomOutButtonTest' })).toBeVisible({ timeout: 10000 });

    // Verify initial zoom is 100%
    await expect(page.getByText('100%')).toBeVisible();

    // Click zoom out
    await page.getByRole('button', { name: /zoom out/i }).click();

    // Verify zoom decreased to 75%
    await expect(page.getByText('75%')).toBeVisible();
  });

  test('keyboard shortcuts + and - control zoom', async ({ page }) => {
    // Create reference with PDF
    await page.getByRole('button', { name: 'New Reference' }).click();
    await expect(page.getByTestId('reference-title-input')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('reference-title-input').fill('Keyboard Zoom Test');
    await page.getByTestId('author-0-family-input').fill('KeyboardAuthor');

    const pdfDropZone = page.locator('text=Drop PDF here or click to browse');
    const fileChooserPromise = page.waitForEvent('filechooser');
    await pdfDropZone.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(FIXTURE_PATHS.pdfs.minimal);

    await expect(page.getByText('minimal.pdf')).toBeVisible();
    await page.getByRole('button', { name: /create/i }).click();
    await expect(page.getByRole('cell', { name: 'Keyboard Zoom Test', exact: true })).toBeVisible();

    // Open PDF reader modal
    await page.getByRole('cell', { name: 'Keyboard Zoom Test', exact: true }).dblclick();
    await expect(page.getByRole('heading', { name: 'Keyboard Zoom Test' })).toBeVisible();

    // Verify initial zoom is 100%
    await expect(page.getByText('100%')).toBeVisible();

    // Press + to zoom in
    await page.keyboard.press('+');
    await expect(page.getByText('125%')).toBeVisible();

    // Press - to zoom out
    await page.keyboard.press('-');
    await expect(page.getByText('100%')).toBeVisible();

    // Press - again to zoom out further
    await page.keyboard.press('-');
    await expect(page.getByText('75%')).toBeVisible();
  });

  test('prev/next page buttons are disabled on single-page PDF', async ({ page }) => {
    // Create reference with PDF (minimal.pdf is single-page)
    await page.getByRole('button', { name: 'New Reference' }).click();
    await expect(page.getByTestId('reference-title-input')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('reference-title-input').fill('Single Page Test');
    await page.getByTestId('author-0-family-input').fill('SinglePageAuthor');

    const pdfDropZone = page.locator('text=Drop PDF here or click to browse');
    const fileChooserPromise = page.waitForEvent('filechooser');
    await pdfDropZone.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(FIXTURE_PATHS.pdfs.minimal);

    await expect(page.getByText('minimal.pdf')).toBeVisible();
    await page.getByRole('button', { name: /create/i }).click();
    await expect(page.getByRole('cell', { name: 'Single Page Test', exact: true })).toBeVisible();

    // Open PDF reader modal
    await page.getByRole('cell', { name: 'Single Page Test', exact: true }).dblclick();
    await expect(page.getByRole('heading', { name: 'Single Page Test' })).toBeVisible();

    // Wait for PDF to load and show 1/1
    await expect(page.getByRole('spinbutton')).toHaveValue('1');

    // Previous page button should be disabled (we're on page 1)
    await expect(page.getByRole('button', { name: /previous page/i })).toBeDisabled();

    // Next page button should also be disabled (only 1 page)
    await expect(page.getByRole('button', { name: /next page/i })).toBeDisabled();
  });
});
