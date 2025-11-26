/**
 * Worker-Scoped Fixtures for E2E Tests
 *
 * This file provides custom Playwright fixtures that ensure test isolation
 * when running tests in parallel with multiple workers.
 *
 * Key Concept:
 * - Each Playwright worker gets a unique user ID (test-user-0, test-user-1, etc.)
 * - Workers cannot interfere with each other's data
 * - Tests within the same worker share the user ID but cleanup between tests
 *
 * Why This Matters:
 * - Prevents race conditions: Worker A's cleanup can't delete Worker B's data
 * - Enables parallel execution: All workers can run simultaneously
 * - Bulletproof isolation: Physical separation at database level
 *
 * Official Playwright Pattern:
 * https://playwright.dev/docs/test-fixtures#worker-scoped-fixtures
 */

import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

type WorkerFixtures = {
  /**
   * Unique user ID for this worker, scoped to the worker lifecycle.
   * Format: test-user-{workerIndex}
   *
   * Example:
   * - Worker 0 gets: test-user-0
   * - Worker 1 gets: test-user-1
   * - Worker 30 gets: test-user-30
   */
  workerUserId: string;
};

type TestFixtures = {
  /**
   * Sets up the library page with routing, cleanup, and a collection.
   * Call this in beforeEach to get a ready-to-use library page.
   */
  setupLibrary: () => Promise<void>;

  /**
   * Waits for any visible toast notifications to disappear.
   * Use this before clicking on elements that might be blocked by toasts.
   *
   * Root cause: Toast notifications have pointer-events-auto, blocking clicks
   * in the top-right area of the screen (where Details Pane tabs are).
   */
  waitForToasts: () => Promise<void>;
};

/**
 * Helper to set up API routing with worker-scoped user ID.
 */
async function setupRouting(page: Page, workerUserId: string): Promise<void> {
  await page.route('http://localhost:8005/api/bibliography/**', async (route) => {
    const headers = {
      ...route.request().headers(),
      'x-user-id': workerUserId,
    };
    await route.continue({ headers });
  });
}

/**
 * Helper to cleanup test data for a worker.
 */
async function cleanupTestData(page: Page, workerUserId: string): Promise<void> {
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
}

/**
 * Helper to create a collection and select it (required before creating references).
 */
async function createAndSelectCollection(page: Page, name: string = 'Test Collection'): Promise<void> {
  await page.getByRole('button', { name: 'New Collection' }).click();
  await expect(page.getByPlaceholder('Collection name')).toBeVisible();
  await page.getByPlaceholder('Collection name').fill(name);
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByPlaceholder('Collection name')).not.toBeVisible();
  await page.waitForLoadState('networkidle');
  // Select the collection (use first() in case of duplicates from parallel tests)
  await page.getByRole('button', { name: new RegExp(name) }).first().click();
}

/**
 * Custom test object with worker-scoped fixtures.
 *
 * Usage in test files:
 * ```ts
 * import { test, expect } from './fixtures/workerFixtures';
 *
 * test.beforeEach(async ({ page, workerUserId }) => {
 *   // Use workerUserId for cleanup and routing
 *   await page.request.delete(
 *     'http://localhost:8005/api/bibliography/references/test-cleanup',
 *     { headers: { 'x-user-id': workerUserId } }
 *   );
 *
 *   await page.route('http://localhost:8005/api/bibliography/**', async (route) => {
 *     const headers = {
 *       ...route.request().headers(),
 *       'x-user-id': workerUserId,
 *     };
 *     await route.continue({ headers });
 *   });
 * });
 * ```
 */
export const test = base.extend<TestFixtures, WorkerFixtures>({
  /**
   * Worker-scoped fixture: runs ONCE per worker, shared across all tests in that worker.
   *
   * The `scope: 'worker'` option means:
   * - Setup runs once when worker starts
   * - All tests in the worker share the same workerUserId
   * - Cleanup runs once when worker finishes
   */
  workerUserId: [
    async ({}, use, workerInfo) => {
      const userId = `test-user-${workerInfo.workerIndex}`;
      console.log(`[Worker ${workerInfo.workerIndex}] Using user ID: ${userId}`);

      // Provide the userId to all tests in this worker
      await use(userId);

      // No cleanup here - handled by global teardown
    },
    { scope: 'worker' },
  ],

  /**
   * Test-scoped fixture: sets up the library page with everything needed.
   * Handles: routing, cleanup, navigation, collection creation.
   *
   * Usage:
   * ```ts
   * test.beforeEach(async ({ setupLibrary }) => {
   *   await setupLibrary();
   * });
   * ```
   */
  setupLibrary: async ({ page, workerUserId }, use) => {
    const setup = async () => {
      // 1. Set up API routing with worker user ID
      await setupRouting(page, workerUserId);

      // 2. Navigate to library
      await page.goto('http://localhost:5173/library');
      await page.waitForLoadState('networkidle');

      // 3. Cleanup any existing test data
      await cleanupTestData(page, workerUserId);

      // 4. Reload to show clean state
      await page.reload();
      await page.waitForLoadState('networkidle');

      // 5. Create and select a collection (required before creating references)
      await createAndSelectCollection(page);

      // 6. Verify page loaded
      await expect(page.getByText('Library')).toBeVisible();
    };

    await use(setup);
  },

  /**
   * Test-scoped fixture: waits for toast notifications to disappear.
   *
   * Why this exists:
   * - Toast container has pointer-events-none but individual toasts have pointer-events-auto
   * - Toasts positioned at top-right (top-4 right-4) overlap with Details Pane tabs
   * - Toasts last 5 seconds (TOAST_DURATION_MS) which is longer than test actions
   * - During parallel execution, CPU load can slow animations, making toasts persist longer
   *
   * Usage:
   * ```ts
   * await page.getByRole('button', { name: 'Create' }).click();
   * await waitForToasts(); // Wait before clicking elements that might be blocked
   * await page.getByRole('tab', { name: 'PDF' }).click();
   * ```
   */
  waitForToasts: async ({ page }, use) => {
    const wait = async () => {
      // Wait for any toast (role="alert") to disappear
      // Use a generous timeout since toasts last 5 seconds + animation time
      try {
        await expect(page.getByRole('alert')).not.toBeVisible({ timeout: 6000 });
      } catch {
        // If no toasts were ever visible, that's fine
      }
    };

    await use(wait);
  },
});

/**
 * Re-export expect to allow single import in test files:
 * import { test, expect } from './fixtures/workerFixtures';
 */
export { expect };
