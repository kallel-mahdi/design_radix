import { test, expect } from './fixtures/workerFixtures';

test.describe('Figma Parity - MVP Features', () => {
  test.beforeEach(async ({ setupLibrary }) => {
    // Use centralized setup (routing, cleanup, collection creation)
    await setupLibrary();
  });

  test.describe('Activity Bar - All 7 Icons Visible', () => {
    test('should display all 7 activity bar icons', async ({ page }) => {
      // Check Library icon
      const libraryBtn = page.getByRole('button', { name: 'View Library' });
      await expect(libraryBtn).toBeVisible();

      // Check Search icon
      const searchBtn = page.getByRole('button', { name: 'View Search' });
      await expect(searchBtn).toBeVisible();

      // Check Projects icon
      const projectsBtn = page.getByRole('button', { name: 'View Projects' });
      await expect(projectsBtn).toBeVisible();

      // Check Duplicates icon (disabled)
      const duplicatesBtn = page.getByRole('button', { name: 'View Duplicates' });
      await expect(duplicatesBtn).toBeVisible();
      await expect(duplicatesBtn).toBeDisabled();

      // Check Tags icon
      const tagsBtn = page.getByRole('button', { name: 'View Tags' });
      await expect(tagsBtn).toBeVisible();

      // Check Sharing icon
      const sharingBtn = page.getByRole('button', { name: 'View Sharing' });
      await expect(sharingBtn).toBeVisible();

      // Check Trash icon
      const trashBtn = page.getByRole('button', { name: 'View Trash' });
      await expect(trashBtn).toBeVisible();
    });

    test('Duplicates button should be disabled with tooltip', async ({ page }) => {
      const duplicatesBtn = page.getByRole('button', { name: 'View Duplicates' });

      // Check disabled state
      await expect(duplicatesBtn).toBeDisabled();

      // Hover to see tooltip
      await duplicatesBtn.hover();

      // Check for tooltip text
      const tooltip = page.locator('text=Coming in Phase 1');
      await expect(tooltip).toBeVisible();
    });

    test('Library button should be active by default', async ({ page }) => {
      const libraryBtn = page.getByRole('button', { name: 'View Library' });

      // Check if button has active class/attribute
      const hasActiveClass = await libraryBtn.evaluate((el) => {
        return el.className.includes('bg-app-accent') || el.getAttribute('aria-current') === 'page';
      });

      expect(hasActiveClass).toBeTruthy();
    });
  });

  test.describe('Tags Route Navigation', () => {
    test('should navigate to Tags view when Tags icon clicked', async ({ page }) => {
      const tagsBtn = page.getByRole('button', { name: 'View Tags' });
      await tagsBtn.click();

      // Check URL changed
      await expect(page).toHaveURL(/\/tags$/);

      // Check Tags heading visible
      const heading = page.getByRole('heading', { name: 'Tags', level: 1 });
      await expect(heading).toBeVisible();
    });

    test('Tags view should display tag information', async ({ page }) => {
      const tagsBtn = page.getByRole('button', { name: 'View Tags' });
      await tagsBtn.click();

      // Wait for content to load
      await page.waitForLoadState('networkidle');

      // Check for tag count message
      const tagCountMsg = page.locator('text=/\\d+ tag/');
      await expect(tagCountMsg).toBeVisible();

      // Check for tag display (at least one tag should be visible)
      const tagElement = page.locator('[class*="bg-"]').first();
      await expect(tagElement).toBeVisible();
    });

    test('Tags button should become active when on Tags route', async ({ page }) => {
      const tagsBtn = page.getByRole('button', { name: 'View Tags' });
      await tagsBtn.click();

      // Check if button is marked active
      const hasActiveClass = await tagsBtn.evaluate((el) => {
        return el.className.includes('bg-app-accent') || el.getAttribute('aria-current') === 'page';
      });

      expect(hasActiveClass).toBeTruthy();
    });
  });

  test.describe('Sharing Route Navigation', () => {
    test('should navigate to Sharing view when Sharing icon clicked', async ({ page }) => {
      const sharingBtn = page.getByRole('button', { name: 'View Sharing' });
      await sharingBtn.click();

      // Check URL changed
      await expect(page).toHaveURL(/\/sharing$/);

      // Check heading visible
      const heading = page.getByRole('heading', { name: 'START COLLABORATING' });
      await expect(heading).toBeVisible();
    });

    test('Sharing view should match Figma Frame 34 design', async ({ page }) => {
      const sharingBtn = page.getByRole('button', { name: 'View Sharing' });
      await sharingBtn.click();

      // Check main heading
      const mainHeading = page.getByRole('heading', { name: 'START COLLABORATING' });
      await expect(mainHeading).toBeVisible();

      // Check description text
      const description = page.locator('text=Invite others to work together on your bibliography');
      await expect(description).toBeVisible();

      // Check email input (should be disabled)
      const emailInput = page.getByPlaceholder('colleague@example.com');
      await expect(emailInput).toBeDisabled();

      // Check Send Invite button (should be disabled)
      const sendBtn = page.getByRole('button', { name: 'Send Invite' });
      await expect(sendBtn).toBeDisabled();

      // Check "Coming in Phase 2" badge
      const badge = page.locator('text=Coming in Phase 2');
      await expect(badge).toBeVisible();
    });

    test('Sharing button should become active when on Sharing route', async ({ page }) => {
      const sharingBtn = page.getByRole('button', { name: 'View Sharing' });
      await sharingBtn.click();

      // Check if button is marked active
      const hasActiveClass = await sharingBtn.evaluate((el) => {
        return el.className.includes('bg-app-accent') || el.getAttribute('aria-current') === 'page';
      });

      expect(hasActiveClass).toBeTruthy();
    });
  });

  test.describe('Notes Tab Empty State - Figma Frame 31', () => {
    // Helper: create a reference for tests in this describe block
    async function createTestReference(page: import('@playwright/test').Page) {
      await page.getByRole('button', { name: /Manual Entry/i }).click();
      await expect(page.getByTestId('reference-title-input')).toBeVisible({ timeout: 5000 });
      await page.getByTestId('reference-title-input').fill('Figma Test Reference');
      await page.getByTestId('author-0-family-input').fill('FigmaAuthor');
      await page.getByTestId('reference-submit-button').click();
      await page.waitForLoadState('networkidle');
    }

    test('should show Notes tab in Details Pane', async ({ page }) => {
      await createTestReference(page);
      // Click on first reference to open Details Pane
      const firstRefRow = page.getByRole('row', { name: /Figma Test Reference/i });
      await firstRefRow.click();

      // Wait for Details Pane to open
      await expect(page.locator('[aria-label="Reference Details"]')).toBeVisible({ timeout: 5000 });

      // Check Notes tab exists
      const notesTab = page.getByRole('tab', { name: 'Notes' });
      await expect(notesTab).toBeVisible();
    });

    test('Notes tab should display empty state with proper design', async ({ page }) => {
      await createTestReference(page);
      // Click on first reference
      const firstRefRow = page.getByRole('row', { name: /Figma Test Reference/i });
      await firstRefRow.click();

      // Wait for Details Pane
      await expect(page.locator('[aria-label="Reference Details"]')).toBeVisible({ timeout: 5000 });

      // Click Notes tab
      const notesTab = page.getByRole('tab', { name: 'Notes' });
      await notesTab.click();

      // Check Notes heading
      const notesHeading = page.getByRole('heading', { name: 'NOTES', level: 3 });
      await expect(notesHeading).toBeVisible();

      // Check empty state message
      const emptyMsg = page.locator('text=No notes have been added');
      await expect(emptyMsg).toBeVisible();

      // Check for document icon (should be present in the snapshot)
      const tabPanel = page.locator('[role="tabpanel"]:has-text("No notes have been added")');
      const icon = tabPanel.locator('svg, img').first();
      await expect(icon).toBeVisible();
    });

    test('Notes tab should be one of three tabs (Info, PDF, Notes)', async ({ page }) => {
      await createTestReference(page);
      // Click on first reference
      const firstRefRow = page.getByRole('row', { name: /Figma Test Reference/i });
      await firstRefRow.click();

      // Wait for Details Pane to open
      await expect(page.locator('[aria-label="Reference Details"]')).toBeVisible({ timeout: 5000 });

      // Get all tabs
      const tabs = page.getByRole('tab');

      // Should have exactly 3 tabs
      const tabCount = await tabs.count();
      expect(tabCount).toBe(3);

      // Check tab names
      const tabNames = ['Info', 'PDF', 'Notes'];
      for (let i = 0; i < 3; i++) {
        const tabText = await tabs.nth(i).textContent();
        expect(tabNames).toContain(tabText?.trim());
      }
    });

    test('Info and PDF tabs should still work correctly', async ({ page }) => {
      await createTestReference(page);
      // Click on first reference
      const firstRefRow = page.getByRole('row', { name: /Figma Test Reference/i });
      await firstRefRow.click();

      // Check Info tab (should be active by default)
      const infoTab = page.getByRole('tab', { name: 'Info' });
      const isInfoActive = await infoTab.evaluate((el) => el.getAttribute('aria-selected') === 'true');
      expect(isInfoActive).toBeTruthy();

      // Click PDF tab
      const pdfTab = page.getByRole('tab', { name: 'PDF' });
      await pdfTab.click();

      // Check PDF tab is now active
      const isPdfActive = await pdfTab.evaluate((el) => el.getAttribute('aria-selected') === 'true');
      expect(isPdfActive).toBeTruthy();

      // Click back to Notes
      const notesTab = page.getByRole('tab', { name: 'Notes' });
      await notesTab.click();

      // Check Notes tab is now active
      const isNotesActive = await notesTab.evaluate((el) => el.getAttribute('aria-selected') === 'true');
      expect(isNotesActive).toBeTruthy();
    });
  });

  test.describe('Navigation Consistency', () => {
    test('should maintain navigation between all views', async ({ page }) => {
      const views = [
        { name: 'Library', url: '/library' },
        { name: 'Tags', url: '/tags' },
        { name: 'Sharing', url: '/sharing' },
      ];

      for (const view of views) {
        const btn = page.getByRole('button', { name: `View ${view.name}` });
        await btn.click();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(new RegExp(view.url + '$'));
      }
    });

    test('Duplicates button should remain disabled throughout navigation', async ({ page }) => {
      const duplicatesBtn = page.getByRole('button', { name: 'View Duplicates' });

      // Check on Library page
      await expect(duplicatesBtn).toBeDisabled();

      // Navigate to Tags
      const tagsBtn = page.getByRole('button', { name: 'View Tags' });
      await tagsBtn.click();
      await page.waitForLoadState('networkidle');

      // Check still disabled
      await expect(duplicatesBtn).toBeDisabled();

      // Navigate to Sharing
      const sharingBtn = page.getByRole('button', { name: 'View Sharing' });
      await sharingBtn.click();
      await page.waitForLoadState('networkidle');

      // Check still disabled
      await expect(duplicatesBtn).toBeDisabled();
    });
  });

  test.describe('Figma Frame Reference Checks', () => {
    test('Frame 33 - Library View should be complete', async ({ page }) => {
      // Should be on /library by default
      await expect(page).toHaveURL(/\/library$/);

      // Check main heading
      const heading = page.getByRole('heading', { name: 'Library', level: 1 });
      await expect(heading).toBeVisible();

      // Wait for content to load
      await page.waitForLoadState('networkidle');

      // Check either Reference Table exists OR empty state is shown
      // (depends on whether there are any references)
      const table = page.locator('[aria-label="Reference list"]');
      const emptyState = page.getByRole('heading', { name: 'No references yet', level: 3 });

      // Wait a moment for either state to render
      await page.waitForTimeout(500);

      // One of these should be visible
      const tableVisible = await table.isVisible();
      const emptyVisible = await emptyState.isVisible();
      expect(tableVisible || emptyVisible).toBeTruthy();

      // Check Activity Bar with all icons
      const buttons = page.getByRole('button', {
        name: /View (Library|Search|Projects|Duplicates|Tags|Sharing|Trash)/,
      });
      const btnCount = await buttons.count();
      expect(btnCount).toBeGreaterThanOrEqual(7);
    });

    test('Frame 31 - Notes Empty State should match design', async ({ page }) => {
      // Create a reference first
      await page.getByRole('button', { name: /Manual Entry/i }).click();
      await expect(page.getByTestId('reference-title-input')).toBeVisible({ timeout: 5000 });
      await page.getByTestId('reference-title-input').fill('Frame 31 Test');
      await page.getByTestId('author-0-family-input').fill('Frame31Author');
      await page.getByTestId('reference-submit-button').click();
      await page.waitForLoadState('networkidle');

      // Wait for toast to disappear before clicking
      await expect(page.getByRole('alert')).not.toBeVisible({ timeout: 6000 }).catch(() => {});

      // Open first reference
      const firstRefRow = page.getByRole('row', { name: /Frame 31 Test/i });
      await firstRefRow.click();

      // Wait for Details Pane to open
      await expect(page.locator('[aria-label="Reference Details"]')).toBeVisible({ timeout: 5000 });

      // Click Notes tab
      const notesTab = page.getByRole('tab', { name: 'Notes' });
      await notesTab.click();

      // Verify empty state elements
      const notesHeading = page.getByRole('heading', { name: 'NOTES', level: 3 });
      await expect(notesHeading).toBeVisible();

      const emptyMsg = page.locator('text=No notes have been added');
      await expect(emptyMsg).toBeVisible();
    });

    test('Frame 34 - Sharing Empty State should match design', async ({ page }) => {
      const sharingBtn = page.getByRole('button', { name: 'View Sharing' });
      await sharingBtn.click();

      // Main heading
      const mainHeading = page.getByRole('heading', { name: 'START COLLABORATING' });
      await expect(mainHeading).toBeVisible();

      // Description
      const description = page.locator('text=Invite others to work together');
      await expect(description).toBeVisible();

      // Disabled form elements
      const emailInput = page.getByPlaceholder('colleague@example.com');
      await expect(emailInput).toBeDisabled();

      const sendBtn = page.getByRole('button', { name: 'Send Invite' });
      await expect(sendBtn).toBeDisabled();

      // Phase 2 badge
      const badge = page.locator('text=Coming in Phase 2');
      await expect(badge).toBeVisible();
    });
  });
});
