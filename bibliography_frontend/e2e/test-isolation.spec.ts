/**
 * Test Isolation Verification
 *
 * Smoke tests to verify that parallel tests don't interfere with each other.
 * These tests run in parallel and verify that each test sees only its own data.
 *
 * If these tests fail, it indicates a problem with test isolation (likely missing cleanup).
 *
 * Worker Isolation:
 * - Each Playwright worker uses a unique user ID (test-user-0, test-user-1, etc.)
 * - This prevents race conditions when tests run in parallel
 * - Worker A cannot delete Worker B's data
 */

import { test, expect } from './fixtures/workerFixtures';
import { Page } from '@playwright/test';

/**
 * Wait for HeadlessUI dialog to properly close after transition.
 * HeadlessUI dialogs have a ~200ms close transition that can intercept pointer events.
 */
async function waitForDialogClose(page: Page): Promise<void> {
  await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });
  // Extra buffer for HeadlessUI portal cleanup
  await page.waitForTimeout(250);
}

test.describe('Test Isolation Verification', () => {
  test.beforeEach(async ({ setupLibrary }) => {
    // Use centralized setup (routing, cleanup, collection creation)
    await setupLibrary();
  });

  test('parallel test 1 - should see only its own reference', async ({ page }) => {
    const testId = `isolation-test-1-${Date.now()}`;

    // Create a reference
    await page.getByRole('button', { name: /Manual Entry/i }).click();
    await expect(page.getByTestId('reference-title-input')).toBeVisible({ timeout: 5000 });

    await page.getByTestId('reference-title-input').fill(`Test 1 ${testId}`);
    await page.getByTestId('author-0-family-input').fill('IsolationTest1');

    await page.getByTestId('reference-submit-button').click();
    await waitForDialogClose(page);
    await page.waitForLoadState('networkidle');

    // Wait for success toast
    await expect(page.getByText(/reference created successfully/i)).toBeVisible({ timeout: 5000 });

    // Count total rows in table (should be exactly 1)
    // Note: Using role-based selector as the table uses aria roles, not tbody
    const rows = page.getByRole('table', { name: 'Reference list' }).getByRole('row');
    // Subtract 1 for header row
    await expect(rows).toHaveCount(2); // 1 header + 1 data row

    // Verify it's our reference
    await expect(page.getByText(`Test 1 ${testId}`)).toBeVisible();
  });

  test('parallel test 2 - should see only its own reference', async ({ page }) => {
    const testId = `isolation-test-2-${Date.now()}`;

    // Create a reference
    await page.getByRole('button', { name: /Manual Entry/i }).click();
    await expect(page.getByTestId('reference-title-input')).toBeVisible({ timeout: 5000 });

    await page.getByTestId('reference-title-input').fill(`Test 2 ${testId}`);
    await page.getByTestId('author-0-family-input').fill('IsolationTest2');

    await page.getByTestId('reference-submit-button').click();
    await waitForDialogClose(page);
    await page.waitForLoadState('networkidle');

    // Wait for success toast
    await expect(page.getByText(/reference created successfully/i)).toBeVisible({ timeout: 5000 });

    // Count total rows in table (should be exactly 1, not 2!)
    const rows = page.getByRole('table', { name: 'Reference list' }).getByRole('row');
    await expect(rows).toHaveCount(2); // 1 header + 1 data row

    // Verify it's our reference
    await expect(page.getByText(`Test 2 ${testId}`)).toBeVisible();
  });

  test('parallel test 3 - should see only its own reference', async ({ page }) => {
    const testId = `isolation-test-3-${Date.now()}`;

    // Create a reference
    await page.getByRole('button', { name: /Manual Entry/i }).click();
    await expect(page.getByTestId('reference-title-input')).toBeVisible({ timeout: 5000 });

    await page.getByTestId('reference-title-input').fill(`Test 3 ${testId}`);
    await page.getByTestId('author-0-family-input').fill('IsolationTest3');

    await page.getByTestId('reference-submit-button').click();
    await waitForDialogClose(page);
    await page.waitForLoadState('networkidle');

    // Wait for success toast
    await expect(page.getByText(/reference created successfully/i)).toBeVisible({ timeout: 5000 });

    // Count total rows in table (should be exactly 1, not 3!)
    const rows = page.getByRole('table', { name: 'Reference list' }).getByRole('row');
    await expect(rows).toHaveCount(2); // 1 header + 1 data row

    // Verify it's our reference
    await expect(page.getByText(`Test 3 ${testId}`)).toBeVisible();
  });

  test('cleanup verification - should start with empty table', async ({ page }) => {
    // This test verifies that cleanup is working
    // After beforeEach cleanup, table should be empty (show empty state)

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Verify empty state is shown (no references after cleanup)
    // Table should only have header row, or show empty state message
    const table = page.getByRole('table', { name: 'Reference list' });
    const rows = table.getByRole('row');

    // Should have only header row (1 row) when empty, or show empty state
    const rowCount = await rows.count();
    if (rowCount > 1) {
      // If more than header, check if it's empty state message
      const emptyState = page.getByText(/no references/i);
      await expect(emptyState).toBeVisible();
    } else {
      // Only header row = empty table
      expect(rowCount).toBeLessThanOrEqual(1);
    }
  });
});
