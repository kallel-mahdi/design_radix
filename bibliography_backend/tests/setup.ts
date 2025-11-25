jest.setTimeout(40_000);

// Mock pdfParseLoader to avoid ESM import.meta issues in Jest (CJS environment)
// This provides a CJS-compatible version of the module
jest.mock('../src/utils/pdfParseLoader', () => ({
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  pdfParse: require('pdf-parse/lib/pdf-parse')
}));

afterEach(() => {
  jest.clearAllMocks();
});
