#!/usr/bin/env node

/**
 * Generate Minimal Test PDFs
 *
 * Creates two tiny test PDFs for E2E testing:
 * 1. minimal.pdf - Smallest valid PDF (291 bytes)
 * 2. small-test.pdf - Small PDF with visible text (630 bytes)
 *
 * Sources:
 * - minimal.pdf based on Stack Overflow minimal PDF example (CC BY-SA)
 * - small-test.pdf based on research of minimal valid PDFs
 */

const fs = require('fs');
const path = require('path');

const FIXTURES_DIR = path.join(__dirname, '../e2e/fixtures/pdfs');

// Ensure fixtures directory exists
if (!fs.existsSync(FIXTURES_DIR)) {
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });
}

// Minimal PDF (291 bytes) - smallest valid PDF
// Source: https://stackoverflow.com/questions/17279712/
const minimalPdf = `%PDF-1.0
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 3 3]/Parent 2 0 R>>endobj
xref
0 4
0000000000 65535 f
0000000009 00000 n
0000000052 00000 n
0000000101 00000 n
trailer<</Size 4/Root 1 0 R>>
startxref
149
%EOF`;

// Small test PDF with visible text (630 bytes)
// More realistic than minimal.pdf, includes actual visible content
const smallTestPdf = `%PDF-1.1
%¥±ë

1 0 obj
  << /Type /Catalog
     /Pages 2 0 R
  >>
endobj

2 0 obj
  << /Type /Pages
     /Kids [3 0 R]
     /Count 1
     /MediaBox [0 0 300 144]
  >>
endobj

3 0 obj
  <<  /Type /Page
      /Parent 2 0 R
      /Resources
       << /Font
           << /F1
               << /Type /Font
                  /Subtype /Type1
                  /BaseFont /Times-Roman
               >>
           >>
       >>
      /Contents 4 0 R
  >>
endobj

4 0 obj
  << /Length 55 >>
stream
  BT
    /F1 18 Tf
    0 0 Td
    (Test PDF Document) Tj
  ET
endstream
endobj

xref
0 5
0000000000 65535 f
0000000018 00000 n
0000000077 00000 n
0000000178 00000 n
0000000457 00000 n
trailer
  <<  /Root 1 0 R
      /Size 5
  >>
startxref
565
%%EOF`;

// Write files
const minimalPath = path.join(FIXTURES_DIR, 'minimal.pdf');
const smallTestPath = path.join(FIXTURES_DIR, 'small-test.pdf');

fs.writeFileSync(minimalPath, minimalPdf);
fs.writeFileSync(smallTestPath, smallTestPdf);

console.log('✅ Generated minimal test PDFs:');
console.log(`   - minimal.pdf (${fs.statSync(minimalPath).size} bytes)`);
console.log(`   - small-test.pdf (${fs.statSync(smallTestPath).size} bytes)`);
console.log(`   Location: ${FIXTURES_DIR}`);
