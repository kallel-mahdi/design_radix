# Database Design & Schema Documentation

## Overview

**Database**: MongoDB `bibliography`
**Collections**: 5 (Reference, Collection, Tag, ProjectLink, DuplicateCandidate)
**ODM**: Mongoose 8.x
**Connection String**: `mongodb://localhost:27017/bibliography`

**Design Philosophy**:
- Denormalized for read performance (embed when possible)
- User-scoped documents (all queries include `userId`)
- Soft delete pattern (deleted flag + deletedAt timestamp)
- Compound indexes for common query patterns
- Text indexes for full-text search

---

## Schema Overview

| Collection | Purpose | Key Fields | Indexes | Estimated Size (1K refs) |
|------------|---------|------------|---------|-------------------------|
| Reference | Bibliography entries | type, title, authors, citationKey | 8 indexes | ~50MB |
| Collection | Folders for organizing references | name, parentId, color | 2 indexes | ~1MB |
| Tag | Tags with colors/positions | name, color, position, usageCount | 2 indexes | <1MB |
| ProjectLink | Many-to-many ref↔project links | referenceId, projectId | 3 indexes | <1MB |
| DuplicateCandidate | Potential duplicate pairs | reference1Id, reference2Id, confidence | 2 indexes | ~2MB |

**Total Estimated Size**: ~55MB for 1,000 references per user

---

## 1. Reference Schema

### Fields

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `_id` | ObjectId | ✅ | Primary | Auto | MongoDB primary key |
| `userId` | String | ✅ | ✅ (compound) | - | Owner user ID (from auth service) |
| `type` | Enum | ✅ | ❌ | - | Reference type: 'article', 'book', 'chapter', 'conference', 'thesis', 'other' |
| `title` | String | ✅ | Text search | - | Reference title (max 1000 chars) |
| `authors` | Array | ❌ | ❌ | [] | Array of author objects: `{given?: string, family?: string, full: string}` |
| `year` | Number | ❌ | ❌ | - | Publication year (1000-2100) |
| `venue` | String | ❌ | ❌ | - | Journal or conference name |
| `doi` | String | ❌ | ✅ Unique | - | DOI identifier (format: `10.xxxx/...`) |
| `isbn` | String | ❌ | ✅ | - | ISBN (for books, used in duplicate detection) |
| `url` | String | ❌ | ❌ | - | External URL |
| `abstract` | String | ❌ | Text search | - | Abstract text (max 5000 chars) |
| `citationKey` | String | ✅ | ✅ Unique | Generated | Unique citation key (e.g., `smith2024machineabc`) |
| `tags` | Array[String] | ❌ | ✅ (compound) | [] | Tag names (array of strings, not ObjectIds) |
| `collectionIds` | Array[ObjectId] | ❌ | ✅ (compound) | [] | Collections containing this reference |
| `hasPdf` | Boolean | ❌ | ❌ | false | Whether PDF is attached |
| `pdf` | Object | ❌ | ❌ | - | PDF metadata: `{storedPath, originalName, size, mimeType, uploadedAt}` |
| `sourceRaw` | Object | ✅ | ❌ | - | Source provenance: `{provider: 'crossref'|'manual'|'bibtex'|'ris', payload: any}` |
| `deleted` | Boolean | ❌ | ✅ (compound) | false | Soft delete flag |
| `deletedAt` | Date | ❌ | ❌ | null | Timestamp when soft deleted |
| `createdAt` | Date | ✅ | ❌ | Auto | Mongoose timestamp |
| `updatedAt` | Date | ✅ | ❌ | Auto | Mongoose timestamp |

### Mongoose Schema Definition

```typescript
const referenceSchema = new Schema({
  userId: { type: String, required: true, index: true },
  type: {
    type: String,
    required: true,
    enum: ['article', 'book', 'chapter', 'conference', 'thesis', 'other']
  },
  title: { type: String, required: true, maxlength: 1000 },
  authors: [{
    given: { type: String, default: '' },
    family: { type: String, default: '' },
    full: { type: String, required: true }
  }],
  year: { type: Number, min: 1000, max: 2100 },
  venue: { type: String, maxlength: 500 },
  doi: { type: String, index: true },
  isbn: { type: String, index: true },
  url: { type: String, maxlength: 2000 },
  abstract: { type: String, maxlength: 5000 },
  citationKey: { type: String, required: true, unique: true },
  tags: [{ type: String }],
  collectionIds: [{ type: Schema.Types.ObjectId, ref: 'Collection' }],
  hasPdf: { type: Boolean, default: false },
  pdf: {
    storedPath: { type: String },
    originalName: { type: String },
    size: { type: Number },
    mimeType: { type: String },
    uploadedAt: { type: Date }
  },
  sourceRaw: {
    provider: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, required: true }
  },
  deleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});
```

### Indexes

**Purpose**: Optimize query performance for common access patterns

| Index Name | Type | Fields | Cardinality | Purpose | Query Pattern |
|------------|------|--------|-------------|---------|---------------|
| `_id_` | Single | `_id: 1` | 1:1 | MongoDB default | `findById()` |
| `userId_deleted` | Compound | `{userId: 1, deleted: 1}` | High | List active/trash references | `find({userId, deleted: false})` |
| `userId_collectionIds` | Compound | `{userId: 1, collectionIds: 1}` | High | Filter by collection | `find({userId, collectionIds: id})` |
| `userId_tags` | Compound | `{userId: 1, tags: 1}` | High | Filter by tags | `find({userId, tags: {$in: [...]}})` |
| `doi_1` | Single | `doi: 1` | Medium | Duplicate detection | `findOne({doi})` |
| `isbn_1` | Single | `isbn: 1` | Low | Duplicate detection (books) | `findOne({isbn})` |
| `citationKey_1` | Single | `citationKey: 1` (unique) | 1:1 | Citation key uniqueness | `findOne({citationKey})` |
| `title_abstract_text` | Text | `{title: 'text', abstract: 'text'}` | N/A | Full-text search | `find({$text: {$search: '...'}})` |

**Index Creation** (Mongoose automatic):
```typescript
referenceSchema.index({ userId: 1, deleted: 1 });
referenceSchema.index({ userId: 1, collectionIds: 1 });
referenceSchema.index({ userId: 1, tags: 1 });
referenceSchema.index({ doi: 1 });
referenceSchema.index({ isbn: 1 });
referenceSchema.index({ citationKey: 1 }, { unique: true });
referenceSchema.index({ title: 'text', abstract: 'text' });
```

### Index Coverage Analysis

**Query 1: List Active References**
```javascript
db.references.find({ userId: 'user-123', deleted: false })
```
- **Covered by**: `userId_deleted` compound index
- **IXSCAN** (index scan, not COLLSCAN)
- **Performance**: <50ms for 10,000 refs

**Query 2: Filter by Collection**
```javascript
db.references.find({ userId: 'user-123', collectionIds: 'collection-id' })
```
- **Covered by**: `userId_collectionIds` compound index
- **Performance**: <50ms for 10,000 refs

**Query 3: Filter by Tags (AND logic)**
```javascript
db.references.find({ userId: 'user-123', tags: { $all: ['important', 'to-read'] } })
```
- **Covered by**: `userId_tags` compound index
- **Performance**: <100ms for 10,000 refs

**Query 4: Duplicate Detection (DOI)**
```javascript
db.references.find({ userId: 'user-123', doi: '10.1234/example', _id: { $ne: 'ref-id' } })
```
- **Covered by**: `doi_1` index (DOI is selective, userId filter applied after)
- **Performance**: <50ms

**Query 5: Full-Text Search**
```javascript
db.references.find({
  userId: 'user-123',
  $text: { $search: 'machine learning' }
}).sort({ score: { $meta: 'textScore' } })
```
- **Covered by**: `title_abstract_text` text index
- **Performance**: <200ms for 10,000 refs

### Virtual Fields

**projectIds** (computed via aggregation):
```typescript
referenceSchema.virtual('projectIds', {
  ref: 'ProjectLink',
  localField: '_id',
  foreignField: 'referenceId',
  justOne: false
});
```

**Usage**:
```typescript
const ref = await Reference.findById(id).populate('projectIds');
// ref.projectIds = ['project-id-1', 'project-id-2']
```

### Performance Targets

**Expected Load**:
- MVP: 1,000 references per user
- Phase 1: 10,000 references per user
- Phase 2: 100,000 references per user (requires sharding)

**Query Performance** (10,000 refs):
- List active references: <50ms
- Filter by collection: <50ms
- Filter by tags: <100ms
- Full-text search: <200ms
- Duplicate detection (single reference): <500ms (all 3 stages)

**Write Performance**:
- Create reference: <100ms (includes duplicate detection trigger)
- Update reference: <50ms
- Soft delete: <50ms
- Permanent delete: <100ms (includes cascade deletes)

### Storage Estimates

**Average Document Size**: ~50KB per reference (with abstract, 10 authors, 5 tags)
- 1,000 refs = ~50MB
- 10,000 refs = ~500MB
- 100,000 refs = ~5GB (per user)

**With PDFs** (average 2MB per PDF, 50% have PDFs):
- 1,000 refs = ~1GB
- 10,000 refs = ~10GB
- 100,000 refs = ~100GB

---

## 2. Collection Schema

### Fields

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `_id` | ObjectId | ✅ | Primary | Auto | MongoDB primary key |
| `userId` | String | ✅ | ✅ (compound) | - | Owner user ID |
| `name` | String | ✅ | ❌ | - | Collection name (max 100 chars) |
| `parentId` | ObjectId | ❌ | ❌ | null | Parent collection for nesting (null = root level) |
| `color` | String | ❌ | ❌ | null | Hex color code for UI display (e.g., `#3B82F6`) |
| `deleted` | Boolean | ❌ | ✅ (compound) | false | Soft delete flag |
| `deletedAt` | Date | ❌ | ❌ | null | Timestamp when deleted |
| `createdAt` | Date | ✅ | ❌ | Auto | Mongoose timestamp |
| `updatedAt` | Date | ✅ | ❌ | Auto | Mongoose timestamp |

### Mongoose Schema

```typescript
const collectionSchema = new Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true, maxlength: 100 },
  parentId: { type: Schema.Types.ObjectId, ref: 'Collection', default: null },
  color: { type: String, match: /^#[0-9A-Fa-f]{6}$/ },
  deleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date }
}, { timestamps: true });
```

### Indexes

| Index | Fields | Purpose |
|-------|--------|---------|
| `userId_deleted` | `{userId: 1, deleted: 1}` | List active collections |
| `userId_name` | `{userId: 1, name: 1}` | Name uniqueness check (application-level) |

### Hierarchical Structure

**Tree Representation**:
- Flat array stored in database
- Frontend builds tree structure using `parentId` references
- No depth limit (but UI may limit to 5 levels for UX)

**Example**:
```javascript
[
  { _id: 'c1', name: 'Computer Science', parentId: null },
  { _id: 'c2', name: 'Machine Learning', parentId: 'c1' },
  { _id: 'c3', name: 'Deep Learning', parentId: 'c2' },
  { _id: 'c4', name: 'NLP', parentId: 'c1' }
]
```

**Frontend Tree**:
```
Computer Science (c1)
├── Machine Learning (c2)
│   └── Deep Learning (c3)
└── NLP (c4)
```

### Circular Reference Prevention

**Application-Level Check** (in CollectionService.update):
```typescript
async function validateNoCircularReference(collectionId: string, newParentId: string): Promise<boolean> {
  let currentId = newParentId;
  while (currentId) {
    if (currentId === collectionId) {
      throw new Error('CIRCULAR_REFERENCE');
    }
    const parent = await Collection.findById(currentId);
    currentId = parent?.parentId;
  }
  return true;
}
```

### Performance

**Query**: List all collections (user builds tree)
- `Collection.find({ userId, deleted: false })`
- **Performance**: <50ms for 1,000 collections

**Average Collections per User**: ~50 collections (estimated)

**Storage**: ~1KB per collection → 50KB per user

---

## 3. Tag Schema

### Fields

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `_id` | ObjectId | ✅ | Primary | Auto | MongoDB primary key |
| `userId` | String | ✅ | ✅ (compound) | - | Owner user ID |
| `name` | String | ✅ | ✅ (compound) | - | Tag name (case-sensitive, max 50 chars) |
| `color` | String | ❌ | ❌ | null | Hex color code (null if not colored) |
| `position` | Number | ❌ | ❌ | null | Position 1-9 for colored tags (keyboard shortcut) |
| `usageCount` | Number | ❌ | ❌ | 0 | Number of references with this tag (for sorting) |
| `createdAt` | Date | ✅ | ❌ | Auto | Mongoose timestamp |
| `updatedAt` | Date | ✅ | ❌ | Auto | Mongoose timestamp |

### Mongoose Schema

```typescript
const tagSchema = new Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true, maxlength: 50 },
  color: { type: String, match: /^#[0-9A-Fa-f]{6}$/, default: null },
  position: { type: Number, min: 1, max: 9, default: null },
  usageCount: { type: Number, default: 0, min: 0 }
}, { timestamps: true });
```

### Indexes

| Index | Fields | Unique | Purpose |
|-------|--------|--------|---------|
| `userId_name` | `{userId: 1, name: 1}` | ✅ | Ensure tag names unique per user |

### Colored Tags Constraint

**Rule**: Maximum 9 colored tags per user (Zotero pattern)

**Enforcement**: Application-level (in TagService.setColor)

**Logic**:
```typescript
const coloredCount = await Tag.countDocuments({
  userId,
  color: { $ne: null }
});

if (coloredCount >= 9) {
  throw new Error('MAX_COLORED_TAGS');
}
```

**Position Assignment**:
- When assigning color: Find first available position 1-9
- When removing color: Set position to null, renumber remaining tags to fill gap
- Example: Remove position 5 → tags at 6,7,8,9 become 5,6,7,8

**Keyboard Shortcuts** (frontend):
- `1-9`: Toggle tag with position 1-9 on selected reference

### Performance

**Query**: List all tags sorted by usage
- `Tag.find({ userId }).sort({ usageCount: -1 })`
- **Performance**: <50ms for 500 tags

**Average Tags per User**: ~100 tags (estimated)

**Storage**: ~500 bytes per tag → 50KB per user

---

## 4. ProjectLink Schema

### Fields

| Field | Type | Required | Indexed | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | ✅ | Primary | MongoDB primary key |
| `userId` | String | ✅ | ✅ (compound) | Owner user ID (same as reference owner) |
| `referenceId` | ObjectId | ✅ | ✅ (compound) | Reference ObjectId |
| `projectId` | ObjectId | ✅ | ✅ (compound) | Project ObjectId (from document-service) |
| `createdAt` | Date | ✅ | ❌ | Mongoose timestamp (when linked) |
| `updatedAt` | Date | ✅ | ❌ | Mongoose timestamp |

### Mongoose Schema

```typescript
const projectLinkSchema = new Schema({
  userId: { type: String, required: true, index: true },
  referenceId: { type: Schema.Types.ObjectId, ref: 'Reference', required: true },
  projectId: { type: Schema.Types.ObjectId, required: true },
}, { timestamps: true });
```

### Indexes

| Index | Fields | Unique | Purpose |
|-------|--------|--------|---------|
| `userId_referenceId_projectId` | `{userId: 1, referenceId: 1, projectId: 1}` | ✅ | Prevent duplicate links, query links |
| `userId_referenceId` | `{userId: 1, referenceId: 1}` | ❌ | Get all projects for reference |
| `userId_projectId` | `{userId: 1, projectId: 1}` | ❌ | Get all references for project |

### Purpose

**Many-to-Many Relationship**:
- One reference can be linked to multiple projects
- One project can have multiple references
- Links are user-scoped (users can only link their own references)

**Minimal Storage**:
- Only stores IDs, no duplicate data
- Actual project metadata lives in document-service
- Actual reference metadata lives in bibliography-service

**Query Patterns**:

1. **Get projects for reference**:
```javascript
const links = await ProjectLink.find({ userId, referenceId });
const projectIds = links.map(link => link.projectId);
```

2. **Get references for project**:
```javascript
const links = await ProjectLink.find({ userId, projectId });
const referenceIds = links.map(link => link.referenceId);
```

### Performance

**Query Performance**: <50ms for 1,000 links per user

**Average Links per User**: ~500 links (10 projects × 50 refs each)

**Storage**: ~200 bytes per link → 100KB per user

---

## 5. DuplicateCandidate Schema

### Fields

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `_id` | ObjectId | ✅ | Primary | Auto | MongoDB primary key |
| `userId` | String | ✅ | ✅ (compound) | - | Owner user ID |
| `reference1Id` | ObjectId | ✅ | ✅ (compound) | - | First reference (usually existing one) |
| `reference2Id` | ObjectId | ✅ | ✅ (compound) | - | Second reference (usually newer one) |
| `matchReason` | Enum | ✅ | ❌ | - | 'isbn', 'doi', or 'title-creator' |
| `confidence` | Number | ✅ | ❌ | - | Confidence score 0.0-1.0 (0.70-0.95 range) |
| `status` | Enum | ✅ | ✅ (compound) | 'pending' | 'pending', 'resolved-keep-existing', 'resolved-keep-both' |
| `resolvedAt` | Date | ❌ | ❌ | null | Timestamp when resolved |
| `createdAt` | Date | ✅ | ❌ | Auto | Mongoose timestamp (when detected) |
| `updatedAt` | Date | ✅ | ❌ | Auto | Mongoose timestamp |

### Mongoose Schema

```typescript
const duplicateCandidateSchema = new Schema({
  userId: { type: String, required: true, index: true },
  reference1Id: { type: Schema.Types.ObjectId, ref: 'Reference', required: true },
  reference2Id: { type: Schema.Types.ObjectId, ref: 'Reference', required: true },
  matchReason: {
    type: String,
    required: true,
    enum: ['isbn', 'doi', 'title-creator']
  },
  confidence: {
    type: Number,
    required: true,
    min: 0.0,
    max: 1.0
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'resolved-keep-existing', 'resolved-keep-both'],
    default: 'pending'
  },
  resolvedAt: { type: Date }
}, { timestamps: true });
```

### Indexes

| Index | Fields | Purpose |
|-------|--------|---------|
| `userId_status` | `{userId: 1, status: 1}` | List pending duplicates |
| `userId_reference1Id_reference2Id` | `{userId: 1, reference1Id: 1, reference2Id: 1}` | Prevent duplicate candidates (unique constraint) |

### Confidence Scores

| Match Reason | Confidence | Algorithm |
|--------------|-----------|-----------|
| `isbn` | 0.95 | Exact ISBN match (after normalization) |
| `doi` | 0.90 | Exact DOI match |
| `title-creator` | 0.70-0.90 | Levenshtein similarity > 85% + first author match. Confidence scales: 85% similarity → 0.70, 100% similarity → 0.90 |

### Zotero 3-Stage Algorithm

**Stage 1: ISBN Match** (books only)
```javascript
const duplicates = await Reference.find({
  userId,
  isbn: cleanedISBN,
  _id: { $ne: referenceId }
});
// Create candidates with matchReason='isbn', confidence=0.95
```

**Stage 2: DOI Match**
```javascript
const duplicates = await Reference.find({
  userId,
  doi: reference.doi,
  _id: { $ne: referenceId }
});
// Create candidates with matchReason='doi', confidence=0.90
```

**Stage 3: Title + First Author Match**
```javascript
const allRefs = await Reference.find({ userId, _id: { $ne: referenceId } });
for (const candidate of allRefs) {
  const titleSimilarity = calculateLevenshteinSimilarity(
    normalizeTitle(reference.title),
    normalizeTitle(candidate.title)
  );

  const firstAuthorMatch = (
    reference.authors[0]?.family === candidate.authors[0]?.family
  );

  if (titleSimilarity > 0.85 && firstAuthorMatch) {
    const confidence = 0.70 + (titleSimilarity - 0.85) * 1.33; // Scale to 0.70-0.90
    // Create candidate with matchReason='title-creator'
  }
}
```

### Performance

**Detection Time** (per reference):
- Stage 1 (ISBN): <50ms (uses index)
- Stage 2 (DOI): <50ms (uses index)
- Stage 3 (Title+Author): <400ms (scans all refs, computes Levenshtein)
- **Total**: <500ms for 1,000 references

**Average Candidates per User**: ~20 pending duplicates (estimated)

**Storage**: ~500 bytes per candidate → 10KB per user

---

## Database Lifecycle Operations

### Initialization

**Create Indexes** (automatic via Mongoose):
```typescript
await mongoose.connect(process.env.MONGODB_URL);
await Reference.createIndexes();
await Collection.createIndexes();
await Tag.createIndexes();
await ProjectLink.createIndexes();
await DuplicateCandidate.createIndexes();
```

**Verify Indexes**:
```bash
mongo bibliography
> db.references.getIndexes()
# Should show 8 indexes
```

### Backup Strategy

**Daily Backups** (MongoDB dump):
```bash
mongodump --db bibliography --out /backups/$(date +%Y%m%d)
```

**Incremental Backups** (oplog):
```bash
mongodump --db bibliography --oplog --out /backups/incremental
```

**Restore**:
```bash
mongorestore --db bibliography /backups/20240108
```

### Migration Strategy

**Schema Changes** (e.g., adding new field):

1. **Add field to schema** (with default value):
```typescript
referenceSchema.add({
  newField: { type: String, default: 'default-value' }
});
```

2. **Deploy code** (backward compatible)

3. **Backfill existing documents** (if needed):
```javascript
await Reference.updateMany(
  { newField: { $exists: false } },
  { $set: { newField: 'default-value' } }
);
```

4. **Add index** (if needed):
```javascript
await Reference.collection.createIndex({ newField: 1 });
```

**Index Changes**:
- Add new indexes: `db.collection.createIndex()`
- Drop old indexes: `db.collection.dropIndex('index_name')`
- Monitor performance: `db.collection.stats()`

### Monitoring

**Key Metrics**:
- Index usage: `db.references.aggregate([{ $indexStats: {} }])`
- Slow queries: Enable MongoDB profiler, log queries >100ms
- Disk usage: `db.stats()`
- Connection pool: Monitor active connections

**Alerts**:
- Disk usage > 80%
- Slow queries > 200ms
- Connection pool exhaustion
- Index missing on critical queries

---

## Data Integrity Constraints

### Application-Level Constraints

**Max 9 Colored Tags**:
- Enforced in TagService.setColor
- Check: `Tag.countDocuments({ userId, color: { $ne: null } }) < 9`

**Circular Collection References**:
- Enforced in CollectionService.update
- Traverse parent chain to ensure no loop

**Citation Key Uniqueness**:
- Database unique index on `citationKey`
- Collision handling: Regenerate with new random suffix (max 10 attempts)

**User Scoping**:
- All queries include `userId` filter
- Prevents cross-user data access

### Database Constraints

**Unique Indexes**:
- `Reference.citationKey` (globally unique)
- `Tag { userId, name }` (unique per user)
- `ProjectLink { userId, referenceId, projectId }` (prevent duplicate links)

**Required Fields**:
- Enforced by Mongoose schema validation
- Missing required field → ValidationError

**Enum Validation**:
- `Reference.type`: Only allows valid reference types
- `DuplicateCandidate.matchReason`: Only allows valid match reasons
- `DuplicateCandidate.status`: Only allows valid statuses

---

## Scaling Considerations

### MVP (1,000 refs per user)
- **Current design sufficient**
- Single MongoDB instance
- Indexes cover all queries
- Query performance <200ms

### Phase 1 (10,000 refs per user)
- **Current design sufficient**
- Consider read replicas for search
- Monitor index sizes
- May need caching layer (Redis) for hot data

### Phase 2 (100,000 refs per user)
- **Requires optimization**:
  1. Shard by `userId` (horizontal scaling)
  2. Separate PDF storage (S3/GridFS)
  3. Elasticsearch for full-text search
  4. Redis cache for frequently accessed refs
  5. Aggregate collections (materialized views)

**Sharding Strategy** (Phase 2):
- Shard key: `userId` (ensures all user data on same shard)
- Even distribution if users have similar ref counts
- Co-locate related collections (Reference, Collection, Tag) on same shard

---

## Testing Data

### Seed Data Script

```typescript
// scripts/seedData.ts
import { Reference, Collection, Tag } from '../src/models';

async function seedTestData(userId: string) {
  // Create collections
  const mlCollection = await Collection.create({
    userId,
    name: 'Machine Learning',
    color: '#3B82F6'
  });

  // Create tags
  await Tag.create([
    { userId, name: 'important', color: '#EF4444', position: 1, usageCount: 0 },
    { userId, name: 'to-read', usageCount: 0 }
  ]);

  // Create references
  const refs = await Reference.create([
    {
      userId,
      type: 'article',
      title: 'Machine Learning: A Probabilistic Perspective',
      authors: [{ full: 'Kevin Murphy', family: 'Murphy', given: 'Kevin' }],
      year: 2012,
      citationKey: 'murphy2012machineabc',
      tags: ['important'],
      collectionIds: [mlCollection._id],
      sourceRaw: { provider: 'manual', payload: {} }
    },
    {
      userId,
      type: 'book',
      title: 'Deep Learning',
      authors: [
        { full: 'Ian Goodfellow', family: 'Goodfellow', given: 'Ian' },
        { full: 'Yoshua Bengio', family: 'Bengio', given: 'Yoshua' }
      ],
      year: 2016,
      isbn: '978-0262035613',
      citationKey: 'goodfellow2016deepxyz',
      tags: ['important', 'to-read'],
      collectionIds: [mlCollection._id],
      sourceRaw: { provider: 'manual', payload: {} }
    }
  ]);

  console.log(`Created ${refs.length} references`);
}
```

### Test Data Cleanup

```typescript
// tests/helpers/cleanDatabase.ts
export async function cleanDatabase() {
  await Reference.deleteMany({});
  await Collection.deleteMany({});
  await Tag.deleteMany({});
  await ProjectLink.deleteMany({});
  await DuplicateCandidate.deleteMany({});
}
```

---

## Summary

**5 Collections** with well-defined schemas and indexes:
1. **Reference**: Bibliography entries with 8 indexes for optimal query performance
2. **Collection**: Hierarchical folders with circular reference prevention
3. **Tag**: Tags with max 9 colored constraint
4. **ProjectLink**: Many-to-many reference↔project links
5. **DuplicateCandidate**: Zotero 3-stage duplicate detection results

**Performance Targets**: All queries <200ms for 10,000 references

**Scaling**: Current design supports MVP and Phase 1, requires optimization for Phase 2 (100K+ refs)
