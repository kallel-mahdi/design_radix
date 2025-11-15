# Service Layer Specifications

## Overview

The service layer implements business logic, separated from HTTP concerns (controllers) and data access (Mongoose models). Uses InversifyJS for dependency injection to enable testability and loose coupling.

**Architecture Pattern**:
- Controllers handle HTTP (request/response)
- Services handle business logic
- Models handle data persistence
- Middleware handles cross-cutting concerns (auth, validation, errors)

**Dependency Injection**: All services are registered in `src/config/container.ts` and injected via `@injectable()` and `@inject()` decorators.

---

## 1. ReferenceService

**File**: `src/services/ReferenceService.ts`
**Interface**: `IReferenceService`
**DI Symbol**: `TYPES.IReferenceService`
**Dependencies**:
- `Reference` model (Mongoose)
- `IDuplicateService` (for async duplicate detection)
- Winston logger

### Methods

#### create(userId: string, data: CreateReferenceInput): Promise<IReference>

**Purpose**: Create a new reference with auto-generated citation key and trigger duplicate detection

**Parameters**:
- `userId` (string) - User ID from x-user-id header (trusted from gateway)
- `data` (CreateReferenceInput):
  - `type` (required) - Reference type enum: 'article', 'book', 'chapter', 'conference', 'thesis', 'other'
  - `title` (required) - Reference title
  - `authors` (optional) - Array of author objects: `{given?: string, family?: string, full: string}`
  - `year` (optional) - Publication year (1000-2100)
  - `venue` (optional) - Journal/conference name
  - `doi` (optional) - DOI identifier
  - `isbn` (optional) - ISBN (for books)
  - `url` (optional) - External URL
  - `abstract` (optional) - Abstract text
  - `tags` (optional) - Array of tag names
  - `collectionIds` (optional) - Array of collection ObjectIds
  - `sourceRaw` (required) - Source provenance: `{provider: string, payload: any}`

**Business Logic**:
1. Generate unique citation key using `generateCitationKey()`:
   - Format: `lastname + year + titleWord + random3chars`
   - Example: `smith2024machine + abc` → `smith2024machineabc`
2. Validate required fields (title, type checked by Joi in controller)
3. Create reference document in MongoDB with `deleted: false`
4. **Trigger async duplicate detection** (non-blocking):
   - Calls `duplicateService.detectForReference(reference._id)`
   - Runs in background, doesn't block response
5. Log creation event (info level)

**Returns**: Created reference document with populated `_id` and generated `citationKey`

**Errors**:
- `ValidationError` if title missing (caught by Mongoose schema)
- `DuplicateKeyError` if citationKey collision (auto-retry with new random suffix)
- `MongoError` if database connection fails

**Code Reference**: `/home/mahdi/Desktop/bibliography/bibliography_backend/src/services/ReferenceService.ts:15-42`

**Example**:
```typescript
const reference = await referenceService.create('user-123', {
  type: 'article',
  title: 'Machine Learning Survey',
  authors: [{full: 'John Smith', family: 'Smith', given: 'John'}],
  year: 2024,
  doi: '10.1234/example',
  sourceRaw: {provider: 'crossref', payload: {/* raw JSON */}}
});
// Returns: { _id: '...', citationKey: 'smith2024machineabc', ... }
```

---

#### list(userId: string, filters: ReferenceFilters): Promise<IReference[]>

**Purpose**: List references with optional filtering and pagination

**Parameters**:
- `userId` (string) - User ID for scoping query
- `filters` (ReferenceFilters):
  - `collectionId` (optional) - Filter by collection membership (ObjectId as string)
  - `tags` (optional) - Filter by tags (array of strings, AND logic)
  - `deleted` (optional) - Include trash (true) or active only (false, default: false)
  - `limit` (optional) - Pagination limit (default: 100, max: 1000)
  - `offset` (optional) - Pagination offset (default: 0)

**Business Logic**:
1. Build MongoDB query object:
   - Always include: `{ userId }`
   - If `deleted` specified: `{ deleted: filters.deleted }`
   - If `collectionId` specified: `{ collectionIds: collectionId }`
   - If `tags` specified: `{ tags: { $all: filters.tags } }` (AND logic)
2. Apply pagination: `.skip(offset).limit(limit)`
3. Sort by `createdAt` descending (newest first)
4. Execute query and return array

**Performance**: Uses compound indexes for optimal query performance:
- `{ userId: 1, deleted: 1 }` covers most queries
- `{ userId: 1, collectionIds: 1 }` for collection filtering
- `{ userId: 1, tags: 1 }` for tag filtering

**Returns**: Array of reference documents (may be empty)

**Errors**:
- `ValidationError` if limit > 1000 (enforced in controller)
- `MongoError` if database query fails

**Code Reference**: `/home/mahdi/Desktop/bibliography/bibliography_backend/src/services/ReferenceService.ts:48-69`

**Example**:
```typescript
// List active references in a collection
const refs = await referenceService.list('user-123', {
  collectionId: '507f1f77bcf86cd799439011',
  deleted: false,
  limit: 50,
  offset: 0
});

// List references with specific tags
const tagged = await referenceService.list('user-123', {
  tags: ['important', 'to-read'], // AND logic: must have both tags
  deleted: false
});
```

---

#### getById(userId: string, id: string): Promise<IReference | null>

**Purpose**: Retrieve a single reference by ID with user scoping

**Parameters**:
- `userId` (string) - User ID for authorization check
- `id` (string) - Reference ObjectId as string

**Business Logic**:
1. Query: `Reference.findOne({ _id: id, userId })`
2. Return reference if found, null if not found or belongs to different user

**Authorization**: Ensures users can only access their own references

**Returns**: Reference document or null

**Errors**:
- `CastError` if id is not valid ObjectId format (caught by controller)
- `MongoError` if database query fails

**Code Reference**: `/home/mahdi/Desktop/bibliography/bibliography_backend/src/services/ReferenceService.ts:75-80`

---

#### update(userId: string, id: string, updates: UpdateReferenceInput): Promise<IReference | null>

**Purpose**: Update reference metadata fields

**Parameters**:
- `userId` (string) - User ID for authorization
- `id` (string) - Reference ObjectId
- `updates` (UpdateReferenceInput) - Partial update object:
  - `title`, `authors`, `year`, `venue`, `doi`, `isbn`, `url`, `abstract` (all optional)
  - `tags`, `collectionIds` (optional arrays)

**Business Logic**:
1. Find reference: `findOne({ _id: id, userId })`
2. If not found → return null (controller returns 404)
3. Apply updates using `Object.assign(reference, updates)`
4. Save document (triggers Mongoose validation)
5. **Re-trigger duplicate detection** if metadata changed (title, authors, doi, isbn)
6. Log update event

**Immutable Fields**: Cannot update `userId`, `citationKey`, `createdAt`, `deleted`, `deletedAt`

**Returns**: Updated reference document or null

**Errors**:
- `ValidationError` if updates violate schema constraints
- `MongoError` if save fails

**Code Reference**: `/home/mahdi/Desktop/bibliography/bibliography_backend/src/services/ReferenceService.ts:86-105`

**Example**:
```typescript
const updated = await referenceService.update('user-123', refId, {
  title: 'Updated Title',
  tags: ['revised', 'important']
});
```

---

#### softDelete(userId: string, id: string): Promise<IReference | null>

**Purpose**: Move reference to trash (soft delete)

**Parameters**:
- `userId` (string) - User ID
- `id` (string) - Reference ObjectId

**Business Logic**:
1. Find reference: `findOne({ _id: id, userId })`
2. If not found → return null
3. Set `deleted: true`, `deletedAt: new Date()`
4. Save document
5. Log deletion event

**Behavior**: Reference remains in database, excluded from default queries (deleted=false)

**Returns**: Deleted reference document or null

**Code Reference**: `/home/mahdi/Desktop/bibliography/bibliography_backend/src/services/ReferenceService.ts:111-120`

---

#### restore(userId: string, id: string): Promise<IReference | null>

**Purpose**: Restore reference from trash

**Parameters**:
- `userId` (string) - User ID
- `id` (string) - Reference ObjectId

**Business Logic**:
1. Find reference: `findOne({ _id: id, userId })`
2. If not found → return null
3. Set `deleted: false`, `deletedAt: null`
4. Save document
5. Log restoration event

**Returns**: Restored reference document or null

**Code Reference**: `/home/mahdi/Desktop/bibliography/bibliography_backend/src/services/ReferenceService.ts:126-135`

---

#### permanentDelete(userId: string, id: string): Promise<boolean>

**Purpose**: Permanently delete reference and associated data (DESTRUCTIVE)

**Parameters**:
- `userId` (string) - User ID
- `id` (string) - Reference ObjectId

**Business Logic**:
1. Delete reference document: `deleteOne({ _id: id, userId })`
2. Delete associated PDF file (if exists) using `unlinkSync()`
3. Delete ProjectLink documents: `ProjectLink.deleteMany({ referenceId: id })`
4. Delete DuplicateCandidate documents: `DuplicateCandidate.deleteMany({ $or: [{reference1Id: id}, {reference2Id: id}] })`
5. Log permanent deletion event

**Warning**: Cannot be undone. Use soft delete for trash functionality.

**Returns**: `true` if deleted, `false` if not found

**Code Reference**: `/home/mahdi/Desktop/bibliography/bibliography_backend/src/services/ReferenceService.ts:141-165`

---

#### generateCitationKey(userId: string, reference: Partial<IReference>): Promise<string>

**Purpose**: Generate unique citation key in Zotero-like format

**Parameters**:
- `userId` (string) - User ID for scoping uniqueness check
- `reference` - Partial reference with `authors`, `year`, `title`

**Algorithm**:
1. Extract last name from first author:
   - If authors array exists: `authors[0].family` or parse from `authors[0].full`
   - If no authors: `'unknown'`
   - Normalize: lowercase, remove special chars
2. Extract year:
   - Use `reference.year` if present
   - Otherwise use current year
3. Extract title word:
   - Take first significant word from title (skip articles: a, an, the)
   - Normalize: lowercase, alphanumeric only
4. Generate random 3-character suffix: `Math.random().toString(36).substring(2, 5)`
5. Combine: `lastname + year + titleWord + random`
6. Check uniqueness: `Reference.findOne({ userId, citationKey })`
7. If collision → regenerate random suffix and retry (max 10 attempts)

**Returns**: Unique citation key string

**Examples**:
- Smith, J. (2024) "Machine Learning Survey" → `smith2024machineabc`
- Unknown author (2024) "Deep Learning" → `unknown2024deepxyz`
- Doe, A. (2023) "A Survey of NLP" → `doe2023survey123` (skipped "A")

**Code Reference**: `/home/mahdi/Desktop/bibliography/bibliography_backend/src/services/ReferenceService.ts:171-225`

---

## 2. CollectionService

**File**: `src/services/CollectionService.ts`
**Interface**: `ICollectionService`
**DI Symbol**: `TYPES.ICollectionService`
**Dependencies**:
- `Collection` model (Mongoose)
- `Reference` model (for cascade delete check)
- Winston logger

### Methods

#### create(userId: string, data: CreateCollectionInput): Promise<ICollection>

**Purpose**: Create a new collection (folder) for organizing references

**Parameters**:
- `userId` (string) - User ID
- `data` (CreateCollectionInput):
  - `name` (required) - Collection name
  - `parentId` (optional) - Parent collection ObjectId for nesting
  - `color` (optional) - Hex color code for UI display

**Business Logic**:
1. Validate parent exists if `parentId` provided
2. Create collection document with `deleted: false`
3. Log creation event

**Returns**: Created collection document

**Errors**:
- `ValidationError` if name missing
- `NotFoundError` if parent collection doesn't exist
- `MongoError` if database error

**Code Reference**: `/home/mahdi/Desktop/bibliography/bibliography_backend/src/services/CollectionService.ts:15-35`

---

#### list(userId: string, filters: CollectionFilters): Promise<ICollection[]>

**Purpose**: List collections with optional filtering

**Parameters**:
- `userId` (string) - User ID
- `filters` (CollectionFilters):
  - `deleted` (optional) - Include deleted collections (default: false)

**Business Logic**:
1. Query: `Collection.find({ userId, deleted: filters.deleted ?? false })`
2. Sort by `name` ascending (alphabetical)
3. Return array (frontend builds tree structure)

**Returns**: Flat array of collections

**Code Reference**: `/home/mahdi/Desktop/bibliography/bibliography_backend/src/services/CollectionService.ts:41-50`

---

#### getById(userId: string, id: string): Promise<ICollection | null>

**Purpose**: Retrieve single collection by ID

**Parameters**:
- `userId` (string) - User ID for authorization
- `id` (string) - Collection ObjectId

**Business Logic**:
1. Query: `Collection.findOne({ _id: id, userId })`
2. Return collection or null

**Returns**: Collection document or null

**Code Reference**: `/home/mahdi/Desktop/bibliography/bibliography_backend/src/services/CollectionService.ts:56-60`

---

#### update(userId: string, id: string, updates: UpdateCollectionInput): Promise<ICollection | null>

**Purpose**: Update collection metadata

**Parameters**:
- `userId` (string) - User ID
- `id` (string) - Collection ObjectId
- `updates` (UpdateCollectionInput):
  - `name` (optional) - New name
  - `parentId` (optional) - Move to different parent (null = root level)
  - `color` (optional) - Update color

**Business Logic**:
1. Find collection
2. If changing `parentId`, validate:
   - New parent exists
   - Not creating circular reference (collection can't be its own ancestor)
3. Apply updates and save
4. Log update event

**Circular Reference Check**: Traverse parent chain to ensure `id` not in ancestors

**Returns**: Updated collection or null

**Code Reference**: `/home/mahdi/Desktop/bibliography/bibliography_backend/src/services/CollectionService.ts:66-92`

---

#### softDelete(userId: string, id: string): Promise<ICollection | null>

**Purpose**: Move collection to trash (references remain, just unlinked from collection)

**Parameters**:
- `userId` (string) - User ID
- `id` (string) - Collection ObjectId

**Business Logic**:
1. Find collection
2. Set `deleted: true`, `deletedAt: new Date()`
3. **Do NOT delete references** - they remain in library
4. Child collections remain (orphaned at root level)
5. Save and log

**Returns**: Deleted collection or null

**Code Reference**: `/home/mahdi/Desktop/bibliography/bibliography_backend/src/services/CollectionService.ts:98-107`

---

#### restore(userId: string, id: string): Promise<ICollection | null>

**Purpose**: Restore collection from trash

**Parameters**:
- `userId` (string) - User ID
- `id` (string) - Collection ObjectId

**Business Logic**:
1. Find collection
2. Set `deleted: false`, `deletedAt: null`
3. Save and log

**Returns**: Restored collection or null

**Code Reference**: `/home/mahdi/Desktop/bibliography/bibliography_backend/src/services/CollectionService.ts:113-122`

---

#### permanentDelete(userId: string, id: string): Promise<boolean>

**Purpose**: Permanently delete collection (DESTRUCTIVE)

**Parameters**:
- `userId` (string) - User ID
- `id` (string) - Collection ObjectId

**Business Logic**:
1. Delete collection document
2. **Update references**: Remove `id` from `collectionIds` arrays in all references
3. **Update child collections**: Set `parentId: null` for children (orphan to root)
4. Log permanent deletion

**Returns**: `true` if deleted, `false` if not found

**Code Reference**: `/home/mahdi/Desktop/bibliography/bibliography_backend/src/services/CollectionService.ts:128-150`

---

## 3. TagService

**File**: `src/services/TagService.ts`
**Interface**: `ITagService`
**DI Symbol**: `TYPES.ITagService`
**Dependencies**:
- `Tag` model (Mongoose)
- `Reference` model (for cascade operations)
- Winston logger

### Special Constraint: Max 9 Colored Tags

Zotero allows max 9 colored tags (numbered 1-9 for keyboard shortcuts). Enforced at application level.

### Methods

#### create(userId: string, data: CreateTagInput): Promise<ITag>

**Purpose**: Create a new tag (auto-created when assigned to reference)

**Parameters**:
- `userId` (string) - User ID
- `data` (CreateTagInput):
  - `name` (required) - Tag name (case-sensitive)
  - `color` (optional) - Hex color code (triggers max 9 check)

**Business Logic**:
1. Check if tag already exists: `Tag.findOne({ userId, name })`
2. If exists → return existing tag (idempotent)
3. If creating with color → check colored tag count < 9
4. If assigning color → find first available position (1-9)
5. Create tag document
6. Log creation

**Returns**: Created or existing tag document

**Errors**:
- `MaxColoredTagsError` if trying to create 10th colored tag
- `MongoError` if database error

**Code Reference**: `/home/mahdi/Desktop/bibliography/bibliography_backend/src/services/TagService.ts:15-45`

---

#### list(userId: string): Promise<ITag[]>

**Purpose**: List all tags for user (sorted by usage frequency)

**Parameters**:
- `userId` (string) - User ID

**Business Logic**:
1. Query: `Tag.find({ userId })`
2. Sort by `usageCount` descending (most used first)
3. Return array

**Returns**: Array of tag documents

**Code Reference**: `/home/mahdi/Desktop/bibliography/bibliography_backend/src/services/TagService.ts:51-58`

---

#### setColor(userId: string, name: string, color: string | null): Promise<void>

**Purpose**: Assign or remove color from tag (enforces max 9 colored tags rule)

**Parameters**:
- `userId` (string) - User ID
- `name` (string) - Tag name
- `color` (string | null) - Hex color code or null to remove

**Business Logic**:

**Assigning Color** (`color !== null`):
1. Count current colored tags: `Tag.countDocuments({ userId, color: { $ne: null } })`
2. If count >= 9 → throw `MaxColoredTagsError` (cannot assign 10th color)
3. Find first available position:
   - Query existing positions: `Tag.find({ userId, color: { $ne: null } }).select('position')`
   - Find lowest unused position in range 1-9
4. Update tag: `Tag.updateOne({ userId, name }, { color, position })`

**Removing Color** (`color === null`):
1. Find tag to remove color from: `Tag.findOne({ userId, name })`
2. Get its position (e.g., position 5)
3. Set `color: null`, `position: null`
4. **Renumber remaining colored tags** to fill gap:
   - Find all colored tags with position > removed position
   - Decrement their positions by 1
   - Example: Removed position 5 → tags at positions 6,7,8,9 become 5,6,7,8

**Returns**: `void` (updates in-place)

**Errors**:
- `MaxColoredTagsError` if trying to assign 10th color
- `NotFoundError` if tag doesn't exist
- `MongoError` if database error

**Code Reference**: `/home/mahdi/Desktop/bibliography/bibliography_backend/src/services/TagService.ts:64-125`

**Example**:
```typescript
// Assign color to tag (first colored tag gets position 1)
await tagService.setColor('user-123', 'important', '#FF0000');

// Remove color (renumbers remaining tags)
await tagService.setColor('user-123', 'important', null);
```

---

#### rename(userId: string, oldName: string, newName: string): Promise<void>

**Purpose**: Rename tag across all references

**Parameters**:
- `userId` (string) - User ID
- `oldName` (string) - Current tag name
- `newName` (string) - New tag name

**Business Logic**:
1. Check if `newName` already exists → throw `DuplicateTagError`
2. Update tag document: `Tag.updateOne({ userId, name: oldName }, { name: newName })`
3. Update all references:
   - `Reference.updateMany({ userId, tags: oldName }, { $set: { 'tags.$': newName } })`
   - Uses positional operator `$` to update specific array element
4. Log rename event

**Returns**: `void`

**Errors**:
- `DuplicateTagError` if newName already exists
- `NotFoundError` if oldName doesn't exist

**Code Reference**: `/home/mahdi/Desktop/bibliography/bibliography_backend/src/services/TagService.ts:131-155`

---

#### delete(userId: string, name: string): Promise<void>

**Purpose**: Delete tag and remove from all references

**Parameters**:
- `userId` (string) - User ID
- `name` (string) - Tag name to delete

**Business Logic**:
1. Delete tag document: `Tag.deleteOne({ userId, name })`
2. Remove from all references:
   - `Reference.updateMany({ userId, tags: name }, { $pull: { tags: name } })`
   - `$pull` operator removes all occurrences from array
3. Log deletion

**Returns**: `void`

**Code Reference**: `/home/mahdi/Desktop/bibliography/bibliography_backend/src/services/TagService.ts:161-175`

---

#### incrementUsage(userId: string, tagNames: string[]): Promise<void>

**Purpose**: Increment usage count when tags assigned to reference (internal method)

**Parameters**:
- `userId` (string) - User ID
- `tagNames` (string[]) - Array of tag names

**Business Logic**:
1. For each tag name:
   - `Tag.updateOne({ userId, name }, { $inc: { usageCount: 1 } }, { upsert: true })`
   - Auto-creates tag if doesn't exist (with usageCount=1)
2. Run in parallel using `Promise.all()`

**Returns**: `void`

**Code Reference**: `/home/mahdi/Desktop/bibliography/bibliography_backend/src/services/TagService.ts:181-195`

---

## 4. ProjectLinkService

**File**: `src/services/ProjectLinkService.ts`
**Interface**: `IProjectLinkService`
**DI Symbol**: `TYPES.IProjectLinkService`
**Dependencies**:
- `ProjectLink` model (Mongoose)
- Winston logger

### Purpose

Manages many-to-many links between bibliography references and LaTeX projects (from editor backend). Stores minimal data (just IDs), actual project metadata lives in document-service.

### Methods

#### linkReferenceToProject(userId: string, referenceId: string, projectId: string): Promise<IProjectLink>

**Purpose**: Create link between reference and project

**Parameters**:
- `userId` (string) - User ID for authorization
- `referenceId` (string) - Reference ObjectId
- `projectId` (string) - Project ObjectId (from document-service)

**Business Logic**:
1. Check if link already exists: `ProjectLink.findOne({ userId, referenceId, projectId })`
2. If exists → return existing link (idempotent)
3. Create new ProjectLink document
4. Log link creation

**Returns**: Created or existing ProjectLink document

**Code Reference**: `/home/mahdi/Desktop/bibliography/bibliography_backend/src/services/ProjectLinkService.ts:15-35`

---

#### unlinkReferenceFromProject(userId: string, referenceId: string, projectId: string): Promise<boolean>

**Purpose**: Remove link between reference and project

**Parameters**:
- `userId` (string) - User ID
- `referenceId` (string) - Reference ObjectId
- `projectId` (string) - Project ObjectId

**Business Logic**:
1. Delete link: `ProjectLink.deleteOne({ userId, referenceId, projectId })`
2. Log unlink event

**Returns**: `true` if link deleted, `false` if not found

**Code Reference**: `/home/mahdi/Desktop/bibliography/bibliography_backend/src/services/ProjectLinkService.ts:41-52`

---

#### getProjectsForReference(userId: string, referenceId: string): Promise<string[]>

**Purpose**: Get all project IDs linked to a reference

**Parameters**:
- `userId` (string) - User ID
- `referenceId` (string) - Reference ObjectId

**Business Logic**:
1. Query: `ProjectLink.find({ userId, referenceId }).select('projectId')`
2. Extract `projectId` from each document
3. Return array of project IDs

**Returns**: Array of project ObjectIds as strings

**Code Reference**: `/home/mahdi/Desktop/bibliography/bibliography_backend/src/services/ProjectLinkService.ts:58-67`

---

#### getReferencesForProject(userId: string, projectId: string): Promise<string[]>

**Purpose**: Get all reference IDs linked to a project

**Parameters**:
- `userId` (string) - User ID
- `projectId` (string) - Project ObjectId

**Business Logic**:
1. Query: `ProjectLink.find({ userId, projectId }).select('referenceId')`
2. Extract `referenceId` from each document
3. Return array of reference IDs

**Returns**: Array of reference ObjectIds as strings

**Code Reference**: `/home/mahdi/Desktop/bibliography/bibliography_backend/src/services/ProjectLinkService.ts:73-82`

---

## 5. DuplicateService

**File**: `src/services/DuplicateService.ts`
**Interface**: `IDuplicateService`
**DI Symbol**: `TYPES.IDuplicateService`
**Dependencies**:
- `DuplicateCandidate` model (Mongoose)
- `Reference` model (for querying)
- Winston logger

### Purpose

Implements Zotero's 3-stage duplicate detection algorithm: ISBN → DOI → Title+First Author matching.

### Methods

#### detectForReference(referenceId: string): Promise<void>

**Purpose**: Run 3-stage duplicate detection for a reference (async, non-blocking)

**Parameters**:
- `referenceId` (string) - Reference ObjectId to check for duplicates

**Algorithm**:

**Stage 1: ISBN Match** (highest confidence: 0.95)
1. Load reference from database
2. If reference has ISBN:
   - Clean ISBN (remove hyphens, spaces)
   - Query: `Reference.find({ userId, isbn: cleanedISBN, _id: { $ne: referenceId } })`
   - For each match:
     - Check if candidate already exists (avoid duplicates)
     - Create DuplicateCandidate with:
       - `reference1Id: referenceId`
       - `reference2Id: match._id`
       - `matchReason: 'isbn'`
       - `confidence: 0.95`
       - `status: 'pending'`

**Stage 2: DOI Match** (confidence: 0.90)
1. If reference has DOI:
   - Query: `Reference.find({ userId, doi: reference.doi, _id: { $ne: referenceId } })`
   - For each match:
     - Skip if already detected via ISBN
     - Create DuplicateCandidate with matchReason='doi', confidence=0.90

**Stage 3: Title + First Author Match** (confidence: 0.70-0.90 based on similarity)
1. Normalize reference title:
   - Lowercase
   - Remove punctuation
   - Trim whitespace
2. Get first author family name (if exists)
3. Query all references with same userId (excluding referenceId)
4. For each candidate:
   - Normalize candidate title
   - Calculate Levenshtein distance
   - Calculate similarity: `1 - (distance / maxLength)`
   - If similarity > 0.85 AND first authors match:
     - Calculate confidence: `0.70 + (similarity - 0.85) * 1.33` (scales 0.85-1.0 → 0.70-0.90)
     - Create DuplicateCandidate with matchReason='title-creator'

**Performance**: Uses indexes on `isbn`, `doi`, and text search on `title`. Typical detection time <500ms for 1,000 references.

**Returns**: `void` (creates DuplicateCandidate documents in database)

**Code Reference**: `/home/mahdi/Desktop/bibliography/bibliography_backend/src/services/DuplicateService.ts:18-135`

**Example Flow**:
```typescript
// New reference created
const ref = await referenceService.create(userId, {
  type: 'book',
  title: 'Machine Learning',
  authors: [{full: 'Tom Mitchell', family: 'Mitchell', given: 'Tom'}],
  isbn: '978-0070428072',
  sourceRaw: {provider: 'manual', payload: {}}
});

// Async duplicate detection triggered (non-blocking)
duplicateService.detectForReference(ref._id);

// Stage 1: Finds another book with same ISBN
// Creates DuplicateCandidate: { reference1Id: ref._id, reference2Id: existing._id, matchReason: 'isbn', confidence: 0.95 }
```

---

#### getCandidatesForUser(userId: string, filters: DuplicateCandidateFilters): Promise<IDuplicateCandidate[]>

**Purpose**: List duplicate candidates with optional filtering

**Parameters**:
- `userId` (string) - User ID
- `filters` (DuplicateCandidateFilters):
  - `status` (optional) - Filter by status: 'pending', 'resolved-keep-both', 'resolved-keep-existing'
  - `minConfidence` (optional) - Minimum confidence threshold (0.0-1.0)

**Business Logic**:
1. Build query:
   - Always include: `{ userId }`
   - If status specified: `{ status: filters.status }`
   - If minConfidence specified: `{ confidence: { $gte: filters.minConfidence } }`
2. Populate `reference1Id` and `reference2Id` (full reference documents)
3. Sort by `confidence` descending (highest confidence first)
4. Return array

**Returns**: Array of DuplicateCandidate documents with populated references

**Code Reference**: `/home/mahdi/Desktop/bibliography/bibliography_backend/src/services/DuplicateService.ts:141-162`

---

#### resolve(userId: string, candidateId: string, action: 'keep-existing' | 'keep-both' | 'merge'): Promise<IDuplicateCandidate>

**Purpose**: Resolve duplicate candidate (user decision)

**Parameters**:
- `userId` (string) - User ID
- `candidateId` (string) - DuplicateCandidate ObjectId
- `action` (enum):
  - `'keep-existing'`: Delete reference2 (newer duplicate), keep reference1
  - `'keep-both'`: Mark as not duplicates, keep both
  - `'merge'`: Merge metadata (Phase 1 - not implemented)

**Business Logic**:

**Action: keep-existing**
1. Find candidate and populate references
2. Delete reference2 (newer reference): `referenceService.permanentDelete(userId, candidate.reference2Id)`
3. Update candidate: `status: 'resolved-keep-existing'`, `resolvedAt: new Date()`

**Action: keep-both**
1. Update candidate: `status: 'resolved-keep-both'`, `resolvedAt: new Date()`
2. No deletions

**Action: merge** (Phase 1)
1. Return 501 Not Implemented (planned for Phase 1 post-MVP)

**Returns**: Updated DuplicateCandidate document

**Errors**:
- `NotFoundError` if candidate doesn't exist
- `NotImplementedError` if action='merge'

**Code Reference**: `/home/mahdi/Desktop/bibliography/bibliography_backend/src/services/DuplicateService.ts:168-210`

---

#### normalizeTitle(title: string): string

**Purpose**: Normalize title for comparison (internal helper)

**Algorithm**:
1. Convert to lowercase
2. Remove punctuation (keep only alphanumeric and spaces)
3. Trim leading/trailing whitespace
4. Collapse multiple spaces to single space

**Example**:
- Input: `"Machine Learning: A Survey!"`
- Output: `"machine learning a survey"`

**Code Reference**: `/home/mahdi/Desktop/bibliography/bibliography_backend/src/services/DuplicateService.ts:216-225`

---

#### levenshteinDistance(a: string, b: string): number

**Purpose**: Calculate Levenshtein edit distance between strings (internal helper)

**Algorithm**: Classic dynamic programming implementation
- Creates 2D matrix of size (a.length+1) × (b.length+1)
- Fills matrix with minimum edit distance at each position
- Returns final distance at bottom-right corner

**Performance**: O(n×m) time, O(n×m) space where n, m are string lengths

**Example**:
- `levenshteinDistance("kitten", "sitting")` → 3 (3 edits: k→s, e→i, +g)

**Code Reference**: `/home/mahdi/Desktop/bibliography/bibliography_backend/src/services/DuplicateService.ts:231-255`

---

## 6. SearchService

**File**: `src/services/SearchService.ts`
**Interface**: `ISearchService`
**DI Symbol**: `TYPES.ISearchService`
**Dependencies**:
- `Reference` model (Mongoose)
- Winston logger

### Methods

#### search(userId: string, query: SearchQuery): Promise<IReference[]>

**Purpose**: Full-text search across references with filters

**Parameters**:
- `userId` (string) - User ID
- `query` (SearchQuery):
  - `text` (optional) - Full-text search query (searches title, abstract)
  - `collectionId` (optional) - Filter by collection
  - `tags` (optional) - Filter by tags (AND logic)
  - `type` (optional) - Filter by reference type
  - `deleted` (optional) - Include trash (default: false)
  - `limit` (optional) - Pagination limit (default: 100)
  - `offset` (optional) - Pagination offset (default: 0)

**Business Logic**:
1. Build MongoDB query:
   - Base: `{ userId, deleted: query.deleted ?? false }`
   - If text: `{ $text: { $search: query.text } }` (uses text index on title + abstract)
   - If collectionId: `{ collectionIds: query.collectionId }`
   - If tags: `{ tags: { $all: query.tags } }`
   - If type: `{ type: query.type }`
2. Apply pagination: `.skip(offset).limit(limit)`
3. Sort:
   - If text search: sort by `textScore` descending (relevance)
   - Otherwise: sort by `createdAt` descending

**Text Search**: Uses MongoDB text index on `{ title: 'text', abstract: 'text' }`
- Supports phrase search: `"machine learning"`
- Supports negation: `-deep`
- Supports OR: `machine OR learning`

**Returns**: Array of reference documents (sorted by relevance or date)

**Code Reference**: `/home/mahdi/Desktop/bibliography/bibliography_backend/src/services/SearchService.ts:15-55`

**Example**:
```typescript
// Search for "machine learning" in AI collection
const results = await searchService.search('user-123', {
  text: '"machine learning"',
  collectionId: 'ai-collection-id',
  tags: ['important'],
  limit: 50
});
```

---

## Error Handling

All services throw custom errors that controllers catch and convert to HTTP responses:

| Service Error | HTTP Status | Error Code |
|---------------|-------------|------------|
| `ValidationError` | 400 | VALIDATION_ERROR |
| `NotFoundError` | 404 | NOT_FOUND |
| `DuplicateKeyError` | 409 | DUPLICATE_CITATION_KEY |
| `DuplicateDOIError` | 409 | DUPLICATE_DOI |
| `MaxColoredTagsError` | 400 | MAX_COLORED_TAGS |
| `NotImplementedError` | 501 | NOT_IMPLEMENTED |
| `MongoError` | 500 | INTERNAL_ERROR |

---

## Dependency Injection Setup

**Container Registration** (`src/config/container.ts`):

```typescript
container.bind<IReferenceService>(TYPES.IReferenceService).to(ReferenceService);
container.bind<ICollectionService>(TYPES.ICollectionService).to(CollectionService);
container.bind<ITagService>(TYPES.ITagService).to(TagService);
container.bind<IProjectLinkService>(TYPES.IProjectLinkService).to(ProjectLinkService);
container.bind<IDuplicateService>(TYPES.IDuplicateService).to(DuplicateService);
container.bind<ISearchService>(TYPES.ISearchService).to(SearchService);
```

**Controller Injection**:

```typescript
@injectable()
export class ReferenceController {
  constructor(
    @inject(TYPES.IReferenceService) private referenceService: IReferenceService,
    @inject(TYPES.IDuplicateService) private duplicateService: IDuplicateService
  ) {}
}
```

---

## Testing Strategy

### Unit Tests

Test service methods in isolation using mocked dependencies:

```typescript
// tests/unit/services/ReferenceService.test.ts
describe('ReferenceService', () => {
  let service: ReferenceService;
  let mockDuplicateService: jest.Mocked<IDuplicateService>;

  beforeEach(() => {
    mockDuplicateService = {
      detectForReference: jest.fn()
    };
    service = new ReferenceService(mockDuplicateService);
  });

  it('should generate unique citation key', async () => {
    const key = await service.generateCitationKey('user-123', {
      authors: [{full: 'John Smith', family: 'Smith', given: 'John'}],
      year: 2024,
      title: 'Machine Learning'
    });
    expect(key).toMatch(/^smith2024machine[a-z0-9]{3}$/);
  });
});
```

### Integration Tests

Test service methods with real database:

```typescript
// tests/integration/ReferenceService.test.ts
describe('ReferenceService Integration', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_MONGODB_URL);
  });

  afterEach(async () => {
    await Reference.deleteMany({});
  });

  it('should create reference and trigger duplicate detection', async () => {
    const ref = await referenceService.create('user-123', {
      type: 'article',
      title: 'Test Paper',
      sourceRaw: {provider: 'manual', payload: {}}
    });

    expect(ref._id).toBeDefined();
    expect(ref.citationKey).toMatch(/^unknown2024test[a-z0-9]{3}$/);
  });
});
```

---

## Performance Considerations

### Query Optimization

All frequently-used queries covered by compound indexes:
- List active references: `{ userId: 1, deleted: 1 }` → <50ms
- Filter by collection: `{ userId: 1, collectionIds: 1 }` → <50ms
- Filter by tags: `{ userId: 1, tags: 1 }` → <100ms
- Duplicate detection (DOI): `{ doi: 1 }` → <50ms
- Full-text search: Text index on `{ title: 'text', abstract: 'text' }` → <200ms

### Async Operations

Duplicate detection runs asynchronously to avoid blocking reference creation:
```typescript
// Non-blocking
await this.duplicateService.detectForReference(reference._id);
// Returns immediately, detection runs in background
```

### Batch Operations

Tag usage count updates use `Promise.all()` for parallel execution:
```typescript
await Promise.all(tagNames.map(name =>
  Tag.updateOne({ userId, name }, { $inc: { usageCount: 1 } })
));
```

---

## Logging

All services log key operations at appropriate levels:

**Info Level** (normal operations):
- Reference created/updated/deleted
- Collection created/moved
- Tag renamed/deleted
- Duplicate detected/resolved

**Error Level** (failures):
- Database connection errors
- Validation errors
- External API failures (Crossref)

**Debug Level** (diagnostics):
- Query execution details
- Duplicate detection algorithm steps
- Citation key generation attempts

**Log Format** (Winston structured JSON):
```json
{
  "level": "info",
  "message": "Reference created",
  "timestamp": "2024-01-08T12:00:00Z",
  "userId": "user-123",
  "referenceId": "507f1f77bcf86cd799439011",
  "citationKey": "smith2024machineabc",
  "service": "ReferenceService"
}
```
