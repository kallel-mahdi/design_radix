/**
 * Crossref API Mock for E2E Tests
 *
 * Mocks Crossref API responses to:
 * 1. Avoid rate limiting (429 errors) when running parallel tests
 * 2. Ensure consistent, fast responses
 * 3. Eliminate external API dependency
 *
 * Usage in test files:
 * ```typescript
 * import { setupCrossrefMock } from './fixtures/crossrefMock';
 *
 * test.beforeEach(async ({ page, workerUserId }) => {
 *   await setupCrossrefMock(page);
 *   // ... rest of beforeEach
 * });
 * ```
 */

import { Page } from '@playwright/test';

/**
 * Mock responses for known DOIs used in tests
 */
export const MOCK_CROSSREF_RESPONSES: Record<string, object> = {
  // Primary test DOI (Data Cascades paper)
  '10.1145/3411764.3445518': {
    status: 'ok',
    'message-type': 'work',
    'message-version': '1.0.0',
    message: {
      DOI: '10.1145/3411764.3445518',
      title: ['"Everyone wants to do the model work, not the data work": Data Cascades in High-Stakes AI'],
      author: [
        { given: 'Nithya', family: 'Sambasivan', sequence: 'first', affiliation: [] },
        { given: 'Shivani', family: 'Kapania', sequence: 'additional', affiliation: [] },
        { given: 'Hannah', family: 'Highfill', sequence: 'additional', affiliation: [] },
        { given: 'Diana', family: 'Akrong', sequence: 'additional', affiliation: [] },
        { given: 'Praveen', family: 'Paritosh', sequence: 'additional', affiliation: [] },
        { given: 'Lora M.', family: 'Aroyo', sequence: 'additional', affiliation: [] },
      ],
      published: {
        'date-parts': [[2021, 5, 6]],
      },
      type: 'proceedings-article',
      'container-title': ['CHI Conference on Human Factors in Computing Systems'],
      publisher: 'ACM',
      URL: 'http://dx.doi.org/10.1145/3411764.3445518',
      ISSN: [],
      ISBN: ['9781450380966'],
    },
  },

  // Second test DOI (Cultivating Care paper)
  '10.1145/3290605.3300507': {
    status: 'ok',
    'message-type': 'work',
    'message-version': '1.0.0',
    message: {
      DOI: '10.1145/3290605.3300507',
      title: ['Cultivating Care through Ambiguity: Lessons from a Mobile Health Intervention for Maternal Health'],
      author: [
        { given: 'Azra', family: 'Ismail', sequence: 'first', affiliation: [] },
        { given: 'Neha', family: 'Kumar', sequence: 'additional', affiliation: [] },
      ],
      published: {
        'date-parts': [[2019, 5, 2]],
      },
      type: 'proceedings-article',
      'container-title': ['CHI Conference on Human Factors in Computing Systems'],
      publisher: 'ACM',
      URL: 'http://dx.doi.org/10.1145/3290605.3300507',
      ISSN: [],
      ISBN: ['9781450359702'],
    },
  },

  // PLOS Neglected Tropical Diseases paper (used in PDF metadata tests)
  '10.1371/journal.pntd.0003350': {
    status: 'ok',
    'message-type': 'work',
    'message-version': '1.0.0',
    message: {
      DOI: '10.1371/journal.pntd.0003350',
      title: ['Shaping the Research Agenda'],
      author: [
        { given: 'Peter J.', family: 'Hotez', sequence: 'first', affiliation: [] },
      ],
      published: {
        'date-parts': [[2014, 11, 20]],
      },
      type: 'journal-article',
      'container-title': ['PLOS Neglected Tropical Diseases'],
      publisher: 'Public Library of Science (PLoS)',
      URL: 'http://dx.doi.org/10.1371/journal.pntd.0003350',
      ISSN: ['1935-2735'],
    },
  },
};

/**
 * Error response for non-existent DOIs
 */
const NOT_FOUND_RESPONSE = {
  status: 'error',
  'message-type': 'error',
  message: 'Resource not found.',
};

/**
 * Sets up Crossref API mock for the given page
 *
 * @param page - Playwright page object
 */
export async function setupCrossrefMock(page: Page): Promise<void> {
  await page.route('https://api.crossref.org/works/**', async (route) => {
    const url = route.request().url();
    const doiMatch = url.match(/works\/(.+?)(?:\?|$)/);
    const doi = doiMatch?.[1] ? decodeURIComponent(doiMatch[1]) : null;

    // Add small delay to simulate network latency (50-150ms)
    await new Promise((resolve) => setTimeout(resolve, 50 + Math.random() * 100));

    if (doi && MOCK_CROSSREF_RESPONSES[doi]) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CROSSREF_RESPONSES[doi]),
      });
    } else {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify(NOT_FOUND_RESPONSE),
      });
    }
  });
}

/**
 * Adds a custom DOI mock response (useful for specific test cases)
 *
 * @param doi - The DOI to mock
 * @param response - The mock response object
 */
export function addMockDoi(doi: string, response: object): void {
  MOCK_CROSSREF_RESPONSES[doi] = response;
}
