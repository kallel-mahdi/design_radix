/**
 * PDF Parse Loader
 *
 * Loads pdf-parse module in a way that works in both ESM and CJS environments.
 * This wrapper exists because:
 * 1. ESM (tsx runtime): Needs createRequire(import.meta.url)
 * 2. CJS (Jest tests): import.meta causes compile error
 *
 * Jest mocks this module in tests/setup.ts to provide a CJS-compatible version.
 */
import { createRequire } from 'module';

// import.meta.url is valid in ES2020+ modules (Jest mocks this file in tests)
const esmRequire = createRequire(import.meta.url);

// Import from lib/pdf-parse to avoid debug wrapper that loads test files
// See: https://github.com/nicktrygg/pdf-parse/issues
export const pdfParse = esmRequire('pdf-parse/lib/pdf-parse');
