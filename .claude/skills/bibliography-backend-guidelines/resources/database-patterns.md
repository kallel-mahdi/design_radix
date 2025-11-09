# Database Patterns - Mongoose Best Practices

Complete guide to database access patterns using Mongoose (MongoDB) in backend microservices.

## Table of Contents

- [Mongoose Connection](#mongoose-connection)
- [Model Definitions](#model-definitions)
- [Repository Pattern](#repository-pattern)
- [Query Patterns](#query-patterns)
- [Transaction Patterns](#transaction-patterns)
- [Query Optimization](#query-optimization)
- [N+1 Query Prevention](#n1-query-prevention)
- [Error Handling](#error-handling)

---

## Mongoose Connection

### Basic Connection Setup

```typescript
import mongoose from 'mongoose';

// In app startup (server.ts)
export async function connectDatabase(mongoUrl: string) {
    try {
        await mongoose.connect(mongoUrl);
        logger.info('MongoDB connected');
    } catch (error) {
        logger.error('MongoDB connection failed', { error });
        throw error;
    }
}

// Connection event listeners
mongoose.connection.on('error', (err) => {
    logger.error('MongoDB error', { error: err.message });
});

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
});
```

### Graceful Shutdown

```typescript
async function shutdown() {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
```

---

## Model Definitions

### Basic Schema & Model

```typescript
import { Schema, Document, Model } from 'mongoose';

// Define TypeScript interface
export interface IReference extends Document {
    title: string;
    doi?: string;
    authors: string[];
    publishedDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Define Mongoose schema
const referenceSchema = new Schema<IReference>(
    {
        title: { type: String, required: true, index: true },
        doi: { type: String, sparse: true, unique: true },
        authors: { type: [String], required: true },
        publishedDate: { type: Date },
    },
    { timestamps: true }
);

// Create and export model
export const Reference: Model<IReference> = mongoose.model('Reference', referenceSchema);
```

### Schema with Relations

```typescript
export interface ICollection extends Document {
    name: string;
    userId: mongoose.Types.ObjectId;
    references: mongoose.Types.ObjectId[];
    createdAt: Date;
}

const collectionSchema = new Schema<ICollection>(
    {
        name: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        references: [{ type: Schema.Types.ObjectId, ref: 'Reference' }],
    },
    { timestamps: true }
);

// Create compound index for user + name
collectionSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Collection: Model<ICollection> = mongoose.model('Collection', collectionSchema);
```

### Middleware & Hooks

```typescript
// Pre-save hook for validation
referenceSchema.pre<IReference>('save', function (next) {
    if (this.authors && this.authors.length === 0) {
        throw new Error('At least one author required');
    }
    next();
});

// Post-save hook for logging
referenceSchema.post<IReference>('save', function () {
    logger.info('Reference saved', { id: this._id });
});

// Pre-find hook to populate references
collectionSchema.pre('findById', function () {
    this.populate('references');
});
```

---

## Repository Pattern

### Why Use Repositories

✅ **Use repositories when:**
- Complex queries with lookups/populations
- Query used in multiple places
- Need caching layer
- Want to mock for testing

❌ **Skip repositories for:**
- Simple one-off queries
- Prototyping (can refactor later)

### Repository Template

```typescript
export class ReferenceRepository {
    async findById(id: string): Promise<IReference | null> {
        return Reference.findById(id);
    }

    async findByDoi(doi: string): Promise<IReference | null> {
        return Reference.findOne({ doi });
    }

    async findAll(filters?: { archived?: boolean }): Promise<IReference[]> {
        return Reference.find(filters || {})
            .sort({ createdAt: -1 });
    }

    async create(data: Partial<IReference>): Promise<IReference> {
        return Reference.create(data);
    }

    async update(id: string, data: Partial<IReference>): Promise<IReference | null> {
        return Reference.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string): Promise<boolean> {
        const result = await Reference.findByIdAndDelete(id);
        return result !== null;
    }

    async bulkCreate(data: Partial<IReference>[]): Promise<IReference[]> {
        return Reference.insertMany(data);
    }
}
```

### Service Using Repository

```typescript
export class ReferenceService {
    constructor(private referenceRepository: ReferenceRepository) {}

    async getReference(id: string): Promise<IReference> {
        const reference = await this.referenceRepository.findById(id);
        if (!reference) {
            throw new NotFoundError('Reference not found');
        }
        return reference;
    }

    async createReference(data: CreateReferenceInput): Promise<IReference> {
        // Check for duplicates
        if (data.doi) {
            const existing = await this.referenceRepository.findByDoi(data.doi);
            if (existing) {
                throw new ConflictError('Reference with this DOI already exists');
            }
        }
        return this.referenceRepository.create(data);
    }
}
```

---

## Query Patterns

### Basic Queries

```typescript
// Find all
const references = await Reference.find();

// Find by ID
const reference = await Reference.findById(id);

// Find one by condition
const reference = await Reference.findOne({ doi: '10.1234/example' });

// Find many by condition
const references = await Reference.find({ archived: false });

// Count documents
const count = await Reference.countDocuments({ archived: false });

// Exists check
const exists = await Reference.exists({ doi });
```

### Query with Sorting & Limiting

```typescript
const references = await Reference.find()
    .sort({ createdAt: -1 })           // Descending by createdAt
    .limit(10)                           // Take 10 results
    .skip(20)                            // Skip first 20 (pagination)
    .select('title authors doi');        // Select specific fields
```

### Aggregation Pipeline

```typescript
const stats = await Reference.aggregate([
    { $match: { archived: false } },
    { $group: {
        _id: null,
        totalReferences: { $sum: 1 },
        authorCount: { $sum: { $size: '$authors' } }
    }},
]);
```

---

## Transaction Patterns

### Basic Transaction

```typescript
const session = await mongoose.startSession();
session.startTransaction();

try {
    const reference = await Reference.create(
        [{ title: 'New Ref', authors: ['Author'] }],
        { session }
    );

    const collection = await Collection.findByIdAndUpdate(
        collectionId,
        { $push: { references: reference[0]._id } },
        { session, new: true }
    );

    await session.commitTransaction();
    return { reference: reference[0], collection };
} catch (error) {
    await session.abortTransaction();
    throw error;
} finally {
    await session.endSession();
}
```

### Transaction Helper

```typescript
export async function withTransaction<T>(
    fn: (session: mongoose.ClientSession) => Promise<T>
): Promise<T> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const result = await fn(session);
        await session.commitTransaction();
        return result;
    } catch (error) {
        await session.abortTransaction();
        logger.error('Transaction failed', { error });
        throw error;
    } finally {
        await session.endSession();
    }
}

// Usage
const result = await withTransaction(async (session) => {
    const ref = await Reference.create([...], { session });
    await Collection.updateOne({...}, {...}, { session });
    return ref;
});
```

---

## Query Optimization

### Use select to Limit Fields

```typescript
// ❌ Fetches all fields including large arrays
const references = await Reference.find();

// ✅ Only fetch needed fields
const references = await Reference.find()
    .select('title authors doi')
    .lean();  // Returns plain JS objects, faster
```

### Use populate Carefully

```typescript
// ❌ Unnecessary population
const collection = await Collection.findById(id)
    .populate({
        path: 'references',
        populate: { path: 'tags' }  // Don't populate nested unnecessarily
    });

// ✅ Only populate what you need
const collection = await Collection.findById(id)
    .populate('references', 'title authors');  // Limit fields
```

### Use lean() for Read-Only

```typescript
// When you don't need Mongoose documents with methods
const references = await Reference.find()
    .lean()
    .exec();  // Returns plain objects, 2-3x faster
```

---

## N+1 Query Prevention

### Problem: N+1 Queries

```typescript
// ❌ N+1 Query Problem
const collections = await Collection.find();  // 1 query

for (const collection of collections) {
    // N queries (one per collection)
    const references = await Reference.find({ _id: { $in: collection.references } });
}
```

### Solution 1: Use populate

```typescript
// ✅ Single query with populate
const collections = await Collection.find()
    .populate('references');
```

### Solution 2: Aggregation Pipeline

```typescript
// ✅ Single aggregation query
const collections = await Collection.aggregate([
    { $match: {} },
    { $lookup: {
        from: 'references',
        localField: 'references',
        foreignField: '_id',
        as: 'references'
    }},
]);
```

### Solution 3: Batch Queries

```typescript
// ✅ Batch query alternative
const collections = await Collection.find();
const referenceIds = collections.flatMap(c => c.references);
const references = await Reference.find({ _id: { $in: referenceIds } });

// Match back to collections
const referencesMap = new Map(
    references.map(r => [r._id.toString(), r])
);
```

---

## Error Handling

### MongoDB Error Types

```typescript
try {
    await Reference.create({ title: 'Ref' });  // Missing authors
} catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
        // Schema validation failed
        throw new ValidationError(error.message);
    }

    if (error.code === 11000) {
        // Duplicate key error
        const field = Object.keys(error.keyValue)[0];
        throw new ConflictError(`${field} already exists`);
    }

    if (error instanceof mongoose.Error.CastError) {
        // Invalid ObjectId
        throw new ValidationError('Invalid ID format');
    }

    // Unknown error
    logger.error('Database error', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
}
```

### Connection Error Handling

```typescript
// Check connection status
if (mongoose.connection.readyState !== 1) {
    throw new Error('Database not connected');
}

// Reconnect logic
async function ensureConnected() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URL!);
    }
}

// Use before operations
await ensureConnected();
const references = await Reference.find();
```

---

## Best Practices Checklist

- ✅ Use TypeScript interfaces for type safety
- ✅ Define indexes for frequently queried fields
- ✅ Use `lean()` for read-only queries
- ✅ Use `select()` to limit fetched fields
- ✅ Use transactions for multi-document operations
- ✅ Avoid N+1 queries with populate or aggregation
- ✅ Handle MongoDB-specific errors (validation, duplicate, cast)
- ✅ Log all database errors with Winston
- ✅ Use repositories to abstract data access
- ✅ Validate data before creating/updating

---

**Related Files:**
- [SKILL.md](SKILL.md)
- [services-and-repositories.md](services-and-repositories.md)
- [async-and-errors.md](async-and-errors.md)
