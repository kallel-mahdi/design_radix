#!/usr/bin/env node

/**
 * Download Test Fixtures from arXiv
 *
 * Downloads academic papers from arXiv.org for local testing.
 * These PDFs are NOT redistributed and are excluded from version control.
 *
 * Legal: arXiv papers are downloaded for local testing only under fair use.
 * Most arXiv papers use the default arXiv license which does not permit redistribution.
 *
 * Usage: node scripts/download-test-fixtures.cjs
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const FIXTURES_DIR = path.join(__dirname, '../e2e/fixtures/pdfs');

// Ensure fixtures directory exists
if (!fs.existsSync(FIXTURES_DIR)) {
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });
}

/**
 * arXiv papers selected for testing
 * - Small: ~500KB (2-4 pages)
 * - Medium: ~1-2MB (10-15 pages)
 * - Large: ~1-3MB (8-12 pages with figures)
 */
const TEST_PAPERS = [
  {
    id: '2302.12854',
    name: 'small-paper.pdf',
    description: 'The Micro-Paper (short format)',
    size: 'small (~500KB)'
  },
  {
    id: '1706.03762',
    name: 'medium-paper.pdf',
    description: 'Attention Is All You Need (landmark AI paper)',
    size: 'medium (~2MB)'
  },
  {
    id: '1301.3781',
    name: 'large-paper.pdf',
    description: 'Efficient Estimation of Word Representations (Word2Vec)',
    size: 'large (~1-2MB)'
  },
];

/**
 * Download a PDF from arXiv (handles redirects)
 */
function downloadPaper(paper) {
  return new Promise((resolve, reject) => {
    const url = `https://arxiv.org/pdf/${paper.id}.pdf`;
    const filePath = path.join(FIXTURES_DIR, paper.name);

    console.log(`📥 Downloading ${paper.description}`);
    console.log(`   arXiv ID: ${paper.id}`);
    console.log(`   Expected size: ${paper.size}`);

    const file = fs.createWriteStream(filePath);

    const handleResponse = (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        let redirectUrl = response.headers.location;

        // Handle relative redirects
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = `https://arxiv.org${redirectUrl}`;
        }

        console.log(`   Redirected to: ${redirectUrl}`);

        https.get(redirectUrl, handleResponse).on('error', (err) => {
          fs.unlink(filePath, () => {});
          reject(err);
        });
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${paper.id}: HTTP ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        const stats = fs.statSync(filePath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`   ✅ Downloaded ${paper.name} (${sizeMB} MB)`);
        resolve();
      });

      file.on('error', (err) => {
        fs.unlink(filePath, () => {}); // Delete partial file
        reject(err);
      });
    };

    https.get(url, handleResponse).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete partial file
      reject(err);
    });
  });
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Downloading arXiv test fixtures...\n');

  for (const paper of TEST_PAPERS) {
    try {
      await downloadPaper(paper);
    } catch (error) {
      console.error(`❌ Error downloading ${paper.id}:`, error.message);
      process.exit(1);
    }
  }

  console.log('\n✅ All test fixtures downloaded successfully!');
  console.log(`📁 Location: ${FIXTURES_DIR}\n`);

  // List all PDFs in directory
  const files = fs.readdirSync(FIXTURES_DIR).filter(f => f.endsWith('.pdf'));
  console.log('📄 Available test PDFs:');
  files.forEach(file => {
    const stats = fs.statSync(path.join(FIXTURES_DIR, file));
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`   - ${file} (${sizeKB} KB)`);
  });
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
