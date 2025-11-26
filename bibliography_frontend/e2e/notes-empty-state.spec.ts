import { test, expect } from './fixtures/workerFixtures';

test.describe('Notes Tab Empty State (Figma Frame 31)', () => {
  test.beforeEach(async ({ setupLibrary }) => {
    // Use centralized setup (routing, cleanup, collection creation)
    await setupLibrary();
  });

  test('should display Notes tab with empty state', async ({ page }) => {
    // Create a reference first
    await page.getByRole('button', { name: /Manual Entry/i }).click();
    await expect(page.getByTestId('reference-title-input')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('reference-title-input').fill('Notes Test Reference');
    await page.getByTestId('author-0-family-input').fill('NotesAuthor');
    await page.getByTestId('reference-submit-button').click();
    await page.waitForLoadState('networkidle');

    // Click reference row to open details pane
    await page.getByRole('row', { name: /Notes Test Reference/i }).click();

    // Wait for Details Pane to open
    await expect(page.locator('[aria-label="Reference Details"]')).toBeVisible({ timeout: 5000 });

    // Click Notes tab
    const notesTab = page.getByRole('tab', { name: 'Notes' });
    await notesTab.click();

    // Verify Notes empty state elements
    const emptyMsg = page.locator('text=No notes have been added');
    await expect(emptyMsg).toBeVisible();
  });
});
