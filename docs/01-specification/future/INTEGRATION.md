# Bibliography Manager - Integration Guide

**Purpose**: Document how bibliography_frontend and bibliography_backend integrate with the editor ecosystem.

**Audience**: Editor team, future contributors, DevOps engineers.

---

## Architecture Overview

### Deployment Model: Microservices

The bibliography system follows the **same microservices architecture as the editor**:

```
┌──────────────────────┐
│ bibliography_frontend│  (React 19 + TanStack Router)
│ (Standalone app)     │
└──────────────┬───────┘
               │ HTTP requests
               ▼
┌──────────────────────────────────────┐
│          API Gateway                 │  (Port 3000)
│  - JWT validation                    │
│  - Route mapping                     │
│  - Auth header injection             │
└──────────────┬──────────────────────┘
               │
    ┌──────────┼──────────┐
    ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌──────────────────┐
│ Auth   │ │ Document│ │ Bibliography     │
│Service │ │Service │ │ Service          │
│(8001)  │ │(8002)  │ │ (Port 8005)      │
└────────┘ └────────┘ └──────────────────┘
    │          │          │
    └──────────┼──────────┘
               ▼
         MongoDB Atlas
        (Shared cluster)
```

**Key Points**:
- Each service runs in its own Docker container
- Services communicate **through the API Gateway only** (no direct service-to-service)
- Database is shared MongoDB cluster (separate databases per service)
- Services trust auth headers from gateway (do NOT validate JWT themselves)

---

## Authentication Flow

### MVP: Gateway Trust Model

```
┌─────────────────────────────────────┐
│   bibliography_frontend (React)     │
│   - User logs in via editor auth    │
│   - JWT stored in localStorage      │
└──────────────┬──────────────────────┘
               │ Sends JWT in Authorization header
               │ Authorization: Bearer {jwt}
               ▼
┌─────────────────────────────────────┐
│        API Gateway                  │
│ 1. Validate JWT signature           │
│ 2. Extract userId from JWT          │
│ 3. Strip JWT, inject headers        │
│    - x-user-id: {userId}            │
│    - x-user-email: {email}          │
│    - x-user-roles: {roles}          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  bibliography_backend               │
│  (trustGatewayAuth middleware)      │
│  - Trust x-user-id header           │
│  - No JWT validation                │
│  - No DB lookup for auth            │
└─────────────────────────────────────┘
```

### Implementation Details

**Frontend Side** (`bibliography_frontend/src/common/api/client.ts`):
```typescript
const apiClient = new ApiClient()

// Automatically injects JWT from auth store
class ApiClient {
  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const { tokens } = useAuthStore.getState()

    headers = {
      ...headers,
      Authorization: `Bearer ${tokens.accessToken}`
    }

    return fetch(url, { ...options, headers })
  }
}
```

**Backend Side** (`bibliography_backend/src/middleware/trustGateway.ts`):
```typescript
export const trustGatewayAuth = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'] as string

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Attach to request for use in controllers
  req.user = { userId }
  next()
}
```

**Dev Mode** (`src/common/api/client.ts`, line 54):
```typescript
// For local testing without API Gateway
const authStore = useAuthStore.getState()
const testUser = 'test-user-123'

headers = {
  ...headers,
  'x-user-id': testUser  // Bypass JWT in dev
}
```

### Token Refresh Strategy

**JWT Refresh Flow** (Phase 2):
1. Frontend sends request with expired access token
2. API Gateway returns 401
3. Frontend uses refresh token to get new access token from auth-service
4. Retry original request with new token
5. Backend receives valid token from gateway

---

## API Integration Points

### Bibliography Service URLs

**Production**:
```
API Gateway: https://editor.example.com/api
Bibliography endpoints: https://editor.example.com/api/bibliography/*
```

**Development**:
```
API Gateway: http://localhost:3000/api
Bibliography service: http://localhost:8005/api/bibliography
Bibliography_frontend: http://localhost:5173
```

**Configuration**:
```typescript
// bibliography_frontend/src/common/api/client.ts
const API_BASE_URL = import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:3000/api/bibliography';
const AUTH_SERVICE_URL = import.meta.env['VITE_AUTH_SERVICE_URL'] || 'http://localhost:3000/api/auth';
```

### API Response Format

All bibliography service endpoints return a **standardized envelope structure** for consistent error handling and data access:

**Success Response**:
```typescript
interface ApiResponse<T> {
  success: boolean;        // Always true for successful requests
  message: string;         // Human-readable success message
  data: T;                 // Actual response data (typed)
  pagination?: {           // Present for list endpoints
    total: number;         // Total items in database
    limit: number;         // Items per page
    offset: number;        // Starting position
    hasMore: boolean;      // Whether more pages exist
  };
}
```

**Error Response**:
```typescript
interface ApiError {
  success: false;          // Always false for errors
  message: string;         // Human-readable error message
  code: string;            // Machine-readable error code (e.g., 'VALIDATION_ERROR')
  details?: any;           // Optional error details (validation errors, etc.)
}
```

**Example Success Response**:
```json
{
  "success": true,
  "message": "Reference created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "type": "article",
    "title": "Machine Learning Paper",
    "citationKey": "smith2024machine",
    ...
  }
}
```

**Example Error Response**:
```json
{
  "success": false,
  "message": "Invalid path parameters",
  "code": "VALIDATION_ERROR",
  "details": [
    {"field": "id", "message": "Invalid ObjectId format"}
  ]
}
```

**Request Flow**:
1. Frontend → API Gateway (port 3000)
2. Gateway validates JWT, injects `x-user-id` header
3. Gateway routes to bibliography service (port 8005)
4. Service trusts `x-user-id` header (zero-trust within service)
5. Service returns envelope response
6. Frontend uses `isApiError()` type guard to handle errors

**Frontend Usage**:
```typescript
import { ApiResponse, isApiError } from '@bibliography/shared';

const response = await apiClient.get<Reference>('/references/123');

if (isApiError(response)) {
  // Handle error
  console.error(response.code, response.message);
} else {
  // Access data
  const reference = response.data;
}
```

### Shared Data Models

Backend defines these models that frontend uses:

```typescript
// src/common/types.ts (shared between frontend and backend)

export interface Reference {
  _id: string
  userId: string
  type: 'article' | 'book' | 'chapter' | 'conference' | 'thesis' | 'other'
  title: string
  authors: Author[]
  year?: number
  venue?: string
  doi?: string
  url?: string
  tags: string[]
  collectionIds: string[]
  hasPdf: boolean
  pdfMetadata?: {
    storedPath: string
    originalName: string
    size: number
    mimeType: string
  }
  deleted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Collection {
  _id: string
  userId: string
  name: string
  description?: string
  parentCollectionId?: string
  position: number
  deleted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Tag {
  _id: string
  userId: string
  name: string
  color?: string
  position: number
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  _id: string
  userId: string
  name: string
  description?: string
  collectionIds: string[]
  createdAt: Date
  updatedAt: Date
}
```

**CRITICAL**: Keep these types in sync with backend MongoDB models. When backend schema changes, update frontend types immediately.

### CORS Configuration

**API Gateway** (handles all CORS):
```typescript
// editor_backend/services/api-gateway/src/index.ts

app.use(cors({
  origin: [
    'http://localhost:5173',        // bibliography_frontend dev
    'http://localhost:5174',        // editor_frontend dev
    process.env.PRODUCTION_DOMAIN   // Production domain
  ],
  credentials: true
}))
```

**Bibliography Service**: No CORS config needed (gateway handles it)

**Important**: All HTTP calls go through the gateway. Bibliography service never receives direct requests from browsers.

---

## Database

### Schema Separation

```
MongoDB Cluster
├── Database: editor-auth
│   └── Collections: users, tokens, sessions
├── Database: editor-documents
│   └── Collections: documents, revisions, collaborators
├── Database: editor-latex
│   └── Collections: compilations, artifacts
└── Database: editor-bibliography
    ├── Collections: references, collections, tags, projects, duplicates
    └── Indexes: [userId, doi], [userId, title], etc.
```

**Key Points**:
- Each service has its own database (no cross-service queries)
- MongoDB Atlas connection string in `docker-compose.yml`
- All collections namespaced with `userId` for multi-tenancy
- Soft delete flag (`deleted: true`) instead of physical deletion

### Indexing Strategy

**References** (most queries):
```javascript
// Performance-critical indexes
db.references.createIndex({ userId: 1, deleted: 1 })
db.references.createIndex({ userId: 1, collectionIds: 1 })
db.references.createIndex({ userId: 1, tags: 1 })
db.references.createIndex({ doi: 1 })  // Duplicate detection
db.references.createIndex({ title: "text", abstract: "text" })  // Full-text search
```

**Collections** (tree traversal):
```javascript
db.collections.createIndex({ userId: 1, parentCollectionId: 1, position: 1 })
```

**Tags** (quick lookup):
```javascript
db.tags.createIndex({ userId: 1, name: 1 }, { unique: true })
db.tags.createIndex({ userId: 1, color: 1 })
```

---

## File Storage

### MVP: Local Filesystem

**Storage Location**: `./data/bibliography/uploads/`

**Structure**:
```
data/bibliography/uploads/
├── {userId}_{referenceId}_{timestamp}.pdf
├── {userId}_{referenceId}_{timestamp}.pdf
└── ...
```

**Multer Configuration** (`src/utils/fileUpload.ts`):
```typescript
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './data/bibliography/uploads/')
  },
  filename: (req, file, cb) => {
    const userId = req.headers['x-user-id']
    const timestamp = Date.now()
    cb(null, `${userId}_${timestamp}_${file.originalname}`)
  }
})

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files allowed'))
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
})
```

### Phase 2: AWS S3 Migration

**Future Architecture**:
```typescript
const s3 = new AWS.S3({
  bucket: process.env.S3_BUCKET_NAME,
  region: process.env.AWS_REGION
})

// Replace local storage with S3
await s3.upload({
  Bucket: bucket,
  Key: `${userId}/${referenceId}.pdf`,
  Body: fileBuffer,
  ContentType: 'application/pdf'
}).promise()
```

**Rationale**:
- Local storage works for MVP (easy debugging)
- S3 needed for production (scalable, reliable backup)
- Migration path documented in Roadmap.md

---

## External API Integration

### Crossref DOI Lookup

**Service**: `src/services/CrossrefService.ts`

```typescript
export class CrossrefService {
  static async fetchByDOI(doi: string): Promise<Reference> {
    const url = `https://api.crossref.org/works/${doi}`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'BibliographyManager/1.0 (https://example.com)'
      }
    })

    const data = await response.json()

    // Map Crossref JSON to Reference schema
    return {
      type: this.mapType(data.message.type),
      title: data.message.title?.[0],
      authors: data.message.author?.map(a => ({
        given: a.given,
        family: a.family
      })) || [],
      year: data.message.issued?.['date-parts']?.[0]?.[0],
      venue: data.message['container-title']?.[0],
      doi: data.message.DOI,
      // ... other fields
    }
  }
}
```

**Rate Limiting**:
- Crossref allows ~1000 requests per minute (polite user-agent required)
- No authentication needed
- Phase 2: Implement queue-based rate limiting if needed

### Future API Integrations

**Phase 2+**:
- UnPaywall (open access PDF lookup)
- arXiv (preprint discovery)
- PubMed (biomedical references)
- ORCID (author identification)

---

## Testing Integration

### Local Dev Setup

**Start Services**:
```bash
# Terminal 1: Start MongoDB
docker run -d -p 27017:27017 mongo:latest

# Terminal 2: Start API Gateway + Bibliography Service
cd editor_backend
docker-compose up api-gateway bibliography-service

# Terminal 3: Start Frontend
cd bibliography_frontend
npm run dev
```

**Verify Integration**:
```bash
# Test API Gateway is running
curl http://localhost:3000/health

# Test Bibliography Service
curl -H "x-user-id: test-user" http://localhost:8005/api/bibliography/references

# Test Frontend
open http://localhost:5173
```

### Integration Testing

**Mock Gateway for Tests**:
```typescript
// tests/mocks/gateway.ts
export const mockGatewayHeaders = {
  'x-user-id': 'test-user-123',
  'x-user-email': 'test@example.com',
  'x-user-roles': 'user'
}

// Usage in test
const response = await request(app)
  .get('/references')
  .set(mockGatewayHeaders)
```

**Test Auth Flow**:
```typescript
test('rejects request without x-user-id header', async () => {
  const response = await request(app).get('/references')
  expect(response.status).toBe(401)
})

test('accepts request with x-user-id header', async () => {
  const response = await request(app)
    .get('/references')
    .set('x-user-id', 'user-123')
  expect(response.status).toBe(200)
})
```

---

## Phase 2: Editor Integration Points

### Citation Picker in Editor

**User Flow**:
1. User in editor clicks "Insert Citation"
2. Editor opens iframe/modal showing bibliography search
3. User selects reference(s)
4. Editor inserts citation markers in LaTeX

**API Endpoint**:
```
GET /api/bibliography/references?search=...&collectionId=...&fields=title,authors,year,doi
```

**Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "ref-123",
      "title": "Machine Learning Basics",
      "authors": [{"given": "John", "family": "Smith"}],
      "year": 2024,
      "doi": "10.1234/example"
    }
  ]
}
```

### Project Linking

**API Endpoints**:
```
POST /api/bibliography/projects/{projectId}/link-collection/{collectionId}
DELETE /api/bibliography/projects/{projectId}/unlink-collection/{collectionId}
GET /api/bibliography/projects/{projectId}/references
```

**Use Case**: Link a bibliography collection to an editor document/project, share references across team

---

## Troubleshooting

### Common Issues

**Problem**: Frontend gets 401 from API Gateway
- **Cause**: JWT expired or invalid
- **Solution**: Refresh token, or clear localStorage and re-login

**Problem**: Bibliography Service returns 401
- **Cause**: API Gateway not injecting `x-user-id` header
- **Solution**: Check gateway middleware is running, verify CORS headers

**Problem**: PDF upload fails
- **Cause**: File too large (>10MB) or not PDF
- **Solution**: Validate file size/type on frontend before upload

**Problem**: Duplicate detection not triggering
- **Cause**: Service running async in background
- **Solution**: Check service logs with `docker logs bibliography-service`

**Problem**: References not appearing in frontend
- **Cause**: Wrong database or userId mismatch
- **Solution**: Check `x-user-id` header is being sent, verify MongoDB connection

### Debug Commands

```bash
# Check service is running
docker ps | grep bibliography-service

# View service logs
docker logs -f bibliography-service

# Test API directly
curl -H "x-user-id: test-user" http://localhost:8005/api/bibliography/references

# Check MongoDB
mongosh --uri "mongodb://localhost:27017/editor-bibliography"
db.references.find({userId: 'test-user'}).pretty()

# Check network requests in browser
# DevTools → Network tab → Filter by "bibliography"
```

---

## Documentation

**Related Files**:
- **Spec.md**: Complete feature specification
- **Roadmap.md**: Phased development timeline
- **UnifiedImplementationChecklist.md**: Session-by-session tasks
- **APIDesignSystem.md**: API endpoint details and validation schemas
- **ServiceLayerSpec.md**: Service layer architecture
- **DesignSystem.md**: Frontend UI patterns and colors

**Keep Updated**:
- When adding new API endpoints
- When changing database schema
- When modifying auth flow
- When adding new external API integrations

---

**Last Updated**: November 2025
**Status**: MVP architecture complete, Phase 2 integration in planning
**Next Steps**: Follow UnifiedImplementationChecklist.md for Session 1-20 implementation
