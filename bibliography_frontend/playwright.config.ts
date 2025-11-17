import { defineConfig, devices } from '@playwright/test';
import os from 'os';

/**
 * Playwright Configuration for E2E Tests
 *
 * Worker-Scoped User ID Strategy:
 * - Each Playwright worker gets a unique user ID (test-user-0, test-user-1, etc.)
 * - This prevents race conditions when tests run in parallel
 * - Worker A cannot delete Worker B's data - complete isolation
 * - Tests must use the workerUserId fixture from e2e/fixtures/workerFixtures.ts
 *
 * Test Isolation Pattern:
 * 1. Import from fixtures: import { test, expect } from './fixtures/workerFixtures'
 * 2. Use workerUserId in beforeEach for cleanup and API routing
 * 3. Each worker cleans up only its own data before each test
 * 4. Global teardown cleans up all workers after tests complete
 *
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  /* Global teardown - cleanup test data after all tests */
  globalTeardown: './e2e/global-teardown.ts',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /*
   * Worker optimization: Leave 1 CPU for OS/browser overhead (Playwright best practice)
   * CI uses 1 worker for predictable results
   */
  workers: process.env.CI ? 1 : Math.max(1, os.cpus().length - 1),

  /* Reporter to use */
  reporter: 'html',

  /* Timeout for each test (60 seconds - allows for complex workflows) */
  timeout: 60 * 1000,

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'http://localhost:5173',

    /* Viewport size - Full HD */
    viewport: { width: 1920, height: 1080 },

    /* Action timeout - fail fast if element not found (10 seconds instead of 30) */
    actionTimeout: 10 * 1000,

    /* Navigation timeout (10 seconds) */
    navigationTimeout: 10 * 1000,

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    /* Uncomment to test on other browsers */
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Run your local dev servers before starting the tests */
  webServer: [
    {
      command: 'cd ../bibliography_backend && pnpm dev',
      url: 'http://localhost:8005/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: 'pnpm dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
