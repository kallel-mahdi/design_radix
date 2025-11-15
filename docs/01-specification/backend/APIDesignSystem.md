# API Design System

## Overview

This document defines the standard patterns for HTTP API responses, error handling, validation schemas, and endpoint specifications for the bibliography backend service.

**Base URL**: `http://localhost:8005/api/bibliography`
**Protocol**: REST with JSON payloads
**Authentication**: Trusted x-user-id header from API Gateway

---

## Response Formats

### Success Response (2xx)

**Standard Format**:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* payload */ }
}
```

**Examples**:

**GET /references (200 OK)**:
```json
{
  "success": true,
  "message": "References retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "user-123",
      "type": "article",
      "title": "Machine Learning Survey",
      "authors": [
        {"full": "John Smith", "family": "Smith", "given": "John"}
      ],
      "year": 2024,
      "citationKey": "smith2024machineabc",
      "tags": ["important", "to-read"],
      "collectionIds": ["507f1f77bcf86cd799439012"],
      "hasPdf": true,
      "deleted": false,
      "createdAt": "2024-01-08T10:00:00Z",
      "updatedAt": "2024-01-08T10:00:00Z"
    }
  ]
}
```

**POST /references (201 Created)**:
```json
{
  "success": true,
  "message": "Reference created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "user-123",
    "type": "article",
    "title": "Machine Learning Survey",
    "citationKey": "smith2024machineabc",
    "deleted": false,
    "createdAt": "2024-01-08T12:00:00Z",
    "updatedAt": "2024-01-08T12:00:00Z"
  }
}
```

**DELETE /references/:id (204 No Content)**:
- No response body
- Empty response with 204 status code

---

### Error Response (4xx, 5xx)

**Standard Format**:
```json
{
  "success": false,
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": [
    {"field": "fieldName", "message": "Specific validation error"}
  ]
}
```

**Examples**:

**400 Bad Request (Validation Error)**:
```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    {"field": "title", "message": "Title is required"},
    {"field": "type", "message": "Type must be one of: article, book, chapter, conference, thesis, other"}
  ]
}
```

**404 Not Found**:
```json
{
  "success": false,
  "message": "Reference not found",
  "code": "NOT_FOUND",
  "details": []
}
```

**409 Conflict (Duplicate DOI)**:
```json
{
  "success": false,
  "message": "Reference with this DOI already exists",
  "code": "DUPLICATE_DOI",
  "details": [
    {"field": "doi", "message": "10.1234/example already exists in your library"}
  ]
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "message": "Internal server error",
  "code": "INTERNAL_ERROR",
  "details": []
}
```

---

### Paginated Response

**Format**:
```json
{
  "success": true,
  "message": "References retrieved successfully",
  "data": [ /* array of items */ ],
  "pagination": {
    "total": 542,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  }
}
```

**Example**:
```json
{
  "success": true,
  "message": "References retrieved successfully",
  "data": [
    /* 100 reference objects */
  ],
  "pagination": {
    "total": 542,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  }
}
```

**Pagination Parameters** (query string):
- `limit`: Number of items per page (default: 100, max: 1000)
- `offset`: Number of items to skip (default: 0)

---

## HTTP Status Codes

| Code | Usage | Example Scenarios |
|------|-------|------------------|
| **200 OK** | Successful GET, PATCH | Retrieved reference, Updated tag color, Restored reference from trash |
| **201 Created** | Successful POST | Created reference, Created collection, Linked reference to project |
| **204 No Content** | Successful DELETE (no response body) | Soft deleted reference, Permanently deleted collection |
| **400 Bad Request** | Validation error, malformed request | Missing required field, invalid DOI format, max colored tags exceeded |
| **401 Unauthorized** | Missing or invalid authentication | No x-user-id header, malformed user ID |
| **403 Forbidden** | Insufficient permissions (MVP: not used) | Accessing another user's reference (caught by userId scoping) |
| **404 Not Found** | Resource doesn't exist | Reference ID not found, Collection doesn't exist, Tag not found |
| **409 Conflict** | Duplicate resource, constraint violation | Duplicate DOI, Duplicate citation key, Duplicate tag name |
| **500 Internal Server Error** | Server/database error | MongoDB connection failed, Uncaught exception |
| **501 Not Implemented** | Feature planned but not implemented | Merge duplicates action (Phase 1) |
| **502 Bad Gateway** | External API error | Crossref API timeout, Crossref invalid response |

---

## Error Code Taxonomy

| Code | Description | HTTP Status | Example Scenario |
|------|-------------|-------------|------------------|
| `VALIDATION_ERROR` | Input validation failed (Joi) | 400 | Missing required field, invalid format, type mismatch |
| `NOT_FOUND` | Resource not found | 404 | Reference ID doesn't exist, Collection not found |
| `DUPLICATE_DOI` | Reference with same DOI exists | 409 | Creating reference with existing DOI |
| `DUPLICATE_ISBN` | Reference with same ISBN exists | 409 | Creating book with existing ISBN |
| `DUPLICATE_CITATION_KEY` | Citation key collision (rare) | 409 | Generated citation key already in use (auto-retry failed) |
| `DUPLICATE_TAG_NAME` | Tag name already exists | 409 | Renaming tag to existing name |
| `MAX_COLORED_TAGS` | Too many colored tags (limit: 9) | 400 | Trying to assign color to 10th tag |
| `UNAUTHORIZED` | Missing authentication header | 401 | No x-user-id header in request |
| `FORBIDDEN` | Insufficient permissions | 403 | Accessing another user's resource (MVP: should not occur due to userId scoping) |
| `INTERNAL_ERROR` | Server error | 500 | Database connection failed, uncaught exception |
| `EXTERNAL_API_ERROR` | Crossref API failure | 502 | Crossref timeout, invalid DOI lookup |
| `NOT_IMPLEMENTED` | Feature planned but not ready | 501 | Merge duplicates action, offline sync |
| `FILE_UPLOAD_ERROR` | PDF upload failed | 400 | Invalid file type, file too large (>50MB) |
| `CIRCULAR_REFERENCE` | Collection hierarchy loop | 400 | Setting collection parent to itself or descendant |

---

## Joi Validation Schemas

### Reference Creation

**Endpoint**: `POST /api/bibliography/references`

**Schema**:
```typescript
const createReferenceSchema = Joi.object({
  type: Joi.string()
    .valid('article', 'book', 'chapter', 'conference', 'thesis', 'other')
    .required()
    .messages({
      'any.required': 'Reference type is required',
      'any.only': 'Type must be one of: article, book, chapter, conference, thesis, other'
    }),

  title: Joi.string()
    .min(1)
    .required()
    .messages({
      'any.required': 'Title is required',
      'string.empty': 'Title cannot be empty'
    }),

  authors: Joi.array()
    .items(Joi.object({
      given: Joi.string().allow('').optional(),
      family: Joi.string().allow('').optional(),
      full: Joi.string().required()
    }))
    .optional(),

  year: Joi.number()
    .integer()
    .min(1000)
    .max(2100)
    .optional()
    .messages({
      'number.min': 'Year must be at least 1000',
      'number.max': 'Year cannot exceed 2100'
    }),

  venue: Joi.string().optional(),

  doi: Joi.string()
    .regex(/^10\.\d{4,}\/\S+$/)
    .optional()
    .messages({
      'string.pattern.base': 'Invalid DOI format. Must start with "10." followed by registrant code and suffix'
    }),

  isbn: Joi.string()
    .regex(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/)
    .optional()
    .messages({
      'string.pattern.base': 'Invalid ISBN format. Must be valid ISBN-10 or ISBN-13'
    }),

  url: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Invalid URL format'
    }),

  abstract: Joi.string().optional(),

  tags: Joi.array()
    .items(Joi.string())
    .optional(),

  collectionIds: Joi.array()
    .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
    .optional()
    .messages({
      'string.pattern.base': 'Invalid collection ID format. Must be valid MongoDB ObjectId'
    }),

  sourceRaw: Joi.object({
    provider: Joi.string().required(),
    payload: Joi.any().required()
  }).required()
});
```

---

### Reference Update

**Endpoint**: `PATCH /api/bibliography/references/:id`

**Schema**:
```typescript
const updateReferenceSchema = Joi.object({
  title: Joi.string().min(1).optional(),
  authors: Joi.array().items(Joi.object({
    given: Joi.string().allow('').optional(),
    family: Joi.string().allow('').optional(),
    full: Joi.string().required()
  })).optional(),
  year: Joi.number().integer().min(1000).max(2100).optional(),
  venue: Joi.string().optional(),
  doi: Joi.string().regex(/^10\.\d{4,}\/\S+$/).optional(),
  isbn: Joi.string().regex(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/).optional(),
  url: Joi.string().uri().optional(),
  abstract: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  collectionIds: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).optional()
}).min(1); // At least one field required
```

---

### Collection Create

**Endpoint**: `POST /api/bibliography/collections`

**Schema**:
```typescript
const createCollectionSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .required()
    .messages({
      'any.required': 'Collection name is required',
      'string.empty': 'Collection name cannot be empty'
    }),

  parentId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .allow(null)
    .optional()
    .messages({
      'string.pattern.base': 'Invalid parent ID format. Must be valid MongoDB ObjectId'
    }),

  color: Joi.string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Invalid color format. Must be hex color code (e.g., #FF5733)'
    })
});
```

---

### Collection Update

**Endpoint**: `PATCH /api/bibliography/collections/:id`

**Schema**:
```typescript
const updateCollectionSchema = Joi.object({
  name: Joi.string().min(1).optional(),
  parentId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null).optional(),
  color: Joi.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
}).min(1);
```

---

### Tag Create

**Endpoint**: `POST /api/bibliography/tags`

**Schema**:
```typescript
const createTagSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .required()
    .messages({
      'any.required': 'Tag name is required',
      'string.empty': 'Tag name cannot be empty'
    }),

  color: Joi.string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .allow(null)
    .optional()
    .messages({
      'string.pattern.base': 'Invalid color format. Must be hex color code (e.g., #FF5733)'
    })
});
```

---

### Tag Set Color

**Endpoint**: `PATCH /api/bibliography/tags/:name/color`

**Schema**:
```typescript
const setTagColorSchema = Joi.object({
  color: Joi.string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .allow(null)
    .required()
    .messages({
      'any.required': 'Color is required (use null to remove color)',
      'string.pattern.base': 'Invalid color format. Must be hex color code or null'
    })
});
```

---

### Search Query

**Endpoint**: `POST /api/bibliography/search`

**Schema**:
```typescript
const searchQuerySchema = Joi.object({
  text: Joi.string().optional(),

  collectionId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),

  tags: Joi.array()
    .items(Joi.string())
    .optional(),

  type: Joi.string()
    .valid('article', 'book', 'chapter', 'conference', 'thesis', 'other')
    .optional(),

  deleted: Joi.boolean()
    .optional()
    .default(false),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .optional()
    .default(100),

  offset: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0)
});
```

---

### Duplicate Resolution

**Endpoint**: `POST /api/bibliography/duplicates/resolve`

**Schema**:
```typescript
const resolveDuplicateSchema = Joi.object({
  candidateId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'any.required': 'Candidate ID is required',
      'string.pattern.base': 'Invalid candidate ID format'
    }),

  action: Joi.string()
    .valid('keep-existing', 'keep-both', 'merge')
    .required()
    .messages({
      'any.required': 'Action is required',
      'any.only': 'Action must be one of: keep-existing, keep-both, merge'
    })
});
```

---

## Endpoint Specifications

### References

#### POST /api/bibliography/references

**Purpose**: Create a new reference

**Request Headers**:
- `Content-Type: application/json`
- `x-user-id: <user-id>` (required, from API Gateway)

**Request Body**: `CreateReferenceInput` (see Joi schema above)

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "Reference created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "user-123",
    "type": "article",
    "title": "Machine Learning Survey",
    "authors": [{"full": "John Smith", "family": "Smith", "given": "John"}],
    "year": 2024,
    "citationKey": "smith2024machineabc",
    "tags": [],
    "collectionIds": [],
    "hasPdf": false,
    "deleted": false,
    "sourceRaw": {"provider": "manual", "payload": {}},
    "createdAt": "2024-01-08T12:00:00Z",
    "updatedAt": "2024-01-08T12:00:00Z"
  }
}
```

**Error Responses**:
- **400 VALIDATION_ERROR**: Missing title or invalid type
- **401 UNAUTHORIZED**: Missing x-user-id header
- **409 DUPLICATE_DOI**: Reference with same DOI exists

**Example curl**:
```bash
curl -X POST http://localhost:8005/api/bibliography/references \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-123" \
  -d '{
    "type": "article",
    "title": "Machine Learning Survey",
    "authors": [{"full": "John Smith", "family": "Smith", "given": "John"}],
    "year": 2024,
    "doi": "10.1234/example",
    "sourceRaw": {"provider": "manual", "payload": {}}
  }'
```

---

#### GET /api/bibliography/references

**Purpose**: List references with optional filtering

**Request Headers**:
- `x-user-id: <user-id>` (required)

**Query Parameters**:
- `collectionId` (optional) - Filter by collection (MongoDB ObjectId)
- `tags` (optional) - Filter by tags (comma-separated, AND logic)
- `deleted` (optional) - Include trash (true/false, default: false)
- `limit` (optional) - Pagination limit (default: 100, max: 1000)
- `offset` (optional) - Pagination offset (default: 0)

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "References retrieved successfully",
  "data": [
    { /* reference object 1 */ },
    { /* reference object 2 */ }
  ],
  "pagination": {
    "total": 542,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  }
}
```

**Error Responses**:
- **401 UNAUTHORIZED**: Missing x-user-id header
- **400 VALIDATION_ERROR**: Invalid query parameters (e.g., limit > 1000)

**Example curl**:
```bash
# List active references in a collection
curl -X GET "http://localhost:8005/api/bibliography/references?collectionId=507f1f77bcf86cd799439011&deleted=false&limit=50" \
  -H "x-user-id: user-123"

# List trash
curl -X GET "http://localhost:8005/api/bibliography/references?deleted=true" \
  -H "x-user-id: user-123"
```

---

#### GET /api/bibliography/references/:id

**Purpose**: Retrieve a single reference by ID

**Request Headers**:
- `x-user-id: <user-id>` (required)

**URL Parameters**:
- `id` - Reference ObjectId

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Reference retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "user-123",
    "type": "article",
    "title": "Machine Learning Survey",
    "citationKey": "smith2024machineabc",
    // ... full reference object
  }
}
```

**Error Responses**:
- **401 UNAUTHORIZED**: Missing x-user-id header
- **404 NOT_FOUND**: Reference not found or belongs to different user

**Example curl**:
```bash
curl -X GET http://localhost:8005/api/bibliography/references/507f1f77bcf86cd799439011 \
  -H "x-user-id: user-123"
```

---

#### PATCH /api/bibliography/references/:id

**Purpose**: Update reference metadata

**Request Headers**:
- `Content-Type: application/json`
- `x-user-id: <user-id>` (required)

**URL Parameters**:
- `id` - Reference ObjectId

**Request Body**: `UpdateReferenceInput` (partial update)

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Reference updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Updated Title",
    "updatedAt": "2024-01-08T14:00:00Z",
    // ... full updated reference
  }
}
```

**Error Responses**:
- **400 VALIDATION_ERROR**: Invalid update data
- **401 UNAUTHORIZED**: Missing x-user-id header
- **404 NOT_FOUND**: Reference not found

**Example curl**:
```bash
curl -X PATCH http://localhost:8005/api/bibliography/references/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-123" \
  -d '{"title": "Updated Title", "tags": ["revised", "important"]}'
```

---

#### DELETE /api/bibliography/references/:id

**Purpose**: Soft delete reference (move to trash)

**Request Headers**:
- `x-user-id: <user-id>` (required)

**URL Parameters**:
- `id` - Reference ObjectId

**Success Response** (204 No Content):
- Empty response body

**Error Responses**:
- **401 UNAUTHORIZED**: Missing x-user-id header
- **404 NOT_FOUND**: Reference not found

**Example curl**:
```bash
curl -X DELETE http://localhost:8005/api/bibliography/references/507f1f77bcf86cd799439011 \
  -H "x-user-id: user-123"
```

---

#### PATCH /api/bibliography/references/:id/restore

**Purpose**: Restore reference from trash

**Request Headers**:
- `x-user-id: <user-id>` (required)

**URL Parameters**:
- `id` - Reference ObjectId

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Reference restored successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "deleted": false,
    "deletedAt": null,
    // ... full reference
  }
}
```

**Error Responses**:
- **401 UNAUTHORIZED**: Missing x-user-id header
- **404 NOT_FOUND**: Reference not found

**Example curl**:
```bash
curl -X PATCH http://localhost:8005/api/bibliography/references/507f1f77bcf86cd799439011/restore \
  -H "x-user-id: user-123"
```

---

#### DELETE /api/bibliography/references/:id/permanent

**Purpose**: Permanently delete reference (DESTRUCTIVE, cannot be undone)

**Request Headers**:
- `x-user-id: <user-id>` (required)

**URL Parameters**:
- `id` - Reference ObjectId

**Success Response** (204 No Content):
- Empty response body

**Error Responses**:
- **401 UNAUTHORIZED**: Missing x-user-id header
- **404 NOT_FOUND**: Reference not found

**Example curl**:
```bash
curl -X DELETE http://localhost:8005/api/bibliography/references/507f1f77bcf86cd799439011/permanent \
  -H "x-user-id: user-123"
```

---

### Collections

#### POST /api/bibliography/collections

**Purpose**: Create a new collection

**Request Body**: `CreateCollectionInput`

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "Collection created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "user-123",
    "name": "Machine Learning Papers",
    "parentId": null,
    "color": "#3B82F6",
    "deleted": false,
    "createdAt": "2024-01-08T12:00:00Z"
  }
}
```

**Error Responses**:
- **400 VALIDATION_ERROR**: Missing name
- **404 NOT_FOUND**: Parent collection doesn't exist

---

#### GET /api/bibliography/collections

**Purpose**: List all collections (frontend builds tree)

**Query Parameters**:
- `deleted` (optional) - Include deleted (default: false)

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Collections retrieved successfully",
  "data": [
    {"_id": "...", "name": "Machine Learning", "parentId": null, "color": "#3B82F6"},
    {"_id": "...", "name": "Deep Learning", "parentId": "...", "color": null}
  ]
}
```

---

#### PATCH /api/bibliography/collections/:id

**Purpose**: Update collection (rename, move, recolor)

**Request Body**: `UpdateCollectionInput`

**Success Response** (200 OK)

**Error Responses**:
- **400 CIRCULAR_REFERENCE**: Setting parent to itself or descendant
- **404 NOT_FOUND**: Collection or parent not found

---

#### DELETE /api/bibliography/collections/:id

**Purpose**: Soft delete collection

**Success Response** (204 No Content)

---

#### PATCH /api/bibliography/collections/:id/restore

**Purpose**: Restore collection from trash

**Success Response** (200 OK)

---

#### DELETE /api/bibliography/collections/:id/permanent

**Purpose**: Permanently delete collection

**Success Response** (204 No Content)

---

### Tags

#### POST /api/bibliography/tags

**Purpose**: Create a tag (usually auto-created when assigned to reference)

**Request Body**: `CreateTagInput`

**Success Response** (201 Created)

---

#### GET /api/bibliography/tags

**Purpose**: List all tags (sorted by usage count)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {"_id": "...", "name": "important", "color": "#EF4444", "position": 1, "usageCount": 42},
    {"_id": "...", "name": "to-read", "color": null, "position": null, "usageCount": 28}
  ]
}
```

---

#### PATCH /api/bibliography/tags/:name/color

**Purpose**: Assign or remove color from tag

**Request Body**: `{ "color": "#EF4444" }` or `{ "color": null }`

**Success Response** (200 OK)

**Error Responses**:
- **400 MAX_COLORED_TAGS**: Already have 9 colored tags

---

#### PATCH /api/bibliography/tags/:oldName/rename

**Purpose**: Rename tag across all references

**Request Body**: `{ "newName": "critical" }`

**Success Response** (200 OK)

**Error Responses**:
- **409 DUPLICATE_TAG_NAME**: New name already exists

---

#### DELETE /api/bibliography/tags/:name

**Purpose**: Delete tag and remove from all references

**Success Response** (204 No Content)

---

### Search

#### POST /api/bibliography/search

**Purpose**: Full-text search with filters

**Request Body**: `SearchQuery`

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": [
    { /* matching reference 1 */ },
    { /* matching reference 2 */ }
  ],
  "pagination": {
    "total": 23,
    "limit": 100,
    "offset": 0,
    "hasMore": false
  }
}
```

**Example curl**:
```bash
curl -X POST http://localhost:8005/api/bibliography/search \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-123" \
  -d '{
    "text": "machine learning",
    "tags": ["important"],
    "type": "article",
    "limit": 50
  }'
```

---

### Duplicates

#### GET /api/bibliography/duplicates

**Purpose**: List duplicate candidates

**Query Parameters**:
- `status` (optional) - Filter by status: 'pending', 'resolved-keep-both', 'resolved-keep-existing'
- `minConfidence` (optional) - Minimum confidence (0.0-1.0)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "userId": "user-123",
      "reference1Id": { /* full reference object */ },
      "reference2Id": { /* full reference object */ },
      "matchReason": "isbn",
      "confidence": 0.95,
      "status": "pending",
      "createdAt": "2024-01-08T12:00:00Z"
    }
  ]
}
```

---

#### POST /api/bibliography/duplicates/resolve

**Purpose**: Resolve duplicate candidate

**Request Body**: `ResolveDuplicateInput`

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Duplicate resolved successfully",
  "data": {
    "_id": "...",
    "status": "resolved-keep-existing",
    "resolvedAt": "2024-01-08T14:00:00Z"
  }
}
```

**Error Responses**:
- **501 NOT_IMPLEMENTED**: Action 'merge' (Phase 1 feature)

---

### File Upload

#### POST /api/bibliography/references/:id/upload-pdf

**Purpose**: Upload PDF attachment

**Request Headers**:
- `Content-Type: multipart/form-data`
- `x-user-id: <user-id>` (required)

**Request Body**: Multipart form with `file` field

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "PDF uploaded successfully",
  "data": {
    "hasPdf": true,
    "pdf": {
      "originalName": "paper.pdf",
      "size": 2048576,
      "mimeType": "application/pdf",
      "uploadedAt": "2024-01-08T12:00:00Z"
    }
  }
}
```

**Error Responses**:
- **400 FILE_UPLOAD_ERROR**: Invalid file type (not PDF)
- **400 FILE_UPLOAD_ERROR**: File too large (>50MB)
- **404 NOT_FOUND**: Reference not found

**Example curl**:
```bash
curl -X POST http://localhost:8005/api/bibliography/references/507f1f77bcf86cd799439011/upload-pdf \
  -H "x-user-id: user-123" \
  -F "file=@/path/to/paper.pdf"
```

---

#### DELETE /api/bibliography/references/:id/pdf

**Purpose**: Delete PDF attachment

**Success Response** (204 No Content)

---

### Project Links

#### POST /api/bibliography/projects/link

**Purpose**: Link reference to project

**Request Body**: `{ "referenceId": "...", "projectId": "..." }`

**Success Response** (201 Created)

---

#### DELETE /api/bibliography/projects/unlink

**Purpose**: Unlink reference from project

**Request Body**: `{ "referenceId": "...", "projectId": "..." }`

**Success Response** (204 No Content)

---

#### GET /api/bibliography/projects/:projectId/references

**Purpose**: Get all references for a project

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012"
  ]
}
```

---

### Export

#### POST /api/bibliography/export

**Purpose**: Export references to .bib file

**Request Body**: `{ "referenceIds": ["...", "..."] }` or omit for all references

**Success Response** (200 OK):
```
Content-Type: application/x-bibtex
Content-Disposition: attachment; filename="bibliography.bib"

@article{smith2024machineabc,
  title = {Machine Learning Survey},
  author = {John Smith},
  year = {2024},
  doi = {10.1234/example}
}
```

---

## Logging Standards

### Log Levels

| Level | Usage | Examples |
|-------|-------|----------|
| `error` | Exceptions, failures requiring attention | Database connection failed, Crossref API error, Uncaught exception |
| `warn` | Potential issues, deprecations | Duplicate citation key collision (auto-retry), File upload size near limit |
| `info` | Normal operations | Reference created, Collection updated, Tag renamed, Duplicate resolved |
| `debug` | Detailed diagnostic info | Query execution details, Duplicate detection algorithm steps, Citation key generation attempts |

### Structured Log Format (Winston JSON)

```json
{
  "level": "info",
  "message": "Reference created",
  "timestamp": "2024-01-08T12:00:00Z",
  "userId": "user-123",
  "referenceId": "507f1f77bcf86cd799439011",
  "citationKey": "smith2024machineabc",
  "service": "bibliography-service",
  "operation": "create-reference"
}
```

### What to Log

**DO Log**:
- ✅ All create/update/delete operations (info level)
- ✅ External API calls (Crossref) with response time (info level)
- ✅ Errors and exceptions with stack traces (error level)
- ✅ Duplicate detection results (debug level)
- ✅ File upload operations (info level)

**DO NOT Log**:
- ❌ Passwords, auth tokens, sensitive data
- ❌ Full request/response bodies (only log IDs and operation type)
- ❌ Personal identifiable information (PII) unless necessary

### Example Logs

**Reference Creation**:
```json
{
  "level": "info",
  "message": "Reference created",
  "userId": "user-123",
  "referenceId": "507f1f77bcf86cd799439011",
  "citationKey": "smith2024machineabc",
  "type": "article",
  "hasPdf": false
}
```

**Duplicate Detection**:
```json
{
  "level": "info",
  "message": "Duplicate detected",
  "userId": "user-123",
  "referenceId": "507f1f77bcf86cd799439011",
  "duplicateId": "507f1f77bcf86cd799439013",
  "matchReason": "isbn",
  "confidence": 0.95
}
```

**Crossref API Call**:
```json
{
  "level": "info",
  "message": "Crossref API call successful",
  "doi": "10.1234/example",
  "responseTime": 245,
  "cached": false
}
```

**Error**:
```json
{
  "level": "error",
  "message": "Database connection failed",
  "error": "MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017",
  "stack": "Error: MongoNetworkError...",
  "service": "bibliography-service"
}
```

---

## Rate Limiting (Phase 1)

Not implemented in MVP. Planned for Phase 1:
- 1000 requests per hour per user
- 100 Crossref API calls per hour per user
- 10 PDF uploads per hour per user

---

## CORS Configuration

**Allowed Origins** (development):
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative frontend port)

**Allowed Methods**:
- GET, POST, PATCH, DELETE

**Allowed Headers**:
- `Content-Type`, `x-user-id`

**Credentials**: Not used (no cookies)

---

## Security Headers (Helmet)

Applied via `helmet` middleware:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

---

## Health Check

**Endpoint**: `GET /health`

**Response** (200 OK):
```json
{
  "status": "ok",
  "service": "bibliography-service",
  "version": "1.0.0",
  "uptime": 3600,
  "mongodb": "connected"
}
```

**Used by**: Kubernetes liveness/readiness probes, monitoring systems
