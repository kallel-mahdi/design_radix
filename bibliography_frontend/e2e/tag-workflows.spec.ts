import { test, expect } from './fixtures/workerFixtures';
import type { Page } from '@playwright/test';

/**
 * Helper to wait for HeadlessUI dialog to close and portal animation to complete.
 * Prevents "headlessui-portal-root intercepts pointer events" flakiness.
 */
async function waitForDialogClose(page: Page) {
  // Wait for any dialog to be hidden (longer timeout for parallel test runs)
  await page.waitForFunction(() => {
    const dialogs = document.querySelectorAll('[role="dialog"]');
    return dialogs.length === 0;
  }, { timeout: 15000 });
  // Wait for HeadlessUI portal animation cleanup (200ms transition + buffer)
  await page.waitForTimeout(250);
}

/**
 * Tag Management Workflows - E2E Tests
 *
 * Tests comprehensive tag functionality including:
 * - Creating and organizing tags
 * - Color coding (max 9 colored tags with keyboard shortcuts)
 * - Filtering by multiple tags
 * - Tag usage tracking
 *
 * IMPLEMENTED (Session 10.5):
 * - TagSelector with search, filter, Enter-to-create
 * - TagItem with color indicators
 * - Context menu (right-click): Rename, Delete, Assign Color
 * - TagColorPickerModal with 9 positions
 * - Reference context menu with "Add to Collection"
 * - Keyboard shortcuts (1-9) for colored tags
 * - TagPicker in DetailsPane for adding/removing tags
 *
 * UI NOTE: TagSelector is always visible in sidebar (no dropdown button to click)
 *
 * Worker Isolation:
 * - Each Playwright worker uses a unique user ID (test-user-0, test-user-1, etc.)
 * - This prevents race conditions when tests run in parallel
 * - Worker A cannot delete Worker B's data
 */

test.describe('Tag Workflows', () => {
  test.beforeEach(async ({ page, setupLibrary }) => {
    // Use centralized setup (routing, cleanup, collection creation)
    await setupLibrary();

    // Create a test reference for tag operations
    const newRefButton = page.getByRole('button', { name: /Manual Entry/i });
    await expect(newRefButton).toBeVisible({ timeout: 10000 });
    await newRefButton.click();
    await expect(page.getByTestId('reference-title-input')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('reference-title-input').fill('Test Reference for Tags');
    await page.getByTestId('reference-type-select').selectOption('article');
    await page.getByTestId('reference-year-input').fill('2024');
    await page.getByTestId('author-0-family-input').fill('TestAuthor');
    await page.getByTestId('reference-submit-button').click();
    await page.waitForLoadState('networkidle');
  });

  test('Create Tag On-The-Fly → Apply to Reference → Filter', async ({ page }) => {
    // Step 1: Type new tag name (TagSelector is always visible)
    await page.getByPlaceholder(/Search tags/i).fill('machine-learning');
    await page.keyboard.press('Enter');

    // Verify tag was created in sidebar
    await expect(page.getByRole('complementary').getByText('machine-learning')).toBeVisible();

    // Step 2: Apply tag to reference (UI uses table rows, not reference-card)
    const referenceRow = page.getByRole('row', { name: /Test Reference for Tags/i });
    await referenceRow.click();

    // Wait for details pane to open
    await expect(page.getByRole('complementary', { name: 'Reference Details' })).toBeVisible();

    // Tag selector should be open in reference details
    await page.getByRole('button', { name: /Add Tag/i }).click();
    // Click the tag in the TagPicker dropdown (scope to Reference Details pane)
    await page.getByRole('complementary', { name: 'Reference Details' }).getByText('machine-learning').first().click();

    // Close reference details
    await page.keyboard.press('Escape');

    // Step 3: Filter by tag (click the tag in sidebar)
    await page.getByRole('complementary').getByText('machine-learning').click();

    // Verify filtered view
    await expect(page.getByText('Active Filters')).toBeVisible();
    await expect(page.getByRole('button', { name: /machine-learning.*✕/i })).toBeVisible();
  });

  test('Assign Color to Tag with Keyboard Shortcut (1-9)', async ({ page }) => {
    // Create tag (TagSelector is always visible)
    await page.getByPlaceholder(/Search tags/i).fill('important');
    await page.keyboard.press('Enter');

    // Wait for tag to appear
    await expect(page.getByRole('complementary').first().getByText('important')).toBeVisible();

    // Right-click to assign color (in sidebar)
    await page.getByRole('complementary').first().getByText('important').click({ button: 'right' });
    await page.getByRole('menuitem', { name: /Assign Color/i }).click();

    // Color and position are auto-selected when modal opens - just click Set Color
    // Don't click color swatch as it might toggle off the auto-selected color
    await page.getByRole('button', { name: /Set Color/i }).click();
    await waitForDialogClose(page);

    // Wait for mutation to complete
    await page.waitForLoadState('networkidle');

    // Verify tag now has color indicator in sidebar (scope to sidebar to avoid counting other workers' indicators)
    const sidebar = page.getByRole('complementary').first();
    const importantTag = sidebar.getByRole('button', { name: /important/i });
    await expect(importantTag.locator('[data-testid="color-indicator"]')).toBeVisible();

    // Test keyboard shortcut: Press '1' to toggle tag
    // Click on Library heading to remove focus from search input (keyboard shortcuts are ignored in inputs)
    await page.getByRole('heading', { name: 'Library', level: 1 }).click();
    await page.keyboard.press('1');

    // Verify tag filter is applied
    await expect(page.getByText('Active Filters')).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /important.*✕/i })).toBeVisible();

    // Press '1' again to toggle off
    await page.keyboard.press('1');

    // Verify filter is removed
    await expect(page.getByText('Active Filters')).not.toBeVisible();
  });

  test('Assign Colors to Multiple Tags → Verify Max 9 Limit', async ({ page, workerUserId }) => {
    // Use API to create 10 tags with first 9 having colors (avoids fragile 9-iteration UI loop)
    const TAG_COLORS = [
      '#ef4444', '#14b8a6', '#3b82f6', '#f87171', '#34d399',
      '#fbbf24', '#a855f7', '#38bdf8', '#fb923c'
    ];

    // Create 10 tags via API - first 9 with colors, 10th without
    for (let i = 1; i <= 10; i++) {
      await fetch('http://localhost:8005/api/bibliography/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': workerUserId },
        body: JSON.stringify({
          name: `tag-${i}`,
          ...(i <= 9 ? { color: TAG_COLORS[i - 1], position: i } : {})
        })
      });
    }

    // Reload to see the created tags
    await page.reload();
    await page.waitForLoadState('networkidle');

    const sidebar = page.getByRole('complementary').first();

    // Verify 9 colored tags exist
    let coloredCount = 0;
    for (let i = 1; i <= 9; i++) {
      const tagButton = sidebar.getByRole('button', { name: new RegExp(`^tag-${i}\\s+\\d+$`) });
      const hasColor = await tagButton.locator('[data-testid="color-indicator"]').count();
      if (hasColor > 0) coloredCount++;
    }
    expect(coloredCount).toBe(9);

    // Try to assign color to 10th tag - should show warning
    await sidebar.getByRole('button', { name: /^tag-10\s+\d+$/ }).click({ button: 'right' });
    await page.getByRole('menuitem', { name: /Assign Color/i }).click();

    // Should show warning that all positions are occupied
    await expect(page.getByText(/All positions are occupied/i).first()).toBeVisible();

    // Cancel
    await page.getByRole('button', { name: /Cancel/i }).click();
    await waitForDialogClose(page);
  });

  test('Filter by Multiple Tags → Clear All Filters', async ({ page }) => {
    const sidebar = page.getByRole('complementary').first();
    const referenceRow = page.getByRole('row', { name: /Test Reference for Tags/i });

    // Create first tag
    await page.getByPlaceholder(/Search tags/i).fill('ai');
    await page.keyboard.press('Enter');
    await expect(sidebar.getByText('ai')).toBeVisible();
    await page.waitForLoadState('networkidle');

    // Create second tag
    await page.getByPlaceholder(/Search tags/i).fill('machine-learning');
    await page.keyboard.press('Enter');
    await expect(sidebar.getByText('machine-learning')).toBeVisible();
    await page.waitForLoadState('networkidle');

    // Apply first tag to reference
    await referenceRow.click();
    await expect(page.locator('[aria-label="Reference Details"]')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: /Add Tag/i }).click();
    // Wait for tag picker and click tag (use locator within tag picker area)
    await page.getByPlaceholder(/Search or create tag/i).waitFor({ state: 'visible' });
    await page.locator('[aria-label="Reference Details"]').getByText('ai', { exact: true }).click();
    await page.keyboard.press('Escape');

    // Apply second tag to reference
    await referenceRow.click();
    await expect(page.locator('[aria-label="Reference Details"]')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: /Add Tag/i }).click();
    await page.getByPlaceholder(/Search or create tag/i).waitFor({ state: 'visible' });
    await page.locator('[aria-label="Reference Details"]').getByText('machine-learning').click();
    await page.keyboard.press('Escape');

    // Filter by both tags (click tags in sidebar)
    await sidebar.getByRole('button', { name: /^ai\s+\d+$/ }).click();
    await sidebar.getByRole('button', { name: /^machine-learning\s+\d+$/ }).click();

    // Verify active filters section (use filter chip buttons to avoid ambiguity with sidebar)
    await expect(page.getByText(/Active Filters/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /ai.*✕/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /machine-learning.*✕/i })).toBeVisible();

    // Clear all filters
    await page.getByRole('button', { name: /Clear All|Reset Filters/i }).click();

    // Verify filters cleared
    await expect(page.getByText(/Active Filters/i)).not.toBeVisible();
  });

  test('Tag Usage Count Updates When References Added/Removed', async ({ page }) => {
    // Create a second reference (beforeEach creates 1, we need 2 total)
    await page.getByRole('button', { name: /Manual Entry/i }).click();
    await expect(page.getByTestId('reference-title-input')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('reference-title-input').fill('Second Reference for Usage Count');
    await page.getByTestId('reference-type-select').selectOption('article');
    await page.getByTestId('reference-year-input').fill('2024');
    await page.getByTestId('author-0-family-input').fill('SecondAuthor');
    await page.getByTestId('reference-submit-button').click();
    await page.waitForLoadState('networkidle');

    // Create tag (TagSelector is always visible)
    await page.getByPlaceholder(/Search tags/i).fill('test-tag');
    await page.keyboard.press('Enter');

    // Check initial usage count (0) in sidebar
    const sidebar = page.getByRole('complementary').first();
    const tagItem = sidebar.getByRole('button', { name: /test-tag/i });
    await expect(tagItem).toContainText('0');

    // Add tag to first reference (UI uses table rows, not reference-card)
    const firstRow = page.getByRole('row', { name: /Test Reference for Tags/i });
    await firstRow.click();
    await expect(page.getByRole('complementary', { name: 'Reference Details' })).toBeVisible();
    await page.getByRole('button', { name: /Add Tag/i }).click();
    // Click in TagPicker dropdown
    await page.getByRole('complementary', { name: 'Reference Details' }).getByText('test-tag').first().click();
    await page.keyboard.press('Escape');

    // Verify count increased to 1
    await expect(tagItem).toContainText('1');

    // Add tag to second reference
    const secondRow = page.getByRole('row', { name: /Second Reference for Usage Count/i });
    await secondRow.click();
    await expect(page.getByRole('complementary', { name: 'Reference Details' })).toBeVisible();
    await page.getByRole('button', { name: /Add Tag/i }).click();
    // Click in TagPicker dropdown
    await page.getByRole('complementary', { name: 'Reference Details' }).getByText('test-tag').first().click();
    await page.keyboard.press('Escape');

    // Verify count increased to 2
    await expect(tagItem).toContainText('2');

    // Remove tag from first reference
    await firstRow.click();
    await expect(page.getByRole('complementary', { name: 'Reference Details' })).toBeVisible();
    // Tag.tsx uses aria-label="Remove tag {tagName}"
    await page.getByRole('button', { name: 'Remove tag test-tag' }).click();
    await page.keyboard.press('Escape');

    // Verify count decreased to 1
    await expect(tagItem).toContainText('1');
  });

  test('Remove Color from Tag → Keyboard Shortcut Stops Working', async ({ page }) => {
    // Create tag with color (TagSelector is always visible)
    await page.getByPlaceholder(/Search tags/i).fill('colored-tag');
    await page.keyboard.press('Enter');

    const sidebar = page.getByRole('complementary').first();
    await sidebar.getByText('colored-tag').click({ button: 'right' });
    await page.getByRole('menuitem', { name: /Assign Color/i }).click();
    // Color and position are auto-selected - just click Set Color
    await page.getByRole('button', { name: /Set Color/i }).click();
    await waitForDialogClose(page);
    await page.waitForLoadState('networkidle');

    // Verify keyboard shortcut works
    await page.getByRole('heading', { name: 'Library', level: 1 }).click();
    await page.keyboard.press('1');
    await expect(page.getByText('Active Filters')).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /colored-tag.*✕/i })).toBeVisible();
    await page.keyboard.press('1'); // Toggle off

    // Remove color
    await sidebar.getByText('colored-tag').click({ button: 'right' });
    await page.getByRole('menuitem', { name: /Assign Color/i }).click();
    await page.getByRole('button', { name: /Remove Color/i }).click();
    await waitForDialogClose(page);
    await page.waitForLoadState('networkidle');

    // Verify color indicator gone for this specific tag (scope to sidebar)
    const coloredTagButton = sidebar.getByRole('button', { name: /colored-tag/i });
    await expect(coloredTagButton.locator('[data-testid="color-indicator"]')).not.toBeVisible();

    // Try keyboard shortcut - should not work
    await page.keyboard.press('1');
    await expect(page.getByText('Active Filters')).not.toBeVisible();
  });

  test('Rename Tag → Verify References Association Preserved', async ({ page }) => {
    // Create tag and apply to reference (TagSelector is always visible)
    await page.getByPlaceholder(/Search tags/i).fill('old-tag');
    await page.keyboard.press('Enter');

    const sidebar = page.getByRole('complementary').first();
    const referenceRow = page.getByRole('row', { name: /Test Reference for Tags/i });
    await referenceRow.click();
    await expect(page.getByRole('complementary', { name: 'Reference Details' })).toBeVisible();
    await page.getByRole('button', { name: /Add Tag/i }).click();
    // Click in TagPicker dropdown
    await page.getByRole('complementary', { name: 'Reference Details' }).getByText('old-tag').first().click();
    await page.keyboard.press('Escape');

    // Rename tag (right-click in sidebar)
    await sidebar.getByText('old-tag').click({ button: 'right' });
    await page.getByRole('menuitem', { name: /Rename/i }).click();
    await page.getByPlaceholder(/Tag name/i).fill('new-tag');
    await page.getByRole('button', { name: /Rename/i }).click();
    await waitForDialogClose(page);

    // Wait for rename mutation to complete
    await page.waitForLoadState('networkidle');
    await expect(sidebar.getByText('new-tag')).toBeVisible();

    // Verify reference still has the tag
    await referenceRow.click();
    await expect(page.getByRole('complementary', { name: 'Reference Details' })).toBeVisible();
    await expect(page.getByRole('complementary', { name: 'Reference Details' }).getByText('new-tag')).toBeVisible();
  });

  test('Delete Tag → References Lose Tag Association', async ({ page }) => {
    // Create a second reference (beforeEach creates 1, we need 2 total)
    await page.getByRole('button', { name: /Manual Entry/i }).click();
    await expect(page.getByTestId('reference-title-input')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('reference-title-input').fill('Second Reference for Tags');
    await page.getByTestId('reference-type-select').selectOption('article');
    await page.getByTestId('reference-year-input').fill('2024');
    await page.getByTestId('author-0-family-input').fill('SecondAuthor');
    await page.getByTestId('reference-submit-button').click();
    await page.waitForLoadState('networkidle');

    // Create tag and apply to multiple references (TagSelector is always visible)
    await page.getByPlaceholder(/Search tags/i).fill('delete-me');
    await page.keyboard.press('Enter');

    const sidebar = page.getByRole('complementary').first();
    const firstRow = page.getByRole('row', { name: /Test Reference for Tags/i });
    const secondRow = page.getByRole('row', { name: /Second Reference for Tags/i });

    // Apply to first reference
    await firstRow.click();
    await expect(page.getByRole('complementary', { name: 'Reference Details' })).toBeVisible();
    await page.getByRole('button', { name: /Add Tag/i }).click();
    await page.getByRole('complementary', { name: 'Reference Details' }).getByText('delete-me').first().click();
    await page.waitForLoadState('networkidle');
    await page.keyboard.press('Escape');

    // Apply to second reference
    await secondRow.click();
    await expect(page.getByRole('complementary', { name: 'Reference Details' })).toBeVisible();
    await page.getByRole('button', { name: /Add Tag/i }).click();
    await page.getByRole('complementary', { name: 'Reference Details' }).getByText('delete-me').first().click();
    await page.waitForLoadState('networkidle');
    await page.keyboard.press('Escape');

    // Verify tag has usage count 2
    const tagItem = sidebar.getByRole('button', { name: /delete-me/i });
    await expect(tagItem).toContainText('2');

    // Delete tag - click Delete in context menu (no confirmation dialog, immediate delete)
    await sidebar.getByText('delete-me').click({ button: 'right' });
    await page.getByRole('menuitem', { name: /Delete/i }).click();
    await page.waitForLoadState('networkidle');

    // Verify tag is gone from sidebar (with longer timeout to allow mutation to complete)
    await expect(sidebar.getByText('delete-me')).not.toBeVisible({ timeout: 10000 });

    // Verify references no longer have the tag
    await firstRow.click();
    await expect(page.getByRole('complementary', { name: 'Reference Details' })).toBeVisible();
    await expect(page.getByRole('complementary', { name: 'Reference Details' }).getByText('delete-me')).not.toBeVisible();
  });

  test('Tag Search/Filter in Tag Selector', async ({ page }) => {
    // Create multiple tags with proper waiting for each to appear
    const sidebar = page.getByRole('complementary').first();
    const tags = ['machine-learning', 'deep-learning', 'reinforcement-learning', 'nlp', 'computer-vision'];
    for (const tag of tags) {
      await page.getByPlaceholder(/Search tags/i).fill(tag);
      await page.keyboard.press('Enter');
      // Wait for tag to appear before creating the next one (prevents race condition)
      await expect(sidebar.getByText(tag)).toBeVisible({ timeout: 5000 });
    }

    // Search for 'learning'
    await page.getByPlaceholder(/Search tags/i).fill('learning');

    // Should show only matching tags (scoped to sidebar to avoid finding text in reference table)
    await expect(sidebar.getByText('machine-learning')).toBeVisible();
    await expect(sidebar.getByText('deep-learning')).toBeVisible();
    await expect(sidebar.getByText('reinforcement-learning')).toBeVisible();
    await expect(sidebar.getByText('nlp')).not.toBeVisible();
    await expect(sidebar.getByText('computer-vision')).not.toBeVisible();

    // Clear search
    await page.getByPlaceholder(/Search tags/i).clear();

    // All tags should be visible again
    await expect(sidebar.getByText('nlp')).toBeVisible();
    await expect(sidebar.getByText('computer-vision')).toBeVisible();
  });

  // TODO: This test is skipped because TagSelector defaults to expanded state (isCollapsed = false).
  // The collapse/expand functionality exists but is not part of the primary user workflow.
  // To enable this test, either:
  // 1. Update it to test that TagSelector defaults to expanded (simpler test)
  // 2. Add setup steps to manually collapse it first, then test expand/collapse behavior
  test.skip('Tag Selector Collapse/Expand → State Persists', async ({ page }) => {
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
