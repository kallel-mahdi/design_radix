import { test, expect } from './fixtures/workerFixtures';

/**
 * Tag Management Workflows - E2E Tests
 *
 * Tests comprehensive tag functionality including:
 * - Creating and organizing tags
 * - Color coding (max 9 colored tags with keyboard shortcuts)
 * - Filtering by multiple tags
 * - Tag usage tracking
 *
 * TODO: Implement tag management UI (Session 9) before enabling these tests
 * SKIPPED: Tag selector, color picker, and tag filtering UI not yet implemented
 *
 * Worker Isolation:
 * - Each Playwright worker uses a unique user ID (test-user-0, test-user-1, etc.)
 * - This prevents race conditions when tests run in parallel
 * - Worker A cannot delete Worker B's data
 */

test.describe.skip('Tag Workflows', () => {
  test.beforeEach(async ({ page, workerUserId }) => {
    // Intercept all API calls to inject worker-scoped user ID
    await page.route('http://localhost:8005/api/bibliography/**', async (route) => {
      const headers = {
        ...route.request().headers(),
        'x-user-id': workerUserId,
      };
      await route.continue({ headers });
    });

    await page.goto('http://localhost:5173/library');
    await page.waitForLoadState('networkidle');
  });

  test('Create Tag On-The-Fly → Apply to Reference → Filter', async ({ page }) => {
    // Step 1: Open tag selector
    await page.getByRole('button', { name: /Tags/i }).click();

    // Step 2: Type new tag name
    await page.getByPlaceholder(/Search tags/i).fill('machine-learning');
    await page.keyboard.press('Enter');

    // Verify tag was created
    await expect(page.getByText('machine-learning')).toBeVisible();

    // Step 3: Apply tag to reference
    const referenceCard = page.locator('[data-testid="reference-card"]').first();
    await referenceCard.click();

    // Tag selector should be open in reference details
    await page.getByRole('button', { name: /Add Tag/i }).click();
    await page.getByText('machine-learning').click();

    // Close reference details
    await page.keyboard.press('Escape');

    // Step 4: Filter by tag
    await page.getByRole('button', { name: /Tags/i }).click();
    await page.getByText('machine-learning').click();

    // Verify filtered view
    await expect(page.getByText(/Filtered by.*machine-learning/i)).toBeVisible();
  });

  test('Assign Color to Tag with Keyboard Shortcut (1-9)', async ({ page }) => {
    // Create tag
    await page.getByRole('button', { name: /Tags/i }).click();
    await page.getByPlaceholder(/Search tags/i).fill('important');
    await page.keyboard.press('Enter');

    // Right-click to assign color
    await page.getByText('important').click({ button: 'right' });
    await page.getByRole('menuitem', { name: /Assign Color/i }).click();

    // Select color position 1 (red)
    await page.locator('button[aria-label*="Select color"]').first().click();
    await page.getByRole('button', { name: /Apply/i }).click();

    // Verify color indicator
    const colorIndicator = page.locator('[data-testid="tag-color-indicator"]').first();
    await expect(colorIndicator).toBeVisible();

    // Test keyboard shortcut: Press '1' to toggle tag
    await page.keyboard.press('1');

    // Verify tag filter is applied
    await expect(page.getByText(/Filtered by.*important/i)).toBeVisible();

    // Press '1' again to toggle off
    await page.keyboard.press('1');

    // Verify filter is removed
    await expect(page.getByText(/Filtered by.*important/i)).not.toBeVisible();
  });

  test('Assign Colors to Multiple Tags → Verify Max 9 Limit', async ({ page }) => {
    // Open tag selector
    await page.getByRole('button', { name: /Tags/i }).click();

    // Create 10 tags
    const tagNames = Array.from({ length: 10 }, (_, i) => `tag-${i + 1}`);

    for (const tagName of tagNames) {
      await page.getByPlaceholder(/Search tags/i).fill(tagName);
      await page.keyboard.press('Enter');
    }

    // Assign colors to first 9 tags
    for (let i = 0; i < 9; i++) {
      await page.getByText(`tag-${i + 1}`).click({ button: 'right' });
      await page.getByRole('menuitem', { name: /Assign Color/i }).click();

      // Select color at position i+1
      await page.locator('button[aria-label*="Select color"]').nth(i).click();
      await page.getByRole('button', { name: /Apply/i }).click();
    }

    // Try to assign color to 10th tag
    await page.getByText('tag-10').click({ button: 'right' });
    await page.getByRole('menuitem', { name: /Assign Color/i }).click();

    // Should show warning that all positions are occupied
    await expect(page.getByText(/All positions are occupied/i)).toBeVisible();

    // Cancel
    await page.getByRole('button', { name: /Cancel/i }).click();

    // Verify 9 colored tags
    const coloredTags = page.locator('[data-testid="tag-color-indicator"]');
    await expect(coloredTags).toHaveCount(9);
  });

  test('Filter by Multiple Tags → Clear All Filters', async ({ page }) => {
    // Create and apply first tag
    await page.getByRole('button', { name: /Tags/i }).click();
    await page.getByPlaceholder(/Search tags/i).fill('ai');
    await page.keyboard.press('Enter');

    // Apply to reference
    const referenceCard = page.locator('[data-testid="reference-card"]').first();
    await referenceCard.click();
    await page.getByRole('button', { name: /Add Tag/i }).click();
    await page.getByText('ai').click();
    await page.keyboard.press('Escape');

    // Create and apply second tag
    await page.getByRole('button', { name: /Tags/i }).click();
    await page.getByPlaceholder(/Search tags/i).fill('machine-learning');
    await page.keyboard.press('Enter');

    await referenceCard.click();
    await page.getByRole('button', { name: /Add Tag/i }).click();
    await page.getByText('machine-learning').click();
    await page.keyboard.press('Escape');

    // Filter by both tags
    await page.getByRole('button', { name: /Tags/i }).click();
    await page.getByText('ai').click();
    await page.getByText('machine-learning').click();

    // Verify active filters section
    await expect(page.getByText(/Active Filters/i)).toBeVisible();
    await expect(page.getByText('ai')).toBeVisible();
    await expect(page.getByText('machine-learning')).toBeVisible();

    // Clear all filters
    await page.getByRole('button', { name: /Clear All|Reset Filters/i }).click();

    // Verify filters cleared
    await expect(page.getByText(/Active Filters/i)).not.toBeVisible();
  });

  test('Tag Usage Count Updates When References Added/Removed', async ({ page }) => {
    // Create tag
    await page.getByRole('button', { name: /Tags/i }).click();
    await page.getByPlaceholder(/Search tags/i).fill('test-tag');
    await page.keyboard.press('Enter');

    // Check initial usage count (0)
    const tagItem = page.getByText('test-tag').locator('..');
    await expect(tagItem).toContainText('0');

    // Add tag to first reference
    const firstCard = page.locator('[data-testid="reference-card"]').first();
    await firstCard.click();
    await page.getByRole('button', { name: /Add Tag/i }).click();
    await page.getByText('test-tag').click();
    await page.keyboard.press('Escape');

    // Verify count increased to 1
    await page.getByRole('button', { name: /Tags/i }).click();
    await expect(tagItem).toContainText('1');

    // Add tag to second reference
    const secondCard = page.locator('[data-testid="reference-card"]').nth(1);
    await secondCard.click();
    await page.getByRole('button', { name: /Add Tag/i }).click();
    await page.getByText('test-tag').click();
    await page.keyboard.press('Escape');

    // Verify count increased to 2
    await page.getByRole('button', { name: /Tags/i }).click();
    await expect(tagItem).toContainText('2');

    // Remove tag from first reference
    await firstCard.click();
    await page.getByText('test-tag').locator('[data-testid="remove-tag"]').click();
    await page.keyboard.press('Escape');

    // Verify count decreased to 1
    await page.getByRole('button', { name: /Tags/i }).click();
    await expect(tagItem).toContainText('1');
  });

  test('Remove Color from Tag → Keyboard Shortcut Stops Working', async ({ page }) => {
    // Create tag with color
    await page.getByRole('button', { name: /Tags/i }).click();
    await page.getByPlaceholder(/Search tags/i).fill('colored-tag');
    await page.keyboard.press('Enter');

    await page.getByText('colored-tag').click({ button: 'right' });
    await page.getByRole('menuitem', { name: /Assign Color/i }).click();
    await page.locator('button[aria-label*="Select color"]').first().click();
    await page.getByRole('button', { name: /Apply/i }).click();

    // Verify keyboard shortcut works
    await page.keyboard.press('1');
    await expect(page.getByText(/Filtered by.*colored-tag/i)).toBeVisible();
    await page.keyboard.press('1'); // Toggle off

    // Remove color
    await page.getByText('colored-tag').click({ button: 'right' });
    await page.getByRole('menuitem', { name: /Remove Color/i }).click();
    await page.getByRole('button', { name: /Confirm/i }).click();

    // Verify color indicator gone
    const colorIndicator = page.locator('[data-testid="tag-color-indicator"]');
    await expect(colorIndicator).not.toBeVisible();

    // Try keyboard shortcut - should not work
    await page.keyboard.press('1');
    await expect(page.getByText(/Filtered by.*colored-tag/i)).not.toBeVisible();
  });

  test('Rename Tag → Verify References Association Preserved', async ({ page }) => {
    // Create tag and apply to reference
    await page.getByRole('button', { name: /Tags/i }).click();
    await page.getByPlaceholder(/Search tags/i).fill('old-tag');
    await page.keyboard.press('Enter');

    const referenceCard = page.locator('[data-testid="reference-card"]').first();
    await referenceCard.click();
    await page.getByRole('button', { name: /Add Tag/i }).click();
    await page.getByText('old-tag').click();
    await page.keyboard.press('Escape');

    // Rename tag
    await page.getByRole('button', { name: /Tags/i }).click();
    await page.getByText('old-tag').click({ button: 'right' });
    await page.getByRole('menuitem', { name: /Rename/i }).click();
    await page.getByPlaceholder(/Tag name/i).fill('new-tag');
    await page.getByRole('button', { name: /Save/i }).click();

    await expect(page.getByText('new-tag')).toBeVisible();

    // Verify reference still has the tag
    await referenceCard.click();
    await expect(page.getByText('new-tag')).toBeVisible();
  });

  test('Delete Tag → References Lose Tag Association', async ({ page }) => {
    // Create tag and apply to multiple references
    await page.getByRole('button', { name: /Tags/i }).click();
    await page.getByPlaceholder(/Search tags/i).fill('delete-me');
    await page.keyboard.press('Enter');

    // Apply to 2 references
    for (let i = 0; i < 2; i++) {
      const card = page.locator('[data-testid="reference-card"]').nth(i);
      await card.click();
      await page.getByRole('button', { name: /Add Tag/i }).click();
      await page.getByText('delete-me').click();
      await page.keyboard.press('Escape');
    }

    // Verify tag has usage count 2
    await page.getByRole('button', { name: /Tags/i }).click();
    const tagItem = page.getByText('delete-me').locator('..');
    await expect(tagItem).toContainText('2');

    // Delete tag
    await page.getByText('delete-me').click({ button: 'right' });
    await page.getByRole('menuitem', { name: /Delete/i }).click();
    await page.getByRole('button', { name: /Confirm/i }).click();

    // Verify tag is gone
    await expect(page.getByText('delete-me')).not.toBeVisible();

    // Verify references no longer have the tag
    const firstCard = page.locator('[data-testid="reference-card"]').first();
    await firstCard.click();
    await expect(page.getByText('delete-me')).not.toBeVisible();
  });

  test('Tag Search/Filter in Tag Selector', async ({ page }) => {
    // Create multiple tags
    await page.getByRole('button', { name: /Tags/i }).click();

    const tags = ['machine-learning', 'deep-learning', 'reinforcement-learning', 'nlp', 'computer-vision'];
    for (const tag of tags) {
      await page.getByPlaceholder(/Search tags/i).fill(tag);
      await page.keyboard.press('Enter');
    }

    // Search for 'learning'
    await page.getByPlaceholder(/Search tags/i).fill('learning');

    // Should show only matching tags
    await expect(page.getByText('machine-learning')).toBeVisible();
    await expect(page.getByText('deep-learning')).toBeVisible();
    await expect(page.getByText('reinforcement-learning')).toBeVisible();
    await expect(page.getByText('nlp')).not.toBeVisible();
    await expect(page.getByText('computer-vision')).not.toBeVisible();

    // Clear search
    await page.getByPlaceholder(/Search tags/i).clear();

    // All tags should be visible again
    await expect(page.getByText('nlp')).toBeVisible();
    await expect(page.getByText('computer-vision')).toBeVisible();
  });

  test('Tag Selector Collapse/Expand → State Persists', async ({ page }) => {
    // Tag selector should be expanded by default
    await page.getByRole('button', { name: /Tags/i }).click();
    await expect(page.getByPlaceholder(/Search tags/i)).toBeVisible();

    // Collapse tag selector
    await page.getByRole('button', { name: /Tags/i }).click();
    await expect(page.getByPlaceholder(/Search tags/i)).not.toBeVisible();

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify tag selector is still collapsed
    await expect(page.getByPlaceholder(/Search tags/i)).not.toBeVisible();

    // Expand
    await page.getByRole('button', { name: /Tags/i }).click();
    await expect(page.getByPlaceholder(/Search tags/i)).toBeVisible();

    // Reload again
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify tag selector is expanded
    await page.getByRole('button', { name: /Tags/i }).click();
    await expect(page.getByPlaceholder(/Search tags/i)).toBeVisible();
  });
});
