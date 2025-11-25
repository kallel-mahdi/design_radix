/**
 * E2E Tests for ReferenceTable Component
 *
 * Tests for table interactions: sorting, selection, multi-select, and navigation.
 * These tests run against the real backend and database.
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

test.describe('ReferenceTable Interactions', () => {
  let testId: string;

  test.beforeEach(async ({ page, workerUserId }) => {
    // Generate unique test ID for each test run (with random suffix to avoid parallel collisions)
    testId = `table-test-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

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

    // Wait for page to load
    await expect(page.getByText('Library')).toBeVisible();

    // Create test references with specific years for sorting tests
    const references = [
      { title: `Reference A ${testId}`, author: 'Alpha', year: '2023', venue: 'Nature' },
      { title: `Reference B ${testId}`, author: 'Beta', year: '2022', venue: 'Science' },
      { title: `Reference C ${testId}`, author: 'Gamma', year: '2021', venue: 'Cell' },
    ];

    for (const ref of references) {
      await page.getByRole('button', { name: /new reference/i }).click();
      await expect(page.getByRole('heading', { name: 'Create Reference' })).toBeVisible();

      // Fill form fields
      await page.getByTestId('reference-title-input').fill(ref.title);
      await page.getByTestId('author-0-given-input').fill('Test');
      await page.getByTestId('author-0-family-input').fill(ref.author);
      await page.getByTestId('reference-year-input').fill(ref.year);

      // Submit and wait for modal to close
      await page.getByTestId('reference-submit-button').click();
      await waitForDialogClose(page);
      await page.waitForLoadState('networkidle');

      // CRITICAL: Wait for success toast to confirm creation completed
      // Use .first() because previous toasts might still be visible when creating multiple references
      await expect(page.getByText(/reference created successfully/i).first()).toBeVisible({ timeout: 5000 });

      await page.waitForTimeout(500);
    }

    // Wait for all references to appear
    await expect(page.getByText(`Reference A ${testId}`)).toBeVisible();
    await expect(page.getByText(`Reference B ${testId}`)).toBeVisible();
    await expect(page.getByText(`Reference C ${testId}`)).toBeVisible();
  });

  test('should sort table by clicking column headers', async ({ page }) => {
    // NOTE: This test may be slow if database has accumulated many test references
    //       Consider adding database cleanup in future iterations
    test.setTimeout(60000); // 60 seconds timeout for this test

    // Get table rows
    const getRowTitles = async () => {
      const rows = await page.locator('tbody tr').all();
      const titles = [];
      for (const row of rows) {
        const titleCell = await row.locator('td').nth(1).textContent();
        if (titleCell && titleCell.includes(testId)) {
          titles.push(titleCell.trim());
        }
      }
      return titles;
    };

    // Initially sorted by year desc (2023, 2022, 2021)
    let titles = await getRowTitles();
    expect(titles[0]).toContain('Reference A'); // 2023
    expect(titles[1]).toContain('Reference B'); // 2022
    expect(titles[2]).toContain('Reference C'); // 2021

    // Click Title header to sort by title ascending
    await page.getByRole('columnheader', { name: 'Title' }).click({ force: true });
    await page.waitForTimeout(300); // Wait for sort animation

    titles = await getRowTitles();
    expect(titles[0]).toContain('Reference A');
    expect(titles[1]).toContain('Reference B');
    expect(titles[2]).toContain('Reference C');

    // Click Title header again to sort descending
    await page.getByRole('columnheader', { name: 'Title' }).click({ force: true });
    await page.waitForTimeout(300);

    titles = await getRowTitles();
    expect(titles[0]).toContain('Reference C');
    expect(titles[1]).toContain('Reference B');
    expect(titles[2]).toContain('Reference A');
  });

  test('should select references using checkboxes', async ({ page }) => {
    // Find the first test reference row
    const firstRow = page.getByText(`Reference A ${testId}`).locator('..').locator('..');

    // Click checkbox
    await firstRow.getByRole('checkbox').check();
    await page.waitForTimeout(200);

    // Row should be visually selected (highlighted)
    await expect(firstRow).toHaveClass(/bg-app-accent/);

    // Checkbox should be checked
    await expect(firstRow.getByRole('checkbox')).toBeChecked();

    // Uncheck
    await firstRow.getByRole('checkbox').uncheck();
    await page.waitForTimeout(200);

    // Should not be selected
    await expect(firstRow.getByRole('checkbox')).not.toBeChecked();
  });

  test('should select all references with header checkbox', async ({ page }) => {
    // Click "Select all" checkbox in table header
    await page.locator('thead').getByRole('checkbox').check();
    await page.waitForTimeout(300);

    // All test references should be checked
    const rowA = page.getByText(`Reference A ${testId}`).locator('..').locator('..');
    const rowB = page.getByText(`Reference B ${testId}`).locator('..').locator('..');
    const rowC = page.getByText(`Reference C ${testId}`).locator('..').locator('..');

    await expect(rowA.getByRole('checkbox')).toBeChecked();
    await expect(rowB.getByRole('checkbox')).toBeChecked();
    await expect(rowC.getByRole('checkbox')).toBeChecked();

    // Uncheck all
    await page.locator('thead').getByRole('checkbox').uncheck();
    await page.waitForTimeout(300);

    await expect(rowA.getByRole('checkbox')).not.toBeChecked();
    await expect(rowB.getByRole('checkbox')).not.toBeChecked();
    await expect(rowC.getByRole('checkbox')).not.toBeChecked();
  });

  test('should toggle selection with Cmd+Click', async ({ page }) => {
    const rowA = page.getByText(`Reference A ${testId}`).locator('..').locator('..');
    const rowB = page.getByText(`Reference B ${testId}`).locator('..').locator('..');

    // Cmd+Click first row
    await page.keyboard.down('Meta');
    await rowA.click();
    await page.keyboard.up('Meta');
    await page.waitForTimeout(200);

    await expect(rowA.getByRole('checkbox')).toBeChecked();

    // Cmd+Click second row (should add to selection, not replace)
    await page.keyboard.down('Meta');
    await rowB.click();
    await page.keyboard.up('Meta');
    await page.waitForTimeout(200);

    // Both should be selected
    await expect(rowA.getByRole('checkbox')).toBeChecked();
    await expect(rowB.getByRole('checkbox')).toBeChecked();

    // Cmd+Click first row again (should deselect)
    await page.keyboard.down('Meta');
    await rowA.click();
    await page.keyboard.up('Meta');
    await page.waitForTimeout(200);

    // Only B should be selected
    await expect(rowA.getByRole('checkbox')).not.toBeChecked();
    await expect(rowB.getByRole('checkbox')).toBeChecked();
  });

  test('should select range with Shift+Click', async ({ page }) => {
    const rowA = page.getByText(`Reference A ${testId}`).locator('..').locator('..');
    const rowB = page.getByText(`Reference B ${testId}`).locator('..').locator('..');
    const rowC = page.getByText(`Reference C ${testId}`).locator('..').locator('..');

    // Normal click first row
    await rowA.click();
    await page.waitForTimeout(200);

    await expect(rowA.getByRole('checkbox')).toBeChecked();

    // Shift+Click third row (should select A, B, C)
    await page.keyboard.down('Shift');
    await rowC.click();
    await page.keyboard.up('Shift');
    await page.waitForTimeout(300);

    // All three should be selected
    await expect(rowA.getByRole('checkbox')).toBeChecked();
    await expect(rowB.getByRole('checkbox')).toBeChecked();
    await expect(rowC.getByRole('checkbox')).toBeChecked();
  });

  test('should open edit modal on double-click', async ({ page }) => {
    const row = page.getByText(`Reference A ${testId}`).locator('..').locator('..');

    // Double-click the row
    await row.dblclick();
    await page.waitForTimeout(300);

    // Edit modal should open
    await expect(page.getByRole('heading', { name: 'Edit Reference' })).toBeVisible();

    // Title should be pre-filled
    await expect(page.getByTestId('reference-title-input')).toHaveValue(`Reference A ${testId}`);

    // Close modal with Escape
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: 'Edit Reference' })).not.toBeVisible();
  });
});
