# PDF Test Fixtures

This directory contains PDF files used for E2E and integration testing. These files are NOT redistributed with the application and are for local testing only.

## Files

### Hand-Crafted Test PDFs (Committed to Git)

**minimal.pdf** (~291 bytes)
- **Purpose**: Smallest valid PDF for fast smoke tests
- **Source**: Based on Stack Overflow minimal PDF example
- **License**: CC BY-SA (Stack Overflow content)
- **URL**: https://stackoverflow.com/questions/17279712/
- **Use case**: Fast upload validation, basic file handling

**small-test.pdf** (~630 bytes)
- **Purpose**: Small PDF with visible text content
- **Source**: Generated using scripts/generate-minimal-pdfs.cjs
- **License**: Public domain
- **Use case**: Tests requiring visible PDF content

### Session 10.5: PDF Metadata Extraction Fixtures (Committed to Git)

**with-doi-zotero.pdf** (~9.4KB)
- **Purpose**: Test DOI extraction from PDF with embedded DOI
- **DOI**: 10.1371/journal.pntd.0003350
- **Source**: Copied from Zotero test fixtures
- **License**: CC BY (PLOS Open Access)
- **Use case**: Testing Crossref enrichment workflow

**smith-2023-machine-learning.pdf** (~22KB)
- **Purpose**: Test filename fallback when no DOI found
- **Source**: Minimal empty PDF with descriptive filename
- **License**: MIT
- **Use case**: Testing filename-to-title extraction

**minimal-empty.pdf** (~78KB)
- **Purpose**: Edge case testing (valid but empty PDF)
- **Source**: Generated programmatically
- **License**: MIT
- **Use case**: PDF attachment verification, delete workflows

**corrupt.pdf** (~500 bytes)
- **Purpose**: Test error handling for corrupt/invalid PDFs
- **Source**: Intentionally corrupted PDF header
- **License**: MIT
- **Use case**: Error handling tests (INVALID_PDF error code)

### arXiv Papers (Downloaded, NOT Committed)

These papers are downloaded from arXiv.org for local testing only. They are excluded from version control and must be downloaded using the provided script.

**small-paper.pdf** (~500KB)
- **arXiv ID**: 2302.12854
- **Title**: "The Micro-Paper"
- **Authors**: [Check arXiv]
- **URL**: https://arxiv.org/abs/2302.12854
- **License**: arXiv.org perpetual non-exclusive license
- **Use case**: Small file upload tests, realistic academic paper format

**medium-paper.pdf** (~2MB)
- **arXiv ID**: 1706.03762
- **Title**: "Attention Is All You Need"
- **Authors**: Vaswani, A., et al.
- **URL**: https://arxiv.org/abs/1706.03762
- **License**: arXiv.org perpetual non-exclusive license
- **Use case**: Standard workflow testing, realistic file size, landmark paper

**large-paper.pdf** (~1-2MB)
- **arXiv ID**: 1301.3781
- **Title**: "Efficient Estimation of Word Representations in Vector Space"
- **Authors**: Mikolov, T., et al.
- **URL**: https://arxiv.org/abs/1301.3781
- **License**: arXiv.org perpetual non-exclusive license
- **Use case**: Performance testing, edge cases with larger files

## Setup

### First Time Setup

Run the download script to fetch arXiv papers:

```bash
npm run test:download-fixtures
```

Or manually:

```bash
node scripts/download-test-fixtures.cjs
```

### Regenerate Hand-Crafted PDFs

If you need to regenerate the minimal PDFs:

```bash
node scripts/generate-minimal-pdfs.cjs
```

## Legal Notice

### arXiv Papers

The PDF files downloaded from arXiv.org are for **local testing purposes only** and are NOT redistributed with this application.

**Legal basis:**
- Fair use for testing and development
- arXiv papers are used in their original form without modification
- Papers are referenced with proper attribution
- No commercial use or redistribution

**arXiv license:**
Most papers on arXiv use the default arXiv non-exclusive license, which:
- Grants arXiv perpetual rights to distribute the work
- Does NOT grant arXiv (or third parties) redistribution rights
- Copyright remains with the original authors

**Important:**
- These PDFs are gitignored and NOT included in version control
- Each developer must download them independently
- Do NOT commit arXiv papers to the repository
- Do NOT redistribute these papers

### Hand-Crafted PDFs

The hand-crafted test PDFs (minimal.pdf, small-test.pdf) are either:
- Based on public examples with permissive licenses (CC BY-SA)
- Generated programmatically (public domain)

These small test PDFs ARE committed to version control as they are minimal test fixtures, not copyrighted works.

## Attribution

### Stack Overflow Minimal PDF

The `minimal.pdf` is based on a minimal PDF example from Stack Overflow:
- **Question**: "What is the smallest possible valid PDF?"
- **URL**: https://stackoverflow.com/questions/17279712/
- **License**: CC BY-SA 4.0 (Stack Overflow user contributions)
- **Modified**: No (used as-is)

### arXiv Papers

All arXiv papers are properly attributed above with:
- arXiv identifier (e.g., 1706.03762)
- Direct URL to arXiv abstract page
- Original title and authors
- Acknowledgment of arXiv license terms

## Usage in Tests

Import fixture paths from the centralized helper:

```typescript
import { FIXTURE_PATHS } from './fixtures/paths';

test('upload PDF file', async ({ page }) => {
  // Use type-safe fixture paths
  await fileInput.setInputFiles(FIXTURE_PATHS.pdfs.small);
});
```

Available paths:
- `FIXTURE_PATHS.pdfs.minimal` - Minimal test PDF (< 1KB)
- `FIXTURE_PATHS.pdfs.smallTest` - Small PDF with text (< 1KB)
- `FIXTURE_PATHS.pdfs.small` - Small arXiv paper (~500KB)
- `FIXTURE_PATHS.pdfs.medium` - Medium arXiv paper (~2MB)
- `FIXTURE_PATHS.pdfs.large` - Large arXiv paper (~1-2MB)

**Session 10.5 paths:**
- `FIXTURE_PATHS.pdfs.withDoiZotero` - PDF with embedded DOI for Crossref enrichment
- `FIXTURE_PATHS.pdfs.noDoiDescriptive` - PDF with descriptive filename (no DOI)
- `FIXTURE_PATHS.pdfs.minimalEmpty` - Empty PDF for edge case testing
- `FIXTURE_PATHS.pdfs.corrupt` - Corrupt PDF for error handling tests

## Troubleshooting

### Missing arXiv PDFs

If tests fail with "file not found" errors:

```bash
npm run test:download-fixtures
```

### Download Failures

If downloads fail:
1. Check internet connection
2. Verify arXiv is accessible (https://arxiv.org)
3. Check if arXiv IDs are still valid
4. Retry after a few minutes (rate limiting)

### File Size Discrepancies

arXiv may occasionally update PDF files, changing sizes slightly. This is normal and doesn't affect test validity.

## Future Additions

When adding new test PDFs:

1. **For small test fixtures**: Commit to Git, document source and license
2. **For arXiv papers**: Add to download script, update README with attribution
3. **For other sources**: Ensure proper licensing, add attribution

## References

- arXiv Terms of Use: https://info.arxiv.org/help/license/index.html
- arXiv API: https://info.arxiv.org/help/api/index.html
- Stack Overflow Licensing: https://stackoverflow.com/help/licensing
