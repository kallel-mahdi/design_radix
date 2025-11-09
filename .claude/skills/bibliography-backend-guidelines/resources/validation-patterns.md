# Validation Patterns - Input Validation with Joi

Complete guide to input validation using Joi schemas for robust request validation in bibliography microservice.

## Table of Contents

- [Why Joi?](#why-joi)
- [Basic Joi Patterns](#basic-joi-patterns)
- [Schema Examples for Bibliography](#schema-examples-for-bibliography)
- [Route-Level Validation](#route-level-validation)
- [Controller Validation](#controller-validation)
- [DTO Pattern](#dto-pattern)
- [Error Handling](#error-handling)
- [Advanced Patterns](#advanced-patterns)

---

## Why Joi?

### Benefits for Bibliography Project

**Robust Validation:**
- ✅ Comprehensive validation rules
- ✅ Error message customization
- ✅ Async validation support
- ✅ Schema composition and reuse

**Express Integration:**
- ✅ Easy middleware integration
- ✅ Proven in production backends
- ✅ Excellent documentation
- ✅ Compatible with error handling patterns

**Flexibility:**
- ✅ Custom validation functions
- ✅ Conditional validation (`.when()`)
- ✅ Transform and preprocess data
- ✅ Chainable API

---

## Basic Joi Patterns

### Primitive Types

```typescript
import Joi from 'joi';

// Strings
const nameSchema = Joi.string().required();
const emailSchema = Joi.string().email().required();
const urlSchema = Joi.string().uri().required();
const minLengthSchema = Joi.string().min(3).required();
const maxLengthSchema = Joi.string().max(100).required();
const doiSchema = Joi.string().pattern(/^10\.\d+\/\S+$/).optional();

// Numbers
const pageSchema = Joi.number().integer().positive();
const yearSchema = Joi.number().integer().min(1000).max(2100);
const ratingSchema = Joi.number().min(0).max(5);

// Booleans
const archivedSchema = Joi.boolean().default(false);

// Dates
const dateSchema = Joi.date().iso().required();
const publishedDateSchema = Joi.date().iso().max('now').optional();

// Arrays
const authorsSchema = Joi.array()
    .items(Joi.string().min(1))
    .min(1)
    .required();

const tagsSchema = Joi.array()
    .items(Joi.string().max(50))
    .max(9)  // Max 9 tags like Zotero
    .optional();
```

### Objects

```typescript
// Simple object
const referenceSchema = Joi.object({
    title: Joi.string().required(),
    doi: Joi.string().optional(),
    authors: Joi.array().items(Joi.string()).required(),
});

// Nested objects
const referenceWithMetadataSchema = Joi.object({
    reference: Joi.object({
        title: Joi.string().required(),
        authors: Joi.array().items(Joi.string()).required(),
    }).required(),
    metadata: Joi.object({
        createdAt: Joi.date().required(),
        source: Joi.string().valid('import', 'manual', 'duplicate-detection'),
    }).optional(),
});

// Optional fields
const updateReferenceSchema = Joi.object({
    title: Joi.string().optional(),
    doi: Joi.string().optional(),
    authors: Joi.array().items(Joi.string()).optional(),
});

// Nullable/default fields
const collectionSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow(null).optional(),
    archived: Joi.boolean().default(false),
});
```

---

## Schema Examples for Bibliography

### Reference Creation Schema

```typescript
export const createReferenceSchema = Joi.object({
    title: Joi.string()
        .min(1)
        .max(500)
        .required()
        .messages({
            'string.empty': 'Title cannot be empty',
            'string.max': 'Title must not exceed 500 characters',
        }),

    doi: Joi.string()
        .pattern(/^10\.\d+\/\S+$/)
        .optional()
        .messages({
            'string.pattern.base': 'Invalid DOI format',
        }),

    authors: Joi.array()
        .items(Joi.string().min(1).max(200))
        .min(1)
        .max(100)
        .required()
        .messages({
            'array.min': 'At least one author required',
            'array.max': 'Maximum 100 authors allowed',
        }),

    publishedDate: Joi.date()
        .iso()
        .max('now')
        .optional()
        .messages({
            'date.max': 'Published date cannot be in the future',
        }),

    journal: Joi.string()
        .max(300)
        .optional(),

    volume: Joi.number()
        .integer()
        .positive()
        .optional(),

    issue: Joi.number()
        .integer()
        .positive()
        .optional(),

    pages: Joi.string()
        .pattern(/^\d+(-\d+)?$/)
        .optional()
        .messages({
            'string.pattern.base': 'Invalid page range format (e.g., "1-50")',
        }),

    url: Joi.string()
        .uri()
        .optional(),

    tags: Joi.array()
        .items(Joi.string().max(50))
        .max(9)
        .optional(),
});
```

### Collection Schema

```typescript
export const createCollectionSchema = Joi.object({
    name: Joi.string()
        .min(1)
        .max(255)
        .required()
        .trim()
        .messages({
            'string.empty': 'Collection name required',
        }),

    description: Joi.string()
        .max(1000)
        .optional()
        .trim()
        .allow(null),

    archived: Joi.boolean()
        .default(false),

    references: Joi.array()
        .items(Joi.string().length(24))  // MongoDB ObjectId
        .optional(),
});

export const updateCollectionSchema = Joi.object({
    name: Joi.string()
        .min(1)
        .max(255)
        .optional()
        .trim(),

    description: Joi.string()
        .max(1000)
        .optional()
        .trim()
        .allow(null),

    archived: Joi.boolean().optional(),
});
```

### Duplicate Detection Schema

```typescript
export const detectDuplicatesSchema = Joi.object({
    referenceId: Joi.string()
        .length(24)
        .required()
        .messages({
            'string.length': 'Invalid reference ID',
        }),

    strategy: Joi.string()
        .valid('isbn', 'doi', 'title-author', 'all')
        .default('all')
        .optional(),
});
```

### Import Schema

```typescript
export const importReferencesSchema = Joi.object({
    format: Joi.string()
        .valid('bibtex', 'ris', 'json')
        .required()
        .messages({
            'any.only': 'Unsupported import format',
        }),

    data: Joi.string()
        .required()
        .messages({
            'string.empty': 'No data provided',
        }),

    collectionId: Joi.string()
        .length(24)
        .optional(),

    autoDetectDuplicates: Joi.boolean()
        .default(true),
});
```

---

## Route-Level Validation

### Pattern 1: Inline Validation (Simple Routes)

```typescript
import Joi from 'joi';
import { Router, Request, Response } from 'express';

const createReferenceSchema = Joi.object({
    title: Joi.string().required(),
    authors: Joi.array().items(Joi.string()).required(),
});

const router = Router();

router.post('/references', async (req: Request, res: Response) => {
    try {
        // Validate at route level
        const { error, value } = createReferenceSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Validation failed',
                    details: error.details.map(d => ({
                        field: d.path.join('.'),
                        message: d.message,
                    })),
                },
            });
        }

        // Delegate to controller
        const reference = await referenceController.create(value);
        res.status(201).json({ success: true, data: reference });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
```

**Pros:**
- Quick and simple
- Good for simple routes

**Cons:**
- Validation logic in routes
- Harder to test
- Not reusable

---

## Controller Validation

### Pattern 2: Controller Validation (Recommended)

**File:** `src/validators/referenceSchemas.ts`

```typescript
import Joi from 'joi';

export const createReferenceSchema = Joi.object({
    title: Joi.string().min(1).max(500).required(),
    doi: Joi.string().optional(),
    authors: Joi.array().items(Joi.string()).min(1).required(),
    publishedDate: Joi.date().iso().optional(),
});

export const updateReferenceSchema = Joi.object({
    title: Joi.string().min(1).max(500).optional(),
    doi: Joi.string().optional(),
    authors: Joi.array().items(Joi.string()).optional(),
    publishedDate: Joi.date().iso().optional(),
});

export type CreateReferenceInput = {
    title: string;
    doi?: string;
    authors: string[];
    publishedDate?: Date;
};

export type UpdateReferenceInput = Partial<CreateReferenceInput>;
```

**File:** `src/controllers/ReferenceController.ts`

```typescript
import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { ReferenceService } from '../services/referenceService';
import { createReferenceSchema, updateReferenceSchema } from '../validators/referenceSchemas';

export class ReferenceController extends BaseController {
    constructor(private referenceService: ReferenceService) {
        super();
    }

    async createReference(req: Request, res: Response): Promise<void> {
        try {
            // Validate input
            const { error, value } = createReferenceSchema.validate(req.body);

            if (error) {
                return this.handleValidationError(res, error);
            }

            // Call service
            const reference = await this.referenceService.create(value);
            this.handleSuccess(res, reference, 'Reference created', 201);
        } catch (error) {
            this.handleError(error, res, 'createReference');
        }
    }

    async updateReference(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            // Validate input
            const { error, value } = updateReferenceSchema.validate(req.body);

            if (error) {
                return this.handleValidationError(res, error);
            }

            const reference = await this.referenceService.update(id, value);
            this.handleSuccess(res, reference, 'Reference updated');
        } catch (error) {
            this.handleError(error, res, 'updateReference');
        }
    }
}
```

**BaseController Helper:**

```typescript
export class BaseController {
    handleValidationError(res: Response, error: Joi.ValidationError): void {
        const details = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            type: detail.type,
        }));

        res.status(400).json({
            success: false,
            error: {
                message: 'Validation failed',
                details,
            },
        });
    }

    handleSuccess(res: Response, data: any, message?: string, statusCode: number = 200): void {
        res.status(statusCode).json({
            success: true,
            message: message || 'Operation successful',
            data,
        });
    }

    handleError(error: unknown, res: Response, method: string, statusCode: number = 500): void {
        logger.error(`Error in ${method}`, { error });

        if (statusCode === 400) {
            return res.status(400).json({
                success: false,
                error: { message: 'Bad request' },
            });
        }

        res.status(statusCode).json({
            success: false,
            error: { message: 'Internal server error' },
        });
    }
}
```

**Pros:**
- Clean separation
- Reusable schemas
- Easy to test
- Type-safe

**Cons:**
- More files to manage

---

## DTO Pattern

### Type-Safe Input Objects

```typescript
export interface CreateReferenceDTO {
    title: string;
    doi?: string;
    authors: string[];
    publishedDate?: Date;
}

export interface UpdateReferenceDTO {
    title?: string;
    doi?: string;
    authors?: string[];
    publishedDate?: Date;
}

export interface ReferenceOutput {
    id: string;
    title: string;
    doi?: string;
    authors: string[];
    publishedDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// In service
class ReferenceService {
    async createReference(data: CreateReferenceDTO): Promise<ReferenceOutput> {
        // data is fully typed!
        const reference = await Reference.create(data);
        return this.formatOutput(reference);
    }
}
```

---

## Error Handling

### Joi Error Format

```typescript
try {
    const { error, value } = schema.validate(data);

    if (error) {
        console.log(error.details);
        // [
        //   {
        //     message: '"email" must be a valid email',
        //     path: ['email'],
        //     type: 'string.email',
        //     context: { value: 'invalid', label: 'email', key: 'email' }
        //   }
        // ]
    }
} catch (error) {
    // Handle unexpected errors
}
```

### Custom Error Messages

```typescript
const schema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required',
        }),

    name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.min': 'Name must be at least 2 characters',
            'string.max': 'Name cannot exceed 100 characters',
        }),

    authors: Joi.array()
        .min(1)
        .required()
        .messages({
            'array.min': 'At least one author is required',
        }),
});
```

### Formatted Error Response

```typescript
function formatJoiError(error: Joi.ValidationError) {
    return {
        message: 'Validation failed',
        errors: error.details.map((detail) => ({
            field: detail.path.join('.'),
            message: detail.message,
            type: detail.type,
        })),
    };
}

// In controller
catch (error) {
    if (error && 'isJoi' in error) {
        return res.status(400).json({
            success: false,
            error: formatJoiError(error as Joi.ValidationError),
        });
    }
}

// Response example:
// {
//   "success": false,
//   "error": {
//     "message": "Validation failed",
//     "errors": [
//       {
//         "field": "email",
//         "message": "\"email\" must be a valid email",
//         "type": "string.email"
//       }
//     ]
//   }
// }
```

---

## Advanced Patterns

### Conditional Validation

```typescript
const submissionSchema = Joi.object({
    type: Joi.string()
        .valid('new', 'duplicate')
        .required(),

    referenceId: Joi.string()
        .length(24)
        .when('type', {
            is: 'duplicate',
            then: Joi.required(),
            otherwise: Joi.forbidden(),
        }),

    mergeStrategy: Joi.string()
        .valid('keep-both', 'merge', 'delete')
        .when('type', {
            is: 'duplicate',
            then: Joi.required(),
            otherwise: Joi.forbidden(),
        }),
});
```

### External Validation

```typescript
// Custom validation with async support
const referenceSchema = Joi.object({
    doi: Joi.string()
        .external(async (value) => {
            // Check if DOI already exists
            const existing = await Reference.findOne({ doi: value });
            if (existing) {
                throw new Error('DOI already exists');
            }
        })
        .optional(),
});
```

### Transform & Preprocessing

```typescript
const userSchema = Joi.object({
    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required(),

    name: Joi.string()
        .trim()
        .required(),

    year: Joi.string()
        .pattern(/^\d{4}$/)
        .external(async (value) => {
            // Convert to number after validation
            return parseInt(value, 10);
        })
        .optional(),
});
```

### Schema Composition

```typescript
// Base schemas
const timestampsSchema = Joi.object({
    createdAt: Joi.date().required(),
    updatedAt: Joi.date().required(),
});

const auditSchema = Joi.object({
    createdBy: Joi.string().required(),
    updatedBy: Joi.string().required(),
});

// Compose schemas
const referenceSchema = Joi.object({
    id: Joi.string().required(),
    title: Joi.string().required(),
}).concat(timestampsSchema).concat(auditSchema);

// Extend schemas
const adminReferenceSchema = referenceSchema.keys({
    adminNotes: Joi.string().optional(),
});

// Modify existing schema
const updateReferenceSchema = referenceSchema.fork(
    ['createdAt', 'updatedAt', 'createdBy', 'updatedBy'],
    (schema) => schema.forbidden()
);
```

### Validation Middleware

```typescript
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export function validateBody(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error, value } = schema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Validation failed',
                    details: error.details.map(d => ({
                        field: d.path.join('.'),
                        message: d.message,
                    })),
                },
            });
        }

        req.body = value;
        next();
    };
}

// Usage
router.post('/references',
    validateBody(createReferenceSchema),
    async (req, res) => {
        // req.body is validated!
        const reference = await referenceService.create(req.body);
        res.json({ success: true, data: reference });
    }
);
```

---

## Best Practices

- ✅ Use schemas for all request validation
- ✅ Customize error messages for better UX
- ✅ Use controller-level validation (not route-level)
- ✅ Define schemas in separate validator files
- ✅ Use TypeScript interfaces alongside schemas
- ✅ Validate before passing to services
- ✅ Return standardized error responses
- ✅ Use `external()` for async validation (database checks)
- ✅ Use `trim()` and `lowercase()` for string preprocessing
- ✅ Keep schemas DRY by composing smaller schemas

---

**Related Files:**
- [SKILL.md](SKILL.md) - Main guide
- [routing-and-controllers.md](routing-and-controllers.md) - Using validation in controllers
- [services-and-repositories.md](services-and-repositories.md) - Using DTOs in services
- [async-and-errors.md](async-and-errors.md) - Error handling patterns
