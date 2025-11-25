import { test, expect } from './fixtures/workerFixtures';

/**
 * E2E Test: DOI Import Flow (One-Step Pattern)
 *
 * Tests the complete user journey for importing a reference via DOI.
 * Follows Zotero's one-step pattern: create reference immediately, no preview.
 *
 * User flow:
 * 1. Click "Import" button
 * 2. Enter DOI
 * 3. Click "Import Reference" (or press Enter)
 * 4. Reference created immediately in database
 * 5. Success toast shown
 * 6. Input cleared for next import (modal stays open)
 *
 * Prerequisites:
 * - Backend running on http://localhost:8005
 * - Frontend running on http://localhost:5173
 * - MongoDB accessible
 *
 * Note: These tests make REAL calls to Crossref API.
 * Crossref may rate limit if tests run too frequently (HTTP 429).
 * If tests fail with rate limiting errors, wait a few minutes before retrying.
 *
 * Performance: These tests take 15-20 seconds due to real Crossref API calls.
 *
 * Worker Isolation:
 * - Each Playwright worker uses a unique user ID (test-user-0, test-user-1, etc.)
 * - This prevents race conditions when tests run in parallel
 * - Worker A cannot delete Worker B's data
 * - Serial execution no longer needed - worker isolation handles it
 */

test.describe('DOI Import Flow', () => {
  // Mark all tests in this suite as slow for CI awareness
  test.slow();
  const TEST_DOI = '10.1145/3411764.3445518';
  const EXPECTED_TITLE = '"Everyone wants to do the model work, not the data work": Data Cascades in High-Stakes AI';
  const EXPECTED_TITLE_PARTIAL = 'Data Cascades in High-Stakes AI'; // Use partial match for wrapped text

  // Helper to open import modal via dropdown menu
  async function openImportModalViaDOI(page: import('@playwright/test').Page) {
    // Click Import button to open dropdown
    await page.getByRole('button', { name: 'Import', exact: true }).click();
    // Click "Import from DOI" in the dropdown menu
    await page.getByRole('menuitem', { name: /Import from DOI/i }).click();
    // Wait for modal to be visible
    await expect(page.getByRole('heading', { name: 'Import Reference' })).toBeVisible();
  }

  test.beforeEach(async ({ page, workerUserId }) => {
    // 1. Intercept API calls FIRST to inject worker-scoped user ID
    await page.route('http://localhost:8005/api/bibliography/**', async (route) => {
      const headers = {
        ...route.request().headers(),
        'x-user-id': workerUserId,
      };
      await route.continue({ headers });
    });

    // 2. Navigate to library page
    await page.goto('http://localhost:5173/library');
    await page.waitForLoadState('networkidle');

    // 3. Cleanup AFTER route intercept is set up (headers will be correct)
    const cleanupResponse = await page.request.delete('http://localhost:8005/api/bibliography/references/test-cleanup', {
      headers: {
        'x-user-id': workerUserId,
        'x-test-cleanup': 'true',
      },
    });
    expect(cleanupResponse.ok()).toBeTruthy();

    // 4. Reload to show empty state
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should successfully import reference from DOI (one-step)', async ({ page }) => {
    // Step 1: Open import modal via dropdown
    await openImportModalViaDOI(page);

    // Step 2: Enter DOI
    const doiInput = page.getByLabel('DOI');
    await doiInput.fill(TEST_DOI);

    // Step 4: Click Import Reference (creates immediately, no preview)
    const importButton = page.getByRole('button', { name: /^Import Reference$/i });
    await importButton.click();

    // Step 5: Verify success toast appears
    await expect(page.getByRole('alert').filter({ hasText: /imported from DOI successfully/i })).toBeVisible({ timeout: 10000 });

    // Step 6: Verify input cleared for next import
    await expect(doiInput).toHaveValue('');

    // Step 7: Verify modal still open for sequential imports
    await expect(page.getByRole('heading', { name: 'Import Reference' })).toBeVisible();

    // Step 8: Close modal to verify reference in table
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: 'Import Reference' })).not.toBeVisible();

    // Step 9: Verify reference appears in library table (use partial match for wrapped text)
    await expect(page.getByText(EXPECTED_TITLE_PARTIAL)).toBeVisible();
  });

  test('should show error for invalid DOI format', async ({ page }) => {
    await openImportModalViaDOI(page);

    const doiInput = page.getByLabel('DOI');
    await doiInput.fill('invalid-doi');

    const importButton = page.getByRole('button', { name: /^Import Reference$/i });
    await expect(importButton).toBeDisabled();
  });

  test('should show error toast for non-existent DOI', async ({ page }) => {
    await openImportModalViaDOI(page);

    const doiInput = page.getByLabel('DOI');
    await doiInput.fill('10.9999/nonexistent');

    const importButton = page.getByRole('button', { name: /^Import Reference$/i });
    await importButton.click();

    await expect(page.getByRole('alert').filter({ hasText: /DOI not found/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Import Reference' })).toBeVisible();
  });

  test('should allow fixing typo after error', async ({ page }) => {
    await openImportModalViaDOI(page);

    const doiInput = page.getByLabel('DOI');
    await doiInput.fill('10.9999/wrong');

    const importButton = page.getByRole('button', { name: /^Import Reference$/i });
    await importButton.click();

    await expect(page.getByRole('alert').filter({ hasText: /DOI not found/i })).toBeVisible({ timeout: 10000 });

    await doiInput.clear();
    await doiInput.fill(TEST_DOI);
    await importButton.click();

    await expect(page.getByRole('alert').filter({ hasText: /imported from DOI successfully/i })).toBeVisible({ timeout: 10000 });

    // Close modal to verify reference in table
    await page.keyboard.press('Escape');
    await expect(page.getByText(EXPECTED_TITLE_PARTIAL)).toBeVisible();
  });

  test('should import DOI with Enter key', async ({ page }) => {
    await openImportModalViaDOI(page);

    const doiInput = page.getByLabel('DOI');
    await doiInput.fill(TEST_DOI);
    await doiInput.press('Enter');

    await expect(page.getByRole('alert').filter({ hasText: /imported from DOI successfully/i })).toBeVisible({ timeout: 10000 });
    await expect(doiInput).toHaveValue('');

    // Close modal to verify reference in table
    await page.keyboard.press('Escape');
    await expect(page.getByText(EXPECTED_TITLE_PARTIAL)).toBeVisible();
  });

  test('should open import modal from empty state', async ({ page }) => {
    // Verify empty state is visible (cleanup should ensure clean DB)
    const emptyStateButton = page.getByRole('button', { name: /Import References/i });
    await expect(emptyStateButton).toBeVisible();

    // Click and verify modal opens
    await emptyStateButton.click();
    await expect(page.getByRole('heading', { name: 'Import Reference' })).toBeVisible();
  });

  // ============================================================================
  // CRITICAL TESTS (One-Step Flow)
  // ============================================================================

  test('should show message when importing duplicate DOI', async ({ page }) => {
    // Import DOI first time
    await openImportModalViaDOI(page);
    const doiInput = page.getByLabel('DOI');
    await doiInput.fill(TEST_DOI);
    const importButton = page.getByRole('button', { name: /^Import Reference$/i });
    await importButton.click();

    await expect(page.getByRole('alert').filter({ hasText: /imported from DOI successfully/i })).toBeVisible({ timeout: 10000 });
    await expect(doiInput).toHaveValue(''); // Cleared after import

    // Import same DOI again
    await doiInput.fill(TEST_DOI);
    await importButton.click();

    // Backend returns existing reference, no duplicate created
    await expect(page.getByRole('alert').filter({ hasText: /already exists/i })).toBeVisible({ timeout: 10000 });

    // Close modal and verify only ONE reference in table
    await page.keyboard.press('Escape');

    const titleElements = page.getByText(EXPECTED_TITLE_PARTIAL);
    await expect(titleElements).toHaveCount(1);
  });

  test('should show loading state during import', async ({ page }) => {
    await openImportModalViaDOI(page);
    const doiInput = page.getByLabel('DOI');
    await doiInput.fill(TEST_DOI);

    const importButton = page.getByRole('button', { name: /^Import Reference$/i });
    await importButton.click();

    // Loading state: button text changes to "Importing..."
    await expect(page.getByRole('button', { name: /Importing.../i })).toBeVisible();

    // Input should be disabled during loading
    await expect(doiInput).toBeDisabled();

    // Wait for success toast (loading complete)
    await expect(page.getByRole('alert').filter({ hasText: /imported from DOI successfully/i })).toBeVisible({ timeout: 10000 });

    // Loading state is gone
    await expect(doiInput).toBeEnabled();
  });

  test('should reset state when modal closed and reopened', async ({ page }) => {
    // Open modal, import reference
    await openImportModalViaDOI(page);
    const doiInput = page.getByLabel('DOI');
    await doiInput.fill(TEST_DOI);
    await page.getByRole('button', { name: /^Import Reference$/i }).click();
    await expect(page.getByRole('alert').filter({ hasText: /imported from DOI successfully/i })).toBeVisible({ timeout: 10000 });

    // Close modal
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: 'Import Reference' })).not.toBeVisible();

    // Reopen modal via dropdown
    await openImportModalViaDOI(page);

    // Verify state is reset
    const reopenedDoiInput = page.getByLabel('DOI');
    await expect(reopenedDoiInput).toHaveValue('');
  });

  // ============================================================================
  // IMPORTANT TESTS (Sequential Import Pattern)
  // ============================================================================

  test('should import multiple different DOIs sequentially', async ({ page }) => {
    const SECOND_DOI = '10.1145/3290605.3300507';
    const SECOND_TITLE_PARTIAL = 'Cultivating Care through Ambiguity'; // Partial match for wrapped text

    // Open modal once via dropdown
    await openImportModalViaDOI(page);
    const doiInput = page.getByLabel('DOI');
    const importButton = page.getByRole('button', { name: /^Import Reference$/i });

    // Import first DOI
    await doiInput.fill(TEST_DOI);
    await importButton.click();
    await expect(page.getByRole('alert').filter({ hasText: /imported from DOI successfully/i })).toBeVisible({ timeout: 10000 });
    await expect(doiInput).toHaveValue(''); // Cleared for next

    // Import second DOI (modal still open)
    await doiInput.fill(SECOND_DOI);
    await importButton.click();
    await expect(page.getByRole('alert').filter({ hasText: /imported from DOI successfully/i })).toBeVisible({ timeout: 10000 });
    await expect(doiInput).toHaveValue(''); // Cleared again

    // Close modal
    await page.keyboard.press('Escape');

    // Verify both references in table
    await expect(page.getByText(EXPECTED_TITLE_PARTIAL)).toBeVisible();
    await expect(page.getByText(SECOND_TITLE_PARTIAL)).toBeVisible();
  });

  test('should persist reference after page refresh', async ({ page }) => {
    // Import reference via dropdown
    await openImportModalViaDOI(page);
    const doiInput = page.getByLabel('DOI');
    await doiInput.fill(TEST_DOI);
    await page.getByRole('button', { name: /^Import Reference$/i }).click();
    await expect(page.getByRole('alert').filter({ hasText: /imported from DOI successfully/i })).toBeVisible({ timeout: 10000 });

    // Close modal to verify reference in table before refresh
    await page.keyboard.press('Escape');
    await expect(page.getByText(EXPECTED_TITLE_PARTIAL)).toBeVisible();

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify reference still exists
    await expect(page.getByText(EXPECTED_TITLE_PARTIAL)).toBeVisible();
  });
});
