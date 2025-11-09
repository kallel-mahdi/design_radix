# Logging and Error Handling

Complete guide to structured logging with Winston and error handling patterns for bibliography service.

## Table of Contents

- [Core Principles](#core-principles)
- [Winston Logger Setup](#winston-logger-setup)
- [Structured Logging](#structured-logging)
- [Error Handling](#error-handling)
- [Custom Error Classes](#custom-error-classes)
- [Logging Levels](#logging-levels)
- [Best Practices](#best-practices)

---

## Core Principles

**MANDATORY**: All errors and important events MUST be logged. No exceptions.

**Core Rules:**
- ✅ Use structured logging (JSON format)
- ✅ Include context with every log (userId, requestId, operation)
- ✅ Log errors with full stack traces
- ✅ Use appropriate log levels (error, warn, info, debug)
- ✅ Include timestamps and correlation IDs
- ❌ Never log sensitive data (passwords, tokens, emails)
- ❌ Don't use console.log() directly

---

## Winston Logger Setup

### Logger Initialization

**File:** `src/utils/logger.ts`

```typescript
import winston from 'winston';
import path from 'path';

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Create logger instance
export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'bibliography-service' },

    transports: [
        // Console output (all levels)
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ timestamp, level, message, ...meta }) => {
                    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
                    return `${timestamp} [${level}] ${message} ${metaStr}`;
                })
            ),
        }),

        // File transport for all logs
        new winston.transports.File({
            filename: path.join('logs', 'combined.log'),
            maxsize: 10485760, // 10MB
            maxFiles: 5,
        }),

        // Separate error log file
        new winston.transports.File({
            filename: path.join('logs', 'error.log'),
            level: 'error',
            maxsize: 10485760, // 10MB
            maxFiles: 5,
        }),
    ],
});

// Log unhandled exceptions
logger.exceptions.handle(
    new winston.transports.File({ filename: path.join('logs', 'exceptions.log') })
);

// Log unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', {
        reason,
        promise: promise.toString(),
        stack: (reason as any)?.stack,
    });
});
```

### Express Integration

**File:** `src/middleware/loggingMiddleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Generate request ID for correlation
    const requestId = uuidv4();

    // Attach to request for later use
    (req as any).requestId = requestId;

    const start = Date.now();

    // Capture response logging
    res.on('finish', () => {
        const duration = Date.now() - start;

        logger.info('HTTP Request', {
            requestId,
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('user-agent'),
            ip: req.ip,
        });
    });

    next();
};
```

---

## Structured Logging

### Log Entry Components

Each log entry should include:

```typescript
logger.info('Operation completed', {
    requestId: req.requestId,           // Correlation ID
    userId: req.user?.id,               // Who did it
    operation: 'createReference',       // What operation
    resourceId: reference.id,           // What resource
    status: 'success',                  // Result
    duration: endTime - startTime,      // Performance
    changes: {                          // What changed
        title: 'New Paper',
        authors: ['Smith', 'Jones'],
    },
});
```

### Usage Examples

**Successful Operation:**
```typescript
async createReference(req: Request, res: Response) {
    try {
        const validated = referenceSchema.validate(req.body);
        if (validated.error) {
            logger.warn('Validation failed', {
                requestId: req.requestId,
                error: validated.error.message,
                input: req.body,
            });
            return res.status(400).json({ error: validated.error.message });
        }

        const reference = await referenceRepository.create(validated.value);

        logger.info('Reference created', {
            requestId: req.requestId,
            userId: req.user?.id,
            referenceId: reference._id,
            title: reference.title,
            authors: reference.authors.length,
        });

        res.status(201).json(reference);
    } catch (error) {
        logger.error('Failed to create reference', {
            requestId: req.requestId,
            userId: req.user?.id,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            input: req.body,
        });
        res.status(500).json({ error: 'Failed to create reference' });
    }
}
```

**Database Operation:**
```typescript
async findById(id: string): Promise<Reference | null> {
    try {
        const start = Date.now();
        const reference = await Reference.findById(id).lean();
        const duration = Date.now() - start;

        if (duration > 1000) {
            logger.warn('Slow database query', {
                operation: 'Reference.findById',
                referenceId: id,
                duration: `${duration}ms`,
            });
        }

        return reference;
    } catch (error) {
        logger.error('Database query failed', {
            operation: 'Reference.findById',
            referenceId: id,
            error: error instanceof Error ? error.message : 'Unknown error',
            errorCode: (error as any)?.code,
        });
        throw error;
    }
}
```

---

## Error Handling

### Error Middleware

**File:** `src/middleware/errorMiddleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
    statusCode?: number;
    code?: string;
}

export const errorMiddleware = (
    error: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';

    // Log error
    logger.error('Request error', {
        requestId: (req as any).requestId,
        statusCode,
        error: message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        userId: (req as any).userId,
        errorCode: (error as any).code,
    });

    // Send response
    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
};
```

### Global Error Handler Setup

**File:** `src/index.ts`

```typescript
import express from 'express';
import { errorMiddleware } from './middleware/errorMiddleware';
import { loggingMiddleware } from './middleware/loggingMiddleware';
import { logger } from './utils/logger';

const app = express();

// Logging middleware (first)
app.use(loggingMiddleware);

// ... other middleware and routes ...

// Error middleware (last)
app.use(errorMiddleware);

// Handle 404
app.use((req, res) => {
    logger.warn('Route not found', {
        method: req.method,
        path: req.path,
    });
    res.status(404).json({ error: 'Not found' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info('Server started', {
        port: PORT,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});
```

---

## Custom Error Classes

### Error Class Hierarchy

```typescript
// base/AppError.ts
export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number,
        public code?: string
    ) {
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

// Specific error types
export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
    }
}

export class ValidationError extends AppError {
    constructor(message: string = 'Validation failed') {
        super(message, 400, 'VALIDATION_ERROR');
    }
}

export class ConflictError extends AppError {
    constructor(message: string = 'Resource already exists') {
        super(message, 409, 'CONFLICT');
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized') {
        super(message, 401, 'UNAUTHORIZED');
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = 'Forbidden') {
        super(message, 403, 'FORBIDDEN');
    }
}

export class DatabaseError extends AppError {
    constructor(message: string = 'Database operation failed', public originalError?: Error) {
        super(message, 500, 'DATABASE_ERROR');
    }
}
```

### Using Custom Errors

```typescript
async getReference(req: Request, res: Response) {
    try {
        const reference = await referenceRepository.findById(req.params.id);

        if (!reference) {
            throw new NotFoundError(`Reference with ID ${req.params.id} not found`);
        }

        res.json(reference);
    } catch (error) {
        if (error instanceof AppError) {
            logger.warn('Client error', {
                requestId: (req as any).requestId,
                code: error.code,
                message: error.message,
                statusCode: error.statusCode,
            });
            return res.status(error.statusCode).json({ error: error.message });
        }

        // Unknown error
        throw error;
    }
}
```

---

## Logging Levels

### Level Hierarchy

From most to least severe:

1. **error** - Application errors, database failures, HTTP 5xx
   ```typescript
   logger.error('Failed to create reference', { error: err.message });
   ```

2. **warn** - Warnings, slow queries, client errors (HTTP 4xx)
   ```typescript
   logger.warn('Slow query detected', { duration: 1500, query: 'findById' });
   ```

3. **info** - Normal operational events (requests, completions)
   ```typescript
   logger.info('Reference created', { referenceId: '123', title: 'Paper Title' });
   ```

4. **debug** - Debug information (detailed traces, variable values)
   ```typescript
   logger.debug('Processing reference', { page: 2, limit: 10, filters: filters });
   ```

### Configuring Log Level

```bash
# Production
LOG_LEVEL=info npm start

# Development
LOG_LEVEL=debug npm run dev

# Testing
LOG_LEVEL=error npm test
```

---

## Best Practices

### 1. Always Include Context

❌ **BAD** - No context
```typescript
logger.error('Error occurred', { error: err.message });
```

✅ **GOOD** - Full context
```typescript
logger.error('Failed to create reference', {
    requestId,
    userId,
    referenceId,
    error: err.message,
    errorCode: (err as any).code,
    duration,
});
```

### 2. Sanitize Sensitive Data

❌ **BAD** - Logging sensitive data
```typescript
logger.info('User registered', {
    email: user.email,
    password: req.body.password,  // ❌ NEVER!
    token: authToken,             // ❌ NEVER!
});
```

✅ **GOOD** - Sanitized logs
```typescript
logger.info('User registered', {
    userId: user._id,
    emailDomain: user.email.split('@')[1],  // Only domain
    // Don't log password or token
});
```

### 3. Use Appropriate Levels

```typescript
// ✅ GOOD
logger.debug('Query parameters', { page: 2, limit: 10 });          // Detailed
logger.info('Reference created', { referenceId: '123' });          // Important event
logger.warn('Query took 1.2s', { duration: 1200 });                // Unexpected but handled
logger.error('Database connection failed', { error });             // Error state

// ❌ BAD
logger.info('Processing item 1 of 100');    // Too chatty for info
logger.error('User not found');             // Normal behavior, not an error
logger.debug('Response sent');              // Not useful detail
```

### 4. Use Request IDs

```typescript
// Attach to requests
const requestId = uuidv4();
(req as any).requestId = requestId;

// Use everywhere
logger.info('Operation completed', {
    requestId,  // Include in EVERY log
    userId,
    status: 'success',
});
```

### 5. Log Errors Consistently

```typescript
// Always include:
logger.error('Operation failed', {
    requestId,
    userId,
    operation: 'createReference',
    error: error instanceof Error ? error.message : 'Unknown',
    stack: error instanceof Error ? error.stack : undefined,
    statusCode: statusCode,
    duration,
});
```

---

**Related Files:**
- [SKILL.md](SKILL.md) - Main guide
- [database-patterns.md](database-patterns.md) - Database error handling
- [validation-patterns.md](validation-patterns.md) - Validation error logging
- [complete-examples.md](complete-examples.md) - Full examples with error handling
