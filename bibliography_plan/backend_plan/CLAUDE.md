# Bibliography Manager Backend - Context for AI Agents

## You Are Here: Backend Development

This document provides **backend-specific context** for AI agents working on the bibliography manager API.

**IMPORTANT**: Read the **root CLAUDE.md** (`/home/mahdi/Desktop/bibliography/CLAUDE.md`) FIRST for:
- Overall project vision and team structure
- Architecture principles (separation of concerns, microservices, tech stack)
- Code reuse strategy (editor patterns → bibliography patterns)
- Coding philosophy (trust types, minimal defensive coding)
- Common tasks workflow

**Then read the unified documentation**:
- **Spec.md** (`bibliography_plan/Spec.md`) - Complete frontend + backend specification
- **Roadmap.md** (`bibliography_plan/Roadmap.md`) - Phased development timeline
- **UnifiedImplementationChecklist.md** (`bibliography_plan/UnifiedImplementationChecklist.md`) - 20 sessions combining frontend + backend

This file provides **backend-specific patterns** not covered in the root documentation.

---

## Backend Quick Reference

**Your Primary Documentation**:
1. **Spec.md** - MUST READ FIRST - API endpoints, data models, architecture
2. **Roadmap.md** - Phased development timeline
3. **ImplementationChecklist.md** - Evening-by-evening task breakdown
4. **Agents.md** - Instructions for AI assistants (specialized guidance)
5. **zotero.md** - Zotero implementation notes (data models, algorithms)

**Your Reference Codebases**:
- **Editor Backend**: `/home/mahdi/Desktop/bibliography/editor_backend/services/` - COPY PATTERNS FROM HERE
- **Zotero Backend**: `/home/mahdi/Desktop/bibliography/zotero/chrome/content/zotero/xpcom/` - ALGORITHM REFERENCE

**Your Target**: `/home/mahdi/Desktop/bibliography/editor_backend/services/bibliography-service/` (partially scaffolded)

---

## Tech Stack (MUST MATCH EDITOR)

```json
{
  "runtime": "Node.js 22+",
  "framework": "Express 4.x",
  "language": "TypeScript 5.8",
  "database": "MongoDB (Mongoose 8.x)",
  "cache": "Redis 4.x (optional for Phase 2)",
  "validation": "Joi 17.x (schema validation)",
  "logging": "Winston 3.x (structured logging)",
  "file-upload": "Multer 2.x (multipart/form-data)",
  "testing": "Jest or Vitest (unit + integration)"
}
```

**Why these exact versions?** To match editor backend and enable service reuse.

---

## Where to Find Patterns

### Editor Backend Structure

```
/home/mahdi/Desktop/bibliography/editor_backend/
├── services/
│   ├── auth-service/                    # REFERENCE - Auth patterns
│   │   ├── src/
│   │   │   ├── controllers/             # → COPY controller structure
│   │   │   ├── models/                  # → COPY User model pattern
│   │   │   ├── routes/                  # → COPY route structure
│   │   │   ├── services/
│   │   │   │   ├── SecureJWTTokenService.ts   # JWT patterns
│   │   │   │   └── SecureAuthService.ts       # Auth logic
│   │   │   ├── middleware/
│   │   │   │   ├── validation.ts        # → COPY Joi validation pattern
│   │   │   │   └── auth.ts
│   │   │   ├── utils/
│   │   │   │   └── logger.ts            # → COPY Winston setup
│   │   │   └── index.ts                 # → COPY Express app setup
│   │   └── package.json                 # → COPY dependencies
│   │
│   ├── document-service/                # REFERENCE - File upload patterns
│   │   ├── src/
│   │   │   ├── models/
│   │   │   │   ├── Document.ts          # → COPY Mongoose model pattern
│   │   │   │   └── Project.ts
│   │   │   ├── routes/
│   │   │   │   └── documents.ts         # → COPY Multer usage
│   │   │   └── utils/
│   │   │       └── fileUpload.ts        # → COPY Multer config
│   │   └── package.json
│   │
│   ├── bibliography-service/            # YOUR WORK
│   │   ├── src/
│   │   │   ├── controllers/             # Partially implemented
│   │   │   ├── models/                  # EMPTY - You need to create
│   │   │   ├── routes/                  # Scaffolded - Wire to controllers
│   │   │   ├── services/                # EMPTY - Business logic here
│   │   │   ├── middleware/
│   │   │   │   ├── errorHandler.ts      # EXISTS
│   │   │   │   └── trustGateway.ts      # EXISTS
│   │   │   ├── utils/
│   │   │   │   └── logger.ts            # EXISTS
│   │   │   └── index.ts                 # EXISTS - Express setup
│   │   └── package.json                 # EXISTS - Dependencies listed
│   │
│   └── api-gateway/                     # REFERENCE - Routing & auth
│       └── (gateway configuration)
│
└── docker-compose.yml                   # All services orchestration
```

### What to Copy Directly

**1. Logger Setup**
- **File**: `editor_backend/services/auth-service/src/utils/logger.ts`
- **Copy**:
  - Winston configuration
  - Log levels (error, warn, info, debug)
  - JSON formatting
  - File transports
- **Use**: Import in every file that needs logging

**2. Mongoose Model Pattern**
- **File**: `editor_backend/services/auth-service/src/models/User.ts` or `document-service/src/models/Document.ts`
- **Copy**:
  - Schema structure
  - Timestamps (createdAt, updatedAt)
  - Indexes
  - Virtual fields
  - Static methods
- **Adapt**: Create Reference, Collection, Tag, ProjectLink, DuplicateCandidate models

**3. Route Structure**
- **File**: `editor_backend/services/document-service/src/routes/documents.ts`
- **Copy**:
  - Express Router setup
  - Route definitions (GET, POST, PATCH, DELETE)
  - Middleware chaining (validation → controller)
  - Error handling (try-catch → next(error))
- **Adapt**: Create routes for references, collections, tags, projects, duplicates

**4. Controller Pattern**
- **File**: `editor_backend/services/auth-service/src/controllers/*`
- **Copy**:
  - Request/response handling
  - Service layer calls
  - Response format (`{ data, message, success }`)
  - Error throwing
- **Adapt**: Create controllers for bibliography domain

**5. Validation (Joi)**
- **File**: `editor_backend/services/auth-service/src/middleware/validation.ts`
- **Copy**:
  - Joi schema definitions
  - Validation middleware factory
  - Error formatting
- **Adapt**: Create schemas for Reference, Collection, Tag creation/update

**6. Multer File Upload**
- **File**: `editor_backend/services/document-service/src/utils/fileUpload.ts` or routes using multer
- **Copy**:
  - Multer configuration (dest, limits, fileFilter)
  - Single file upload pattern
  - File validation (MIME type, size)
- **Adapt**: PDF upload for references (single file, .pdf only, max 10MB)

**7. Trust Gateway Middleware**
- **File**: `editor_backend/services/bibliography-service/src/middleware/trustGateway.ts` (already exists)
- **Use**: Already implemented, trusts `x-user-id` header from API Gateway
- **No changes needed**: This follows editor pattern

**8. Error Handler**
- **File**: `editor_backend/services/bibliography-service/src/middleware/errorHandler.ts` (already exists)
- **Use**: Already implemented, centralized error handling
- **No changes needed**: This follows editor pattern

---

## Zotero Backend Patterns (Reference Only)

### Where to Look in Zotero

```
/home/mahdi/Desktop/bibliography/zotero/chrome/content/zotero/xpcom/
├── duplicates.js            # CRITICAL - Duplicate detection algorithm
├── data/
│   ├── item.js              # Item CRUD operations
│   ├── items.js             # Bulk operations
│   ├── collection.js        # Collection operations
│   └── search.js            # Search query building
├── fulltext.js              # PDF text extraction (Phase 2)
├── translation/
│   └── translate_item.js    # Import/export translators
└── recognizeDocument.js     # DOI recognition
```

### What to Learn from Zotero

**Duplicate Detection** (`duplicates.js`):
- **Algorithm** (lines 194-402):
  1. ISBN match (exact, cleaned)
  2. DOI match (case-insensitive)
  3. Title + Creator match:
     - Normalize title (lowercase, remove punctuation, remove diacritics)
     - Match if exact title + ≥1 creator (lastName + firstInitial)
     - Verify no conflicting DOIs/ISBNs
     - Verify years within ±1 if both present
- **Data Structure**: Disjoint Set Forest (Union-Find) for grouping
- **Your Implementation**: Simpler approach - store DuplicateCandidate pairs in MongoDB

**Title Normalization** (for duplicate detection):
```javascript
// From Zotero duplicates.js
function normalizeString(str) {
  str = Zotero.Utilities.removeDiacritics(str)
    .replace(/[ !-/:-@[-`{-~]+/g, ' ') // Remove punctuation
    .trim()
    .toLowerCase()
  return str
}
```

**Data Model** (`resource/schema/userdata.sql`):
- References stored in `items` table (SQLite)
- Field values deduplicated in `itemDataValues` table (not needed in MongoDB)
- Collections support parent/child via `parentCollectionID`
- Tags are global, linked to items via `itemTags` junction table
- See `zotero.md` for full schema details

**Import/Export** (`translation/translate_item.js`):
- Zotero uses complex "translator" system (JavaScript modules)
- **Your approach**: Simpler parsers (BibTeX regex, CSL JSON native, RIS line-by-line)
- **Crossref DOI**: Direct API call to `https://api.crossref.org/works/{doi}`

**Search** (`data/search.js`):
- Zotero builds dynamic SQL queries
- **Your approach**: MongoDB aggregation pipeline with $match, $text, $regex operators

---

## Data Models (from Spec.md)

### Core Models to Implement

**1. Reference** (primary model)
```typescript
interface Reference {
  _id: ObjectId
  userId: string                    // Owner
  type: 'article' | 'book' | 'chapter' | 'conference' | 'thesis' | 'other'
  title: string                     // REQUIRED
  authors: Array<{                  // Optional
    given: string
    family: string
    full: string
  }>
  year: number                      // Optional
  venue: string                     // Journal/conference name
  doi: string                       // Optional
  url: string                       // Optional
  abstract: string                  // Phase 2
  tags: string[]                    // Array of tag names
  collectionIds: ObjectId[]         // Array of collection IDs
  pdf: {                            // Single PDF (MVP)
    storedPath: string
    originalName: string
    size: number
    mimeType: string
    uploadedAt: Date
  } | null
  sourceRaw: {                      // Import provenance
    provider: 'doi' | 'bibtex' | 'csl-json' | 'ris' | 'manual'
    payload: any                    // Original metadata
  }
  deleted: boolean                  // Soft delete flag
  deletedAt: Date | null
  createdAt: Date                   // Mongoose timestamps
  updatedAt: Date
}
```

**2. Collection** (hierarchy)
```typescript
interface Collection {
  _id: ObjectId
  userId: string
  name: string
  parentId: ObjectId | null         // For nesting
  position: number                  // Manual ordering within parent
  createdAt: Date
  updatedAt: Date
}
```

**3. Tag** (global per user)
```typescript
interface Tag {
  _id: ObjectId
  userId: string
  name: string                      // Unique per user
  color: string | null              // Hex color, max 9 colored tags
  position: number | null           // 1-9 for colored tags (keyboard shortcut)
  automatic: boolean                // From translators vs user-created
  createdAt: Date
  updatedAt: Date
}
```

**4. ProjectLink** (bibliography-specific)
```typescript
interface ProjectLink {
  _id: ObjectId
  projectId: string                 // From editor's project service
  collectionId: ObjectId            // Link to our collection
  userId: string
  createdAt: Date
}
```

**5. DuplicateCandidate** (duplicate tracking)
```typescript
interface DuplicateCandidate {
  _id: ObjectId
  userId: string
  existingReferenceId: ObjectId
  duplicateReferenceId: ObjectId
  matchReason: 'isbn' | 'doi' | 'title-creator'
  confidence: number                // 0-1 score
  resolved: boolean                 // User resolved?
  resolution: 'keep-existing' | 'merge' | 'keep-both' | null
  resolvedAt: Date | null
  createdAt: Date
}
```

### Indexes (Performance)

**Reference**:
- `{ userId: 1, deleted: 1 }` - List user's references
- `{ userId: 1, collectionIds: 1 }` - Filter by collection
- `{ userId: 1, tags: 1 }` - Filter by tag
- `{ doi: 1 }` - Duplicate detection (DOI match)
- `{ title: 'text', abstract: 'text' }` - Full-text search

**Collection**:
- `{ userId: 1, parentId: 1, position: 1 }` - Tree traversal

**Tag**:
- `{ userId: 1, name: 1 }` - Unique constraint
- `{ userId: 1, color: 1 }` - Find colored tags

**DuplicateCandidate**:
- `{ userId: 1, resolved: 1 }` - List pending duplicates

---

## API Endpoints (from Spec.md)

### Routes Structure

```typescript
// src/routes/index.ts
import express from 'express'
import referencesRouter from './references'
import collectionsRouter from './collections'
import tagsRouter from './tags'
import projectsRouter from './projects'
import duplicatesRouter from './duplicates'
import searchRouter from './search'
import healthRouter from './health'

const router = express.Router()

router.use('/references', referencesRouter)
router.use('/collections', collectionsRouter)
router.use('/tags', tagsRouter)
router.use('/projects', projectsRouter)
router.use('/duplicates', duplicatesRouter)
router.use('/search', searchRouter)
router.use('/health', healthRouter)

export default router
```

### Key Endpoints to Implement

**References**:
- `GET /references` - List (filter by collectionId, tags, deleted)
- `GET /references/:id` - Get single
- `POST /references` - Create (trigger duplicate check)
- `PATCH /references/:id` - Update
- `DELETE /references/:id` - Soft delete (set deleted: true)
- `PATCH /references/:id/restore` - Restore from trash
- `POST /references/import-doi` - Import from DOI (Crossref API)
- `POST /references/import-bibtex` - Import from BibTeX string
- `POST /references/import-csl-json` - Import from CSL JSON
- `POST /references/import-ris` - Import from RIS
- `POST /references/:id/pdf` - Upload PDF (multipart/form-data)
- `GET /references/:id/pdf` - Download PDF

**Collections**:
- `GET /collections` - List (tree structure, sorted by position)
- `POST /collections` - Create
- `PATCH /collections/:id` - Update (rename, move)
- `DELETE /collections/:id` - Delete (cascade to children)

**Tags**:
- `GET /tags` - List all user tags with counts
- `POST /tags` - Create
- `PATCH /tags/:name` - Rename
- `DELETE /tags/:name` - Delete (remove from all references)
- `PATCH /tags/:name/color` - Assign/remove color

**Projects**:
- `GET /projects` - List projects (from editor's project service via gateway)
- `GET /projects/:id/collections` - Get linked collections
- `POST /projects/:id/link-collection` - Link collection to project
- `DELETE /projects/:id/unlink-collection/:collectionId` - Unlink
- `GET /projects/:id/references` - Get all references from linked collections

**Duplicates**:
- `GET /duplicates` - List pending duplicate pairs
- `POST /duplicates/resolve` - Resolve (keep-existing, merge, keep-both)

**Search**:
- `GET /search?q=...&authors=...&yearMin=...&yearMax=...&venues=...&tags=...` - Search with filters

**Export**:
- `POST /export/bibtex` - Export references to BibTeX (body: referenceIds[])

---

## Service Layer Pattern

### Separation of Concerns

**Controllers** (`src/controllers/`):
- Handle HTTP request/response
- Validate input (Joi schemas)
- Call service layer
- Format response
- Catch errors, pass to error handler

**Services** (`src/services/`):
- Business logic
- Database operations (Mongoose models)
- External API calls (Crossref, etc.)
- No HTTP knowledge (no req/res)

**Example**:

```typescript
// src/controllers/ReferenceController.ts
export class ReferenceController {
  async createReference(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string // From gateway
      const data = req.body

      const reference = await ReferenceService.create(userId, data)

      // Trigger duplicate detection (async, don't block)
      DuplicateService.detectForReference(reference._id).catch(err =>
        logger.error('Duplicate detection failed', { err, referenceId: reference._id })
      )

      res.status(201).json({
        success: true,
        data: reference,
        message: 'Reference created successfully'
      })
    } catch (error) {
      next(error)
    }
  }
}

// src/services/ReferenceService.ts
export class ReferenceService {
  static async create(userId: string, data: CreateReferenceInput): Promise<Reference> {
    // Build full name for authors
    const authors = data.authors?.map(a => ({
      ...a,
      full: `${a.family}, ${a.given || ''}`
    }))

    const reference = await Reference.create({
      ...data,
      userId,
      authors,
      deleted: false
    })

    logger.info('Reference created', { userId, referenceId: reference._id })
    return reference
  }
}
```

---

## Duplicate Detection Implementation

### Algorithm (from zotero.md)

**Stage 1: ISBN Match** (for books)
```typescript
async function detectByISBN(isbn: string, userId: string): Promise<DuplicateCandidate[]> {
  const cleanISBN = isbn.replace(/[^0-9X]/gi, '').toUpperCase()

  const existing = await Reference.find({
    userId,
    isbn: cleanISBN,
    deleted: false
  })

  // Create DuplicateCandidate for each match
  return existing.map(ref => createCandidate(ref, 'isbn', 1.0))
}
```

**Stage 2: DOI Match**
```typescript
async function detectByDOI(doi: string, userId: string): Promise<DuplicateCandidate[]> {
  const cleanDOI = doi.trim().toUpperCase()

  const existing = await Reference.find({
    userId,
    doi: cleanDOI,
    deleted: false
  })

  return existing.map(ref => createCandidate(ref, 'doi', 1.0))
}
```

**Stage 3: Title + Creator Match**
```typescript
function normalizeTitle(title: string): string {
  // Remove diacritics (use library like 'diacritics' or custom)
  let normalized = removeDiacritics(title)
  // Remove punctuation
  normalized = normalized.replace(/[ !-/:-@[-`{-~]+/g, ' ')
  // Lowercase and trim
  return normalized.trim().toLowerCase()
}

async function detectByTitleCreator(
  title: string,
  authors: Author[],
  year: number | null,
  userId: string
): Promise<DuplicateCandidate[]> {
  const normalizedTitle = normalizeTitle(title)

  // Find references with same normalized title
  const candidates = await Reference.find({
    userId,
    deleted: false,
    $where: `normalizeTitle(this.title) === '${normalizedTitle}'` // Or use aggregation
  })

  // Filter by creator match
  const matches = candidates.filter(ref => {
    // Check if at least one creator matches (lastName + firstInitial)
    const hasCreatorMatch = authors.some(newAuthor =>
      ref.authors.some(existingAuthor =>
        existingAuthor.family === newAuthor.family &&
        existingAuthor.given?.[0] === newAuthor.given?.[0]
      )
    )

    if (!hasCreatorMatch) return false

    // Check year tolerance (within ±1)
    if (year && ref.year && Math.abs(ref.year - year) > 1) return false

    // Check no conflicting DOIs
    if (newReference.doi && ref.doi && newReference.doi !== ref.doi) return false

    return true
  })

  return matches.map(ref => createCandidate(ref, 'title-creator', 0.9))
}
```

**Automatic Trigger** (on reference creation):
```typescript
// In ReferenceController.createReference (after creation)
DuplicateService.detectForReference(reference._id)
  .catch(err => logger.error('Duplicate detection failed', { err, referenceId }))
```

---

## Import/Export Implementation

### Crossref DOI Import

```typescript
// src/services/CrossrefService.ts
import axios from 'axios'

export class CrossrefService {
  static async fetchByDOI(doi: string): Promise<any> {
    const url = `https://api.crossref.org/works/${doi}`
    const response = await axios.get(url)

    const data = response.data.message

    // Map Crossref JSON to our Reference schema
    return {
      type: this.mapType(data.type),
      title: data.title?.[0] || '',
      authors: data.author?.map((a: any) => ({
        given: a.given,
        family: a.family,
        full: `${a.family}, ${a.given || ''}`
      })) || [],
      year: data.issued?.['date-parts']?.[0]?.[0],
      venue: data['container-title']?.[0],
      doi: data.DOI,
      url: data.URL,
      sourceRaw: {
        provider: 'doi',
        payload: data
      }
    }
  }

  private static mapType(crossrefType: string): string {
    const mapping: Record<string, string> = {
      'journal-article': 'article',
      'book': 'book',
      'book-chapter': 'chapter',
      'proceedings-article': 'conference',
      // ... more mappings
    }
    return mapping[crossrefType] || 'other'
  }
}
```

### BibTeX Export (Simple Template)

```typescript
// src/services/BibTeXExporter.ts
export class BibTeXExporter {
  static export(references: Reference[]): string {
    return references.map(ref => this.formatEntry(ref)).join('\n\n')
  }

  private static formatEntry(ref: Reference): string {
    const authors = ref.authors.map(a => a.full).join(' and ')
    const key = this.generateKey(ref)

    return `@${ref.type}{${key},
  title = {${ref.title}},
  author = {${authors}},
  year = {${ref.year || ''}},
  journal = {${ref.venue || ''}},
  doi = {${ref.doi || ''}},
  url = {${ref.url || ''}}
}`
  }

  private static generateKey(ref: Reference): string {
    const firstAuthor = ref.authors[0]?.family || 'unknown'
    const year = ref.year || 'nodate'
    const titleWord = ref.title.split(' ')[0].toLowerCase()
    return `${firstAuthor}${year}${titleWord}`
  }
}
```

---

## Testing Strategy

### Unit Tests (Services)

```typescript
// tests/unit/ReferenceService.test.ts
import { ReferenceService } from '../../src/services/ReferenceService'
import { Reference } from '../../src/models/Reference'

describe('ReferenceService', () => {
  describe('create', () => {
    it('creates reference with full author names', async () => {
      const data = {
        title: 'Test Paper',
        authors: [{ given: 'John', family: 'Smith' }]
      }

      const ref = await ReferenceService.create('user-123', data)

      expect(ref.authors[0].full).toBe('Smith, John')
      expect(ref.userId).toBe('user-123')
      expect(ref.deleted).toBe(false)
    })
  })
})
```

### Integration Tests (API Endpoints)

```typescript
// tests/integration/references.test.ts
import request from 'supertest'
import app from '../../src/index'

describe('POST /api/bibliography/references', () => {
  it('creates reference and returns 201', async () => {
    const response = await request(app)
      .post('/api/bibliography/references')
      .set('x-user-id', 'user-123')
      .send({
        type: 'article',
        title: 'Test Paper',
        authors: [{ given: 'John', family: 'Smith' }],
        year: 2024
      })

    expect(response.status).toBe(201)
    expect(response.body.success).toBe(true)
    expect(response.body.data.title).toBe('Test Paper')
  })

  it('returns 400 if title missing', async () => {
    const response = await request(app)
      .post('/api/bibliography/references')
      .set('x-user-id', 'user-123')
      .send({ type: 'article' })

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('title')
  })
})
```

---

## Common Patterns

### Error Handling

```typescript
// Custom error classes
export class NotFoundError extends Error {
  statusCode = 404
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends Error {
  statusCode = 400
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Usage in service
static async getById(id: string, userId: string): Promise<Reference> {
  const ref = await Reference.findOne({ _id: id, userId })
  if (!ref) {
    throw new NotFoundError(`Reference ${id} not found`)
  }
  return ref
}
```

### Validation (Joi)

```typescript
// src/schemas/reference.schema.ts
import Joi from 'joi'

export const createReferenceSchema = Joi.object({
  type: Joi.string().valid('article', 'book', 'chapter', 'conference', 'thesis', 'other').required(),
  title: Joi.string().min(1).required(),
  authors: Joi.array().items(Joi.object({
    given: Joi.string().allow('').optional(),
    family: Joi.string().allow('').optional()
  })).optional(),
  year: Joi.number().integer().min(1000).max(2100).optional(),
  venue: Joi.string().optional(),
  doi: Joi.string().regex(/^10\.\d{4,}\/\S+$/).optional(),
  url: Joi.string().uri().optional(),
  tags: Joi.array().items(Joi.string()).optional()
})

// Middleware
export const validateRequest = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      })
    }
    next()
  }
}

// Usage in route
router.post('/', validateRequest(createReferenceSchema), ReferenceController.createReference)
```

### Logging

```typescript
// Every file that needs logging
import { logger } from '../utils/logger'

// Log levels
logger.error('Critical error', { err, userId, referenceId })
logger.warn('Potential issue', { reason: 'duplicate DOI' })
logger.info('Operation successful', { userId, action: 'create-reference' })
logger.debug('Debug info', { query, results: results.length })

// Structured logging (all logs are JSON)
{
  "timestamp": "2025-01-08T12:00:00.000Z",
  "level": "info",
  "message": "Reference created",
  "userId": "user-123",
  "referenceId": "ref-456"
}
```

---

## Docker & Environment

### Environment Variables (.env.example)

```env
# Server
PORT=8005
NODE_ENV=development

# Database
MONGODB_URL=mongodb://localhost:27017/bibliography

# Redis (Phase 2)
REDIS_URL=redis://localhost:6379

# Storage
UPLOAD_PATH=./data/bibliography/uploads

# API Gateway
TRUST_GATEWAY_AUTH=true

# External APIs
CROSSREF_API_URL=https://api.crossref.org
```

### Docker (already configured in editor_backend/docker-compose.yml)

Bibliography service is already in the compose file. Just implement the code.

---

## Next Steps

**ImplementationChecklist.md** provides evening-by-evening breakdown. Start with:

**Evening 1**: Data Models
- Create `src/models/Reference.ts` (Mongoose schema)
- Create `src/models/Collection.ts`
- Create `src/models/Tag.ts`
- Create `src/models/ProjectLink.ts`
- Create `src/models/DuplicateCandidate.ts`
- Add indexes

**Evening 2-N**: Follow checklist to implement controllers, services, routes, tests.

---

**Remember**:
- ✅ ALWAYS check editor_backend services for patterns
- ✅ ALWAYS use Winston logger (structured JSON logging)
- ✅ ALWAYS validate input with Joi at route level
- ✅ ALWAYS use service layer (no business logic in controllers)
- ✅ ALWAYS trust gateway auth (`trustGatewayAuth` middleware)
- ✅ ALWAYS check Zotero for algorithm details (duplicate detection, normalization)
- ❌ NEVER skip error handling (try-catch → next(error))
- ❌ NEVER expose internal errors to client (use error middleware)

---

**Last Updated**: 2025-01-08
**Status**: Ready for implementation
**Your First Task**: Create data models in `src/models/`
