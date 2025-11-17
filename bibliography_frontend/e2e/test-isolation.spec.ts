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

test.describe('Test Isolation Verification', () => {
  test.beforeEach(async ({ page, workerUserId }) => {
    // Cleanup BEFORE test to ensure clean state (worker-scoped cleanup)
    const cleanupResponse = await page.request.delete(
      'http://localhost:8005/api/bibliography/references/test-cleanup',
      {
        headers: {
          'x-user-id': workerUserId,
        },
      }
    );
    expect(cleanupResponse.ok()).toBeTruthy();

    // Intercept API calls to inject worker-scoped user ID
    await page.route('http://localhost:8005/api/bibliography/**', async (route) => {
      const headers = {
        ...route.request().headers(),
        'x-user-id': workerUserId,
      };
      await route.continue({ headers });
    });

    // Navigate to library page
    await page.goto('http://localhost:5173/library');
    await page.waitForLoadState('networkidle');
  });

  test('parallel test 1 - should see only its own reference', async ({ page }) => {
    const testId = `isolation-test-1-${Date.now()}`;

    // Create a reference
    await page.getByRole('button', { name: /new reference/i }).click();
    await expect(page.getByRole('heading', { name: 'Create Reference' })).toBeVisible();

    await page.getByTestId('reference-title-input').fill(`Test 1 ${testId}`);
    await page.getByTestId('author-0-family-input').fill('IsolationTest1');

    await page.getByTestId('reference-submit-button').click();
    await page.waitForLoadState('networkidle');

    // Wait for success toast
    await expect(page.getByText(/reference created successfully/i)).toBeVisible({ timeout: 5000 });

    // Count total rows in table (should be exactly 1)
    const rows = await page.locator('tbody tr').count();
    expect(rows).toBe(1);

    // Verify it's our reference
    await expect(page.getByText(`Test 1 ${testId}`)).toBeVisible();
  });

  test('parallel test 2 - should see only its own reference', async ({ page }) => {
    const testId = `isolation-test-2-${Date.now()}`;

    // Create a reference
    await page.getByRole('button', { name: /new reference/i }).click();
    await expect(page.getByRole('heading', { name: 'Create Reference' })).toBeVisible();

    await page.getByTestId('reference-title-input').fill(`Test 2 ${testId}`);
    await page.getByTestId('author-0-family-input').fill('IsolationTest2');

    await page.getByTestId('reference-submit-button').click();
    await page.waitForLoadState('networkidle');

    // Wait for success toast
    await expect(page.getByText(/reference created successfully/i)).toBeVisible({ timeout: 5000 });

    // Count total rows in table (should be exactly 1, not 2!)
    const rows = await page.locator('tbody tr').count();
    expect(rows).toBe(1);

    // Verify it's our reference
    await expect(page.getByText(`Test 2 ${testId}`)).toBeVisible();
  });

  test('parallel test 3 - should see only its own reference', async ({ page }) => {
    const testId = `isolation-test-3-${Date.now()}`;

    // Create a reference
    await page.getByRole('button', { name: /new reference/i }).click();
    await expect(page.getByRole('heading', { name: 'Create Reference' })).toBeVisible();

    await page.getByTestId('reference-title-input').fill(`Test 3 ${testId}`);
    await page.getByTestId('author-0-family-input').fill('IsolationTest3');

    await page.getByTestId('reference-submit-button').click();
    await page.waitForLoadState('networkidle');

    // Wait for success toast
    await expect(page.getByText(/reference created successfully/i)).toBeVisible({ timeout: 5000 });

    // Count total rows in table (should be exactly 1, not 3!)
    const rows = await page.locator('tbody tr').count();
    expect(rows).toBe(1);

    // Verify it's our reference
    await expect(page.getByText(`Test 3 ${testId}`)).toBeVisible();
  });

  test('cleanup verification - should start with empty table', async ({ page }) => {
    // This test verifies that cleanup is working
    // After beforeEach cleanup, table should be empty

    // Wait for page to fully load
    await page.waitForTimeout(1000);

    // Count rows (should be 0 or show empty state)
    const rows = await page.locator('tbody tr').count();

    // If there are rows, they should be empty state indicators, not actual references
    if (rows > 0) {
      // Check if it's an empty state message
      const emptyState = page.getByText(/no references/i);
      await expect(emptyState).toBeVisible();
    } else {
      // No rows is also acceptable (empty table)
      expect(rows).toBe(0);
    }
  });
});
