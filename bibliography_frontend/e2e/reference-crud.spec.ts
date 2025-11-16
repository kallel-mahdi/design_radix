/**
 * E2E Tests for Reference CRUD Operations
 *
 * Critical path tests for creating and editing references through the full application stack.
 * These tests run against the real backend and database.
 *
 * Worker Isolation:
 * - Each Playwright worker uses a unique user ID (test-user-0, test-user-1, etc.)
 * - This prevents race conditions when tests run in parallel
 * - Worker A cannot delete Worker B's data
 */

import { test, expect } from './fixtures/workerFixtures';

test.describe('Reference Creation and Editing', () => {
  // Generate unique test identifier to avoid collisions between test runs
  let testId: string;

  test.beforeEach(async ({ page, workerUserId }) => {
    // Generate unique test ID for each test
    testId = `test-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

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

    // Intercept all API calls to inject worker-scoped user ID
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
  });

  test('should create a new reference with complete workflow', async ({ page }) => {
    const title = `E2E Test Article ${testId}`;
    const author = `Smith${testId}`;

    // Step 1: Click "New Reference" button
    await page.getByRole('button', { name: /new reference/i }).click();

    // Step 2: Modal should open
    await expect(page.getByRole('heading', { name: 'Create Reference' })).toBeVisible();

    // Step 3: Fill in form fields using data-testid
    await page.getByTestId('reference-type-select').selectOption('article');
    await page.getByTestId('reference-title-input').fill(title);
    await page.getByTestId('author-0-given-input').fill('John');
    await page.getByTestId('author-0-family-input').fill(author);
    await page.getByTestId('reference-year-input').fill('2024');
    await page.getByTestId('reference-venue-input').fill('Nature');
    await page.getByTestId('reference-doi-input').fill('10.1234/e2e-test');
    await page.getByTestId('reference-url-input').fill('https://example.com/e2e');

    // Step 4: Submit form
    await page.getByTestId('reference-submit-button').click();
    await page.waitForLoadState('networkidle'); // Wait for API call

    // Step 5: Modal should close
    await expect(page.getByRole('heading', { name: 'Create Reference' })).not.toBeVisible({ timeout: 3000 });

    // Step 6: Success toast should appear
    await expect(page.getByText(/reference created successfully/i)).toBeVisible({ timeout: 5000 });

    // Step 7: New reference should appear in the table
    // Find the row containing our specific title first
    const row = page.locator('tr', { hasText: title });
    await expect(row).toBeVisible();

    // Verify author and year within that row to avoid matching other references
    await expect(row.getByText(author)).toBeVisible();
    await expect(row.getByText('2024')).toBeVisible();
  });

  test('should edit an existing reference', async ({ page }) => {
    const originalTitle = `Original Title ${testId}`;
    const updatedTitle = `Updated Title ${testId}`;

    // First create a reference to edit
    await page.getByRole('button', { name: /new reference/i }).click();
    await expect(page.getByRole('heading', { name: 'Create Reference' })).toBeVisible();
    await page.getByTestId('reference-title-input').fill(originalTitle);
    await page.getByTestId('author-0-family-input').fill('TestAuthor');
    await page.getByTestId('reference-submit-button').click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/reference created successfully/i)).toBeVisible({ timeout: 5000 });

    // Wait for toast to disappear
    await page.waitForTimeout(3000);

    // Now edit the reference - double-click to open edit modal
    const row = page.getByText(originalTitle).locator('..').locator('..');
    await row.dblclick();

    // Modal should open in edit mode
    await expect(page.getByRole('heading', { name: 'Edit Reference' })).toBeVisible();

    // Verify pre-populated data
    await expect(page.getByTestId('reference-title-input')).toHaveValue(originalTitle);

    // Modify fields
    await page.getByTestId('reference-title-input').clear();
    await page.getByTestId('reference-title-input').fill(updatedTitle);
    await page.getByTestId('reference-year-input').fill('2025');

    // Submit changes
    await page.getByTestId('reference-submit-button').click();
    await page.waitForLoadState('networkidle');

    // Modal should close
    await expect(page.getByRole('heading', { name: 'Edit Reference' })).not.toBeVisible({ timeout: 3000 });

    // Success toast
    await expect(page.getByText(/reference updated successfully/i)).toBeVisible({ timeout: 5000 });

    // Updated values should appear in table
    await expect(page.getByText(updatedTitle)).toBeVisible();
    await expect(page.getByText('2025')).toBeVisible();

    // Original title should not be visible
    await expect(page.getByText(originalTitle)).not.toBeVisible();
  });

  test('should handle keyboard shortcuts in modal', async ({ page }) => {
    // Open create modal
    await page.getByRole('button', { name: /new reference/i }).click();
    await expect(page.getByRole('heading', { name: 'Create Reference' })).toBeVisible();

    // Fill required fields
    await page.getByTestId('reference-title-input').fill('Keyboard Shortcut E2E');
    await page.getByTestId('author-0-family-input').fill('ShortcutTest');

    // Submit with Cmd+Enter (or Ctrl+Enter on Windows/Linux)
    const isMac = process.platform === 'darwin';
    if (isMac) {
      await page.keyboard.press('Meta+Enter');
    } else {
      await page.keyboard.press('Control+Enter');
    }
    await page.waitForLoadState('networkidle');

    // Should submit and close
    await expect(page.getByRole('heading', { name: 'Create Reference' })).not.toBeVisible({ timeout: 3000 });
    await expect(page.getByText(/reference created successfully/i)).toBeVisible({ timeout: 5000 });

    // Wait for toast to disappear before opening new modal
    await page.waitForTimeout(3000);

    // Ensure no modal is open before proceeding
    await expect(page.getByRole('heading', { name: 'Create Reference' })).not.toBeVisible();

    // Open modal again
    await page.getByRole('button', { name: /new reference/i }).click();
    await expect(page.getByRole('heading', { name: 'Create Reference' })).toBeVisible();

    // Fill some data
    await page.getByTestId('reference-title-input').fill('Will be discarded');

    // Close with Escape
    await page.keyboard.press('Escape');

    // Should close without saving
    await expect(page.getByRole('heading', { name: 'Create Reference' })).not.toBeVisible({ timeout: 3000 });

    // No success toast (since we cancelled)
    await expect(page.getByText(/reference created successfully/i)).not.toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Open create modal
    await page.getByRole('button', { name: /new reference/i }).click();
    await expect(page.getByRole('heading', { name: 'Create Reference' })).toBeVisible();

    // Try to submit without required title
    await page.getByTestId('reference-submit-button').click();
    await page.waitForTimeout(500); // Wait for validation

    // Validation error should appear
    await expect(page.getByText(/title is required|required/i)).toBeVisible();

    // Modal should still be open
    await expect(page.getByRole('heading', { name: 'Create Reference' })).toBeVisible();
  });

  test('should handle multiple authors', async ({ page }) => {
    const title = `Multi-Author Paper ${testId}`;
    const author1 = `Doe${testId}`;
    const author2 = `Smith${testId}`;

    await page.getByRole('button', { name: /new reference/i }).click();
    await expect(page.getByRole('heading', { name: 'Create Reference' })).toBeVisible();

    // Fill title
    await page.getByTestId('reference-title-input').fill(title);

    // Fill first author
    await page.getByTestId('author-0-given-input').fill('John');
    await page.getByTestId('author-0-family-input').fill(author1);

    // Add second author
    await page.getByTestId('add-author-button').click();

    // Fill second author
    await page.getByTestId('author-1-given-input').fill('Jane');
    await page.getByTestId('author-1-family-input').fill(author2);

    // Submit
    await page.getByTestId('reference-submit-button').click();
    await page.waitForLoadState('networkidle');

    // Should succeed
    await expect(page.getByText(/reference created successfully/i)).toBeVisible({ timeout: 5000 });

    // Both authors should appear in the table
    // Format should be "Doe, J. & Smith, J." (Family, Initial. & Family, Initial.)
    await expect(page.getByText(title)).toBeVisible();

    // Check for the formatted author string in the table
    // The UI renders as "Family, Initial. & Family, Initial." for multiple authors
    const row = page.locator('tr', { hasText: title });
    await expect(row).toBeVisible();

    // Verify both author family names appear in the row
    await expect(row.getByText(new RegExp(`${author1}.*${author2}|${author1}, J\\. & ${author2}, J\\.`))).toBeVisible();
  });
});
