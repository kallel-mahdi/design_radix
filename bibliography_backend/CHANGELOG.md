# Changelog - Bibliography Backend

All notable changes to the Bibliography Manager Backend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added (Session 3E - Full Zod Migration)

- **Zod Validation Middleware**: Replaced Joi validation with Zod
  - Created new `src/middleware/validate.ts` using Zod schemas
  - Generic type-safe middleware: `validate<T extends z.ZodTypeAny>(schema: T)`
  - Consistent error response format matching original Joi middleware
  - Better TypeScript integration with inferred types

- **Shared Schema Integration**: Integrated `@bibliography/shared` package
  - Uses shared Zod schemas for validation across frontend and backend
  - Input schemas: `CreateReferenceInputSchema`, `UpdateReferenceInputSchema`, etc.
  - Single source of truth for all data validation
  - 148 comprehensive tests in shared package

### Changed

- **Route Validation**: Migrated all routes to Zod schemas
  - `src/routes/references.ts` - Uses `CreateReferenceInputSchema`, `UpdateReferenceInputSchema`
  - `src/routes/collections.ts` - Uses `CreateCollectionInputSchema`, `UpdateCollectionInputSchema`
  - `src/routes/tags.ts` - Uses `CreateTagInputSchema`, `UpdateTagInputSchema`
  - All validation now runtime-safe with Zod

- **Type Annotations**: Fixed TypeScript compatibility with pnpm workspaces
  - Added explicit type annotations to all router exports
  - Changed from `const router = Router()` to `const router: ExpressRouter = Router()`
  - Fixed `src/index.ts` app type: `const app: Express = express()`

- **Monorepo Structure**: Configured for pnpm workspace
  - Backend part of monorepo with shared package dependency
  - All builds passing in workspace mode

### Removed

- **Joi Dependency**: Completely removed Joi validation
  - Removed `joi` from package.json dependencies
  - Deleted `src/validation/reference.schemas.ts` (Joi schemas)
  - Deleted old `src/middleware/validation.ts` file
  - Zero Joi references remaining in codebase

## [0.1.0] - 2025-01-09 (Initial Setup)

### Added

- Initial backend setup with Express, TypeScript, MongoDB
- Inversify dependency injection container
- Reference, Collection, Tag, Project, Duplicate controllers
- Service layer with business logic
- Repository pattern with Mongoose models
- Winston logging
- Error handling middleware
- Trust gateway auth middleware
- Joi validation (now replaced with Zod)
- Health check endpoint
- CORS and security middleware (helmet)

### Infrastructure

- TypeScript strict mode
- ESLint + Prettier configuration
- Jest testing setup
- MongoDB connection with Mongoose
- Docker support
