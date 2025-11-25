/**
 * Global Teardown for Playwright E2E Tests
 *
 * This script runs ONCE after ALL tests have completed to clean up test data.
 * It removes all test references and tags from the database to prevent pollution between test runs.
 *
 * Worker-Scoped Cleanup:
 * - Each worker has its own user ID (test-user-0, test-user-1, etc.)
 * - This teardown loops through all workers and cleans up each one's data
 * - Ensures complete cleanup even if individual tests failed
 *
 * Note: Individual test files also have cleanup in beforeEach hooks.
 * This global teardown is a safety net to ensure no test data persists.
 */

import os from 'os';

async function globalTeardown() {
  const API_BASE_URL = 'http://localhost:8005';

  // Calculate worker count (matches playwright.config.ts logic)
  const workerCount = process.env['CI'] ? 1 : Math.max(1, os.cpus().length - 1);

  console.log('\n🧹 Running global teardown...');
  console.log(`   Cleaning up data for ${workerCount} worker(s)...`);

  let totalRefsDeleted = 0;
  let totalTagsDeleted = 0;

  try {
    // Clean up each worker's data
    for (let workerIndex = 0; workerIndex < workerCount; workerIndex++) {
      const userId = `test-user-${workerIndex}`;

      try {
        // Clean up references
        const refsResponse = await fetch(
          `${API_BASE_URL}/api/bibliography/references/test-cleanup`,
          {
            method: 'DELETE',
            headers: {
              'x-user-id': userId,
            },
          }
        );

        if (refsResponse.ok) {
          const result = await refsResponse.json();
          if (result.deletedCount > 0) {
            totalRefsDeleted += result.deletedCount;
          }
        }

        // Clean up tags
        const tagsResponse = await fetch(
          `${API_BASE_URL}/api/bibliography/tags/test-cleanup`,
          {
            method: 'DELETE',
            headers: {
              'x-user-id': userId,
            },
          }
        );

        if (tagsResponse.ok) {
          const result = await tagsResponse.json();
          if (result.deletedCount > 0) {
            totalTagsDeleted += result.deletedCount;
          }
        }
      } catch (error) {
        console.error(`❌ Error cleaning up ${userId}:`, error);
        // Continue with other workers
      }
    }

    console.log(`\n📊 Total cleanup: ${totalRefsDeleted} references, ${totalTagsDeleted} tags deleted across ${workerCount} worker(s)`);
  } catch (error) {
    console.error('❌ Error during global teardown:', error);
    // Don't throw - we don't want to fail the test run if cleanup fails
  }
}

export default globalTeardown;
