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

  test.beforeEach(async ({ page, setupLibrary }) => {
    // Generate unique test ID for each test run (with random suffix to avoid parallel collisions)
    testId = `table-test-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    // Use centralized setup (routing, cleanup, collection creation)
    await setupLibrary();

    // Create test references with specific years for sorting tests
    const references = [
      { title: `Reference A ${testId}`, author: 'Alpha', year: '2023', venue: 'Nature' },
      { title: `Reference B ${testId}`, author: 'Beta', year: '2022', venue: 'Science' },
      { title: `Reference C ${testId}`, author: 'Gamma', year: '2021', venue: 'Cell' },
    ];

    for (const ref of references) {
      await page.getByRole('button', { name: /Manual Entry/i }).click();
      await expect(page.getByTestId('reference-title-input')).toBeVisible({ timeout: 5000 });

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

    // Get table rows - using ARIA roles since table uses CSS Grid with role attributes
    const getRowTitles = async () => {
      const rows = await page.getByRole('row').all();
      const titles = [];
      for (const row of rows) {
        // Skip header row (it has columnheader role, not cell role)
        const cells = await row.getByRole('cell').all();
        if (cells.length > 0) {
          const titleCell = await cells[1]?.textContent();
          if (titleCell && titleCell.includes(testId)) {
            titles.push(titleCell.trim());
          }
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
    // Use checkbox ARIA labels directly (each checkbox has aria-label="Select {title}")
    const checkboxA = page.getByRole('checkbox', { name: `Select Reference A ${testId}` });

    // Click checkbox
    await checkboxA.check();
    await page.waitForTimeout(200);

    // Checkbox should be checked
    await expect(checkboxA).toBeChecked();

    // Uncheck
    await checkboxA.uncheck();
    await page.waitForTimeout(200);

    // Should not be selected
    await expect(checkboxA).not.toBeChecked();
  });

  test('should select all references with header checkbox', async ({ page }) => {
    // Use ARIA labels for checkboxes
    const checkboxA = page.getByRole('checkbox', { name: `Select Reference A ${testId}` });
    const checkboxB = page.getByRole('checkbox', { name: `Select Reference B ${testId}` });
    const checkboxC = page.getByRole('checkbox', { name: `Select Reference C ${testId}` });

    // Click "Select all" checkbox in table header
    await page.getByRole('checkbox', { name: 'Select all references' }).check();
    await page.waitForTimeout(300);

    // All test references should be checked
    await expect(checkboxA).toBeChecked();
    await expect(checkboxB).toBeChecked();
    await expect(checkboxC).toBeChecked();

    // Uncheck all
    await page.getByRole('checkbox', { name: 'Select all references' }).uncheck();
    await page.waitForTimeout(300);

    await expect(checkboxA).not.toBeChecked();
    await expect(checkboxB).not.toBeChecked();
    await expect(checkboxC).not.toBeChecked();
  });

  test('should toggle selection with Cmd+Click', async ({ page }) => {
    // Use ARIA labels for checkboxes
    const checkboxA = page.getByRole('checkbox', { name: `Select Reference A ${testId}` });
    const checkboxB = page.getByRole('checkbox', { name: `Select Reference B ${testId}` });

    // Find row containers by text content - get the parent with the click handler
    const rowA = page.locator(`[data-testid="reference-card"]:has-text("Reference A ${testId}")`);
    const rowB = page.locator(`[data-testid="reference-card"]:has-text("Reference B ${testId}")`);

    // Cmd+Click first row (immediate - not debounced)
    await rowA.click({ modifiers: ['Meta'] });
    await page.waitForTimeout(200);

    await expect(checkboxA).toBeChecked();

    // Cmd+Click second row (should add to selection, not replace)
    await rowB.click({ modifiers: ['Meta'] });
    await page.waitForTimeout(200);

    // Both should be selected
    await expect(checkboxA).toBeChecked();
    await expect(checkboxB).toBeChecked();

    // Cmd+Click first row again (should deselect)
    await rowA.click({ modifiers: ['Meta'] });
    await page.waitForTimeout(200);

    // Only B should be selected
    await expect(checkboxA).not.toBeChecked();
    await expect(checkboxB).toBeChecked();
  });

  test('should select range with Shift+Click', async ({ page }) => {
    // Use ARIA labels for checkboxes
    const checkboxA = page.getByRole('checkbox', { name: `Select Reference A ${testId}` });
    const checkboxB = page.getByRole('checkbox', { name: `Select Reference B ${testId}` });
    const checkboxC = page.getByRole('checkbox', { name: `Select Reference C ${testId}` });

    // Find row containers by text content
    const rowA = page.locator(`[data-testid="reference-card"]:has-text("Reference A ${testId}")`);
    const rowC = page.locator(`[data-testid="reference-card"]:has-text("Reference C ${testId}")`);

    // Normal click first row - wait for debounced action (200ms + buffer)
    await rowA.click();
    await page.waitForTimeout(400);

    await expect(checkboxA).toBeChecked();

    // Shift+Click third row (should select A, B, C) - immediate, not debounced
    await rowC.click({ modifiers: ['Shift'] });
    await page.waitForTimeout(300);

    // All three should be selected
    await expect(checkboxA).toBeChecked();
    await expect(checkboxB).toBeChecked();
    await expect(checkboxC).toBeChecked();
  });

  test('should open edit modal on double-click', async ({ page }) => {
    const row = page.locator(`[data-testid="reference-card"]:has-text("Reference A ${testId}")`);

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
