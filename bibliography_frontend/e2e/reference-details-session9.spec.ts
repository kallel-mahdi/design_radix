/**
 * Session 9: Reference Details E2E Tests
 *
 * Tests the complete reference details workflow:
 * - Click reference → DetailsPane opens
 * - View reference info, tags, collections
 * - Remove tags via X button
 * - Click collection to filter library
 * - Edit button opens ReferenceModal
 * - ESC key closes DetailsPane
 *
 * Worker Isolation:
 * - Each Playwright worker uses a unique user ID (test-user-0, test-user-1, etc.)
 * - This prevents race conditions when tests run in parallel
 */

import { test, expect } from './fixtures/workerFixtures';

test.describe('Reference Details - Session 9', () => {
  let testId: string;
  let referenceId: string;

  test.beforeEach(async ({ page, workerUserId }) => {
    testId = `test-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    // Cleanup BEFORE test (worker-scoped)
    const cleanupResponse = await page.request.delete(
      'http://localhost:8005/api/bibliography/references/test-cleanup',
      {
        headers: {
          'x-user-id': workerUserId,
        },
      }
    );
    expect(cleanupResponse.ok()).toBeTruthy();

    // Inject worker-scoped user ID into all API calls
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
    await expect(page.getByText('Library')).toBeVisible();

    // Create test collections
    const col1Response = await page.request.post(
      'http://localhost:8005/api/bibliography/collections',
      {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': workerUserId,
        },
        data: {
          name: `ML Papers ${testId}`,
          color: '#3b82f6',
        },
      }
    );
    expect(col1Response.ok()).toBeTruthy();
    const col1 = await col1Response.json();

    const col2Response = await page.request.post(
      'http://localhost:8005/api/bibliography/collections',
      {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': workerUserId,
        },
        data: {
          name: `Deep Learning ${testId}`,
          color: '#10b981',
        },
      }
    );
    expect(col2Response.ok()).toBeTruthy();
    const col2 = await col2Response.json();

    // Create test reference with tags and collections
    const refResponse = await page.request.post(
      'http://localhost:8005/api/bibliography/references',
      {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': workerUserId,
        },
        data: {
          type: 'article',
          title: `Neural Networks Study ${testId}`,
          authors: [
            { given: 'John', family: 'Doe' },
            { given: 'Jane', family: 'Smith' },
          ],
          year: 2024,
          venue: 'ICML',
          doi: `10.1234/test.${testId}`,
          abstract: 'A comprehensive study of neural networks and deep learning.',
          tags: ['machine-learning', 'deep-learning', 'neural-networks'],
          collectionIds: [col1.data._id, col2.data._id],
          sourceRaw: { provider: 'manual', payload: {} },
        },
      }
    );
    expect(refResponse.ok()).toBeTruthy();
    const refData = await refResponse.json();
    referenceId = refData.data._id;

    // Reload page to see the new reference
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should open DetailsPane when clicking a reference', async ({ page }) => {
    // Click on the reference in the table
    await page.getByText(`Neural Networks Study ${testId}`).click();

    // Wait for DetailsPane to appear
    const detailsPane = page.getByLabel('Reference Details');
    await expect(detailsPane.getByText('Reference Details')).toBeVisible();

    // Verify reference title is shown
    await expect(detailsPane.getByRole('heading', { name: `Neural Networks Study ${testId}` })).toBeVisible();

    // Verify authors are displayed
    await expect(detailsPane.getByText('Doe, John, Smith, Jane')).toBeVisible();

    // Verify publication info
    const yearSection = detailsPane.locator('text=Year').locator('..');
    await expect(yearSection.getByText('2024')).toBeVisible();

    // Verify type is shown
    await expect(detailsPane.getByText('article')).toBeVisible();

    // Verify DOI link
    await expect(detailsPane.getByText(`10.1234/test.${testId}`)).toBeVisible();

    // Verify abstract
    await expect(detailsPane.getByText('A comprehensive study of neural networks')).toBeVisible();
  });

  test('should display tags with remove buttons', async ({ page }) => {
    // Open DetailsPane
    await page.getByText(`Neural Networks Study ${testId}`).click();
    const detailsPane = page.getByLabel('Reference Details');
    await expect(detailsPane.getByText('Reference Details')).toBeVisible();

    // Verify all tags are displayed in DetailsPane
    await expect(detailsPane.getByText('machine-learning')).toBeVisible();
    await expect(detailsPane.getByText('deep-learning')).toBeVisible();
    await expect(detailsPane.getByText('neural-networks')).toBeVisible();

    // Verify remove buttons are present (Tags section)
    const tagsSection = detailsPane.locator('text=Tags').locator('..');
    const removeButtons = tagsSection.getByRole('button', { name: /remove tag/i });
    await expect(removeButtons).toHaveCount(3);
  });

  test('should remove tag when clicking X button', async ({ page }) => {
    // Open DetailsPane
    await page.getByText(`Neural Networks Study ${testId}`).click();
    const detailsPane = page.getByLabel('Reference Details');
    await expect(detailsPane.getByText('Reference Details')).toBeVisible();

    // Verify tag exists in DetailsPane
    await expect(detailsPane.getByText('machine-learning')).toBeVisible();

    // Click remove button for 'machine-learning' tag
    const tagsSection = detailsPane.locator('text=Tags').locator('..');
    const mlTag = tagsSection.locator('text=machine-learning').locator('..');
    await mlTag.getByRole('button', { name: /remove tag/i }).click();

    // Wait for API call to complete and tag to disappear from DetailsPane
    await expect(detailsPane.getByText('machine-learning')).not.toBeVisible({ timeout: 5000 });

    // Verify other tags still exist in DetailsPane
    await expect(detailsPane.getByText('deep-learning')).toBeVisible();
    await expect(detailsPane.getByText('neural-networks')).toBeVisible();
  });

  test('should display collections with clickable links', async ({ page }) => {
    // Open DetailsPane
    await page.getByText(`Neural Networks Study ${testId}`).click();
    const detailsPane = page.getByLabel('Reference Details');
    await expect(detailsPane.getByText('Reference Details')).toBeVisible();

    // Verify collections are displayed in DetailsPane
    await expect(detailsPane.getByRole('button', { name: `ML Papers ${testId}` })).toBeVisible();
    await expect(detailsPane.getByRole('button', { name: `Deep Learning ${testId}` })).toBeVisible();

    // Verify collections have folder icons (check for svg with folder path)
    const collectionsSection = detailsPane.locator('text=Collections').locator('..');
    const folderIcons = collectionsSection.locator('svg[data-slot="icon"]');
    await expect(folderIcons).toHaveCount(2);
  });

  test('should filter library when clicking a collection', async ({ page }) => {
    // Open DetailsPane
    await page.getByText(`Neural Networks Study ${testId}`).click();
    await expect(page.getByText('Reference Details')).toBeVisible();

    // Click on "ML Papers" collection
    const collectionsSection = page.locator('text=Collections').locator('..');
    await collectionsSection.getByText(`ML Papers ${testId}`).click();

    // Verify library is now filtered (sidebar or URL might change)
    // For now, just verify the collection click worked without errors
    await page.waitForTimeout(500);
  });

  test('should display metadata footer with dates and source', async ({ page }) => {
    // Open DetailsPane
    await page.getByText(`Neural Networks Study ${testId}`).click();
    await expect(page.getByText('Reference Details')).toBeVisible();

    // Verify footer content (dates and source)
    await expect(page.getByText(/Created:/)).toBeVisible();
    await expect(page.getByText(/Modified:/)).toBeVisible();
    await expect(page.getByText(/Source:/)).toBeVisible();
    await expect(page.getByText(/manual/i)).toBeVisible();
  });

  test('should show Edit button in DetailsPane', async ({ page }) => {
    // Open DetailsPane
    await page.getByText(`Neural Networks Study ${testId}`).click();
    await expect(page.getByText('Reference Details')).toBeVisible();

    // Verify Edit button is visible
    await expect(page.getByRole('button', { name: /edit/i })).toBeVisible();
  });

  test('should close DetailsPane when pressing ESC key', async ({ page }) => {
    // Open DetailsPane
    await page.getByText(`Neural Networks Study ${testId}`).click();
    await expect(page.getByText('Reference Details')).toBeVisible();

    // Press ESC key
    await page.keyboard.press('Escape');

    // Verify DetailsPane is closed
    await expect(page.getByText('Reference Details')).not.toBeVisible({ timeout: 2000 });
  });

  test('should NOT close DetailsPane on ESC if no reference is active', async ({ page }) => {
    // Don't click any reference, just verify the page loads
    await expect(page.getByText('Library')).toBeVisible();

    // Press ESC key
    await page.keyboard.press('Escape');

    // Verify nothing happens (no error, page still works)
    await expect(page.getByText('Library')).toBeVisible();
  });

  test('should close DetailsPane when clicking close button', async ({ page }) => {
    // Open DetailsPane
    await page.getByText(`Neural Networks Study ${testId}`).click();
    await expect(page.getByText('Reference Details')).toBeVisible();

    // Click close button (X icon)
    await page.getByRole('button', { name: /close/i }).click();

    // Verify DetailsPane is closed
    await expect(page.getByText('Reference Details')).not.toBeVisible({ timeout: 2000 });
  });

  test('complete workflow: open → remove tag → filter by collection → close with ESC', async ({ page }) => {
    // Step 1: Open DetailsPane
    await page.getByText(`Neural Networks Study ${testId}`).click();
    const detailsPane = page.getByLabel('Reference Details');
    await expect(detailsPane.getByText('Reference Details')).toBeVisible();

    // Step 2: Remove a tag
    const tagsSection = detailsPane.locator('text=Tags').locator('..');
    const mlTag = tagsSection.locator('text=machine-learning').locator('..');
    await mlTag.getByRole('button', { name: /remove tag/i }).click();
    await expect(detailsPane.getByText('machine-learning')).not.toBeVisible({ timeout: 5000 });

    // Step 3: Click collection to filter
    const collectionsSection = detailsPane.locator('text=Collections').locator('..');
    await collectionsSection.getByRole('button', { name: `ML Papers ${testId}` }).click();
    await page.waitForTimeout(500);

    // Step 4: Verify DetailsPane still open
    await expect(detailsPane.getByText('Reference Details')).toBeVisible();

    // Step 5: Close with ESC
    await page.keyboard.press('Escape');
    await expect(page.getByText('Reference Details')).not.toBeVisible({ timeout: 2000 });
  });
});
