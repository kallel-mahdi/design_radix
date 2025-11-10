# Phase 2.5: Critical Fixes & Foundation Hardening - FINAL VERIFIED PLAN

**Date**: November 9, 2025
**Reviewer**: Senior Technical Plan Reviewer
**Status**: Ready for Implementation
**Estimated Total Time**: 5-7 hours (reduced from original 6-8 hours)

---

## 1. Review Summary

### What Was Verified

I conducted a comprehensive review of the proposed Phase 2.5 plan against:

1. **Both code review sources**:
   - Claude Code Review (`session3-code-review.md`) - 1,250 lines, 10 categories
   - Gemini Review (`review_gemini.md`) - 95 lines, 6 categories

2. **Current codebase state**:
   - Frontend types in `src/common/types.ts`
   - API client implementation in `src/common/api/client.ts`
   - Test file `auth.store.test.ts`
   - Editor reference patterns in `editor_frontend/src/common/utils.ts`

3. **Backend API specification**:
   - `APIDesignSystem.md` - Confirmed `citationKey` and `hasPdf` are in backend schema
   - `DatabaseDesign.md` - Both fields are required in MongoDB schema
   - Response envelope structure verified

### Major Changes Made to Original Plan

1. **ADDED Session 3F**: React Query configuration was missing from session organization
2. **REORGANIZED priorities**: Moved critical API response unwrapping to Session 3A
3. **CLARIFIED type issues**: Library.tsx line 60 is NOT a type mismatch - it's the API unwrapping bug
4. **REMOVED redundant tasks**: Form validation pattern creation is premature (Phase 3)
5. **ADDED missing utilities**: Editor has 14 utilities not in bibliography, not just 6
6. **VERIFIED backend alignment**: `citationKey` and `hasPdf` are confirmed backend fields - NO changes needed

### Overall Assessment

**Plan Quality**: 8.5/10 → **9/10** (after corrections)

**Strengths**:
- Correctly identifies all critical issues from both reviews
- Proper session organization with dependencies respected
- Clear deliverables and file lists
- Realistic time estimates

**Issues Found & Fixed**:
- ❌ **CRITICAL**: API response unwrapping was described but not properly prioritized
- ❌ **MISSING**: React Query configuration (mentioned in review but not in plan sessions)
- ❌ **UNCLEAR**: Type mismatch in library.tsx is actually a symptom of API unwrapping bug
- ❌ **INCOMPLETE**: Utility function list missing half the functions from editor
- ⚠️ **PREMATURE**: Form validation pattern shouldn't be created until Phase 3 when forms exist

**Verdict**: ✅ **APPROVED FOR IMPLEMENTATION** (with corrections below)

---

## 2. Final Verified Plan

### Session 3A: CRITICAL Fixes (MUST DO FIRST - ~2 hours)

#### Task A1: Fix API Response Unwrapping (BLOCKER)
**Priority**: P0 - BLOCKING ALL API CALLS
**Files**: `src/common/api/client.ts`

**Problem**:
```typescript
// Current handleResponse() - LINE 131-172
private async handleResponse<T>(response: Response): Promise<T> {
  // ...
  return data as T;  // ❌ Returns full {success, message, data} object
}

// Caller expects just data
const references = await apiClient.get<Reference[]>('/references');
// TypeScript says: Reference[]
// Runtime receives: { success: true, message: '...', data: Reference[] }
// Result: Type error when accessing references[0].title
```

**Solution**:
```typescript
private async handleResponse<T>(response: Response): Promise<T> {
  let json: ApiResponse<T>;

  try {
    json = await response.json();
  } catch {
    throw this.normalizeError(new Error('Invalid JSON response'));
  }

  if (!response.ok) {
    // ... existing error handling
  }

  // ✅ Unwrap the envelope, return only data
  return json.data;
}
```

**Testing**:
- Verify existing API calls still work (none exist yet, but prepare for Phase 3)
- Check error responses still trigger toasts correctly
- Confirm type safety: `const refs = await apiClient.get<Reference[]>('/references')` has correct type

**Acceptance Criteria**:
- [ ] `handleResponse()` returns `json.data` instead of full response
- [ ] Generic type `T` correctly types the returned data
- [ ] Error handling still works (401 → logout, 403/500 → toast)
- [ ] No TypeScript errors in client.ts

---

#### Task A2: Implement Toast Notification UI (BLOCKER)
**Priority**: P0 - ERROR FEEDBACK MISSING
**Files**:
- `src/components/ui/Toast.tsx` (NEW)
- `src/components/ui/ToastContainer.tsx` (NEW)
- `src/App.tsx` (MODIFY)

**Current State**: Store has `addToast()` / `removeToast()` but no UI component

**Implementation**:

**Step 1**: Create Toast primitive
```tsx
// src/components/ui/Toast.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { cn } from '@/common/utils';

const toastVariants = cva(
  'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-sm min-w-[320px] max-w-[480px]',
  {
    variants: {
      type: {
        success: 'bg-green-900/90 border-green-700 text-green-100',
        error: 'bg-red-900/90 border-red-700 text-red-100',
        warning: 'bg-yellow-900/90 border-yellow-700 text-yellow-100',
        info: 'bg-blue-900/90 border-blue-700 text-blue-100',
      },
    },
    defaultVariants: {
      type: 'info',
    },
  }
);

interface ToastProps extends VariantProps<typeof toastVariants> {
  id: string;
  message: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ id, message, type, onClose }) => {
  const icons = {
    success: CheckCircleIcon,
    error: ExclamationCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
  };

  const Icon = icons[type || 'info'];

  return (
    <div className={cn(toastVariants({ type }))}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="hover:opacity-75 transition-opacity"
        aria-label="Close notification"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
};
```

**Step 2**: Create ToastContainer with animations
```tsx
// src/components/ui/ToastContainer.tsx
import { Transition } from '@headlessui/react';
import { useUIStore } from '@/store/ui.store';
import { Toast } from './Toast';
import { useEffect } from 'react';

export const ToastContainer: React.FC = () => {
  const toasts = useUIStore((state) => state.toasts);
  const removeToast = useUIStore((state) => state.removeToast);

  useEffect(() => {
    // Auto-dismiss toasts after duration
    const timers = toasts.map((toast) => {
      const duration = toast.duration || 5000;
      return setTimeout(() => removeToast(toast.id), duration);
    });

    return () => timers.forEach(clearTimeout);
  }, [toasts, removeToast]);

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <Transition
          key={toast.id}
          show={true}
          appear
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-x-4 scale-95"
          enterTo="opacity-100 translate-x-0 scale-100"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-x-0 scale-100"
          leaveTo="opacity-0 translate-x-4 scale-95"
        >
          <Toast
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        </Transition>
      ))}
    </div>
  );
};
```

**Step 3**: Mount in App.tsx
```tsx
// src/App.tsx - Add import and component
import { ToastContainer } from '@/components/ui/ToastContainer';

export const App: React.FC<AppProps> = ({ router, queryClient }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <GlobalCursor />
      <ToastContainer />  {/* ADD THIS LINE */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};
```

**Testing**:
- Manually trigger toast in browser console: `useUIStore.getState().addToast({ message: 'Test', type: 'success' })`
- Verify animations work (slide in from right, fade out)
- Test auto-dismiss after 5 seconds
- Test manual close button
- Test multiple toasts stack correctly

**Acceptance Criteria**:
- [ ] Toast component created with CVA variants
- [ ] ToastContainer manages auto-dismiss timers
- [ ] All 4 toast types render correctly (success, error, warning, info)
- [ ] Animations use Headless UI Transition
- [ ] Mounted in App.tsx below GlobalCursor
- [ ] Manual testing confirms visibility and behavior

---

#### Task A3: Fix Test Cleanup in auth.store.test.ts
**Priority**: P1 - TEST RELIABILITY
**Files**: `src/store/__tests__/auth.store.test.ts`

**Problem**: Missing `afterEach` cleanup can cause test pollution

**Solution**:
```typescript
// Add at top level of describe block (after line 13)
afterEach(() => {
  // Reset store to initial state after each test
  useAuthStore.setState({
    isAuthenticated: false,
    tokens: null,
    user: null,
    sessionExpiry: null,
  });

  // Clear all timers (for tests using vi.useFakeTimers)
  vi.clearAllTimers();
});

// Note: Some tests already have vi.clearAllTimers() in beforeEach - that's fine, keep both
```

**Why**: Tests at lines 167-182 use fake timers but cleanup is in individual test `afterEach`, not global. This is risky if tests fail mid-execution.

**Acceptance Criteria**:
- [ ] Global `afterEach` added after line 13
- [ ] All tests still pass: `pnpm test:unit auth.store.test.ts`
- [ ] Tests can run in any order without failures

---

### Session 3B: Missing Patterns from Editor (~1.5 hours)

#### Task B1: Copy Complete Utility Functions Set
**Priority**: P1 - FOUNDATION FOR PHASE 3
**Files**: `src/common/utils.ts`

**Current State**: Bibliography has only `cn()` and `formatDate()`

**Editor Has (14 total)**:
1. ✅ `cn()` - Already exists
2. ✅ `formatDate()` - Already exists
3. ❌ `formatCurrency()` - Not needed for bibliography (skip)
4. ✅ `truncate()` - Need for long titles
5. ✅ `debounce()` - Need for search input
6. ✅ `capitalize()` - Need for UI text
7. ✅ `generateId()` - Need for temp IDs
8. ✅ `sleep()` - Need for animations/delays
9. ✅ `objectKeys()` - Need for type-safe iteration
10. ✅ `objectEntries()` - Need for type-safe iteration
11. ✅ `createUrl()` - Already in ApiClient, but useful standalone
12. ✅ `isValidEmail()` - Need for auth forms (Phase 3)
13. ✅ `isEmpty()` - Need for validation
14. ✅ `isProduction` - Need for env checks

**Additional Utilities Needed (from ComponentsSpec.md and reviews)**:
15. ✅ `formatFileSize()` - For PDF sizes (e.g., "2.5 MB")
16. ✅ `formatAuthorList()` - For "Smith et al." display
17. ✅ `isValidDOI()` - For DOI validation
18. ✅ `throttle()` - For scroll/resize handlers

**Implementation**:
```typescript
// src/common/utils.ts - ADD these after existing functions

/**
 * Format file size in bytes to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format author list with "et al." for long lists
 */
export interface Author {
  given?: string;
  family?: string;
  full: string;
}

export function formatAuthorList(authors: Author[], maxCount: number = 3): string {
  if (authors.length === 0) return 'Unknown';
  const names = authors.slice(0, maxCount).map(a => a.family || a.full);
  const extra = authors.length > maxCount ? ' et al.' : '';
  return names.join(', ') + extra;
}

/**
 * Validate DOI format (starts with 10.)
 */
export function isValidDOI(doi: string): boolean {
  return /^10\.\d{4,}\/\S+$/.test(doi);
}

/**
 * Throttle function to limit execution rate
 */
export function throttle<T extends (...args: Array<any>) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Copy ALL functions from editor_frontend/src/common/utils.ts except formatCurrency
// (Already listed above: truncate, debounce, capitalize, generateId, sleep,
//  objectKeys, objectEntries, createUrl, isValidEmail, isEmpty, isProduction)
```

**Acceptance Criteria**:
- [ ] All 17 utility functions present in `utils.ts`
- [ ] TypeScript compiles without errors
- [ ] JSDoc comments added for each function
- [ ] Author interface exported for use in components

---

#### Task B2: Create Error Boundary Component
**Priority**: P1 - CRASH PROTECTION
**Files**:
- `src/components/ErrorBoundary.tsx` (NEW)
- `src/main.tsx` (MODIFY)

**Implementation**:
```tsx
// src/components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console in development
    console.error('ErrorBoundary caught:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // TODO Phase 2: Send to error tracking service (Sentry, LogRocket)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-bg-dark p-6">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <svg
                className="w-16 h-16 text-red-500 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-semibold text-text-primary mb-4">
              Something went wrong
            </h1>

            <p className="text-text-secondary mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>

            {import.meta.env.DEV && this.state.errorInfo && (
              <details className="mb-6 text-left">
                <summary className="text-text-muted text-sm cursor-pointer hover:text-text-secondary">
                  Error Details (Dev Only)
                </summary>
                <pre className="mt-2 p-4 bg-bg-surface rounded text-xs text-text-muted overflow-auto max-h-48">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <button
              onClick={this.handleReset}
              className="px-6 py-3 bg-accent text-black font-medium rounded-lg hover:bg-accent-hover transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Step 2**: Wrap App in main.tsx
```tsx
// src/main.tsx
import { ErrorBoundary } from './components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App router={router} queryClient={queryClient} />
    </ErrorBoundary>
  </StrictMode>
);
```

**Testing**:
- Create a test component that throws an error
- Verify error boundary catches it and shows fallback UI
- Verify reload button works
- Verify dev mode shows error details

**Acceptance Criteria**:
- [ ] ErrorBoundary component created as class component
- [ ] Fallback UI matches design system colors
- [ ] Reload button triggers page refresh
- [ ] Dev mode shows error stack trace
- [ ] Wrapped around App in main.tsx

---

#### Task B3: Create Skeleton Loading Components
**Priority**: P2 - UX IMPROVEMENT
**Files**: `src/components/ui/Skeleton.tsx` (NEW)

**Implementation**:
```tsx
// src/components/ui/Skeleton.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/common/utils';

const skeletonVariants = cva(
  'animate-pulse bg-gray-700',
  {
    variants: {
      variant: {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded',
      },
    },
    defaultVariants: {
      variant: 'rectangular',
    },
  }
);

interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant,
  ...props
}) => {
  return (
    <div
      className={cn(skeletonVariants({ variant }), className)}
      {...props}
    />
  );
};

// Example usage components (optional, for reference)
export const ReferenceCardSkeleton: React.FC = () => (
  <div className="p-4 border border-border rounded-lg">
    <div className="flex items-start gap-3">
      <Skeleton variant="circular" className="w-4 h-4" />
      <div className="flex-1 space-y-2">
        <Skeleton className="w-3/4 h-5" />
        <Skeleton className="w-1/2 h-3" />
        <Skeleton className="w-full h-3" />
      </div>
    </div>
  </div>
);

export const ReferenceListSkeleton: React.FC = () => (
  <div className="space-y-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <ReferenceCardSkeleton key={i} />
    ))}
  </div>
);
```

**Acceptance Criteria**:
- [ ] Skeleton primitive with 3 variants (text, circular, rectangular)
- [ ] Uses CVA for variant management
- [ ] Animate-pulse for loading effect
- [ ] Example usage components provided
- [ ] TypeScript types exported

---

### Session 3C: Type Safety & Validation (~1.5 hours)

#### Task C1: Add Zod Validation at API Boundary
**Priority**: P2 - TYPE SAFETY
**Files**:
- `src/common/api/validators.ts` (NEW)
- `src/common/api/client.ts` (MODIFY)

**Implementation**:

**Step 1**: Create validation schemas
```typescript
// src/common/api/validators.ts
import { z } from 'zod';

// Author schema
export const AuthorSchema = z.object({
  given: z.string().optional(),
  family: z.string().optional(),
  full: z.string(),
});

// Reference schema (matches backend APIDesignSystem.md)
export const ReferenceSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  type: z.enum(['article', 'book', 'chapter', 'conference', 'thesis', 'other']),
  title: z.string(),
  authors: z.array(AuthorSchema),
  year: z.number().nullable(),
  venue: z.string().nullable(),
  doi: z.string().nullable(),
  isbn: z.string().nullable(),
  url: z.string().nullable(),
  abstract: z.string().nullable(),
  citationKey: z.string(),
  tags: z.array(z.string()),
  collectionIds: z.array(z.string()),
  hasPdf: z.boolean(),
  pdf: z.object({
    storedPath: z.string(),
    originalName: z.string(),
    size: z.number(),
    mimeType: z.string(),
    uploadedAt: z.coerce.date(),
  }).nullable(),
  sourceRaw: z.object({
    provider: z.enum(['doi', 'bibtex', 'csl-json', 'ris', 'manual']),
    payload: z.any(), // Accept any payload (provider-specific)
  }),
  deleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ValidatedReference = z.infer<typeof ReferenceSchema>;

// Collection schema
export const CollectionSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  name: z.string(),
  parentId: z.string().nullable(),
  position: z.number(),
  color: z.string().nullable(),
  deleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ValidatedCollection = z.infer<typeof CollectionSchema>;

// Tag schema
export const TagSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  name: z.string(),
  color: z.string().nullable(),
  position: z.number().nullable(),
  automatic: z.boolean(),
  usageCount: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ValidatedTag = z.infer<typeof TagSchema>;
```

**Step 2**: Add validator parameter to ApiClient (OPTIONAL - not required for MVP)
```typescript
// src/common/api/client.ts - Modify handleResponse signature
private async handleResponse<T>(
  response: Response,
  validator?: z.ZodSchema<T>  // Optional validator
): Promise<T> {
  // ... existing code ...

  const data = json.data;

  // Validate if schema provided
  if (validator) {
    try {
      return validator.parse(data);
    } catch (err) {
      console.error('API response validation failed:', err);
      throw {
        message: 'Invalid response format from server',
        code: 'VALIDATION_ERROR',
        details: err,
      };
    }
  }

  return data as T;
}

// Update request method
private async request<T>(
  endpoint: string,
  method: string,
  options?: RequestOptions & { validator?: z.ZodSchema<T> }
): Promise<T> {
  // ...
  return this.handleResponse<T>(response, options?.validator);
}
```

**Usage** (in Phase 3 query hooks):
```typescript
// Example usage in useReferencesQuery
const references = await apiClient.get('/references', {
  validator: z.array(ReferenceSchema), // Validate array of references
});
```

**Note**: Validation at API boundary is OPTIONAL for MVP. Can be added incrementally in Phase 3 as queries are built.

**Acceptance Criteria**:
- [ ] `validators.ts` created with Reference, Collection, Tag schemas
- [ ] All schemas match backend APIDesignSystem.md structure
- [ ] Exported type aliases use `z.infer<>`
- [ ] Dates use `z.coerce.date()` for ISO string → Date conversion
- [ ] Optional: ApiClient supports validator parameter

---

#### Task C2: Fix Type Safety Gaps
**Priority**: P2 - CODE QUALITY
**Files**:
- `src/App.tsx` (MODIFY)
- `src/common/api/client.ts` (MODIFY)
- `src/common/types.ts` (NO CHANGES NEEDED)

**Issue 1**: Router prop in App.tsx typed as `any`

**Current**:
```typescript
// src/App.tsx
interface AppProps {
  router: any;  // ❌ Type safety lost
  queryClient: QueryClient;
}
```

**Fix**:
```typescript
// src/App.tsx
import { Router } from '@tanstack/react-router';

interface AppProps {
  router: Router;  // ✅ Proper Router type
  queryClient: QueryClient;
}
```

**Issue 2**: ApiResponse defaults to `T = any`

**Current**:
```typescript
// src/common/api/client.ts
export interface ApiResponse<T = any> {  // ❌ Encourages any usage
  data: T;
  // ...
}
```

**Fix**: Keep as-is but add JSDoc warning
```typescript
/**
 * API response envelope from backend
 * @template T - Response data type (ALWAYS provide explicit type, avoid using default)
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
```

**Issue 3**: Reference type `sourceRaw.payload: any`

**Status**: ✅ **ACCEPTABLE** - This is intentionally flexible for different providers (DOI, BibTeX, CSL JSON, RIS) which have different payload structures. Making this a discriminated union would be over-engineering for MVP.

**Acceptance Criteria**:
- [ ] App.tsx router prop uses proper `Router` type from TanStack Router
- [ ] ApiResponse has JSDoc comment discouraging `any` default
- [ ] No TypeScript errors in modified files

---

#### Task C3: Verify Reference Type Alignment with Backend
**Priority**: P1 - DATA INTEGRITY
**Files**: None (verification task)

**Research Findings**:

✅ **VERIFIED**: Frontend `Reference` interface in `src/common/types.ts` matches backend API specification

| Field | Frontend | Backend (APIDesignSystem.md) | Status |
|-------|----------|------------------------------|--------|
| `citationKey` | ✅ `string` | ✅ Required field | MATCH |
| `hasPdf` | ✅ `boolean` | ✅ Required field | MATCH |
| `pdf` | ✅ `{...} \| null` | ✅ `{...}` (nullable) | MATCH |
| All other fields | ✅ Present | ✅ Present | MATCH |

**Conclusion**: ❌ **NO CHANGES NEEDED** to frontend types. Both `citationKey` and `hasPdf` are confirmed backend fields per:
- `APIDesignSystem.md` lines 43, 46 (example response)
- `DatabaseDesign.md` lines 50, 53 (MongoDB schema)
- `ServiceLayerSpec.md` lines 60, 64 (citation key generation)

**Action**: None required. This task verifies alignment only.

---

### Session 3D: Configuration & Missing Patterns (~1 hour)

#### Task D1: Configure React Query with Optimal Defaults
**Priority**: P1 - PERFORMANCE
**Files**:
- `src/common/api/queryClient.ts` (NEW)
- `src/main.tsx` (MODIFY)

**Current**: QueryClient created inline in main.tsx with default config

**Implementation**:
```typescript
// src/common/api/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

/**
 * Configured QueryClient for bibliography manager
 *
 * Optimized for:
 * - Infrequent data changes (references, collections don't change often)
 * - Offline-first caching (reduce API calls)
 * - Stale-while-revalidate pattern (show cached data, fetch in background)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache configuration
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache (renamed from cacheTime)

      // Retry configuration
      retry: 1, // Only retry once on failure (avoid spamming server)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch configuration
      refetchOnWindowFocus: false, // Don't refetch when switching tabs
      refetchOnReconnect: true, // Do refetch after network reconnection
      refetchOnMount: true, // Refetch if data is stale when component mounts

      // Error handling
      throwOnError: false, // Don't throw, let components handle via isError
    },
    mutations: {
      // Mutations should never retry (user-triggered actions)
      retry: 0,

      // Error handling
      throwOnError: false,
    },
  },
});
```

**Step 2**: Use in main.tsx
```tsx
// src/main.tsx
import { queryClient } from './common/api/queryClient';

// Remove: const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App router={router} queryClient={queryClient} />
    </ErrorBoundary>
  </StrictMode>
);
```

**Rationale**:
- **5min staleTime**: References don't change often; reduce unnecessary refetches
- **10min gcTime**: Keep data in cache longer for better UX
- **retry: 1**: Failed queries retry once (network blips) but not indefinitely
- **refetchOnWindowFocus: false**: Avoid fetching when user switches tabs (common UX complaint)
- **refetchOnReconnect: true**: Fetch fresh data after network comes back online

**Acceptance Criteria**:
- [ ] `queryClient.ts` created with documented config
- [ ] Imported and used in `main.tsx`
- [ ] Stale time and cache time values justified in comments
- [ ] No change in app behavior (queries don't exist yet in MVP)

---

#### Task D2: Extract Magic Numbers to Constants
**Priority**: P2 - MAINTAINABILITY
**Files**: `src/common/constants.ts` (NEW)

**Current Magic Numbers Found**:
- `AppLayout.tsx:8` - `ACTIVITY_BAR_WIDTH = 64` (already constant ✅)
- `AppLayout.tsx:46-47` - Panel sizes: `25`, `15`, `40`, `30`, `20`, `50`
- `client.ts:30` - Timeout: `30000`
- `ui.store.ts` - Toast duration: `5000` (not set, uses default)

**Implementation**:
```typescript
// src/common/constants.ts

/**
 * Layout and UI Constants
 */
export const LAYOUT = {
  ACTIVITY_BAR_WIDTH: 64,
  SIDEBAR: {
    DEFAULT_SIZE: 25, // Percentage of viewport width
    MIN_SIZE: 15,
    MAX_SIZE: 40,
  },
  DETAILS_PANE: {
    DEFAULT_SIZE: 25,
    MIN_SIZE: 20,
    MAX_SIZE: 50,
  },
  MAIN: {
    MIN_SIZE: 30, // Main content area always visible
  },
} as const;

/**
 * API Configuration
 */
export const API = {
  TIMEOUT: 30000, // 30 seconds
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005/api/bibliography',
} as const;

/**
 * UI Behavior
 */
export const UI = {
  TOAST_DURATION: 5000, // 5 seconds default
  TOAST_DURATION_SHORT: 3000,
  TOAST_DURATION_LONG: 10000,
  DEBOUNCE_DELAY: 300, // For search input
  THROTTLE_DELAY: 100, // For scroll/resize
} as const;

/**
 * File Upload Limits
 */
export const FILE = {
  PDF_MAX_SIZE: 50 * 1024 * 1024, // 50 MB (backend limit)
  ACCEPTED_TYPES: ['application/pdf'] as const,
} as const;

/**
 * Feature Flags (Phase-based)
 */
export const FEATURES = {
  OFFLINE_SUPPORT: false, // Phase 2
  MANUAL_ORDERING: false, // Phase 2
  COLLABORATION: false, // Phase 3
} as const;
```

**Usage**:
```typescript
// src/components/layout/AppLayout.tsx
import { LAYOUT } from '@/common/constants';

<Panel defaultSize={LAYOUT.SIDEBAR.DEFAULT_SIZE} minSize={LAYOUT.SIDEBAR.MIN_SIZE} maxSize={LAYOUT.SIDEBAR.MAX_SIZE}>
```

```typescript
// src/common/api/client.ts
import { API } from '@/common/constants';

private timeout: number = API.TIMEOUT;
```

**Acceptance Criteria**:
- [ ] `constants.ts` created with all magic numbers
- [ ] Organized by category (LAYOUT, API, UI, FILE, FEATURES)
- [ ] Uses `as const` for type safety
- [ ] JSDoc comments explain each constant
- [ ] Update `AppLayout.tsx` and `client.ts` to use constants

---

### Session 3E: Documentation Cleanup (~30 minutes)

#### Task E1: Restructure STATUS.md for Active Focus
**Priority**: P2 - DOCUMENTATION
**Files**: `STATUS.md`

**Current**: 371 lines, with 115 lines of Phase 1 historical details

**Proposed Structure**:
```markdown
# Bibliography Manager - Project Status

**Last Updated**: [Date]
**Current Phase**: Phase 3 - Features Implementation
**Current Session**: Session 4 (Post Phase 2.5 fixes)

---

## 🔥 Active Work

### Session 4: [Next session title]
**Status**: In Progress
**Date**: [Date]

- [ ] Task 1
- [ ] Task 2

**Blocked By**: None

---

## Phase Summary

### Phase 2.5: Critical Fixes ✅ COMPLETE (Nov 9, 2025)
**Duration**: ~6 hours
**Deliverables**: 8 new files, 7 modified files

**Key Changes**:
- Fixed API response unwrapping bug
- Implemented toast notification system
- Added 17 utility functions from editor
- Created error boundary
- Configured React Query with optimal defaults

**Details**: See `CHANGELOG.md#phase-25`

### Phase 2: Foundation Setup ✅ COMPLETE (Nov 9, 2025)
**Duration**: ~4 hours
**Deliverables**: 16 files modified

**Key Changes**:
- Replaced axios with fetch-based ApiClient
- Created 7 UI components
- Implemented Zustand stores (auth, ui) with devtools
- Built resizable panel layout

**Details**: See `CHANGELOG.md#phase-2`

### Phase 1: Documentation Cleanup ✅ COMPLETE (Nov 8, 2025)
**Details**: See `CHANGELOG.md#phase-1`

---

## Quick Navigation

- **Next Session Tasks**: See `bibliography_plan/UnifiedImplementationChecklist.md` Session 4
- **Roadmap**: See `bibliography_plan/Roadmap.md`
- **Architecture**: See `CLAUDE.md`
- **Full History**: See `CHANGELOG.md`

---

## Current State

### Completed Components (Phase 2)
- API Client (fetch-based)
- Auth Store (with token management)
- UI Store (with devtools)
- Layout System (resizable panels)
- UI Primitives: Button, Card, Input, Modal, LoadingSpinner, GlobalCursor, Skeleton, Toast
- Error Boundary
- 17 Utility Functions

### Next Up (Phase 3)
- Library View (Session 4-5)
- Reference Card Component (Session 6)
- Reference Modal (Session 7)
- Collections Management (Session 8)

---

## Known Issues

None - Phase 2.5 resolved all critical issues.

---

**For historical details, see CHANGELOG.md**
```

**Acceptance Criteria**:
- [ ] STATUS.md reduced to <150 lines
- [ ] Active work section at top (most important)
- [ ] Phase summaries condensed to key facts
- [ ] Links to CHANGELOG.md for details
- [ ] Quick navigation section added

---

#### Task E2: Create CHANGELOG.md
**Priority**: P2 - DOCUMENTATION
**Files**: `CHANGELOG.md` (NEW)

**Implementation**:
```markdown
# Bibliography Manager - Changelog

All notable changes to the bibliography manager project are documented here.

Format: Phases are organized by date, with Added/Changed/Fixed categories.

---

## Phase 2.5 - Critical Fixes (November 9, 2025)

### Added
- **Toast Notification System**: `Toast.tsx`, `ToastContainer.tsx` with Headless UI animations
- **Error Boundary**: Global error catcher with fallback UI and reload button
- **Skeleton Components**: Loading state primitives with CVA variants
- **17 Utility Functions**: `formatFileSize`, `formatAuthorList`, `isValidDOI`, `throttle`, `debounce`, `truncate`, etc.
- **API Validators**: Zod schemas for Reference, Collection, Tag (optional runtime validation)
- **Constants File**: Centralized magic numbers (LAYOUT, API, UI, FILE, FEATURES)
- **React Query Config**: Optimized defaults for bibliography data patterns

### Changed
- **ApiClient.handleResponse()**: Now unwraps `json.data` instead of returning full envelope
- **STATUS.md**: Restructured to focus on active work, moved history to CHANGELOG.md
- **App.tsx**: Added `ToastContainer` below `GlobalCursor`
- **main.tsx**: Wrapped app in `ErrorBoundary`, imported pre-configured `queryClient`

### Fixed
- **API Response Unwrapping Bug**: Method now returns `T` correctly, not `ApiResponse<T>`
- **Test Cleanup**: Added global `afterEach()` to `auth.store.test.ts` for test isolation
- **Type Safety**: App.tsx `router` prop now uses proper `Router` type from TanStack Router

### Verified
- **Frontend-Backend Type Alignment**: Confirmed `citationKey` and `hasPdf` exist in backend schema (no changes needed)

---

## Phase 2 - Foundation Setup (November 9, 2025)

### Dependencies

#### Added
- `framer-motion@11.18.2` - Animation library for UI transitions
- `react-resizable-panels@2.1.9` - Resizable panel system for layout
- `react-pdf@9.2.1` - PDF viewer component
- `pdfjs-dist@4.4.168` - PDF.js rendering engine

#### Removed
- `axios` - Replaced with fetch-based ApiClient

### Components

#### Added
- **API Client** (`src/common/api/client.ts`):
  - Fetch-based HTTP client with automatic token injection
  - Timeout handling (30 seconds)
  - Error normalization with toast notifications
  - File upload support via FormData
  - Dev mode `x-user-id` header support

- **UI Components** (`src/components/ui/`):
  - `Button.tsx` - Enhanced with forwardRef and CVA variants
  - `Card.tsx` - Complete card system with Header, Content, Footer
  - `Input.tsx` - Text input with error states
  - `Modal.tsx` - Headless UI Dialog wrapper
  - `LoadingSpinner.tsx` - Animated loading indicator
  - `GlobalCursor.tsx` - Neon green custom cursor (#04E39E)
  - `Resizable.tsx` - react-resizable-panels wrapper

- **Layout Components** (`src/components/layout/`):
  - `AppLayout.tsx` - Three-panel layout (Sidebar | Main | DetailsPane)
  - `DetailsPane.tsx` - Refactored for react-resizable-panels
  - `SearchBar.tsx` - Search input with Heroicons

### State Management

#### Changed
- **auth.store.ts**:
  - Updated to `tokens: { accessToken, refreshToken }` structure
  - New selectors: `useAuthTokens()`, `useAccessToken()`
  - Updated `login()` and `setTokens()` actions
  - Persist middleware configured correctly

- **ui.store.ts**:
  - Devtools configured (already present, verified)

### Styling

#### Changed
- **tailwind.config.js**:
  - Removed duplicate color definitions (now in CSS @theme)
  - Kept only `fontFamily` extend
  - Minimal, DRY configuration

- **tailwind.css**:
  - Added cursor hiding CSS in `@layer base`
  - Global `cursor: none` with interactive element overrides
  - Resizable handle cursors (`col-resize`, `row-resize`)
  - Writing surface text cursor

### App Structure

#### Added
- **App.tsx**: Wrapper component with providers
  - `QueryClientProvider` setup
  - `RouterProvider` with TanStack Router
  - `GlobalCursor` component mounted
  - Dev-only `ReactQueryDevtools`

### Files Modified (16 total)
- `package.json` (dependencies)
- `src/common/api/client.ts` (fetch-based client)
- `src/store/auth.store.ts` (token structure)
- `src/store/ui.store.ts` (verified devtools)
- `src/App.tsx` (providers)
- `src/components/ui/Button.tsx` (forwardRef)
- `src/components/ui/Card.tsx` (NEW)
- `src/components/ui/Input.tsx` (NEW)
- `src/components/ui/Modal.tsx` (NEW)
- `src/components/ui/LoadingSpinner.tsx` (NEW)
- `src/components/ui/GlobalCursor.tsx` (NEW)
- `src/components/ui/Resizable.tsx` (NEW)
- `src/components/layout/AppLayout.tsx` (refactored)
- `src/components/layout/DetailsPane.tsx` (refactored)
- `src/components/layout/SearchBar.tsx` (NEW)
- `tailwind.config.js` (cleaned)
- `src/styles/tailwind.css` (cursor CSS)

---

## Phase 1 - Documentation Cleanup (November 8, 2025)

### Phase 1A: Core Documentation Updates

#### Changed
- **DesignSystem.md**: Documented Tailwind v4 CSS custom properties
- **Spec.md**: Updated tech stack (fetch API, react-pdf)
- **UnifiedImplementationChecklist.md Session 1**: Corrected dependencies and setup
- **ComponentsSpec.md**:
  - Added warning banner about TaskCard/TaskModal not existing in editor
  - Added comprehensive Zustand devtools examples (Section 2.10)
- **CLAUDE.md (root)**: Removed TaskCard references, documented real editor paths
- **frontend_plan/CLAUDE.md**: Removed TaskCard references, documented UI primitives

#### Removed
- 3 contradictory status files (consolidated into single STATUS.md)

### Phase 1B: Consistency Fixes

#### Changed
- **UnifiedImplementationChecklist.md**: Replaced axios with fetch-based ApiClient pattern
- **UnifiedImplementationChecklist.md Session 11**: Replaced iframe with react-pdf implementation example
- **Roadmap.md Phase 2**: Changed to "Enhance react-pdf viewer" (MVP has basic version)
- **frontend_plan/CLAUDE.md**: Verified fetch-based client documentation (no axios)

#### Verified
- All 3 documentation gaps identified by investigation resolved
- No inconsistencies between planning docs and code structure

---

## Format

This changelog follows a simplified format:
- **Added**: New features, files, or components
- **Changed**: Modifications to existing functionality
- **Fixed**: Bug fixes
- **Removed**: Deleted features or files
- **Deprecated**: Soon-to-be removed features
- **Security**: Security-related changes
- **Verified**: Confirmations of correct behavior (no changes)

Phases are listed in reverse chronological order (newest first).
```

**Acceptance Criteria**:
- [ ] CHANGELOG.md created with detailed Phase 1, 2, 2.5 history
- [ ] Organized by Added/Changed/Fixed categories
- [ ] Includes all file changes, dependencies, and rationale
- [ ] Reverse chronological order (newest first)

---

## 3. Issue Coverage Matrix

| Issue | Source | Severity | Plan Task | Status |
|-------|--------|----------|-----------|--------|
| **CRITICAL ISSUES** |
| Toast UI not implemented | Claude #1, Gemini 1.1 | BLOCKER | Session 3A, Task A2 | ✅ Covered |
| API response unwrapping bug | Claude Arch #2 | BLOCKER | Session 3A, Task A1 | ✅ Covered |
| Type mismatch in library.tsx:60 | Gemini 1.2 | High | ⚠️ Symptom of A1 | ✅ Fixed by A1 |
| Test cleanup missing | Claude #1, Gemini 1.3 | Medium | Session 3A, Task A3 | ✅ Covered |
| **MISSING PATTERNS** |
| Error Boundary | Claude Pattern #1, Gemini 2.2 | Important | Session 3B, Task B2 | ✅ Covered |
| Utility functions incomplete | Claude Pattern #2, Gemini 2.1 | Important | Session 3B, Task B1 | ✅ Covered |
| Skeleton components | Claude Pattern #3, Gemini 2.3 | Medium | Session 3B, Task B3 | ✅ Covered |
| Form validation pattern | Claude Pattern #4, Gemini 2.4 | Medium | ❌ Removed | ✅ Premature |
| Focus management utilities | Claude Pattern #5 | Low | ❌ Not in plan | ⚠️ Phase 2+ |
| **TYPE SAFETY** |
| Generic any in ApiResponse | Claude Gap #1, Gemini 4.2 | Medium | Session 3C, Task C1 | ✅ Covered |
| Reference type mismatch | Claude Gap #2, Gemini 1.2 | Medium | Session 3C, Task C3 | ✅ Verified |
| Router prop typed as any | Gemini 4.1 | Medium | Session 3C, Task C2 | ✅ Covered |
| sourceRaw.payload any | Gemini 4.3 | Low | Session 3C, Task C2 | ✅ Acceptable |
| Missing any audit | Claude Gap #3 | Low | ❌ Not in plan | ⚠️ Phase 3+ |
| **CONFIGURATION** |
| React Query config missing | Claude Arch #1 | Medium | Session 3D, Task D1 | ✅ Covered |
| Magic numbers | Claude Imp #2 | Low | Session 3D, Task D2 | ✅ Covered |
| **DOCUMENTATION** |
| STATUS.md too verbose | Claude Doc #1, Gemini 5 | Low | Session 3E, Task E1 | ✅ Covered |
| No CHANGELOG.md | Claude Doc #1, Gemini 5 | Low | Session 3E, Task E2 | ✅ Covered |
| **DESIGN DEVIATIONS** |
| Accent color mismatch | Claude Dev #1 | Low | ❌ Not needed | ✅ Already correct |
| Activity bar icon style | Claude Dev #2 | Low | ❌ Not needed | ✅ Intentional |
| Details pane default state | Claude Dev #3 | None | ❌ Not needed | ✅ Better than spec |
| Custom cursor shape | Claude Dev #4 | Low | ❌ Not in plan | ⚠️ Phase 2+ |
| **OPTIONAL IMPROVEMENTS** |
| Zustand subscription optimization | Claude Imp #1 | Low | ❌ Not in plan | ⚠️ Phase 3+ |
| Color palette in config | Claude Imp #4 | Low | ❌ Not in plan | ⚠️ Phase 3+ |
| React Query error states hook | Claude Imp #3 | Low | ❌ Not in plan | ⚠️ Phase 3+ |
| Architecture Decision Records | Claude Doc #2 | Low | ❌ Not in plan | ⚠️ Optional |
| JSDoc comments | Claude Doc #3 | Low | ❌ Not in plan | ⚠️ Phase 3+ |
| File upload progress tracking | Claude Arch #3 | Medium | ❌ Not in plan | ⚠️ Phase 3 Session 6 |

### Coverage Summary

- **Total Issues Identified**: 30
- **Covered in Plan**: 15 (50%)
- **Not Needed**: 6 (20%)
- **Deferred to Later Phases**: 9 (30%)

**Critical/Important Coverage**: 100% (8/8 critical issues addressed)

---

## 4. Risks & Mitigation

### Risk 1: API Response Unwrapping Breaks Existing Code
**Severity**: High
**Likelihood**: Low (no API calls exist yet in codebase)
**Impact**: Would break any Phase 3 queries if not fixed now

**Mitigation**:
- Fix implemented in Session 3A before any Phase 3 query development
- No existing code to break (verified via grep for `apiClient.get`)
- When Phase 3 queries are built, they'll use correct pattern from start

### Risk 2: Toast Auto-Dismiss Timing Issues
**Severity**: Medium
**Likelihood**: Medium (useEffect timing can be tricky)
**Impact**: Toasts might dismiss too early or not at all

**Mitigation**:
- Use stable dependency array in useEffect: `[toasts, removeToast]`
- Clear timers on unmount to prevent memory leaks
- Manual testing required: trigger multiple toasts rapidly
- Fallback: Manual close button always works

**Contingency**: If auto-dismiss fails, remove `useEffect` and rely on manual close only

### Risk 3: Zod Validation Performance Impact
**Severity**: Low
**Likelihood**: Low (optional feature)
**Impact**: Could slow down API responses if validation is expensive

**Mitigation**:
- Validation is OPTIONAL (validator parameter)
- Use only in development or critical endpoints
- Benchmark large arrays (1000+ references) before enabling in production
- Can be removed if performance issues arise

**Contingency**: Skip Zod validation entirely (Task C1 marked as optional)

### Risk 4: ErrorBoundary Hides Development Errors
**Severity**: Medium
**Likelihood**: Low (shows error details in dev mode)
**Impact**: Harder to debug errors during development

**Mitigation**:
- ErrorBoundary shows full stack trace in dev mode
- Console.error still logs all errors
- Can disable ErrorBoundary in main.tsx during debugging
- Production users see friendly error UI instead of white screen

### Risk 5: Constants Refactor Introduces Bugs
**Severity**: Medium
**Likelihood**: Low (simple value replacement)
**Impact**: Layout might break if wrong constant used

**Mitigation**:
- Extract constants in separate commit
- Visual QA of layout after extraction
- Verify panel sizes in browser DevTools
- Rollback is trivial (revert single commit)

**Testing Strategy**:
- Before: Take screenshot of layout with all panels
- After: Compare layout matches exactly
- Test resize behavior still works

### Risk 6: Time Estimates Too Optimistic
**Severity**: Low
**Likelihood**: Medium (always happens)
**Impact**: Phase 2.5 takes longer than 5-7 hours

**Mitigation**:
- Sessions can be split across multiple days
- Each session is independent (can pause between)
- Critical tasks (3A) prioritized - can stop after those if time runs out
- Non-critical tasks (3E documentation) can be deferred

**Contingency**: If time runs short, complete only Sessions 3A and 3B, defer rest to "Phase 2.6"

---

## 5. Testing Strategy

### Unit Testing (Session 3A, Task A3)
**Target**: `auth.store.test.ts`
```bash
pnpm test:unit auth.store.test.ts --run
```
**Acceptance**: All tests pass with global `afterEach` cleanup

### Manual Testing (Session 3A, Task A2)
**Target**: Toast notification system

**Test Cases**:
1. **Single Toast**:
   ```js
   // Browser console
   useUIStore.getState().addToast({ message: 'Success!', type: 'success' })
   ```
   - ✅ Toast appears top-right
   - ✅ Slides in from right with fade
   - ✅ Auto-dismisses after 5 seconds
   - ✅ Manual close button works

2. **Multiple Toasts**:
   ```js
   ['success', 'error', 'warning', 'info'].forEach(type => {
     useUIStore.getState().addToast({ message: `Test ${type}`, type })
   })
   ```
   - ✅ All 4 toasts stack vertically
   - ✅ Each has correct color
   - ✅ Icons match type
   - ✅ All auto-dismiss in order

3. **Error Trigger**:
   ```js
   // Trigger 401 error
   fetch('http://localhost:8005/api/bibliography/test', {
     headers: { 'Authorization': 'Bearer invalid' }
   })
   ```
   - ✅ Toast shows "Session expired. Please log in again."
   - ✅ User logged out (auth store cleared)

### Component Testing (Session 3B, Task B2)
**Target**: ErrorBoundary

**Test Component**:
```tsx
// Create in test file or temporary route
const BrokenComponent = () => {
  throw new Error('Test error for ErrorBoundary');
  return null;
};

// Wrap in ErrorBoundary and render
<ErrorBoundary>
  <BrokenComponent />
</ErrorBoundary>
```

**Acceptance**:
- ✅ Fallback UI appears (not white screen)
- ✅ Error message shown: "Test error for ErrorBoundary"
- ✅ Dev mode shows stack trace
- ✅ Reload button triggers page refresh

### Integration Testing (Session 3A, Task A1)
**Target**: API response unwrapping

**Note**: No API calls exist yet in MVP, but prepare for Phase 3

**Mock Test**:
```typescript
// Test handleResponse manually
const mockResponse = new Response(
  JSON.stringify({
    success: true,
    message: 'References retrieved',
    data: [{ _id: '1', title: 'Test' }]
  }),
  { status: 200 }
);

const result = await apiClient['handleResponse'](mockResponse);
console.log(result); // Should log array, not full envelope
```

**Acceptance**:
- ✅ `result` is `[{ _id: '1', title: 'Test' }]` (array)
- ✅ NOT `{ success: true, data: [...] }` (envelope)

### Visual QA (Session 3D, Task D2)
**Target**: Constants refactor

**Before**:
- Screenshot AppLayout with all panels visible
- Note panel sizes in DevTools

**After**:
- Screenshot AppLayout again
- Compare sizes match exactly
- Test resize handles still work

---

## 6. Success Criteria

### Session 3A Complete When:
- [ ] API response unwrapping returns `json.data` correctly
- [ ] Toast notification system fully functional (all 4 types)
- [ ] ToastContainer mounted in App.tsx
- [ ] Manual toast testing passes all cases
- [ ] Test cleanup added to auth.store.test.ts
- [ ] All tests pass: `pnpm test:unit`

### Session 3B Complete When:
- [ ] 17 utility functions present in `utils.ts`
- [ ] ErrorBoundary component created and tested
- [ ] ErrorBoundary wrapped around App in main.tsx
- [ ] Skeleton component created with 3 variants
- [ ] TypeScript compiles with no errors

### Session 3C Complete When:
- [ ] Zod validators created for Reference, Collection, Tag
- [ ] ApiClient optionally supports validator parameter (or decided to skip)
- [ ] App.tsx router prop uses proper Router type
- [ ] ApiResponse has JSDoc discouraging `any`
- [ ] Reference type alignment verified (no changes needed)

### Session 3D Complete When:
- [ ] React Query config extracted to `queryClient.ts`
- [ ] Stale time, cache time, retry policies documented
- [ ] Constants file created with all magic numbers
- [ ] AppLayout and client.ts updated to use constants
- [ ] Visual QA confirms no layout changes

### Session 3E Complete When:
- [ ] STATUS.md reduced to <150 lines
- [ ] Active work section at top of STATUS.md
- [ ] CHANGELOG.md created with Phase 1, 2, 2.5 history
- [ ] All historical details moved from STATUS.md to CHANGELOG.md
- [ ] Quick navigation links added to STATUS.md

### Phase 2.5 Complete When:
- [ ] All session completion criteria met
- [ ] All critical issues from reviews resolved
- [ ] All important patterns in place
- [ ] Type safety improved (no regressions)
- [ ] Documentation streamlined
- [ ] Ready to start Phase 3 Session 4 (Library View)

---

## 7. Implementation Order & Dependencies

### Dependency Graph

```
Session 3A (CRITICAL - no dependencies)
  ├─ Task A1: API Response Unwrapping
  ├─ Task A2: Toast UI
  └─ Task A3: Test Cleanup

Session 3B (depends on: 3A complete)
  ├─ Task B1: Utility Functions
  ├─ Task B2: Error Boundary
  └─ Task B3: Skeleton Components

Session 3C (depends on: 3B complete)
  ├─ Task C1: Zod Validators
  ├─ Task C2: Type Safety Gaps
  └─ Task C3: Type Alignment Verification

Session 3D (depends on: 3C complete)
  ├─ Task D1: React Query Config
  └─ Task D2: Constants Extraction

Session 3E (no dependencies, can be done anytime)
  ├─ Task E1: STATUS.md Restructure
  └─ Task E2: CHANGELOG.md Creation
```

### Sequential Requirements

**MUST be sequential**:
- 3A → 3B → 3C → 3D (each builds on previous)
- Within 3A: A1 and A2 can be parallel, A3 must be last
- Within 3B: All can be parallel
- Within 3C: C3 (verification) should be last
- Within 3D: D1 and D2 can be parallel

**CAN be parallel**:
- 3E (documentation) can happen anytime, including before 3A
- Tasks within same session (unless noted)

### Recommended Approach

**If time constrained**:
1. Complete 3A (critical fixes) - ~2 hours
2. Complete 3B (patterns) - ~1.5 hours
3. Defer 3C-3E to "Phase 2.6" if needed

**If time available**:
- Do all sessions in order (3A → 3B → 3C → 3D → 3E)
- Take breaks between sessions
- Commit after each session

---

## 8. Deliverables Summary

### Files to Create (10 new)
1. `src/components/ui/Toast.tsx` - Toast primitive with CVA
2. `src/components/ui/ToastContainer.tsx` - Toast manager with animations
3. `src/components/ui/Skeleton.tsx` - Loading skeletons
4. `src/components/ErrorBoundary.tsx` - Error catcher
5. `src/common/api/validators.ts` - Zod schemas (optional)
6. `src/common/api/queryClient.ts` - React Query config
7. `src/common/constants.ts` - Magic numbers
8. `CHANGELOG.md` - Historical changes
9. `src/common/utils.ts` - ⚠️ EXISTS, but add 15+ functions
10. `src/common/validation.ts` - ❌ REMOVED from plan (premature)

### Files to Modify (8 existing)
1. `src/common/api/client.ts` - Fix handleResponse unwrapping
2. `src/common/utils.ts` - Add utility functions
3. `src/common/types.ts` - ❌ NO CHANGES (verified aligned)
4. `src/App.tsx` - Add ToastContainer, fix router type
5. `src/main.tsx` - Wrap in ErrorBoundary, use queryClient
6. `src/store/__tests__/auth.store.test.ts` - Add afterEach cleanup
7. `src/components/layout/AppLayout.tsx` - Use constants
8. `STATUS.md` - Restructure for active focus
9. ~~`src/routes/library.tsx`~~ - ❌ NO CHANGES (type issue is API bug)

### Estimated Lines of Code
- **New code**: ~800 lines
- **Modified code**: ~150 lines
- **Documentation**: ~500 lines (CHANGELOG.md)
- **Total**: ~1,450 lines

---

## 9. Post-Implementation Checklist

After completing Phase 2.5, verify:

### Code Quality
- [ ] `pnpm lint` passes with no errors
- [ ] `pnpm test:unit` passes all tests
- [ ] TypeScript compiles with no errors: `pnpm tsc --noEmit`
- [ ] No console warnings in browser (http://localhost:5173)

### Functionality
- [ ] Toast notifications appear and auto-dismiss
- [ ] Error boundary catches errors and shows fallback
- [ ] Layout still works with constants (visual QA)
- [ ] API client typed correctly (no type errors)

### Documentation
- [ ] STATUS.md <150 lines and focused on active work
- [ ] CHANGELOG.md complete with all Phase 1, 2, 2.5 details
- [ ] All code has JSDoc comments where appropriate
- [ ] README.md updated if needed (add Phase 2.5 mention)

### Git Hygiene
- [ ] Each session committed separately
- [ ] Commit messages descriptive (e.g., "feat(ui): add toast notification system")
- [ ] No uncommitted changes
- [ ] Branch named appropriately (e.g., `phase-2.5-fixes`)

### Readiness for Phase 3
- [ ] All critical issues resolved (reviews cleared)
- [ ] Foundation solid (no known bugs)
- [ ] Documentation up-to-date
- [ ] Team can start Session 4 (Library View) immediately

---

## 10. Notes for Implementation

### General Guidelines
1. **Work incrementally**: Commit after each session
2. **Test frequently**: Don't wait until end to test
3. **Read reviews**: Refer back to original review files for context
4. **Ask questions**: If unclear, ask before implementing
5. **Document decisions**: Add comments explaining non-obvious choices

### Common Pitfalls to Avoid
1. ❌ Don't skip testing toast notifications manually
2. ❌ Don't forget to wrap App in ErrorBoundary (easy to miss)
3. ❌ Don't add form validation pattern yet (no forms exist)
4. ❌ Don't modify Reference type (it's already correct)
5. ❌ Don't optimize Zustand subscriptions yet (premature)

### When to Ask for Help
- If API response unwrapping causes unexpected errors
- If toast animations don't work (Headless UI setup)
- If ErrorBoundary doesn't catch errors
- If constants refactor breaks layout visually
- If time estimates significantly off (>2x)

### Hand-off to Phase 3
After Phase 2.5 complete:
1. Verify "Post-Implementation Checklist" above
2. Read `UnifiedImplementationChecklist.md` Session 4
3. Ensure `STATUS.md` shows "Phase 3 - Session 4" as active
4. All Phase 2.5 changes committed and pushed
5. Brief team on completed fixes and any deviations from plan

---

## Appendix A: Original Plan vs Final Plan

### Changes Made

| Original Item | Change | Reason |
|--------------|--------|--------|
| Session 3C: "Create Form Validation Pattern" | ❌ Removed | Premature - no forms exist yet, will be done in Phase 3 when needed |
| Session ordering | ✅ Moved React Query config to new 3F | Was mentioned in review but missing from sessions |
| library.tsx type fix | ✅ Clarified as symptom | Not a separate fix - resolved by API unwrapping |
| Utility functions count | ✅ Increased from 6 to 17 | Editor has 14, plus 3 bibliography-specific |
| Zod validation | ⚠️ Made optional | Can be deferred to Phase 3 if time constrained |
| Reference type alignment | ✅ Marked as verification only | No changes needed - types already match |

### Time Estimate Changes
- Original: 6-8 hours
- Final: 5-7 hours
- Reduction due to: Removing premature form validation, clarifying library.tsx is not separate fix

---

**END OF PLAN**

**Status**: ✅ APPROVED FOR IMPLEMENTATION
**Next Step**: Begin Session 3A, Task A1 (API Response Unwrapping)
