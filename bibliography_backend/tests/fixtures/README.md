# Test Fixtures for PDF Metadata Extraction (Session 10.5)

## Overview

These test fixtures are **real PDFs** used for testing PDF metadata extraction, DOI parsing, and reference creation workflows. This approach mirrors Zotero's testing strategy (see `/home/mahdi/Desktop/zotero/test/tests/data/`).

**Total Size**: ~1.3MB (acceptable for test suite)

---

## PDF Fixtures

### 1. with-doi-zotero.pdf (9.4KB)
- **Source**: Copied from Zotero test fixtures (`recognizePDF_test_DOI.pdf`)
- **DOI**: `10.1371/journal.pntd.0003350`
- **Paper**: "Shaping the Research Agenda" (PLOS Neglected Tropical Diseases)
- **Purpose**: Primary DOI extraction test (smallest file)
- **License**: Open Access (PLOS)

### 2. with-doi-acm.pdf (665KB)
- **Source**: Downloaded from [Google Research](https://storage.googleapis.com/gweb-research2023-media/pubtools/pdf/0d556e45afc54afeb2eb6b51a9bc1827b9961ff4.pdf)
- **DOI**: `10.1145/3411764.3445518`
- **Paper**: "Everyone wants to do the model work, not the data work": Data Cascades in High-Stakes AI (CHI 2021)
- **Authors**: Nithya Sambasivan, Shivani Kapania, Hannah Highfill, et al.
- **Purpose**: Test Crossref enrichment with real CHI paper
- **License**: CC BY-NC-SA 4.0

### 3. with-doi-plos.pdf (395KB)
- **Source**: Downloaded from [PLOS ONE](https://journals.plos.org/plosone/article/file?id=10.1371/journal.pone.0240505&type=printable)
- **DOI**: `10.1371/journal.pone.0240505`
- **Paper**: "Introducing the PLOS ONE Collection on the neuroscience of reward and decision making"
- **Authors**: Stephanie M. Groman, Satoshi Ikemoto, Matthew Rushworth, et al.
- **Purpose**: Alternative DOI extraction test
- **License**: CC BY 4.0 (PLOS Open Access)

### 4. with-arxiv-id.pdf (90KB)
- **Source**: Copied from Zotero test fixtures (`recognizePDF_test_arXiv.pdf`)
- **Purpose**: Test arXiv ID extraction (future feature)
- **License**: arXiv papers are freely available

### 5. smith-2023-machine-learning.pdf (22KB)
- **Source**: Copy of test.pdf with descriptive filename
- **DOI**: None
- **Purpose**: Test filename fallback extraction
- **Expected Title**: "smith 2023 machine learning" (extracted from filename)

### 6. test.pdf (22KB)
- **Source**: Copied from Zotero test fixtures (`test.pdf`)
- **Purpose**: Generic test fixture for basic operations

### 7. minimal-empty.pdf (78KB)
- **Source**: Copied from Zotero test fixtures (`empty.pdf`)
- **Purpose**: Edge case testing (empty/minimal content)

### 8. corrupt.pdf (500 bytes)
- **Source**: Truncated valid PDF
- **Purpose**: Error handling test (invalid PDF structure)

---

## Usage in Tests

```typescript
import { FIXTURE_PATHS } from '../fixtures/paths';

// DOI extraction test
const response = await request(app)
  .post('/api/bibliography/references/from-pdf')
  .attach('file', FIXTURE_PATHS.withDoiZotero)
  .expect(201);

expect(response.body.extractedMetadata.doi).toBe('10.1371/journal.pntd.0003350');
```

---

## Why Real PDFs?

After researching Zotero's approach and hitting compatibility issues with synthetic PDF generation (pdf-lib ↔ pdf-parse incompatibility), we adopted Zotero's proven strategy:

✅ **Use real academic PDFs** (not synthetic)
✅ **Commit small PDFs to Git** (<100KB preferred, <700KB acceptable)
✅ **Don't mock PDF parsing** (use real pdf-parse extraction)
✅ **Mock only external APIs** (Crossref, arXiv)

**See**: `docs/sessions/10.5-testing-strategy.md` for full rationale

---

## Adding New Fixtures

1. **Find open-access PDF** with known DOI/metadata
2. **Check file size** (<100KB preferred, <500KB acceptable)
3. **Copy to this directory** with descriptive name
4. **Test with pdf-parse**: Verify it parses correctly
5. **Update this README** with source, DOI, license
6. **Add to paths.ts** for easy import

---

## License Notes

All PDFs in this directory are either:
- **Open Access** with permissive licenses (CC BY, CC BY-NC-SA)
- **Test fixtures** from Zotero (MIT licensed project)
- **Public domain** or fair use for testing purposes

If adding new fixtures, verify they're legally redistributable.

---

**Last Updated**: 2025-11-24
**Session**: 10.5 (PDF Metadata Extraction Testing)
