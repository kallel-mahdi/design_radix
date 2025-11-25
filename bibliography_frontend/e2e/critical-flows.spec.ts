import { test, expect } from './fixtures/workerFixtures';

/**
 * Critical User Flows - E2E Tests
 *
 * These tests validate the most critical user journeys that would be
 * time-consuming to test manually (5+ minutes each). They run against
 * the real frontend and backend.
 *
 * Worker Isolation:
 * - Each Playwright worker uses a unique user ID (test-user-0, test-user-1, etc.)
 * - This prevents race conditions when tests run in parallel
 * - Worker A cannot delete Worker B's data
 */

test.describe('Critical User Flows', () => {
  test.beforeEach(async ({ page, workerUserId }) => {
    // 1. Intercept all API calls FIRST to inject worker-scoped user ID
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

    // 3. Cleanup AFTER route intercept is set up (worker-scoped cleanup)
    const cleanupResponse = await page.request.delete(
      'http://localhost:8005/api/bibliography/references/test-cleanup',
      {
        headers: {
          'x-user-id': workerUserId,
          'x-test-cleanup': 'true',
        },
      }
    );
    expect(cleanupResponse.ok()).toBeTruthy();

    // 4. Reload to show empty state
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should create reference and verify in table', async ({ page }) => {
    // Test reference creation workflow (Session 8 - IMPLEMENTED)

    // Step 1: Create a new reference
    await page.getByRole('button', { name: /New Reference/i }).click();

    // Verify modal opened
    await expect(page.getByRole('heading', { name: 'Create Reference' })).toBeVisible();

    // Fill form using data-testid
    await page.getByTestId('reference-title-input').fill('Deep Reinforcement Learning for Robotics');
    await page.getByTestId('reference-type-select').selectOption('article');
    await page.getByTestId('reference-year-input').fill('2024');
    await page.getByTestId('author-0-family-input').fill('Doe');

    // Submit form
    await page.getByTestId('reference-submit-button').click();
    await page.waitForLoadState('networkidle');

    // Verify modal closed
    await expect(page.getByRole('heading', { name: 'Create Reference' })).not.toBeVisible({ timeout: 3000 });

    // Verify success toast
    await expect(page.getByText(/reference created successfully/i)).toBeVisible({ timeout: 5000 });

    // Verify reference appears in library table
    await expect(page.getByText('Deep Reinforcement Learning for Robotics')).toBeVisible();
    await expect(page.getByText('Doe')).toBeVisible();
    await expect(page.getByText('2024')).toBeVisible();
  });

  // TODO: Collection context menu (rename, delete, restore) not fully implemented
  // Skip until collection management UI is complete
  test.skip('Collection Management: Create → Rename → Organize → Delete → Restore', async ({ page }) => {
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

  // TODO: Tag context menu for color assignment not implemented
  // Skip until tag management UI is complete
  test.skip('Tag Management: Create → Assign Color → Filter by Multiple Tags', async ({ page }) => {
    // Assume we have a reference visible
    await expect(page.getByRole('article').first()).toBeVisible();

    // Step 1: Create a new tag (TagSelector is always visible)
    await page.getByPlaceholder(/Search tags/i).fill('machine-learning');
    await page.keyboard.press('Enter');

    // Tag should appear in list
    await expect(page.getByText('machine-learning')).toBeVisible();

    // Step 2: Assign color to tag (keyboard shortcut)
    await page.getByText('machine-learning').click({ button: 'right' });
    await page.getByRole('menuitem', { name: /Assign Color/i }).click();

    // Select color (first color swatch)
    await page.locator('[data-testid="color-swatch"]').first().click();
    await page.getByRole('button', { name: /Set Color/i }).click();

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

  // TODO: Bulk operations UI not yet implemented (multi-select, bulk tag, bulk delete)
  // Re-enable once bulk operations features are added
  test.skip('Bulk Operations: Select Multiple → Tag → Delete → Restore', async ({ page }) => {
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

  // TODO: Sort menu and filter persistence not fully implemented
  test.skip('Search and Sort: Combine Filters → Sort by Author → Persist Preferences', async ({ page }) => {
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

  // TODO: Error boundary retry UI not implemented
  test.skip('Error Recovery: API Failure → Retry → Success', async ({ page }) => {
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

  // TODO: BibTeX import and duplicate resolution UI not implemented
  test.skip('Duplicate Detection: Import → Detect → Resolve', async ({ page }) => {
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

  // TODO: Test expects reference-card but UI uses table rows with details pane (not modal)
  test.skip('Reference Details Modal: View → Edit → Save → Verify', async ({ page }) => {
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
