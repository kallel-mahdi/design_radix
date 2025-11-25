/**
 * Reset Development Database Script
 *
 * Completely wipes the development MongoDB database and removes all uploaded PDF files.
 * Use this to start fresh during development or before testing sessions.
 *
 * Usage:
 *   pnpm reset:dev              - Dry run (shows what will be deleted)
 *   pnpm reset:dev:confirm      - Execute deletion (requires --confirm flag)
 *
 * Safety: Asks for confirmation before executing in development mode
 */

import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';

// MongoDB connection string (can be overridden with env var)
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/bibliography';
const PDF_UPLOAD_DIR = path.join(process.cwd(), 'bibliography_backend', 'data', 'bibliography', 'uploads');
const CONFIRM_FLAG = process.argv.includes('--confirm');

async function resetDatabase() {
  console.log('\n🔄 Bibliography Database Reset Script');
  console.log('=====================================\n');

  // Show safety warning
  if (!CONFIRM_FLAG) {
    console.log('⚠️  DRY RUN MODE - No changes will be made');
    console.log('   Run with --confirm to actually delete data\n');
  } else {
    console.log('🚨 CONFIRM MODE - ALL DATA WILL BE DELETED\n');
  }

  try {
    // Connect to MongoDB
    console.log(`📡 Connecting to MongoDB at ${MONGODB_URL}...`);
    await mongoose.connect(MONGODB_URL);
    console.log('✅ Connected to MongoDB\n');

    // Get database and list collections
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }

    const collections = await db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections:`);
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });

    if (collections.length > 0) {
      if (CONFIRM_FLAG) {
        console.log('\n🗑️  Deleting collections...');
        for (const collection of collections) {
          await db.dropCollection(collection.name);
          console.log(`   ✓ Deleted ${collection.name}`);
        }
        console.log('✅ All collections deleted\n');
      } else {
        console.log('\n[DRY RUN] Would delete all collections above\n');
      }
    }

    // Handle PDF cleanup
    try {
      console.log(`📁 Checking for PDF uploads in ${PDF_UPLOAD_DIR}...`);
      const files = await fs.readdir(PDF_UPLOAD_DIR);

      if (files.length > 0) {
        console.log(`📄 Found ${files.length} PDF file(s):`);
        for (const file of files) {
          console.log(`   - ${file}`);
        }

        if (CONFIRM_FLAG) {
          console.log('\n🗑️  Deleting PDF files...');
          for (const file of files) {
            const filePath = path.join(PDF_UPLOAD_DIR, file);
            await fs.unlink(filePath);
            console.log(`   ✓ Deleted ${file}`);
          }
          console.log('✅ All PDF files deleted\n');
        } else {
          console.log('\n[DRY RUN] Would delete all PDF files above\n');
        }
      } else {
        console.log('📭 No PDF files found\n');
      }
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        console.log('📭 PDF upload directory does not exist\n');
      } else {
        throw error;
      }
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');

    // Summary
    console.log('\n📋 SUMMARY');
    console.log('==========');
    if (CONFIRM_FLAG) {
      console.log(`✅ Reset complete! Database and PDF files have been deleted.`);
      console.log('   Ready for fresh testing session.\n');
    } else {
      console.log(
        `ℹ️  Dry run complete. Re-run with --confirm flag to execute:`,
        `   pnpm reset:dev:confirm\n`
      );
    }
  } catch (error) {
    console.error('❌ Error during reset:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

resetDatabase();
