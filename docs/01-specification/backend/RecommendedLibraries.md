# Recommended Libraries for Bibliography Manager

**Last Updated**: 2025-01-08
**Status**: Bibliography Manager - Backend Dependencies Guide

---

## Executive Summary

This document provides a comprehensive guide to recommended libraries for the bibliography manager backend, organized by implementation phase. All recommendations are based on current best practices (2025), active maintenance status, and alignment with the editor backend stack.

**Key Decision**: MVP uses **Joi** for backend validation (matches editor), with **Zod migration planned for Phase 2** to unify validation across frontend and backend.

---

## Table of Contents

1. [MVP Dependencies (Install Now)](#mvp-dependencies)
2. [Phase 1 Dependencies (Security & Performance)](#phase-1-dependencies)
3. [Phase 2 Dependencies (Advanced Features)](#phase-2-dependencies)
4. [Installation Commands](#installation-commands)
5. [Migration Guides](#migration-guides)

---

## MVP Dependencies

### Already Installed (Editor Stack)

These dependencies are already in the editor backend and should be copied to bibliography service:

| Library | Version | Purpose | Editor Status |
|---------|---------|---------|---------------|
| `express` | ^4.19.2 | Web framework | ✅ Used |
| `mongoose` | ^8.0.3 | MongoDB ODM | ✅ Used |
| `inversify` | ^6.0.2 | Dependency injection | ✅ Used |
| `joi` | ^17.11.0 | Request validation | ✅ Used |
| `validator` | ^13.11.0 | String validation (email, URL, etc.) | ✅ Used |
| `helmet` | ^7.1.0 | Security HTTP headers | ✅ Used |
| `cors` | ^2.8.5 | Cross-origin resource sharing | ✅ Used |
| `compression` | ^1.7.4 | Response compression | ✅ Used |
| `winston` | ^3.11.0 | Structured logging | ✅ Used |
| `multer` | ^2.0.0-rc.4 | File upload middleware | ✅ Used (document-service) |
| `dotenv` | ^16.3.1 | Environment variables | ✅ Used |
| `express-rate-limit` | ^7.1.5 | Basic rate limiting | ✅ Used |

### Newly Installed (Bibliography-Specific)

These libraries were installed to address gaps identified in the code review:

#### `fastest-levenshtein` (v1.0.16)
**Purpose**: String similarity for duplicate detection
**Weekly Downloads**: ~10M
**Why**:
- Zotero-style duplicate detection requires fuzzy title matching
- 15.6x faster than hand-rolled implementations for long strings
- Zero dependencies, battle-tested

**Usage**:
```typescript
import { distance } from 'fastest-levenshtein';

const similarity = (str1.length - distance(str1, str2)) / str1.length;
if (similarity > 0.85) {
  // Potential duplicate
}
```

**Files**: `src/services/DuplicateService.ts:178`

---

#### `modern-diacritics` (v3.1.0)
**Purpose**: Normalize international characters for duplicate detection
**Weekly Downloads**: ~100K
**Why**:
- Zotero removes diacritics when comparing titles/authors
- Essential for matching "Müller" with "Muller"
- Modern, actively maintained fork

**Usage**:
```typescript
import { removeDiacritics } from 'modern-diacritics';

const normalized = removeDiacritics('Müller, François')
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, '');
// Result: "muller francois"
```

**Alternative**: Native JS (simpler but less comprehensive)
```typescript
str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
```

**Files**: `src/services/DuplicateService.ts:163`

---

#### `express-mongo-sanitize` (v2.2.0)
**Purpose**: Prevent NoSQL injection attacks
**Weekly Downloads**: ~200K
**Why**:
- Removes `$` and `.` characters from user input
- Critical for MongoDB security
- Both reviews flagged missing input sanitization

**Installation**: Already installed, **not yet wired** (deferred to Phase 1)

**Future Usage** (Phase 1):
```typescript
import mongoSanitize from 'express-mongo-sanitize';

// Add before route handlers
app.use(mongoSanitize());
```

**Files**: Will be added to `src/index.ts` in Phase 1

---

## Phase 1 Dependencies

**Timeline**: Post-MVP security hardening

### Security

#### `DOMPurify` (v3.3.0)
**Purpose**: XSS sanitization for user-generated HTML
**Weekly Downloads**: ~10M
**Phase**: 2+ (when adding notes/rich text features)
**Why**:
- Industry-standard XSS prevention
- Required for rendering abstracts, notes, or any HTML content
- Works in both browser and Node.js (with jsdom)

**Usage**:
```typescript
// Frontend
import DOMPurify from 'dompurify';

const clean = DOMPurify.sanitize(userInput);
```

**Alternative**: `sanitize-html` (v2.13.1) - Server-side focused, more configurable

---

#### `helmet` Advanced Configuration
**Current Status**: Already installed, using defaults
**Phase 1 Enhancement**: Configure CSP, HSTS, permissions policy

**Recommended Configuration**:
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // For Tailwind
      imgSrc: ["'self'", "data:", "https:"],
      frameSrc: ["'self'"], // For PDF iframe
      connectSrc: ["'self'", process.env.API_URL]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

**Files**: `src/index.ts:27`

---

#### `rate-limiter-flexible` (v5.0.3)
**Purpose**: Advanced rate limiting (replaces `express-rate-limit`)
**Weekly Downloads**: ~1.5M
**Phase**: 2 (MVP uses simpler express-rate-limit)
**Why**:
- Supports Redis for distributed rate limiting
- Per-user, per-IP, and per-endpoint limits
- Prevents brute force, DoS attacks

**Usage**:
```typescript
import { RateLimiterRedis } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  points: 100, // requests
  duration: 60, // per 60 seconds
});
```

**Note**: Editor uses simpler `express-rate-limit` (sufficient for MVP)

---

### Performance

#### `compression` Advanced Configuration
**Current Status**: Already installed
**Phase 1 Enhancement**: Configure threshold, filter

**Recommended Configuration**:
```typescript
app.use(compression({
  filter: (req, res) => {
    // Don't compress PDFs, images (already compressed)
    if (req.headers['x-no-compression']) return false;
    if (res.getHeader('Content-Type')?.includes('pdf')) return false;
    return compression.filter(req, res);
  },
  threshold: 1024 // Only compress > 1KB
}));
```

---

## Phase 2 Dependencies

**Timeline**: Post-MVP advanced features

### Validation Unification

#### `Zod` Migration (v3.25.51)
**Purpose**: Unified validation layer (frontend + backend)
**Weekly Downloads**: 47.9M (vs Joi's 13.2M)
**Migration Effort**: 2-4 hours
**Why**:
- Already used in frontend
- Superior TypeScript type inference
- Share schemas between frontend and backend
- Smaller bundle size (~45KB vs Joi's ~100KB)

**Migration Strategy**:
```typescript
// Before (Zod)
const schema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().min(1000).max(2100)
});

// After (Zod)
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1),
  year: z.number().min(1000).max(2100)
});

// Type inference (automatic!)
type CreateReferenceInput = z.infer<typeof schema>;
```

**Middleware**: Use `zod-express-middleware` or `express-zod-safe`

**Migration Steps**:
1. Create `bibliography_common` package
2. Convert schemas from Zod → Zod (mechanical process)
3. Add Zod middleware to Express
4. Update imports in frontend and backend
5. Remove Zod dependency

**Effort Breakdown**:
- Setup shared package: 30 min
- Convert schemas: 1-2 hours (~10 endpoints)
- Add middleware: 30 min
- Update imports: 30 min

---

### Citation Processing

#### `citation-js` (v0.7.20)
**Purpose**: Format-independent citation processing
**Weekly Downloads**: ~25K
**Phase**: 2+ (Settings screen - citation style selection)
**Why**:
- Converts between BibTeX, DOI, CSL-JSON, RIS
- Integrates with citeproc-js for formatted citations
- Modular plugins

**Usage**:
```typescript
import { Cite } from '@citation-js/core';
import '@citation-js/plugin-bibtex';

const citation = await Cite.async(doi);
const bibtex = citation.format('bibtex');
const apa = citation.format('bibliography', {
  format: 'html',
  template: 'apa'
});
```

**Alternative for MVP**: Hand-rolled BibTeX templates (sufficient for Session 7)

---

#### `citeproc` (v2.4.63)
**Purpose**: CSL (Citation Style Language) processor
**Weekly Downloads**: ~35K
**Phase**: 2+ (formatted citations - APA, MLA, Chicago, etc.)
**Why**:
- Powers Zotero's citation formatting
- Supports 10,000+ citation styles via CSL repository
- Works with citation-js

**Note**: MVP hardcodes `plainnat`, `abbrvnat`, `unsrtnat` (no citeproc needed)

---

### Authentication

#### `argon2` (v0.40.3)
**Purpose**: Password hashing (upgrade from bcrypt)
**Weekly Downloads**: ~1M
**Phase**: 3+ (optional security hardening)
**Why**:
- Winner of Password Hashing Competition 2015
- Memory-hard algorithm (GPU/ASIC resistant)
- More secure than bcrypt

**Migration Strategy**:
- Progressive migration (re-hash on login)
- Keep bcrypt for existing passwords
- Use argon2 for new passwords

**Gotcha**: Requires native build tools (C++ compiler)

---

#### `cookie-parser` (v1.4.6)
**Purpose**: Parse cookies for httpOnly JWT storage
**Weekly Downloads**: ~7M
**Phase**: 2 (when migrating from localStorage to httpOnly cookies)
**Why**:
- More secure than localStorage (XSS-proof)
- Required for httpOnly cookie JWT strategy

**Usage**:
```typescript
import cookieParser from 'cookie-parser';

app.use(cookieParser());

// Set httpOnly cookie
res.cookie('token', jwt, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});
```

---

### Error Handling

#### `express-async-errors` (v3.1.1)
**Purpose**: Automatic async error handling
**Weekly Downloads**: ~500K
**Phase**: Optional (MVP uses manual try-catch)
**Why**:
- Eliminates boilerplate try-catch in controllers
- Automatically forwards errors to error middleware

**Usage**:
```typescript
// Just require at top of index.ts
require('express-async-errors');

// Then you can write:
app.get('/', async (req, res) => {
  const data = await someAsyncCall(); // Errors auto-caught
  res.json(data);
});
```

**Note**: Obsolete in Express 5+ (built-in async error handling)

**Alternative**: Manual try-catch (current editor pattern)

---

### Environment Validation

#### `dotenv-safe` (v9.1.0)
**Purpose**: Validate required environment variables
**Weekly Downloads**: ~100K
**Phase**: 2 (devops hardening)
**Why**:
- Reads `.env.example` and ensures all vars exist
- Prevents missing env vars in production

**Usage**:
```typescript
require('dotenv-safe').config({
  example: './.env.example'
});
```

**Alternative**: Zod env validation (more powerful)
```typescript
const envSchema = z.object({
  PORT: z.string().transform(Number),
  MONGODB_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test'])
});

const env = envSchema.parse(process.env);
```

---

## Installation Commands

### MVP (Already Done)
```bash
cd bibliography_backend

# Editor stack dependencies
npm install express@^4.19.2 typescript@^5.8.3 mongoose@^8.0.3
npm install inversify@^6.0.2 joi@^17.11.0 validator@^13.11.0
npm install helmet@^7.1.0 cors@^2.8.5 compression@^1.7.4
npm install winston@^3.11.0 multer@^2.0.0-rc.4 dotenv@^16.3.1
npm install express-rate-limit@^7.1.5

# Bibliography-specific
npm install fastest-levenshtein modern-diacritics express-mongo-sanitize

# Dev dependencies
npm install -D @types/express @types/node @types/compression
npm install -D @types/cors @types/validator @types/multer
npm install -D typescript@^5.8.3 ts-node-dev@^2.0.0
npm install -D jest@^29.7.0 supertest@^7.1.3 mongodb-memory-server@^9.4.0
```

### Phase 1 (Security Hardening)
```bash
npm install dompurify jsdom rate-limiter-flexible sanitize-html
npm install -D eslint-plugin-security
```

### Phase 2 (Advanced Features)
```bash
# Zod migration
npm install zod@^3.25.51 zod-express-middleware
npm uninstall joi @types/joi

# Citation processing
npm install @citation-js/core @citation-js/plugin-bibtex citeproc

# Optional utilities
npm install express-async-errors dotenv-safe argon2 cookie-parser
```

---

## Migration Guides

### Zod → Zod Migration

**Step 1**: Create shared package
```bash
mkdir bibliography_common
cd bibliography_common
npm init -y
npm install zod
```

**Step 2**: Convert schemas (example)

```typescript
// OLD: bibliography_backend/src/validation/schemas.ts
import Zod from 'joi';

export const createReferenceSchema = Joi.object({
  title: Joi.string().required(),
  authors: Joi.array().items(
    Joi.object({
      given: Joi.string().allow(''),
      family: Joi.string().required()
    })
  ),
  year: Joi.number().min(1000).max(2100).optional()
});

// NEW: bibliography_common/src/schemas/reference.ts
import { z } from 'zod';

export const createReferenceSchema = z.object({
  title: z.string().min(1),
  authors: z.array(
    z.object({
      given: z.string().optional(),
      family: z.string().min(1)
    })
  ).optional(),
  year: z.number().min(1000).max(2100).optional()
});

// Auto-generated type!
export type CreateReferenceInput = z.infer<typeof createReferenceSchema>;
```

**Step 3**: Update middleware
```typescript
// OLD: Using Zod middleware
import { validate } from './middleware/validation';
router.post('/', validate(schema), controller.create);

// NEW: Using Zod middleware
import { zodMiddleware } from 'zod-express-middleware';
import { createReferenceSchema } from '@bibliography/common/schemas';

router.post('/', zodMiddleware(createReferenceSchema), controller.create);
```

**Step 4**: Update imports
```typescript
// Frontend: bibliography_frontend/src/features/library/schemas.ts
import { createReferenceSchema } from '@bibliography/common/schemas';

// Backend: bibliography_backend/src/routes/references.ts
import { createReferenceSchema } from '@bibliography/common/schemas';
```

---

### bcrypt → argon2 Migration (Progressive)

```typescript
// User login
const user = await User.findOne({ email });

if (!user.passwordHash.startsWith('$argon2')) {
  // Old bcrypt password
  const valid = await bcrypt.compare(password, user.passwordHash);

  if (valid) {
    // Re-hash with argon2
    const newHash = await argon2.hash(password);
    await User.updateOne({ _id: user._id }, { passwordHash: newHash });
  }
} else {
  // New argon2 password
  const valid = await argon2.verify(user.passwordHash, password);
}
```

---

## Library Comparison Matrix

### Validation

| Feature | Zod | Zod |
|---------|-----|-----|
| TypeScript Inference | ❌ No | ✅ Excellent |
| Bundle Size | ~100KB | ~45KB |
| Browser Compatible | ❌ No | ✅ Yes |
| Weekly Downloads | 13.2M | 47.9M |
| Editor Usage | ✅ Backend | ✅ Frontend |
| **Recommendation** | **MVP** | **Phase 2** |

### Password Hashing

| Feature | bcrypt | argon2 |
|---------|--------|--------|
| Security | Good | Excellent (memory-hard) |
| Speed | Moderate | Slightly slower (by design) |
| GPU Resistance | Moderate | High |
| Native Dependencies | Yes | Yes |
| Editor Usage | ✅ Yes | ❌ No |
| **Recommendation** | **MVP** | **Phase 3** |

### Levenshtein

| Feature | Custom | fast-levenshtein | fastest-levenshtein |
|---------|--------|------------------|---------------------|
| Speed (short strings) | Slow | Moderate | **3.9x faster** |
| Speed (long strings) | Very slow | Slow | **15.6x faster** |
| Dependencies | 0 | 0 | 0 |
| **Recommendation** | ❌ Avoid | ❌ Deprecated | **✅ Use** |

---

## Security Best Practices

### CORS Configuration (Production)

```typescript
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));
```

**Critical**: ❌ NEVER use `origin: '*'` with `credentials: true`

---

### Helmet CSP for PDF Viewer

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      frameSrc: ["'self'"], // Allow iframe for PDF viewer
      objectSrc: ["'self'"], // Allow <object> for PDF embed
      childSrc: ["'self'", "blob:"] // For PDF.js worker
    }
  }
}));
```

---

### Input Sanitization Layers

1. **MongoDB Sanitization** (express-mongo-sanitize)
   - Removes `$`, `.` from input
   - Prevents NoSQL injection

2. **String Validation** (validator)
   - Email, URL, UUID format checks
   - Whitelist-based validation

3. **Schema Validation** (Joi/Zod)
   - Type checking, range validation
   - Required/optional enforcement

4. **HTML Sanitization** (DOMPurify)
   - Only for user-generated HTML
   - Phase 2+ (notes, rich text)

**Apply in order**: MongoDB sanitize → Schema validate → HTML sanitize (if rendering)

---

## Gotchas & Warnings

### 1. Helmet + PDF Viewer
**Issue**: Default CSP blocks PDF iframe
**Fix**: Configure `frameSrc: ["'self'"]`

### 2. fastest-levenshtein vs fast-levenshtein
**Issue**: `fast-levenshtein` now uses `fastest-levenshtein` internally
**Fix**: Use `fastest-levenshtein` directly

### 3. DOMPurify in Node.js
**Issue**: Requires jsdom (large dependency)
**Alternative**: `sanitize-html` (lighter, server-focused)

### 4. argon2 Native Dependencies
**Issue**: Requires C++ compiler
**Fix**: Ensure build tools available in CI/CD

### 5. Zod Middleware Performance
**Issue**: Slight overhead vs Zod (negligible for MVP)
**Fix**: None needed (trade-off for type safety)

### 6. express-mongo-sanitize Limitations
**Warning**: Doesn't prevent all injection types
**Fix**: Still validate with Joi/Zod schemas

---

## Compatibility Matrix

All recommended libraries are compatible with:

- ✅ Node.js 22+
- ✅ Express 4.19.2
- ✅ TypeScript 5.8
- ✅ Mongoose 8.0.3
- ✅ React 19 (frontend libraries)

---

## References

- Express Security Best Practices: https://expressjs.com/en/advanced/best-practice-security.html
- Helmet Documentation: https://helmetjs.github.io/
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Zotero Source Code: `zotero/chrome/content/zotero/xpcom/duplicates.js`
- Editor Backend: `editor_backend/services/auth-service/`

---

**Next Steps**:
1. ✅ MVP libraries installed
2. ⏳ Wire express-mongo-sanitize (Phase 1)
3. ⏳ Configure Helmet CSP (Phase 1)
4. ⏳ Plan Zod migration (Phase 2)
