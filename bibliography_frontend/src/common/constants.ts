/**
 * Application Constants
 *
 * Centralized constants to avoid magic numbers throughout the codebase
 */

/**
 * API Configuration
 */
export const API_TIMEOUT_MS = 30000; // 30 seconds

/**
 * React Query Configuration
 */
export const QUERY_STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes
export const QUERY_GC_TIME_MS = 10 * 60 * 1000; // 10 minutes (garbage collection)
export const QUERY_RETRY_COUNT = 1; // Retry once on failure

/**
 * UI Interaction
 */
export const SEARCH_DEBOUNCE_MS = 300; // Debounce search input by 300ms
export const TOAST_DURATION_MS = 3000; // Toast notifications last 3 seconds
export const MAX_COLORED_TAGS = 9; // Maximum number of tags with custom colors

/**
 * Panel Layout
 */
export const DEFAULT_SIDEBAR_SIZE = 20; // Default sidebar width (%)
export const DEFAULT_MAIN_SIZE = 60; // Default main content width (%)
export const DEFAULT_DETAIL_SIZE = 20; // Default detail panel width (%)

/**
 * Text Formatting
 */
export const MAX_TITLE_LENGTH = 100; // Truncate titles after 100 characters
export const MAX_ABSTRACT_LENGTH = 300; // Truncate abstracts after 300 characters
export const MAX_AUTHORS_DISPLAY = 3; // Show "et al." after 3 authors

/**
 * Pagination
 */
export const DEFAULT_PAGE_SIZE = 50; // Default number of items per page
export const MAX_PAGE_SIZE = 100; // Maximum items per page
