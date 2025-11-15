/**
 * DOI Validation Utilities
 *
 * Uses Crossref-recommended regex (matches 99.3% of Crossref DOIs)
 * See: docs/sessions/06-plan.md for validation rationale
 */

/**
 * DOI_REGEX: Crossref-recommended pattern
 * Pattern: 10.{4-9 digits}/{suffix with allowed chars}
 * Matches 99.3% of Crossref DOIs (74.4M of 74.9M)
 */
export const DOI_REGEX = /^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;

/**
 * Validate DOI format
 * @param doi - DOI string to validate
 * @returns true if valid DOI format
 */
export function isValidDoi(doi: string): boolean {
  return DOI_REGEX.test(doi.trim());
}

/**
 * Normalize DOI (trim whitespace, lowercase)
 * @param doi - DOI string to normalize
 * @returns normalized DOI
 */
export function normalizeDoi(doi: string): string {
  return doi.trim().toLowerCase();
}

/**
 * Extract DOI from URL or text
 * @param text - Text containing potential DOI
 * @returns extracted DOI or null
 */
export function extractDoi(text: string): string | null {
  // Use global flag to search entire string
  const globalRegex = /10\.\d{4,9}\/[-._;()/:A-Z0-9]+/gi;
  const match = text.match(globalRegex);
  return match ? match[0] : null;
}
