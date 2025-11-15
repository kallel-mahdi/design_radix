import { test, expect } from '@playwright/test';

/**
 * Critical User Flows - E2E Tests
 *
 * These tests validate the most critical user journeys that would be
 * time-consuming to test manually (5+ minutes each). They run against
 * the real frontend and backend.
 */

test.describe('Critical User Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to library page
    await page.goto('http://localhost:5173/library');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('Create Reference → Add to Collection → Search → View Details', async ({ page }) => {
    // Step 1: Create a new reference
    await page.getByRole('button', { name: /Add Reference/i }).click();

    await page.getByLabel(/Title/i).fill('Deep Reinforcement Learning for Robotics');
    await page.getByLabel(/Type/i).selectOption('article');
    await page.getByLabel(/Year/i).fill('2024');
    await page.getByLabel(/Authors/i).fill('Jane Doe, John Smith');

    await page.getByRole('button', { name: /Save|Create/i }).click();

    // Verify reference appears in library
    await expect(page.getByText('Deep Reinforcement Learning for Robotics')).toBeVisible();

    // Step 2: Add to collection
    // Right-click on the reference card
    await page.getByText('Deep Reinforcement Learning for Robotics').click({ button: 'right' });

    // Select "Add to Collection" from context menu
    await page.getByRole('menuitem', { name: /Add to Collection/i }).click();

    // Select ML Papers collection
    await page.getByText('ML Papers').click();

    // Verify success message
    await expect(page.getByText(/Added to collection/i)).toBeVisible();

    // Step 3: Search for the reference
    await page.getByPlaceholder(/Search references/i).fill('reinforcement learning');

    // Wait for search debounce and results
    await page.waitForTimeout(500);

    // Verify filtered results
    await expect(page.getByText('Deep Reinforcement Learning for Robotics')).toBeVisible();

    // Step 4: View reference details
    await page.getByText('Deep Reinforcement Learning for Robotics').click();

    // Verify details modal opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Jane Doe')).toBeVisible();
    await expect(page.getByText('2024')).toBeVisible();

    // Close modal
    await page.getByRole('button', { name: /Close/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('Collection Management: Create → Rename → Organize → Delete → Restore', async ({ page }) => {
    // Step 1: Create new collection
    await page.getByRole('button', { name: /New Collection/i }).click();
    await page.getByPlaceholder(/Collection name/i).fill('Test Papers');
    await page.getByRole('button', { name: /Create/i }).click();

    // Verify collection appears
    await expect(page.getByText('Test Papers')).toBeVisible();

    // Step 2: Rename collection
    await page.getByText('Test Papers').click({ button: 'right' });
    await page.getByRole('menuitem', { name: /Rename/i }).click();
    await page.getByPlaceholder(/Collection name/i).fill('Research Papers 2024');
    await page.getByRole('button', { name: /Save|Rename/i }).click();

    await expect(page.getByText('Research Papers 2024')).toBeVisible();
    await expect(page.getByText('Test Papers')).not.toBeVisible();

    // Step 3: Create nested subcollection
    await page.getByText('Research Papers 2024').click({ button: 'right' });
    await page.getByRole('menuitem', { name: /New Subcollection/i }).click();
    await page.getByPlaceholder(/Collection name/i).fill('Drafts');
    await page.getByRole('button', { name: /Create/i }).click();

    // Expand parent to see subcollection
    await page.getByTestId('expand-collection').first().click();
    await expect(page.getByText('Drafts')).toBeVisible();

    // Step 4: Delete collection
    await page.getByText('Research Papers 2024').click({ button: 'right' });
    await page.getByRole('menuitem', { name: /Delete/i }).click();
    await page.getByRole('button', { name: /Confirm|Delete/i }).click();

    // Collection should be moved to trash
    await expect(page.getByText('Research Papers 2024')).not.toBeVisible();

    // Step 5: Restore from trash
    await page.getByRole('button', { name: /Trash|Deleted/i }).click();
    await page.getByText('Research Papers 2024').click({ button: 'right' });
    await page.getByRole('menuitem', { name: /Restore/i }).click();

    // Back to library view
    await page.getByRole('button', { name: /Library|All References/i }).click();

    // Verify collection is restored
    await expect(page.getByText('Research Papers 2024')).toBeVisible();
  });

  test('Tag Management: Create → Assign Color → Filter by Multiple Tags', async ({ page }) => {
    // Assume we have a reference visible
    await expect(page.getByRole('article').first()).toBeVisible();

    // Step 1: Create a new tag by typing in tag selector
    await page.getByRole('button', { name: /Tags/i }).click();
    await page.getByPlaceholder(/Search tags/i).fill('machine-learning');
    await page.keyboard.press('Enter');

    // Tag should appear in list
    await expect(page.getByText('machine-learning')).toBeVisible();

    // Step 2: Assign color to tag (keyboard shortcut)
    await page.getByText('machine-learning').click({ button: 'right' });
    await page.getByRole('menuitem', { name: /Assign Color/i }).click();

    // Select color #1 (red)
    await page.locator('button[aria-label*="Select color"]').first().click();
    await page.getByRole('button', { name: /Apply|Confirm/i }).click();

    // Verify tag has color indicator
    await expect(page.locator('[data-testid="tag-color-indicator"]')).toBeVisible();

    // Step 3: Filter by tag
    await page.getByText('machine-learning').click();

    // Verify active filter appears
    await expect(page.getByText(/Active Filters/i)).toBeVisible();
    await expect(page.getByText('machine-learning')).toBeVisible();

    // Step 4: Add second tag filter
    await page.getByText('deep-learning').click();

    // Both tags should be in active filters
    await expect(page.getByText('machine-learning')).toBeVisible();
    await expect(page.getByText('deep-learning')).toBeVisible();

    // Step 5: Clear filters
    await page.getByRole('button', { name: /Clear All Filters|Reset/i }).click();

    // Active filters should be gone
    await expect(page.getByText(/Active Filters/i)).not.toBeVisible();
  });

  test('Bulk Operations: Select Multiple → Tag → Delete → Restore', async ({ page }) => {
    // Wait for references to load
    await page.waitForSelector('[data-testid="reference-card"]', { timeout: 5000 });

    // Step 1: Select multiple references
    const firstRef = page.locator('[data-testid="reference-card"]').first();
    const secondRef = page.locator('[data-testid="reference-card"]').nth(1);
    const thirdRef = page.locator('[data-testid="reference-card"]').nth(2);

    // Click with Ctrl to multi-select
    await firstRef.click({ modifiers: ['Control'] });
    await secondRef.click({ modifiers: ['Control'] });
    await thirdRef.click({ modifiers: ['Control'] });

    // Verify 3 selected
    await expect(page.getByText(/3 selected/i)).toBeVisible();

    // Step 2: Bulk tag operation
    await page.getByRole('button', { name: /Add Tags/i }).click();
    await page.getByPlaceholder(/Search tags/i).fill('important');
    await page.keyboard.press('Enter');

    // Step 3: Bulk delete
    await page.getByRole('button', { name: /Delete Selected/i }).click();
    await page.getByRole('button', { name: /Confirm/i }).click();

    // References should disappear
    await expect(page.getByText(/3 selected/i)).not.toBeVisible();

    // Step 4: Go to trash and restore
    await page.getByRole('button', { name: /Trash/i }).click();

    // Select all deleted items
    await page.getByRole('button', { name: /Select All/i }).click();
    await page.getByRole('button', { name: /Restore Selected/i }).click();

    // Back to library
    await page.getByRole('button', { name: /Library/i }).click();

    // Verify items are restored with tag
    await expect(page.getByText('important')).toBeVisible();
  });

  test('Search and Sort: Combine Filters → Sort by Author → Persist Preferences', async ({ page }) => {
    // Step 1: Apply collection filter
    await page.getByText('ML Papers').click();

    // Step 2: Apply tag filter
    await page.getByText('neural-networks').click();

    // Step 3: Apply search query
    await page.getByPlaceholder(/Search/i).fill('deep learning');
    await page.waitForTimeout(500); // Debounce

    // Step 4: Change sort order
    await page.getByRole('button', { name: /Sort/i }).click();
    await page.getByRole('menuitem', { name: /Author/i }).click();

    // Verify combined filters are active
    await expect(page.getByText(/ML Papers/i)).toBeVisible();
    await expect(page.getByText(/neural-networks/i)).toBeVisible();

    // Step 5: Refresh page to test persistence
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify sort preference persisted
    await expect(page.getByRole('button', { name: /Sort.*Author/i })).toBeVisible();

    // Verify filters can be cleared
    await page.getByRole('button', { name: /Clear Filters/i }).click();
    await expect(page.getByText(/ML Papers/i)).not.toBeVisible();
  });

  test('Error Recovery: API Failure → Retry → Success', async ({ page }) => {
    // This test requires mocking network failures
    // For now, we'll test the UI response to errors

    // Intercept API call to return error
    await page.route('**/api/bibliography/references', (route) => {
      route.abort('failed');
    });

    // Try to load library
    await page.goto('http://localhost:5173/library');

    // Should show error message
    await expect(page.getByText(/Failed to load|Error/i)).toBeVisible();

    // Should have retry button
    await expect(page.getByRole('button', { name: /Retry|Try Again/i })).toBeVisible();

    // Remove network mock
    await page.unroute('**/api/bibliography/references');

    // Click retry
    await page.getByRole('button', { name: /Retry/i }).click();

    // Should load successfully
    await page.waitForSelector('[data-testid="reference-card"]', { timeout: 5000 });
    await expect(page.getByRole('article').first()).toBeVisible();
  });

  test('Duplicate Detection: Import → Detect → Resolve', async ({ page }) => {
    // Step 1: Import a reference (via BibTeX or manual)
    await page.getByRole('button', { name: /Import/i }).click();

    // Select BibTeX option
    await page.getByRole('menuitem', { name: /BibTeX/i }).click();

    // Paste BibTeX data
    const bibtex = `@article{doe2024ml,
  title={Machine Learning Fundamentals},
  author={Doe, Jane},
  year={2024},
  journal={AI Review}
}`;

    await page.getByPlaceholder(/Paste BibTeX/i).fill(bibtex);
    await page.getByRole('button', { name: /Import/i }).click();

    // Step 2: Try to import same reference again
    await page.getByRole('button', { name: /Import/i }).click();
    await page.getByRole('menuitem', { name: /BibTeX/i }).click();
    await page.getByPlaceholder(/Paste BibTeX/i).fill(bibtex);
    await page.getByRole('button', { name: /Import/i }).click();

    // Should show duplicate detection warning
    await expect(page.getByText(/Duplicate detected|Already exists/i)).toBeVisible();

    // Step 3: Go to duplicates page
    await page.getByRole('button', { name: /View Duplicates|Duplicates/i }).click();

    // Should show duplicate group
    await expect(page.getByText('Machine Learning Fundamentals')).toBeVisible();

    // Step 4: Resolve duplicate by merging
    await page.getByRole('button', { name: /Merge/i }).first().click();
    await page.getByRole('button', { name: /Confirm/i }).click();

    // Should return to library with single reference
    await expect(page.getByText(/Merged successfully/i)).toBeVisible();
  });

  test('Reference Details Modal: View → Edit → Save → Verify', async ({ page }) => {
    // Click on first reference
    await page.locator('[data-testid="reference-card"]').first().click();

    // Modal should open
    await expect(page.getByRole('dialog')).toBeVisible();

    // Verify all metadata sections
    await expect(page.getByText(/Title/i)).toBeVisible();
    await expect(page.getByText(/Authors/i)).toBeVisible();
    await expect(page.getByText(/Year/i)).toBeVisible();

    // Click edit button
    await page.getByRole('button', { name: /Edit/i }).click();

    // Edit abstract
    await page.getByLabel(/Abstract/i).fill('This is an updated abstract for testing.');

    // Save changes
    await page.getByRole('button', { name: /Save/i }).click();

    // Modal should close
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Reopen to verify changes persisted
    await page.locator('[data-testid="reference-card"]').first().click();
    await expect(page.getByText('This is an updated abstract for testing.')).toBeVisible();

    // Close modal
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
