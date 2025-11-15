---
name: bibliography-backend-guidelines
description: Express/TypeScript backend patterns for bibliography service using Mongoose, Joi validation, and Winston logging. Use when creating routes, controllers, services, repositories, middleware, or working with Express APIs, MongoDB database access, input validation, or error handling. Covers layered architecture, BaseController pattern, error handling, and testing strategies.
---

# Bibliography Backend Development Guidelines

## Quick Reference

| Use this skill when… | Bring this input | You will deliver |
| --- | --- | --- |
| Creating/updating routes, controllers, services | API spec + affected files | Layered Express code (route → controller → service → repository) with Joi + logging |
| Touching Mongoose schemas or repositories | Current schema + data requirements | Models/repositories that follow DI + repository patterns |
| Reviewing middleware/logging/error handling | Gateway contract + failure cases | Middleware stack using Winston, config module, consistent error responses |

## Purpose

Establish consistency and best practices for bibliography microservice using Express/TypeScript/Mongoose patterns.

---

## Tech Stack

- **Express.js** - HTTP routing and middleware
- **TypeScript** - Type safety
- **Mongoose** - MongoDB object modeling
- **Winston** - Structured logging
- **Joi** - Input validation schemas
- **Jest** - Testing framework

---

## When to Use This Skill

Automatically activates when working on:
- Creating or modifying routes, endpoints, APIs
- Building controllers, services, repositories
- Implementing middleware (auth, validation, error handling)
- Database operations with Mongoose
- Input validation with Joi
- Logging with Winston
- Configuration management
- Backend testing and refactoring

---

## Quick Start

### New Backend Feature Checklist

- [ ] **Route**: Clean definition, delegate to controller
- [ ] **Controller**: Extend BaseController
- [ ] **Service**: Business logic with dependency injection
- [ ] **Repository**: Database access (if complex)
- [ ] **Validation**: Joi schema
- [ ] **Logging**: Winston error/info logs
- [ ] **Tests**: Unit + integration tests
- [ ] **Config**: Use environment variables

### New Microservice Checklist

- [ ] Directory structure (matches src/ layout below)
- [ ] Winston logger setup in utils/logger.ts
- [ ] Express app initialization
- [ ] BaseController class
- [ ] Middleware stack (auth via API gateway, validation, error handling)
- [ ] Error boundary middleware
- [ ] Testing framework

---

## Architecture Overview

### Layered Architecture

```
HTTP Request
    ↓
Routes (routing only)
    ↓
Controllers (request handling)
    ↓
Services (business logic)
    ↓
Repositories (data access)
    ↓
Database (Mongoose)
```

**Key Principle:** Each layer has ONE responsibility. Always maintain this separation.

---

## Directory Structure

```
bibliography_backend/src/
├── config/              # Configuration
├── controllers/         # Request handlers
├── services/            # Business logic
├── repositories/        # Data access
├── routes/              # Route definitions
├── middleware/          # Express middleware
├── models/              # Mongoose schemas
├── types/               # TypeScript types
├── validators/          # Joi schemas
├── utils/               # Utilities (logger, errors)
├── tests/               # Test suites
├── app.ts               # Express setup
└── server.ts            # HTTP server
```

**Naming Conventions:**
- Controllers: `PascalCase` - `ReferenceController.ts`
- Services: `camelCase` - `referenceService.ts`
- Routes: `camelCase + Routes` - `referenceRoutes.ts`
- Repositories: `PascalCase + Repository` - `ReferenceRepository.ts`
- Models: `PascalCase` - `Reference.ts`

---

## Core Principles (7 Key Rules)

### 1. Routes Only Route, Controllers Control

```typescript
// ❌ NEVER: Business logic in routes
router.post('/references', async (req, res) => {
    // 200 lines of logic
});

// ✅ ALWAYS: Delegate to controller
router.post('/references', (req, res) =>
    referenceController.createReference(req, res)
);
```

### 2. All Controllers Extend BaseController

```typescript
export class ReferenceController extends BaseController {
    constructor(private referenceService: ReferenceService) {
        super();
    }

    async createReference(req: Request, res: Response): Promise<void> {
        try {
            const reference = await this.referenceService.create(req.body);
            this.handleSuccess(res, reference, 201);
        } catch (error) {
            this.handleError(error, res, 'createReference');
        }
    }
}
```

### 3. All Errors to Winston Logger

```typescript
import logger from '../utils/logger';

try {
    await operation();
} catch (error) {
    logger.error('Operation failed', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
}
```

### 4. Use Config Module, NEVER Direct process.env

```typescript
// ❌ NEVER
const timeout = process.env.TIMEOUT_MS;

// ✅ ALWAYS
import { config } from '../config';
const timeout = config.timeouts.default;
```

### 5. Validate All Input with Joi

```typescript
import Joi from 'joi';

const createReferenceSchema = Joi.object({
    title: Joi.string().required(),
    doi: Joi.string().optional(),
    authors: Joi.array().items(Joi.string()).required(),
    publishedDate: Joi.date().optional()
});

const validated = createReferenceSchema.validate(req.body);
if (validated.error) throw new ValidationError(validated.error.message);
```

### 6. Use Repository Pattern for Data Access

```typescript
// Service → Repository → Mongoose Model
class ReferenceService {
    constructor(private referenceRepository: ReferenceRepository) {}

    async create(data: IReference) {
        return this.referenceRepository.create(data);
    }
}

class ReferenceRepository {
    async create(data: IReference) {
        return Reference.create(data);
    }
}
```

### 7. Comprehensive Testing Required

```typescript
describe('ReferenceService', () => {
    let service: ReferenceService;
    let repository: ReferenceRepository;

    beforeEach(() => {
        repository = mock(ReferenceRepository);
        service = new ReferenceService(repository);
    });

    it('should create reference with valid data', async () => {
        const data = { title: 'Test', authors: ['Author'] };
        const result = await service.create(data);
        expect(result).toBeDefined();
    });
});
```

---

## Common Imports

```typescript
// Express
import express, { Request, Response, NextFunction, Router } from 'express';

// Validation
import Joi, { ObjectSchema } from 'joi';

// Database
import mongoose, { Document, Model, Schema } from 'mongoose';

// Logging
import logger from '../utils/logger';

// Config
import { config } from '../config';

// Middleware
import { authMiddleware } from '../middleware/auth';
import { errorBoundary } from '../middleware/errorBoundary';
import { validateRequest } from '../middleware/validateRequest';
```

---

## Quick Reference

### HTTP Status Codes

| Code | Use Case |
|------|----------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (e.g., duplicate) |
| 500 | Server Error |

### Mongoose Query Patterns

```typescript
// Find
const reference = await Reference.findById(id);
const references = await Reference.find({ archived: false });

// Create
const reference = await Reference.create({ title, authors });

// Update
await Reference.findByIdAndUpdate(id, { title }, { new: true });

// Delete
await Reference.findByIdAndDelete(id);

// Bulk operations
await Reference.insertMany(referencesArray);
```

### Winston Logging Levels

```typescript
logger.error('Critical error occurred', { error, context });
logger.warn('Warning: unusual condition', { data });
logger.info('Operation completed successfully');
logger.debug('Detailed debug information');
```

---

## Anti-Patterns to Avoid

❌ Business logic in routes
❌ Direct process.env usage without config module
❌ Missing error handling
❌ No input validation
❌ Direct Mongoose queries everywhere (use repositories)
❌ console.log instead of Winston logger
❌ Untyped responses

---

## Navigation Guide

| Need to... | Read this |
|------------|-----------|
| Organize business logic | [services-and-repositories.md](services-and-repositories.md) |
| Validate input | [validation-patterns.md](validation-patterns.md) |
| Setup logging | [logging-and-errors.md](logging-and-errors.md) |
| Database access | [database-patterns.md](database-patterns.md) |
| See examples | [complete-examples.md](complete-examples.md) |

---

## Resource Files

### [database-patterns.md](database-patterns.md)
Mongoose models, repositories, transactions, query optimization, document relationships

### [validation-patterns.md](validation-patterns.md)
Joi schemas, request validation, DTO patterns, error handling for validation

### [services-and-repositories.md](services-and-repositories.md)
Service layer patterns, dependency injection, repository pattern, data access organization

### [logging-and-errors.md](logging-and-errors.md)
Winston setup, structured logging, error tracking, debugging strategies

### [complete-examples.md](complete-examples.md)
Full working examples, Mongoose/Joi patterns, refactoring from bad to good

---

## Related Skills

- **bibliography-planning-docs** - Architecture and feature specifications
- **skill-developer** - Meta-skill for creating and managing skills

---

**Skill Status**: COMPLETE ✅
**Line Count**: < 500 ✅
**Progressive Disclosure**: 11 resource files ✅
