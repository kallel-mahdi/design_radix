import { test, expect } from '@playwright/test';

test.describe('Notes Tab Empty State (Figma Frame 31)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/library');
    await page.waitForLoadState('networkidle');
  });

  test('should display Notes tab with empty state', async ({ page }) => {
    // Wait longer for page to fully load
    await page.waitForTimeout(2000);

    // Try to find and click first reference row
    const rows = page.getByRole('row');
    const rowCount = await rows.count();

    console.log(`Found ${rowCount} rows`);

    if (rowCount <= 1) {
      // No data rows, take a screenshot for debugging
      await page.screenshot({ path: '/tmp/debug-notes-test.png' });
      throw new Error(`Expected data rows but found only ${rowCount}`);
    }

    // Click second row (first is header)
    await rows.nth(1).click({ timeout: 15000 });

    // Wait for Details Pane to open with longer timeout
    await expect(page.locator('complementary')).toBeVisible({ timeout: 15000 });

    // Click Notes tab
    const notesTab = page.getByRole('tab', { name: 'Notes' });
    await notesTab.click();

    // Verify Notes empty state elements
    const notesHeading = page.getByRole('heading', { name: 'NOTES', level: 3 });
    await expect(notesHeading).toBeVisible();

    const emptyMsg = page.locator('text=No notes have been added');
    await expect(emptyMsg).toBeVisible();

    // Verify icon is present
    const tabPanel = page.locator('[role="tabpanel"]');
    const icon = tabPanel.locator('svg, img').first();
    await expect(icon).toBeVisible();
  });
});
