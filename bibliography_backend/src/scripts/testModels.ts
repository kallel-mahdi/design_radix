import mongoose from 'mongoose';
import { Reference } from '../models/Reference';
import { Collection } from '../models/Collection';
import { Tag } from '../models/Tag';
import { ProjectLink } from '../models/ProjectLink';
import { DuplicateCandidate } from '../models/DuplicateCandidate';
import { logger } from '../utils/logger';

const TEST_USER_ID = 'test-user-session2';

async function testModels() {
  try {
    logger.info('Starting model tests...');

    // Connect to MongoDB
    const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/bibliography';
    await mongoose.connect(mongoUrl);
    logger.info(`Connected to MongoDB: ${mongoUrl}`);

    // Test 1: Reference Model
    logger.info('Testing Reference model...');
    const testReference = await Reference.create({
      userId: TEST_USER_ID,
      type: 'article',
      title: 'Test Paper: Machine Learning Advances',
      authors: [
        { given: 'John', family: 'Doe', full: 'Doe, John' },
        { given: 'Jane', family: 'Smith', full: 'Smith, Jane' }
      ],
      year: 2024,
      venue: 'ICML',
      doi: '10.1234/test.123',
      isbn: '978-3-16-148410-0',
      citationKey: 'doe2024test',
      tags: ['machine-learning', 'deep-learning'],
      sourceRaw: {
        provider: 'manual',
        payload: {}
      },
      deleted: false,
      hasPdf: false
    });
    logger.info(`✅ Reference created: ${testReference._id}`);

    // Verify reference retrieval
    const foundReference = await Reference.findById(testReference._id);
    if (!foundReference) throw new Error('Reference not found after creation');
    logger.info(`✅ Reference retrieved successfully`);

    // Test 2: Collection Model
    logger.info('Testing Collection model...');
    const testCollection = await Collection.create({
      userId: TEST_USER_ID,
      name: 'Test Collection',
      parentId: null,
      position: 0,
      color: '#FF5733',
      deleted: false
    });
    logger.info(`✅ Collection created: ${testCollection._id}`);

    // Create nested collection
    const nestedCollection = await Collection.create({
      userId: TEST_USER_ID,
      name: 'Nested Collection',
      parentId: testCollection._id,
      position: 0,
      deleted: false
    });
    logger.info(`✅ Nested collection created: ${nestedCollection._id}`);

    // Test 3: Tag Model
    logger.info('Testing Tag model...');
    const testTag = await Tag.create({
      userId: TEST_USER_ID,
      name: 'machine-learning',
      color: '#04E39E',
      position: 1,
      automatic: false,
      usageCount: 1
    });
    logger.info(`✅ Tag created: ${testTag._id}`);

    // Test 4: ProjectLink Model
    logger.info('Testing ProjectLink model...');
    const testProjectLink = await ProjectLink.create({
      userId: TEST_USER_ID,
      projectId: new mongoose.Types.ObjectId(),
      collectionId: testCollection._id
    });
    logger.info(`✅ ProjectLink created: ${testProjectLink._id}`);

    // Test 5: DuplicateCandidate Model
    logger.info('Testing DuplicateCandidate model...');
    const testDuplicate = await DuplicateCandidate.create({
      userId: TEST_USER_ID,
      existingReferenceId: testReference._id,
      duplicateReferenceId: new mongoose.Types.ObjectId(),
      matchReason: 'doi',
      confidence: 1.0,
      resolved: false
    });
    logger.info(`✅ DuplicateCandidate created: ${testDuplicate._id}`);

    // Test Updates
    logger.info('Testing updates...');
    testReference.title = 'Updated Test Paper';
    await testReference.save();
    logger.info(`✅ Reference updated successfully`);

    testCollection.name = 'Updated Collection';
    await testCollection.save();
    logger.info(`✅ Collection updated successfully`);

    // Test Queries
    logger.info('Testing queries...');
    const references = await Reference.find({ userId: TEST_USER_ID, deleted: false });
    logger.info(`✅ Found ${references.length} references for user`);

    const collections = await Collection.find({ userId: TEST_USER_ID, parentId: null });
    logger.info(`✅ Found ${collections.length} root collections`);

    const tags = await Tag.find({ userId: TEST_USER_ID }).sort({ position: 1 });
    logger.info(`✅ Found ${tags.length} tags`);

    // Test Indexes
    logger.info('Checking indexes...');
    const referenceIndexes = await Reference.collection.getIndexes();
    logger.info(`✅ Reference has ${Object.keys(referenceIndexes).length} indexes`);
    logger.info(`   Indexes: ${Object.keys(referenceIndexes).join(', ')}`);

    // Cleanup
    logger.info('Cleaning up test data...');
    await Reference.deleteMany({ userId: TEST_USER_ID });
    await Collection.deleteMany({ userId: TEST_USER_ID });
    await Tag.deleteMany({ userId: TEST_USER_ID });
    await ProjectLink.deleteMany({ userId: TEST_USER_ID });
    await DuplicateCandidate.deleteMany({ userId: TEST_USER_ID });
    logger.info('✅ Test data cleaned up');

    logger.info('');
    logger.info('🎉 All model tests passed!');
    logger.info('');
    logger.info('Summary:');
    logger.info('  - Reference model: ✓');
    logger.info('  - Collection model: ✓');
    logger.info('  - Tag model: ✓');
    logger.info('  - ProjectLink model: ✓');
    logger.info('  - DuplicateCandidate model: ✓');
    logger.info('  - Indexes created: ✓');
    logger.info('  - CRUD operations: ✓');

  } catch (error) {
    logger.error('❌ Model test failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

testModels();
