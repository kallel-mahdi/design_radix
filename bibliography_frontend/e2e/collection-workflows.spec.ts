import { test, expect } from './fixtures/workerFixtures';

/**
 * Collection Management Workflows - E2E Tests
 *
 * Tests comprehensive collection management functionality including:
 * - Creating and organizing collections
 * - Nested hierarchies
 * - Color coding
 * - Drag-drop reordering
 * - Collection-based filtering
 *
 * TODO: Implement collection management UI (Session 8) before enabling these tests
 * SKIPPED: Collection tree, context menus, and collection CRUD UI not yet implemented
 *
 * Worker Isolation:
 * - Each Playwright worker uses a unique user ID (test-user-0, test-user-1, etc.)
 * - This prevents race conditions when tests run in parallel
 * - Worker A cannot delete Worker B's data
 */

test.describe.skip('Collection Workflows', () => {
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

  test('Create Root Collection → Add References → View Collection', async ({ page }) => {
    // Step 1: Create new root collection
    await page.getByRole('button', { name: /New Collection/i }).click();

    await page.getByPlaceholder(/Collection name/i).fill('AI Research Papers');
    await page.getByRole('button', { name: /Create/i }).click();

    // Verify collection appears in tree
    await expect(page.getByText('AI Research Papers')).toBeVisible();

    // Step 2: Add references to collection
    const referenceCard = page.locator('[data-testid="reference-card"]').first();
    await referenceCard.click({ button: 'right' });

    await page.getByRole('menuitem', { name: /Add to Collection/i }).click();
    await page.getByText('AI Research Papers').click();

    // Step 3: Filter by collection
    await page.getByText('AI Research Papers').click();

    // Verify only collection references are shown
    await expect(page.getByText(/Showing.*from AI Research Papers/i)).toBeVisible();
  });

  test('Create Nested Collection Hierarchy (3 levels deep)', async ({ page }) => {
    // Level 1: Root collection
    await page.getByRole('button', { name: /New Collection/i }).click();
    await page.getByPlaceholder(/Collection name/i).fill('Research');
    await page.getByRole('button', { name: /Create/i }).click();

    await expect(page.getByText('Research')).toBeVisible();

    // Level 2: Child collection
    await page.getByText('Research').click({ button: 'right' });
    await page.getByRole('menuitem', { name: /New Subcollection/i }).click();
    await page.getByPlaceholder(/Collection name/i).fill('Machine Learning');
    await page.getByRole('button', { name: /Create/i }).click();

    // Expand to see child
    await page.getByTestId('expand-collection').first().click();
    await expect(page.getByText('Machine Learning')).toBeVisible();

    // Level 3: Grandchild collection
    await page.getByText('Machine Learning').click({ button: 'right' });
    await page.getByRole('menuitem', { name: /New Subcollection/i }).click();
    await page.getByPlaceholder(/Collection name/i).fill('Deep Learning');
    await page.getByRole('button', { name: /Create/i }).click();

    // Expand parent to see grandchild
    const mlChevron = page.getByTestId('expand-collection').nth(1);
    await mlChevron.click();
    await expect(page.getByText('Deep Learning')).toBeVisible();

    // Verify indentation (visual hierarchy)
    const deepLearningNode = page.getByText('Deep Learning').locator('..');
    const style = await deepLearningNode.getAttribute('style');
    expect(style).toContain('padding-left'); // Indented
  });

  test('Assign Color to Collection → Verify Visual Indicator', async ({ page }) => {
    // Create collection
    await page.getByRole('button', { name: /New Collection/i }).click();
    await page.getByPlaceholder(/Collection name/i).fill('Important Papers');
    await page.getByRole('button', { name: /Create/i }).click();

    // Right-click to open context menu
    await page.getByText('Important Papers').click({ button: 'right' });
    await page.getByRole('menuitem', { name: /Assign Color/i }).click();

    // Select color (red #FF6B6B)
    await page.locator('button[aria-label*="Select color #FF6B6B"]').click();
    await page.getByRole('button', { name: /Apply/i }).click();

    // Verify color indicator appears
    const colorIndicator = page.locator('[data-testid="collection-color-indicator"]');
    await expect(colorIndicator).toBeVisible();

    // Verify color is correct (red)
    const bgColor = await colorIndicator.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(bgColor).toContain('rgb(255, 107, 107)'); // #FF6B6B in RGB
  });

  test('Move Collection to Different Parent (Reparenting)', async ({ page }) => {
    // Create two root collections
    await page.getByRole('button', { name: /New Collection/i }).click();
    await page.getByPlaceholder(/Collection name/i).fill('Source');
    await page.getByRole('button', { name: /Create/i }).click();

    await page.getByRole('button', { name: /New Collection/i }).click();
    await page.getByPlaceholder(/Collection name/i).fill('Target');
    await page.getByRole('button', { name: /Create/i }).click();

    // Create child under Source
    await page.getByText('Source').click({ button: 'right' });
    await page.getByRole('menuitem', { name: /New Subcollection/i }).click();
    await page.getByPlaceholder(/Collection name/i).fill('Child');
    await page.getByRole('button', { name: /Create/i }).click();

    // Expand Source to see Child
    await page.getByTestId('expand-collection').first().click();
    await expect(page.getByText('Child')).toBeVisible();

    // Move Child to Target
    await page.getByText('Child').click({ button: 'right' });
    await page.getByRole('menuitem', { name: /Move to/i }).click();
    await page.getByText('Target').click();
    await page.getByRole('button', { name: /Move/i }).click();

    // Verify Child is now under Target
    await page.getByTestId('expand-collection').nth(1).click();
    await expect(page.getByText('Child')).toBeVisible();

    // Verify Child is no longer under Source
    await page.getByTestId('expand-collection').first().click();
    await expect(page.getByText('Child')).not.toBeVisible();
  });

  test('Delete Collection → References Remain → Collection Goes to Trash', async ({ page }) => {
    // Create collection and add reference
    await page.getByRole('button', { name: /New Collection/i }).click();
    await page.getByPlaceholder(/Collection name/i).fill('Temporary');
    await page.getByRole('button', { name: /Create/i }).click();

    const referenceCard = page.locator('[data-testid="reference-card"]').first();
    const referenceTitle = await referenceCard.textContent();

    await referenceCard.click({ button: 'right' });
    await page.getByRole('menuitem', { name: /Add to Collection/i }).click();
    await page.getByText('Temporary').click();

    // Delete collection
    await page.getByText('Temporary').click({ button: 'right' });
    await page.getByRole('menuitem', { name: /Delete/i }).click();
    await page.getByRole('button', { name: /Confirm/i }).click();

    // Verify collection is gone
    await expect(page.getByText('Temporary')).not.toBeVisible();

    // Verify reference still exists
    await expect(page.getByText(referenceTitle!)).toBeVisible();

    // Go to trash
    await page.getByRole('button', { name: /Trash/i }).click();

    // Verify collection is in trash
    await expect(page.getByText('Temporary')).toBeVisible();
  });

  test('Expand/Collapse Collection → State Persists Across Page Reload', async ({ page }) => {
    // Create nested structure
    await page.getByRole('button', { name: /New Collection/i }).click();
    await page.getByPlaceholder(/Collection name/i).fill('Parent');
    await page.getByRole('button', { name: /Create/i }).click();

    await page.getByText('Parent').click({ button: 'right' });
    await page.getByRole('menuitem', { name: /New Subcollection/i }).click();
    await page.getByPlaceholder(/Collection name/i).fill('Child');
    await page.getByRole('button', { name: /Create/i }).click();

    // Expand parent
    await page.getByTestId('expand-collection').first().click();
    await expect(page.getByText('Child')).toBeVisible();

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify parent is still expanded
    await expect(page.getByText('Child')).toBeVisible();

    // Collapse parent
    await page.getByTestId('expand-collection').first().click();
    await expect(page.getByText('Child')).not.toBeVisible();

    // Reload again
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify parent is still collapsed
    await expect(page.getByText('Child')).not.toBeVisible();
  });

  test('Rename Collection → Verify References Association Preserved', async ({ page }) => {
    // Create collection and add reference
    await page.getByRole('button', { name: /New Collection/i }).click();
    await page.getByPlaceholder(/Collection name/i).fill('Old Name');
    await page.getByRole('button', { name: /Create/i }).click();

    const referenceCard = page.locator('[data-testid="reference-card"]').first();
    await referenceCard.click({ button: 'right' });
    await page.getByRole('menuitem', { name: /Add to Collection/i }).click();
    await page.getByText('Old Name').click();

    // Filter by collection
    await page.getByText('Old Name').click();
    const count = await page.locator('[data-testid="reference-card"]').count();

    // Rename collection
    await page.getByText('Old Name').click({ button: 'right' });
    await page.getByRole('menuitem', { name: /Rename/i }).click();
    await page.getByPlaceholder(/Collection name/i).fill('New Name');
    await page.getByRole('button', { name: /Save/i }).click();

    await expect(page.getByText('New Name')).toBeVisible();

    // Filter by renamed collection
    await page.getByText('New Name').click();

    // Verify same number of references
    const newCount = await page.locator('[data-testid="reference-card"]').count();
    expect(newCount).toBe(count);
  });

  test('Collection Reference Count Updates Dynamically', async ({ page }) => {
    // Create collection
    await page.getByRole('button', { name: /New Collection/i }).click();
    await page.getByPlaceholder(/Collection name/i).fill('Counter Test');
    await page.getByRole('button', { name: /Create/i }).click();

    // Check initial count (should be 0)
    const initialCount = await page
      .locator('[data-testid="collection-count"]')
      .first()
      .textContent();
    expect(initialCount).toBe('0');

    // Add reference to collection
    const referenceCard = page.locator('[data-testid="reference-card"]').first();
    await referenceCard.click({ button: 'right' });
    await page.getByRole('menuitem', { name: /Add to Collection/i }).click();
    await page.getByText('Counter Test').click();

    // Verify count increased to 1
    await expect(page.locator('[data-testid="collection-count"]').first()).toHaveText('1');

    // Add another reference
    const secondCard = page.locator('[data-testid="reference-card"]').nth(1);
    await secondCard.click({ button: 'right' });
    await page.getByRole('menuitem', { name: /Add to Collection/i }).click();
    await page.getByText('Counter Test').click();

    // Verify count increased to 2
    await expect(page.locator('[data-testid="collection-count"]').first()).toHaveText('2');

    // Remove one reference
    await page.getByText('Counter Test').click(); // Filter by collection
    await referenceCard.click({ button: 'right' });
    await page.getByRole('menuitem', { name: /Remove from Collection/i }).click();

    // Verify count decreased to 1
    await expect(page.locator('[data-testid="collection-count"]').first()).toHaveText('1');
  });
});
