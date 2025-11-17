# Bibliography Service

Bibliography manager backend for the Citable platform - a modern, elegant alternative to Zotero designed to integrate with collaborative LaTeX editing.

## Overview

This service provides comprehensive bibliography management functionality including:
- **Reference Management**: CRUD operations for academic references with metadata
- **Collections**: Hierarchical organization of references
- **Tags**: Flexible tagging system with colored tags (Zotero-style)
- **Project Integration**: Link references to LaTeX projects
- **Duplicate Detection**: Automatic detection using ISBN/DOI/title-creator matching
- **PDF Attachments**: Single PDF per reference (MVP constraint)
- **Trash/Restore**: Soft delete with restore functionality

## Tech Stack

- **Runtime**: Node.js 22+
- **Framework**: Express + TypeScript
- **Database**: MongoDB with Mongoose ODM
- **DI Container**: InversifyJS
- **Logging**: Winston
- **File Upload**: Multer
- **Validation**: Joi

## Architecture

This service follows the editor's microservices architecture pattern:
- Trusts API Gateway authentication (via `x-user-id` header)
- Standalone service with own MongoDB database
- DI-based architecture with services/controllers separation
- Comprehensive logging and error handling

## Quick Start

### Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URL and other config
   ```

3. **Start MongoDB**:
   ```bash
   # Using Docker:
   docker run -d -p 27017:27017 --name bibliography-mongo mongo:7
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

   Service will start on http://localhost:8005

5. **Health check**:
   ```bash
   curl http://localhost:8005/health
   ```

### Production (Docker)

1. **Build image**:
   ```bash
   docker build -t bibliography-service:latest .
   ```

2. **Run container**:
   ```bash
   docker run -d \
     -p 8005:8005 \
     -e MONGODB_URL=mongodb://host.docker.internal:27017/bibliography \
     -e TRUST_GATEWAY_AUTH=true \
     --name bibliography-service \
     bibliography-service:latest
   ```

## API Endpoints

### References
- `POST /api/bibliography/references` - Create reference
- `GET /api/bibliography/references` - List references (with filters)
- `GET /api/bibliography/references/:id` - Get reference by ID
- `PATCH /api/bibliography/references/:id` - Update reference
- `DELETE /api/bibliography/references/:id` - Soft delete (move to trash)
- `PATCH /api/bibliography/references/:id/restore` - Restore from trash
- `DELETE /api/bibliography/references/:id/permanent` - Permanent delete

### Collections
- `POST /api/bibliography/collections` - Create collection
- `GET /api/bibliography/collections` - List all collections
- `GET /api/bibliography/collections/:id` - Get collection by ID
- `PATCH /api/bibliography/collections/:id` - Update collection
- `DELETE /api/bibliography/collections/:id` - Delete collection

### Tags
- `POST /api/bibliography/tags` - Create tag
- `GET /api/bibliography/tags` - List all tags
- `PATCH /api/bibliography/tags/:id` - Update tag
- `DELETE /api/bibliography/tags/:id` - Delete tag

### Projects
- `POST /api/bibliography/projects/link` - Link reference to project
- `POST /api/bibliography/projects/unlink` - Unlink reference from project
- `GET /api/bibliography/projects/:projectId/references` - Get project references
- `GET /api/bibliography/projects/references/:referenceId/projects` - Get reference projects

### Duplicates
- `GET /api/bibliography/duplicates` - List unresolved duplicates
- `POST /api/bibliography/duplicates/:id/resolve` - Resolve duplicate

### Health
- `GET /health` - Health check

## Environment Variables

See `.env.example` for all configuration options:

```env
# Application
PORT=8005
NODE_ENV=development

# Database
MONGODB_URL=mongodb://localhost:27017/bibliography

# Storage
UPLOAD_PATH=./data/uploads

# External APIs
CROSSREF_API_URL=https://api.crossref.org

# CORS
FRONTEND_URL=http://localhost:5173

# Authentication
TRUST_GATEWAY_AUTH=false  # Set to true in production
```

## Data Models

### Reference
- Type: article, book, chapter, conference, thesis, other
- Metadata: title, authors, year, venue, DOI, ISBN, URL, abstract
- Auto-generated citation key
- Tags and collections
- Single PDF attachment
- Soft delete support

### Collection
- Hierarchical structure (parent/child)
- Position-based ordering
- User-scoped

### Tag
- User-scoped
- Optional color (for 9 colored tags max, Zotero-style)
- Position for colored tags (1-9)
- Automatic vs. manual tags

### ProjectLink
- Many-to-many relationship between references and projects
- User-scoped

### DuplicateCandidate
- 3-stage matching: ISBN → DOI → Title+Creator
- Confidence score
- Resolution tracking

## Development Guidelines

### Code Patterns

All patterns copied from `editor_backend/services/`:
- **Services**: Business logic, injected via InversifyJS
- **Controllers**: Request/response handling, thin layer
- **Models**: Mongoose schemas with indexes
- **Middleware**: Error handling, auth, validation
- **Logger**: Winston with structured logging

### Adding New Endpoints

1. Add interface method in `src/interfaces/I{Service}.ts`
2. Implement in `src/services/{Service}.ts`
3. Add controller method in `src/controllers/{Controller}.ts`
4. Add route in `src/routes/{resource}.ts`

### Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## Deployment

This service is designed to run:
1. **Standalone** (development): Bypass gateway auth
2. **Behind API Gateway** (production): Trust `x-user-id` header

In production, ensure:
- `TRUST_GATEWAY_AUTH=true`
- MongoDB replica set for production workloads
- Volume mount for `/app/data/uploads` (PDF storage)
- Health check endpoint monitored

## Roadmap

- [ ] Full-text search (MongoDB text index)
- [ ] CrossRef metadata fetching
- [ ] BibTeX/RIS import/export
- [ ] PDF text extraction
- [ ] Citation count tracking
- [ ] Automated backup/restore

## License

MIT

## Contact

Part of the Citable platform - Bibliography manager + collaborative LaTeX editor.
