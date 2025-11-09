# Changelog

All notable changes to the Bibliography Manager Frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

- **Zod Validation**: Reverted half-baked Zod integration
  - Removed `*WithSchema` wrapper methods from API client
  - Kept `src/common/schemas.ts` for future shared schema migration (Step 3)
  - Fixed test assertions to check actual arguments (not just "toHaveBeenCalled()")
  - All 76 tests passing

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
