# Changelog

All notable changes to the Bibliography Manager Frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added (Session 3E - Full Zod Migration)

- **@bibliography/shared Package**: Created shared schema package for frontend and backend
  - Centralized Zod schemas for all data models
  - Input schemas for create/update operations
  - Type inference from Zod schemas for TypeScript
  - 148 comprehensive tests covering all schemas
  - Located at `/home/mahdi/Desktop/bibliography/shared/`

- **Runtime Validation**: Added Zod validation to all API responses
  - `ReferenceListSchema.parse()` validates GET /references responses
  - `ReferenceSchema.parse()` validates create/update mutation responses
  - Catches malformed backend data early with helpful error messages
  - Single source of truth for types across frontend and backend

- **Utility Tests**: Added comprehensive test suite for utilities
  - 23 new tests for formatDate, truncateText, debounce, formatAuthors
  - Total test count: 99 tests (up from 76)
  - All tests passing with meaningful assertions

### Added (Session 3B - Infrastructure & Utilities)

- **ErrorBoundary Component**: Added React ErrorBoundary with proper override keywords for TypeScript strict mode
  - Catches and displays errors gracefully with retry functionality
  - Properly uses `override` modifier for class component methods
  - Located at `src/components/ErrorBoundary.tsx`

- **Optimized React Query Configuration**: Centralized query client configuration
  - 5-minute stale time for fresh data
  - 10-minute garbage collection time
  - Reduced retry count to 1 (from default 3)
  - Disabled refetch on window focus
  - Located at `src/common/config/reactQuery.ts`

- **Panel Width Persistence Hook**: Custom hook for persisting resizable panel widths
  - Saves panel sizes to localStorage
  - Restores on mount
  - Works with react-resizable-panels
  - Located at `src/common/hooks/usePanelPersistence.ts`

- **Essential Utility Functions**: Added 5 core utilities to `src/common/utils.ts`
  - `formatDate()`: Format ISO dates to human-readable format
  - `truncateText()`: Truncate text with ellipsis
  - `cn()`: Class name utility (already existed, using clsx + tailwind-merge)
  - `debounce()`: Debounce function calls
  - `formatAuthors()`: Format author arrays (1 author, 2 authors, "et al.")

- **Application Constants**: Centralized constants in `src/common/constants.ts`
  - API timeout (30 seconds)
  - Query stale/GC times (5/10 minutes)
  - Search debounce delay (300ms)
  - UI constants (max colored tags, panel sizes)
  - Text formatting limits
  - Pagination defaults

### Added (Session 3C - Loading States)

- **Skeleton Loading Components**: Generic and domain-specific loading placeholders
  - `Skeleton` component with text/circular/rectangular variants
  - `ReferenceCardSkeleton` matching ReferenceCard structure
  - Proper animations and dark mode support
  - Located at `src/components/ui/Skeleton.tsx` and `src/features/library/components/ReferenceCardSkeleton.tsx`

### Changed

- **Type System**: Migrated to shared package types
  - `src/common/types.ts` now re-exports types from `@bibliography/shared`
  - Removed duplicate type definitions
  - Single source of truth for all data models
  - Types inferred from Zod schemas for guaranteed runtime/compile-time consistency

- **Skeleton Components**: Fixed hardcoded colors
  - Changed from `bg-gray-200 dark:bg-gray-700` to `bg-surface-3` (theme token)
  - Changed from `border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800` to `border-border bg-surface-2`
  - Now properly uses Tailwind v4 CSS custom properties from design system

- **Monorepo Structure**: Set up pnpm workspaces
  - Created root `package.json` and `pnpm-workspace.yaml`
  - Workspaces: `bibliography_frontend`, `bibliography_backend`, `shared`
  - Shared package installed as `@bibliography/shared@workspace:*`
  - All builds passing in workspace mode

### Removed

- **Old Schemas**: Removed duplicate schema file
  - Deleted `src/common/schemas.ts` (now in @bibliography/shared)
  - All imports updated to use shared package

- **Auth Store**: Updated `setTokens` signature to accept `null`
  - Allows clearing tokens without full logout
  - Consistent with `tokens: Tokens | null` state type
  - Located at `src/store/auth.store.ts:33`

- **Type Safety**: All mutation functions properly typed
  - `CreateReferenceInput`, `UpdateReferenceInput` types enforced
  - No defensive runtime checks (trust TypeScript types per user preference)

### Fixed

- Test assertions now verify actual arguments instead of just checking if functions were called
- Non-null assertions used in `formatAuthors()` to satisfy TypeScript without defensive coding

## [0.1.0] - 2025-01-09 (Sessions 1-2)

### Added

- Initial project setup with Vite, React 19, TypeScript
- TanStack Router with file-based routing
- Zustand state management (auth, UI, library stores)
- TanStack React Query for server state
- Tailwind CSS v4 with custom properties
- Basic UI primitives (Button, Card, Input, Modal)
- Reference management (CRUD operations)
- Collection tree structure
- Tag system
- Comprehensive test suite (76 tests passing)
  - Unit tests (Vitest)
  - Component tests (React Testing Library)
  - Store tests

### Infrastructure

- TypeScript strict mode with `noImplicitOverride: true`
- ESLint + Prettier configuration
- Zustand devtools middleware
- API client with token refresh
- Error handling and toast notifications
