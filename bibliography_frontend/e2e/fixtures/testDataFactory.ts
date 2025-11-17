/**
 * Test Data Factory for E2E Tests
 *
 * Generates consistent, unique test data for E2E tests.
 * Each factory function creates data with unique identifiers to prevent
 * collisions when tests run in parallel.
 */

export interface TestReference {
  title: string;
  type: string;
  year: string;
  authors: Array<{
    given?: string;
    family: string;
  }>;
  venue?: string;
  doi?: string;
  url?: string;
  abstract?: string;
}

/**
 * Generate a unique test ID for this test run
 * Format: "test-{timestamp}-{random}"
 */
export const generateTestId = (): string => {
  return `test-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
};

/**
 * Create a test reference with unique identifiers
 *
 * @param overrides - Partial reference data to override defaults
 * @param testId - Optional test ID (auto-generated if not provided)
 * @returns Reference data object
 *
 * @example
 * const ref = createTestReference({ year: '2023' }, 'my-test-id');
 * // Returns: { title: "Test Article my-test-id", type: "article", year: "2023", ... }
 */
export const createTestReference = (
  overrides: Partial<TestReference> = {},
  testId?: string
): TestReference => {
  const id = testId || generateTestId();

  return {
    title: `Test Article ${id}`,
    type: 'article',
    year: '2024',
    authors: [
      {
        given: 'John',
        family: `TestAuthor${id}`,
      },
    ],
    venue: 'Test Journal',
    ...overrides,
  };
};

/**
 * Create multiple test references with unique identifiers
 *
 * @param count - Number of references to create
 * @param baseOverrides - Base overrides applied to all references
 * @param testId - Optional test ID (auto-generated if not provided)
 * @returns Array of reference data objects
 *
 * @example
 * const refs = createTestReferences(3, { type: 'book' }, 'batch-test');
 * // Returns 3 references with titles: "Test Article batch-test-0", "Test Article batch-test-1", ...
 */
export const createTestReferences = (
  count: number,
  baseOverrides: Partial<TestReference> = {},
  testId?: string
): TestReference[] => {
  const id = testId || generateTestId();

  return Array.from({ length: count }, (_, index) =>
    createTestReference(
      {
        ...baseOverrides,
        title: `Test Article ${id}-${index}`,
      },
      `${id}-${index}`
    )
  );
};

/**
 * Create a reference with multiple authors
 *
 * @param authorCount - Number of authors to create
 * @param overrides - Partial reference data to override defaults
 * @param testId - Optional test ID (auto-generated if not provided)
 * @returns Reference data object with multiple authors
 *
 * @example
 * const ref = createMultiAuthorReference(3);
 * // Returns reference with 3 authors: TestAuthor{id}-0, TestAuthor{id}-1, TestAuthor{id}-2
 */
export const createMultiAuthorReference = (
  authorCount: number,
  overrides: Partial<TestReference> = {},
  testId?: string
): TestReference => {
  const id = testId || generateTestId();

  const authors = Array.from({ length: authorCount }, (_, index) => ({
    given: `Author${index}`,
    family: `TestAuthor${id}-${index}`,
  }));

  return createTestReference(
    {
      ...overrides,
      authors,
    },
    id
  );
};

/**
 * Common test DOIs for import testing
 * These are real DOIs that should exist in Crossref
 */
export const TEST_DOIS = {
  VALID: '10.1038/nature12373', // Real Nature article
  INVALID_FORMAT: 'not-a-doi',
  NON_EXISTENT: '10.9999/fake.doi.12345',
} as const;

/**
 * Helper to create form data for reference creation
 * Matches the form field structure expected by the UI
 */
export const referenceToFormData = (ref: TestReference) => ({
  title: ref.title,
  type: ref.type,
  year: ref.year,
  authors: ref.authors,
  venue: ref.venue || '',
  doi: ref.doi || '',
  url: ref.url || '',
  abstract: ref.abstract || '',
});
