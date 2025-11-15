# Services and Repositories - Business Logic Layer

Complete guide to organizing business logic with services and data access with repositories.

## Table of Contents

- [Service Layer Overview](#service-layer-overview)
- [Dependency Injection Pattern](#dependency-injection-pattern)
- [Singleton Pattern](#singleton-pattern)
- [Repository Pattern](#repository-pattern)
- [Service Design Principles](#service-design-principles)
- [Caching Strategies](#caching-strategies)
- [Testing Services](#testing-services)

---

## Service Layer Overview

### Purpose of Services

**Services contain business logic** - the 'what' and 'why' of your application:

```
Controller asks: "Should I do this?"
Service answers: "Yes/No, here's why, and here's what happens"
Repository executes: "Here's the data you requested"
```

**Services are responsible for:**
- ✅ Business rules enforcement
- ✅ Orchestrating multiple repositories
- ✅ Transaction management
- ✅ Complex calculations
- ✅ External service integration
- ✅ Business validations

**Services should NOT:**
- ❌ Know about HTTP (Request/Response)
- ❌ Direct Mongoose access (use repositories)
- ❌ Handle route-specific logic
- ❌ Format HTTP responses

---

## Dependency Injection Pattern

### Why Dependency Injection?

**Benefits:**
- Easy to test (inject mocks)
- Clear dependencies
- Flexible configuration
- Promotes loose coupling

### Example: ReferenceService Dependency Injection

```typescript
import type { ReferenceRepository } from '../repositories/ReferenceRepository';
import type { DuplicateDetector } from '../services/duplicateDetector';

export interface ReferenceServiceDeps {
    repository: ReferenceRepository;
    duplicateDetector: DuplicateDetector;
}

export class ReferenceService {
    constructor(private readonly deps: ReferenceServiceDeps) {}

    async createReference(dto: CreateReferenceDTO) {
        await this.deps.duplicateDetector.ensureNotDuplicate(dto);
        return this.deps.repository.create(dto);
    }

    async updateReference(id: string, dto: UpdateReferenceDTO) {
        const existing = await this.deps.repository.findById(id);
        if (!existing) {
            throw new NotFoundError(`Reference ${id} not found`);
        }
        return this.deps.repository.update(id, dto);
    }
}

// Composition root
const referenceService = new ReferenceService({
    repository: new ReferenceRepository(),
    duplicateDetector: new DuplicateDetector(),
});
```

**Key Takeaways:**
- Constructor injection keeps dependencies explicit and testable
- Services orchestrate business rules (duplicate detection) before delegating to repositories
- Controllers receive a pre-wired `referenceService` instance and stay thin

---

## Singleton Pattern

### When to Use Singletons

**Use for:**
- Services with expensive initialization
- Services with shared state (caching)
- Services accessed from many places
- Permission services
- Configuration services

### Example: CollectionPermissionService (Singleton)

```typescript
import { Collection } from '../models/Collection';

class CollectionPermissionService {
    private static instance: CollectionPermissionService;
    private readonly cache = new Map<string, { canEdit: boolean; timestamp: number }>();
    private constructor(private readonly ttlMs = 5 * 60 * 1000) {}

    static getInstance(): CollectionPermissionService {
        if (!CollectionPermissionService.instance) {
            CollectionPermissionService.instance = new CollectionPermissionService();
        }
        return CollectionPermissionService.instance;
    }

    async canEdit(userId: string, collectionId: string): Promise<boolean> {
        const cacheKey = `${userId}:${collectionId}`;
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.ttlMs) {
            return cached.canEdit;
        }

        const collection = await Collection.findById(collectionId)
            .select('ownerId editors')
            .lean();
        const canEdit = Boolean(collection && (collection.ownerId === userId || collection.editors?.includes(userId)));

        this.cache.set(cacheKey, { canEdit, timestamp: Date.now() });
        return canEdit;
    }

    invalidateCollection(collectionId: string) {
        for (const key of this.cache.keys()) {
            if (key.endsWith(`:${collectionId}`)) {
                this.cache.delete(key);
            }
        }
    }
}

export const collectionPermissionService = CollectionPermissionService.getInstance();
```

**Usage:**

```typescript
import { permissionService } from '../services/permissionService';

// Use anywhere in the codebase
const canComplete = await permissionService.canCompleteStep(userId, stepId);

if (!canComplete) {
    throw new ForbiddenError('You do not have permission to complete this step');
}
```

---

## Repository Pattern

### Purpose of Repositories

**Repositories abstract data access** - the 'how' of data operations:

```
Service: "Get me all active users sorted by name"
Repository: "Here's the Prisma query that does that"
```

**Repositories are responsible for:**
- ✅ All Mongoose operations
- ✅ Query construction
- ✅ Query optimization (select, populate, lean)
- ✅ Database error handling
- ✅ Caching database results

**Repositories should NOT:**
- ❌ Contain business logic
- ❌ Know about HTTP
- ❌ Make decisions (that's service layer)

### Repository Template

```typescript
// repositories/UserRepository.ts
import { User } from '../models/User';
import type { IUser } from '../models/User';
import { MongooseError } from 'mongoose';

export class UserRepository {
    /**
     * Find user by ID with optimized query
     */
    async findById(userId: string): Promise<IUser | null> {
        try {
            return await User.findById(userId)
                .select('_id email name isActive roles createdAt updatedAt')
                .lean();
        } catch (error) {
            console.error('[UserRepository] Error finding user by ID:', error);
            throw new Error(`Failed to find user: ${userId}`);
        }
    }

    /**
     * Find all active users
     */
    async findActive(options?: { sortBy?: string }): Promise<IUser[]> {
        try {
            const query = User.find({ isActive: true })
                .select('_id email name roles');

            if (options?.sortBy) {
                query.sort(options.sortBy);
            } else {
                query.sort({ name: 'asc' });
            }

            return await query.lean();
        } catch (error) {
            console.error('[UserRepository] Error finding active users:', error);
            throw new Error('Failed to find active users');
        }
    }

    /**
     * Find user by email
     */
    async findByEmail(email: string): Promise<IUser | null> {
        try {
            return await User.findOne({ email }).lean();
        } catch (error) {
            console.error('[UserRepository] Error finding user by email:', error);
            throw new Error(`Failed to find user with email: ${email}`);
        }
    }

    /**
     * Create new user
     */
    async create(data: any): Promise<IUser> {
        try {
            const user = new User(data);
            return await user.save();
        } catch (error) {
            if (error instanceof MongooseError && (error as any).code === 11000) {
                throw new Error('Email already in use');
            }
            console.error('[UserRepository] Error creating user:', error);
            throw new Error('Failed to create user');
        }
    }

    /**
     * Update user
     */
    async update(userId: string, data: any): Promise<IUser> {
        try {
            const user = await User.findByIdAndUpdate(userId, data, {
                new: true,
                runValidators: true,
            });

            if (!user) {
                throw new Error(`User not found: ${userId}`);
            }

            return user;
        } catch (error) {
            if (error instanceof MongooseError && (error as any).code === 11000) {
                throw new Error('Email already in use');
            }
            console.error('[UserRepository] Error updating user:', error);
            throw new Error(`Failed to update user: ${userId}`);
        }
    }

    /**
     * Delete user (soft delete by setting isActive = false)
     */
    async delete(userId: string): Promise<IUser> {
        try {
            const user = await User.findByIdAndUpdate(
                userId,
                { isActive: false, deletedAt: new Date() },
                { new: true }
            );

            if (!user) {
                throw new Error(`User not found: ${userId}`);
            }

            return user;
        } catch (error) {
            console.error('[UserRepository] Error deleting user:', error);
            throw new Error(`Failed to delete user: ${userId}`);
        }
    }

    /**
     * Check if email exists
     */
    async emailExists(email: string): Promise<boolean> {
        try {
            const count = await User.countDocuments({ email });
            return count > 0;
        } catch (error) {
            console.error('[UserRepository] Error checking email exists:', error);
            throw new Error('Failed to check if email exists');
        }
    }
}

// Export singleton instance
export const userRepository = new UserRepository();
```

**Using Repository in Service:**

```typescript
// services/userService.ts
import { userRepository } from '../repositories/UserRepository';
import { ConflictError, NotFoundError } from '../utils/errors';

export class UserService {
    /**
     * Create new user with business rules
     */
    async createUser(data: { email: string; name: string; roles: string[] }): Promise<User> {
        // Business rule: Check if email already exists
        const emailExists = await userRepository.emailExists(data.email);
        if (emailExists) {
            throw new ConflictError('Email already exists');
        }

        // Business rule: Validate roles
        const validRoles = ['admin', 'operations', 'user'];
        const invalidRoles = data.roles.filter((role) => !validRoles.includes(role));
        if (invalidRoles.length > 0) {
            throw new ValidationError(`Invalid roles: ${invalidRoles.join(', ')}`);
        }

        // Create user via repository
        return await userRepository.create({
            email: data.email,
            name: data.name,
            roles: data.roles,
            isActive: true,
        });
    }

    /**
     * Get user by ID
     */
    async getUser(userId: string): Promise<User> {
        const user = await userRepository.findById(userId);

        if (!user) {
            throw new NotFoundError(`User not found: ${userId}`);
        }

        return user;
    }
}
```

---

## Service Design Principles

### 1. Single Responsibility

Each service should have ONE clear purpose:

```typescript
// ✅ GOOD - Single responsibility
class UserService {
    async createUser() {}
    async updateUser() {}
    async deleteUser() {}
}

class EmailService {
    async sendEmail() {}
    async sendBulkEmails() {}
}

// ❌ BAD - Too many responsibilities
class UserService {
    async createUser() {}
    async sendWelcomeEmail() {}  // Should be EmailService
    async logUserActivity() {}   // Should be AuditService
    async processPayment() {}    // Should be PaymentService
}
```

### 2. Clear Method Names

Method names should describe WHAT they do:

```typescript
// ✅ GOOD - Clear intent
async createNotification()
async getUserPreferences()
async shouldBatchEmail()
async routeNotification()

// ❌ BAD - Vague or misleading
async process()
async handle()
async doIt()
async execute()
```

### 3. Return Types

Always use explicit return types:

```typescript
// ✅ GOOD - Explicit types
async createUser(data: CreateUserDTO): Promise<User> {}
async findUsers(): Promise<User[]> {}
async deleteUser(id: string): Promise<void> {}

// ❌ BAD - Implicit any
async createUser(data) {}  // No types!
```

### 4. Error Handling

Services should throw meaningful errors:

```typescript
// ✅ GOOD - Meaningful errors
if (!user) {
    throw new NotFoundError(`User not found: ${userId}`);
}

if (emailExists) {
    throw new ConflictError('Email already exists');
}

// ❌ BAD - Generic errors
if (!user) {
    throw new Error('Error');  // What error?
}
```

### 5. Avoid God Services

Don't create services that do everything:

```typescript
// ❌ BAD - God service
class WorkflowService {
    async startWorkflow() {}
    async completeStep() {}
    async assignRoles() {}
    async sendNotifications() {}  // Should be NotificationService
    async validatePermissions() {}  // Should be PermissionService
    async logAuditTrail() {}  // Should be AuditService
    // ... 50 more methods
}

// ✅ GOOD - Focused services
class WorkflowService {
    constructor(
        private notificationService: NotificationService,
        private permissionService: PermissionService,
        private auditService: AuditService
    ) {}

    async startWorkflow() {
        // Orchestrate other services
        await this.permissionService.checkPermission();
        await this.workflowRepository.create();
        await this.notificationService.notify();
        await this.auditService.log();
    }
}
```

---

## Caching Strategies

### 1. In-Memory Caching

```typescript
class UserService {
    private cache: Map<string, { user: User; timestamp: number }> = new Map();
    private CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    async getUser(userId: string): Promise<User> {
        // Check cache
        const cached = this.cache.get(userId);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            return cached.user;
        }

        // Fetch from database
        const user = await userRepository.findById(userId);

        // Update cache
        if (user) {
            this.cache.set(userId, { user, timestamp: Date.now() });
        }

        return user;
    }

    clearUserCache(userId: string): void {
        this.cache.delete(userId);
    }
}
```

### 2. Cache Invalidation

```typescript
class UserService {
    async updateUser(userId: string, data: UpdateUserDTO): Promise<User> {
        // Update in database
        const user = await userRepository.update(userId, data);

        // Invalidate cache
        this.clearUserCache(userId);

        return user;
    }
}
```

---

## Testing Services

### Unit Tests

```typescript
// tests/userService.test.ts
import { UserService } from '../services/userService';
import { userRepository } from '../repositories/UserRepository';
import { ConflictError } from '../utils/errors';

// Mock repository
jest.mock('../repositories/UserRepository');

describe('UserService', () => {
    let userService: UserService;

    beforeEach(() => {
        userService = new UserService();
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        it('should create user when email does not exist', async () => {
            // Arrange
            const userData = {
                email: 'test@example.com',
                name: 'Test User',
                roles: ['user'],
            };

            (userRepository.emailExists as jest.Mock).mockResolvedValue(false);
            (userRepository.create as jest.Mock).mockResolvedValue({
                userID: '123',
                ...userData,
            });

            // Act
            const user = await userService.createUser(userData);

            // Assert
            expect(user).toBeDefined();
            expect(user.email).toBe(userData.email);
            expect(userRepository.emailExists).toHaveBeenCalledWith(userData.email);
            expect(userRepository.create).toHaveBeenCalled();
        });

        it('should throw ConflictError when email exists', async () => {
            // Arrange
            const userData = {
                email: 'existing@example.com',
                name: 'Test User',
                roles: ['user'],
            };

            (userRepository.emailExists as jest.Mock).mockResolvedValue(true);

            // Act & Assert
            await expect(userService.createUser(userData)).rejects.toThrow(ConflictError);
            expect(userRepository.create).not.toHaveBeenCalled();
        });
    });
});
```

---

**Related Files:**
- [SKILL.md](SKILL.md) - Main guide
- [database-patterns.md](database-patterns.md) - Mongoose and repository patterns
- [validation-patterns.md](validation-patterns.md) - Joi validation in services
- [complete-examples.md](complete-examples.md) - Full service/repository examples
