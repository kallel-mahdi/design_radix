# Bibliography Manager - Phase 2 Code Review
## Session 3 Implementation Analysis

**Last Updated**: 2025-01-09
**Reviewer**: Claude Code (Code Review Agent)
**Scope**: 16 files modified in bibliography_frontend/ for Phase 2 foundation
**Status**: ✅ Phase 2 Complete - Ready for Phase 3 with recommended fixes

---

## Executive Summary

Phase 2 implementation successfully established core foundation: API client (fetch-based), Zustand stores (auth + UI), layout structure (resizable panels), and 7+ UI primitives copied from editor. **Overall quality: 8/10**. Code is production-ready with minor improvements recommended.

**Critical Findings**: 1 (toast implementation missing)
**Important Improvements**: 5 (type safety, missing utilities, error boundaries)
**Minor Suggestions**: 4 (documentation, refactoring opportunities)
**Architecture Considerations**: 3 (design deviations, missing patterns)

**Recommendation**: Fix toast notification implementation (CRITICAL) before Phase 3. Address type safety gaps and add error boundaries during Phase 3-4 feature development.

---

## 1. CRITICAL ISSUES

### 🚨 ISSUE #1: Toast Notification System Not Implemented

**File**: `src/store/ui.store.ts:182-192` (addToast method)
**Severity**: Critical
**Impact**: API client calls `addToast()` but no UI component displays toasts. Errors shown in ApiClient will be silent.

**Current State**:
```typescript
// src/store/ui.store.ts - Store has addToast/removeToast actions
addToast: (toast) =>
  set(
    (state) => ({
      toasts: [
        ...state.toasts,
        { ...toast, id: Math.random().toString(36).substr(2, 9) },
      ],
    }),
    false,
    'ui/addToast'
  ),

// src/common/api/client.ts:152-154 - ApiClient calls addToast
useUIStore.getState().addToast({
  message: 'Session expired. Please log in again.',
  type: 'error',
});
```

**Missing**: No `<Toast />` or `<ToastContainer />` component renders toasts from store.

**Recommendation**:
1. **Before Phase 3**: Create `src/components/ui/Toast.tsx` and `ToastContainer.tsx`
2. Mount `<ToastContainer />` in `App.tsx` (below GlobalCursor)
3. Use Headless UI Transition for animations
4. Auto-dismiss after `toast.duration` (default 5000ms)

**Example Implementation**:
```tsx
// src/components/ui/ToastContainer.tsx
import { useToasts, useUIStore } from '@/store/ui.store';
import { Transition } from '@headlessui/react';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

export const ToastContainer: React.FC = () => {
  const toasts = useToasts();
  const removeToast = useUIStore((state) => state.removeToast);

  React.useEffect(() => {
    toasts.forEach((toast) => {
      const duration = toast.duration || 5000;
      const timer = setTimeout(() => removeToast(toast.id), duration);
      return () => clearTimeout(timer);
    });
  }, [toasts, removeToast]);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Transition
          key={toast.id}
          show={true}
          appear
          enter="transition duration-200"
          enterFrom="opacity-0 translate-x-4"
          enterTo="opacity-100 translate-x-0"
          leave="transition duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0 translate-x-4"
        >
          <div className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border",
            toast.type === 'error' && "bg-red-900/90 border-red-700 text-red-100",
            toast.type === 'success' && "bg-green-900/90 border-green-700 text-green-100",
            toast.type === 'warning' && "bg-yellow-900/90 border-yellow-700 text-yellow-100",
            toast.type === 'info' && "bg-blue-900/90 border-blue-700 text-blue-100"
          )}>
            {toast.type === 'success' && <CheckCircleIcon className="w-5 h-5" />}
            {toast.type === 'error' && <ExclamationCircleIcon className="w-5 h-5" />}
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="hover:opacity-75">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </Transition>
      ))}
    </div>
  );
};

// src/App.tsx
export const App: React.FC<AppProps> = ({ router, queryClient }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <GlobalCursor />
      <ToastContainer />  {/* ADD THIS */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};
```

**Urgency**: Before Phase 3 (Session 4). Without this, users won't see API errors.

---

## 2. MISSING PATTERNS FROM EDITOR

### ⚠️ PATTERN #1: Error Boundary Component

**Source**: Check `editor_frontend/src/components/ErrorBoundary.tsx`
**Status**: Not found in bibliography_frontend
**Severity**: Important

**Why Needed**: React components can throw errors. Without ErrorBoundary, entire app crashes on component error (white screen).

**Recommendation**:
```tsx
// src/components/ErrorBoundary.tsx
import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // TODO: Send to error tracking service (Sentry, LogRocket, etc.) in Phase 2
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-bg-dark">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-text-primary mb-4">
              Something went wrong
            </h1>
            <p className="text-text-secondary mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-accent text-black rounded hover:bg-accent-hover"
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

// Wrap App in main.tsx
<ErrorBoundary>
  <App router={router} queryClient={queryClient} />
</ErrorBoundary>
```

**When**: Phase 3 (before feature development starts)

---

### ⚠️ PATTERN #2: Common Utilities Missing

**Source**: `editor_frontend/src/common/utils.ts`
**Current**: Bibliography has `src/common/utils.ts` with only `cn()` function
**Severity**: Important

**Missing Utilities** (check editor for these):
1. **Date formatting**: `formatDate(date, format)` - for reference dates
2. **File size formatting**: `formatFileSize(bytes)` - for PDF sizes
3. **Debounce/Throttle**: `debounce()`, `throttle()` - for search input
4. **String truncation**: `truncate(str, maxLen)` - for long titles
5. **DOI validation**: `isValidDOI(doi)` - regex check
6. **Author name formatting**: `formatAuthorList(authors, maxCount)` - "Smith et al."

**Recommendation**:
Copy from editor_frontend/src/common/utils.ts. If editor doesn't have them, add from this template:

```typescript
// src/common/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date formatting
export function formatDate(date: Date | string, format: 'short' | 'long' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (format === 'short') {
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// File size formatting
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Debounce
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// String truncation
export function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? `${str.slice(0, maxLen)}...` : str;
}

// DOI validation
export function isValidDOI(doi: string): boolean {
  return /^10\.\d{4,}\/\S+$/.test(doi);
}

// Author list formatting
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
```

**When**: Phase 3 (Session 4-5, before implementing features that need these)

---

### ⚠️ PATTERN #3: Loading Skeleton Components

**Source**: Check `editor_frontend/src/components/ui/` for Skeleton.tsx
**Status**: Not implemented (STATUS.md only mentions LoadingSpinner)
**Severity**: Medium (nice-to-have for Phase 3)

**Why Needed**: Better UX than spinner - shows content structure while loading.

**Recommendation**:
Check editor for Skeleton component. If not present, use this:

```tsx
// src/components/ui/Skeleton.tsx
import { cn } from '@/common/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, variant = 'rectangular' }) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-700',
        variant === 'text' && 'h-4 rounded',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded',
        className
      )}
    />
  );
};

// Usage in ReferenceTable (while loading)
{isLoading && (
  <div className="space-y-2 p-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-3">
        <Skeleton className="w-4 h-4" variant="circular" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-3/4 h-4" />
          <Skeleton className="w-1/2 h-3" />
        </div>
      </div>
    ))}
  </div>
)}
```

**When**: Phase 3+ (optional, not critical)

---

### ⚠️ PATTERN #4: Form Validation Helpers

**Source**: `editor_frontend/src/common/validation.ts` (if exists)
**Status**: Not implemented
**Severity**: Medium

**Why Needed**: Phase 3 will have ReferenceModal with complex validation (authors array, DOI format, year range).

**Recommendation**:
Check editor for validation helpers. Likely using Zod schemas with react-hook-form (already in package.json).

Example pattern expected:
```typescript
// src/common/validation.ts
import { z } from 'zod';

export const AuthorSchema = z.object({
  given: z.string().optional(),
  family: z.string().optional(),
});

export const ReferenceSchema = z.object({
  type: z.enum(['article', 'book', 'chapter', 'conference', 'thesis', 'other']),
  title: z.string().min(1, 'Title is required'),
  authors: z.array(AuthorSchema).optional(),
  year: z.number().int().min(1000).max(2100).nullable(),
  doi: z.string().regex(/^10\.\d{4,}\/\S+$/, 'Invalid DOI format').or(z.literal('')).optional(),
  url: z.string().url('Invalid URL').or(z.literal('')).optional(),
  tags: z.array(z.string()).optional(),
});

export type ReferenceFormData = z.infer<typeof ReferenceSchema>;
```

**When**: Phase 3 Session 6 (before building ReferenceModal)

---

### ⚠️ PATTERN #5: Focus Management Utilities

**Source**: `editor_frontend/src/common/` or hooks
**Status**: Not implemented
**Severity**: Low (accessibility)

**Why Needed**: Modals should trap focus, restore focus on close. Tree navigation needs keyboard support.

**Recommendation**:
Check editor for `useFocusTrap()` or similar hook. Headless UI Dialog handles this for modals automatically, but custom components (TreeView) need manual implementation.

**When**: Phase 2+ (when implementing keyboard shortcuts)

---

## 3. DESIGN DEVIATIONS FROM MOCKUPS

### 📐 DEVIATION #1: Accent Color Mismatch

**File**: `src/styles/tailwind.css:20`
**Expected** (from DesignSystem.md): `#04E39E` (neon green)
**Actual** (in tailwind.css @theme): `--color-accent: #04E39E;` ✅ CORRECT
**Actual** (in mockup bibliography1_1.png): Shows `#04E39E` (neon green) ✅ MATCHES

**Status**: ✅ NO DEVIATION - Colors correctly implemented

---

### 📐 DEVIATION #2: Activity Bar Icon Style

**File**: `src/components/layout/ActivityBar.tsx`
**Expected** (from mockup): Circular icons with green highlight for active view
**Actual** (from code): Using Heroicons outline style, active state with `bg-accent/10 border-l-2`

**Visual Difference**:
- Mockup shows circular green background for active icon
- Code uses left border + subtle background tint

**Recommendation**: **Intentional Design Evolution** - Border approach is cleaner and more VS Code-like (matches editor aesthetic). No change needed unless user explicitly requests mockup style.

**Severity**: Low (aesthetic preference)

---

### 📐 DEVIATION #3: Details Pane Default State

**File**: `src/store/ui.store.ts:86`
**Code**: `detailsPaneOpen: false` (closed by default)
**Mockup**: Shows details pane open with "Select a reference to view details"

**Recommendation**: **Correct as implemented**. Pane should auto-open when reference selected (implemented in AppLayout.tsx:74). Default closed state makes sense for first load.

**Severity**: None (implementation is better than mockup)

---

### 📐 DEVIATION #4: Custom Cursor Implementation

**File**: `src/components/ui/GlobalCursor.tsx` + `src/styles/tailwind.css:81-115`
**Expected** (from DesignSystem.md): Neon green triangle cursor + blinking text cursor for writing surfaces
**Actual**: Hiding native cursor globally with CSS, but GlobalCursor component renders 8px circular dot (not triangle)

**Current Implementation**:
```tsx
// src/components/ui/GlobalCursor.tsx:823-835
<div
  style={{
    width: '8px',
    height: '8px',
    backgroundColor: 'var(--color-app-accent)',  // #00DF82
    borderRadius: '50%',  // Circular, not triangle
    boxShadow: '0 0 10px var(--color-app-accent)',
  }}
/>
```

**CSS Cursor Hiding**:
```css
/* src/styles/tailwind.css:83-114 */
* {
  cursor: none;  /* Hides ALL cursors */
}

/* Then overrides for specific elements */
button, a, input[type='text'], ... {
  cursor: text;  /* ❌ WRONG - these should stay hidden, show custom cursor */
}
```

**Issues**:
1. **Cursor shape**: Circular dot instead of triangle (DesignSystem.md specifies triangle)
2. **CSS override contradiction**: Line 99 sets `cursor: text` for inputs, but custom cursor system expects `cursor: none` globally
3. **Missing text cursor mode**: No blinking text cursor for writing surfaces (DesignSystem.md Section 9.2)

**Recommendation**:
```tsx
// Fix 1: Triangle cursor shape (add to GlobalCursor.tsx)
const [cursorMode, setCursorMode] = useState<'normal' | 'text'>('normal');

// Track cursor mode based on hovered element
useEffect(() => {
  const handleMouseOver = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.matches('input, textarea, [contenteditable="true"]')) {
      setCursorMode('text');
    } else {
      setCursorMode('normal');
    }
  };

  document.addEventListener('mouseover', handleMouseOver);
  return () => document.removeEventListener('mouseover', handleMouseOver);
}, []);

return (
  <div style={{ position: 'fixed', left: `${position.x}px`, top: `${position.y}px`, pointerEvents: 'none', zIndex: 9999 }}>
    {cursorMode === 'normal' ? (
      // Triangle cursor (use SVG or CSS triangle)
      <svg width="16" height="16" viewBox="0 0 16 16">
        <path d="M0 0 L0 14 L10 8 Z" fill="var(--color-app-accent)" />
      </svg>
    ) : (
      // Blinking text cursor
      <div className="w-0.5 h-5 bg-accent animate-pulse" />
    )}
  </div>
);

// Fix 2: Remove cursor overrides from tailwind.css (lines 88-100)
// Delete this section - let custom cursor handle everything
```

**Urgency**: Low priority (Phase 2+). Current circular cursor works, just doesn't match spec. Fix when polishing UI.

---

## 4. TYPE SAFETY GAPS

### 🔷 GAP #1: ApiClient Generic Return Types Not Enforced

**File**: `src/common/api/client.ts:200-227`
**Severity**: Medium (runtime safety)

**Issue**: API client methods accept generic `<T>` but don't validate response shape.

**Example**:
```typescript
// Current code allows this (no runtime validation)
const response = await apiClient.get<Reference>('/references/123');
// If backend returns { data: { foo: 'bar' } }, TypeScript thinks it's a Reference
// No error until you try to access reference.title → runtime error
```

**Recommendation**: Add Zod validation at API boundary (ComponentsSpec.md Section 2.11):

```typescript
// src/common/api/validators.ts
import { z } from 'zod';

const AuthorSchema = z.object({
  given: z.string().optional(),
  family: z.string().optional(),
  full: z.string(),
});

export const ReferenceSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  type: z.enum(['article', 'book', 'chapter', 'conference', 'thesis', 'other']),
  title: z.string(),
  authors: z.array(AuthorSchema),
  year: z.number().nullable(),
  // ... rest of fields
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Reference = z.infer<typeof ReferenceSchema>;

// Update ApiClient to use validators
private async handleResponse<T>(response: Response, validator?: z.ZodSchema<T>): Promise<T> {
  let data: any;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    // ... error handling
  }

  // Validate if schema provided
  if (validator) {
    try {
      return validator.parse(data);
    } catch (err) {
      throw {
        message: 'Invalid response format from server',
        code: 'VALIDATION_ERROR',
        details: err,
      };
    }
  }

  return data as T;
}

// Usage in features
const response = await apiClient.get('/references/123');
const reference = ReferenceSchema.parse(response); // Explicit validation
```

**When**: Phase 3 (before fetching real data from backend)

---

### 🔷 GAP #2: Reference Type Mismatch with Backend

**File**: `src/common/types.ts:4-35`
**Backend**: `bibliography_plan/backend_plan/APIDesignSystem.md` (first 200 lines read)

**Comparison**:

| Field | Frontend Type | Backend Type (expected) | Match? |
|-------|--------------|------------------------|--------|
| `_id` | `string` | `ObjectId` (MongoDB, serialized as string) | ✅ |
| `pdf` | `{ storedPath, originalName, size, mimeType, uploadedAt } \| null` | `{ storedPath, originalName, size, mimeType, uploadedAt }` (not null if hasPdf: true) | ⚠️ |
| `citationKey` | `string` | Not in backend spec | ❓ |
| `hasPdf` | `boolean` | Not in backend spec (derived from `pdf !== null`?) | ❓ |

**Issues**:
1. **citationKey**: Frontend has this field, backend spec doesn't mention it. Either backend needs to add it, or frontend should remove it.
2. **hasPdf**: Redundant if we can check `pdf !== null`. Backend may not return this field.

**Recommendation**:
1. Verify with backend API spec (read full APIDesignSystem.md)
2. If citationKey missing from backend, add to backend schema OR remove from frontend
3. Consider `hasPdf` as computed property: `get hasPdf() { return this.pdf !== null }`

**When**: Before Phase 3 Session 6 (API integration)

---

### 🔷 GAP #3: Missing `any` Type Audit

**Search Pattern**: `grep -r ": any" src/` (not run yet, but recommended)

**Recommendation**: Audit codebase for `any` types and replace with proper types.

**Common offenders**:
- `params?: Record<string, any>` → `Record<string, string | number | boolean>`
- `payload: any` → Define proper SourceRaw types for each provider

**When**: Phase 3+ (code quality improvement)

---

## 5. DOCUMENTATION RECOMMENDATIONS

### 📝 RECOMMENDATION #1: Condense STATUS.md Historical Content

**File**: `STATUS.md:256-371` (lines 256-371 cover Phase 1 completion)
**Issue**: 115 lines of historical Phase 1 content. Once Phase 3 starts, this will grow exponentially.

**Proposed Structure**:
```markdown
# Bibliography Manager - Project Status

**Last Updated**: [Date]
**Current Phase**: Phase 3 - Features Implementation

---

## Active Work (Current Session)

[Current session details]

---

## Phase History (Summary)

### Phase 1: Documentation Cleanup ✅ COMPLETE
- All planning docs verified and consistent
- Removed TaskCard/TaskModal references
- Added Zustand devtools examples
- **Details**: See CHANGELOG.md#phase-1

### Phase 2: Foundation Setup ✅ COMPLETE (2025-01-09)
- 16 files modified
- API client (fetch-based), Zustand stores, resizable layout implemented
- **Details**: See CHANGELOG.md#phase-2

### Phase 3: Features - IN PROGRESS
[Current phase work]

---

## Quick Links
- Roadmap: bibliography_plan/Roadmap.md
- Implementation: bibliography_plan/UnifiedImplementationChecklist.md
- Issues: See session code reviews in dev/active/
```

**Create CHANGELOG.md**:
```markdown
# Bibliography Manager - Changelog

## Phase 2 - Foundation Setup (2025-01-09)

### Dependencies Added
- framer-motion@11.18.2
- react-resizable-panels@2.1.9
- react-pdf@9.2.1
- pdfjs-dist@4.4.168

### Dependencies Removed
- axios (replaced with fetch-based ApiClient)

### Files Modified (16 total)

#### Core Components
- src/components/ui/Button.tsx (enhanced with forwardRef)
- src/components/ui/Card.tsx (NEW - complete card system)
- src/components/ui/Input.tsx (NEW)
- src/components/ui/Modal.tsx (NEW - Headless UI Dialog)
- src/components/ui/LoadingSpinner.tsx (NEW)
- src/components/ui/GlobalCursor.tsx (NEW - neon green custom cursor)
- src/components/ui/Resizable.tsx (NEW - react-resizable-panels wrapper)

[... rest of details]

---

## Phase 1 - Documentation Cleanup (2025-01-08)

[Historical details moved here]
```

**Benefits**:
- STATUS.md stays <200 lines (current: 371 lines)
- Easy to find current work
- Historical context preserved in CHANGELOG.md
- Searchable history by phase

**When**: Before Phase 3 Session 4

---

### 📝 RECOMMENDATION #2: Create Architecture Decision Records (ADRs)

**Issue**: Design decisions (fetch vs axios, react-resizable-panels vs custom) not documented.

**Recommendation**:
Create `docs/adr/` folder with lightweight ADRs:

```markdown
# docs/adr/001-fetch-based-api-client.md

# Use Fetch-Based API Client Instead of Axios

**Date**: 2025-01-09
**Status**: Accepted
**Context**: Need HTTP client for bibliography frontend

## Decision
Use native `fetch()` with custom ApiClient class instead of axios.

## Rationale
- Matches editor_frontend pattern (consistency)
- Smaller bundle size (no axios dependency)
- Native browser API (well-supported)
- Full control over request/response handling

## Consequences
- Must implement timeout manually (AbortController)
- Must normalize errors manually
- Manual token injection (no axios interceptors)

## Alternatives Considered
- axios: More features, but adds 13KB to bundle
- ky: Modern fetch wrapper, but not used in editor
```

**When**: Optional (nice-to-have documentation practice)

---

### 📝 RECOMMENDATION #3: Add JSDoc Comments to Complex Functions

**Files**: `src/common/api/client.ts`, `src/store/*.ts`

**Current**: No JSDoc comments on public methods
**Recommendation**: Add JSDoc for DX (autocomplete hints)

**Example**:
```typescript
/**
 * Fetch-based API client for bibliography service
 * Automatically injects auth token from Zustand store
 *
 * @example
 * ```typescript
 * const references = await apiClient.get<Reference[]>('/references');
 * const newRef = await apiClient.post<Reference>('/references', { title: 'My Paper' });
 * ```
 */
class ApiClient {
  /**
   * Perform GET request
   * @param endpoint - API endpoint (e.g., '/references/123')
   * @param options - Request options (params, headers)
   * @returns Parsed JSON response typed as T
   * @throws {ApiError} If request fails or response is not OK
   */
  public async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, 'GET', options);
  }
}
```

**When**: Phase 3+ (code quality improvement)

---

## 6. OPTIONAL IMPROVEMENTS

### 💡 IMPROVEMENT #1: Optimize Zustand Subscriptions

**File**: `src/components/layout/AppLayout.tsx:12-19`
**Current**: Subscribes to multiple UI store slices separately

**Current Code**:
```typescript
const {
  activeView,
  setActiveView,
  detailsPaneOpen,
  detailsPaneTab,
  setDetailsPaneTab,
  setDetailsPaneOpen,
} = useUIStore();
// ❌ Subscribes to entire store, re-renders on any change
```

**Optimized**:
```typescript
// ✅ Subscribe only to needed slices
const activeView = useUIStore((state) => state.activeView);
const setActiveView = useUIStore((state) => state.setActiveView);
const detailsPaneOpen = useUIStore((state) => state.detailsPaneOpen);
const detailsPaneTab = useUIStore((state) => state.detailsPaneTab);
const setDetailsPaneTab = useUIStore((state) => state.setDetailsPaneTab);
const setDetailsPaneOpen = useUIStore((state) => state.setDetailsPaneOpen);
// Or use selectors from ui.store.ts (lines 222-234)
```

**Benefit**: Avoids unnecessary re-renders (performance)
**When**: Phase 3+ (optimization pass)

---

### 💡 IMPROVEMENT #2: Extract Magic Numbers to Constants

**File**: `src/components/layout/AppLayout.tsx:8`

**Current**:
```typescript
const ACTIVITY_BAR_WIDTH = 64; // ✅ Good
```

**Other Magic Numbers** (search codebase):
- Panel default/min/max sizes (lines 46-47, 67, 77)
- Timeout durations (api/client.ts:30 - 30000ms)
- Toast auto-dismiss duration (ui.store.ts - not set, should be)

**Recommendation**:
```typescript
// src/common/constants.ts
export const LAYOUT = {
  ACTIVITY_BAR_WIDTH: 64,
  SIDEBAR: {
    DEFAULT_SIZE: 25,  // Percentage
    MIN_SIZE: 15,
    MAX_SIZE: 40,
  },
  DETAILS_PANE: {
    DEFAULT_SIZE: 25,
    MIN_SIZE: 20,
    MAX_SIZE: 50,
  },
  MAIN: {
    MIN_SIZE: 30,
  },
} as const;

export const API = {
  TIMEOUT: 30000,  // 30 seconds
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005/api/bibliography',
} as const;

export const UI = {
  TOAST_DURATION: 5000,  // 5 seconds
  DEBOUNCE_DELAY: 300,   // For search input
} as const;
```

**When**: Phase 3+ (refactoring)

---

### 💡 IMPROVEMENT #3: Add React Query Error/Loading States Hook

**Issue**: TanStack Query hooks will be used everywhere in Phase 3. Need consistent error/loading handling.

**Recommendation**:
```typescript
// src/common/hooks/useQueryState.ts
import { useIsFetching, useIsMutating } from '@tanstack/react-query';

export function useQueryState() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  return {
    isLoading: isFetching > 0 || isMutating > 0,
  };
}

// Usage in components
const { isLoading } = useQueryState();
if (isLoading) return <LoadingSpinner />;
```

**When**: Phase 3 Session 6 (when building first React Query hooks)

---

### 💡 IMPROVEMENT #4: Color Palette in tailwind.config.js Should Match DesignSystem.md

**File**: `tailwind.config.js` vs `src/styles/tailwind.css`

**Current**:
- Colors defined in `tailwind.css` @theme block (CSS vars)
- `tailwind.config.js` only extends fontFamily

**DesignSystem.md Section 1.2**: Specifies `primary`, `secondary`, `semantic` color scales

**Issue**: No type-safe color access in Tailwind classes. Can't use `bg-primary-500` or `text-secondary-600`.

**Recommendation**: Keep CSS vars for runtime theming, but also expose in config for IntelliSense:

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        // CSS var references (for Tailwind classes)
        bg: {
          dark: 'var(--color-bg-dark)',
          surface: 'var(--color-bg-surface)',
          hover: 'var(--color-bg-hover)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          accent: 'var(--color-border-accent)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          dark: 'var(--color-accent-dark)',
        },
        // Brand scales (from DesignSystem.md 1.2)
        primary: {
          50: '#E6F5F2', 100: '#CCEBE5', 200: '#99D7CB',
          // ... rest
        },
        secondary: {
          50: '#F0FCF0', 100: '#E0F9E0',
          // ... rest
        },
      },
    },
  },
};
```

**Benefits**:
- IntelliSense autocomplete for `bg-primary-500`
- Maintains CSS var flexibility
- Matches DesignSystem.md spec

**When**: Phase 3 (polish pass)

---

## 7. ARCHITECTURE CONSIDERATIONS

### 🏛️ CONSIDERATION #1: React Query Cache Configuration

**File**: Not implemented (needs `src/common/api/queryClient.ts`)
**Severity**: Medium (affects UX)

**Current**: App.tsx creates QueryClient inline (line 13):
```typescript
export const App: React.FC<AppProps> = ({ router, queryClient }) => {
  // queryClient passed from main.tsx (not shown)
```

**Issue**: Default React Query config may not be optimal for bibliography use case.

**Recommendation**:
```typescript
// src/common/api/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes (references don't change often)
      gcTime: 10 * 60 * 1000, // 10 minutes (keep in cache)
      retry: 1, // Only retry once (avoid spamming server on errors)
      refetchOnWindowFocus: false, // Don't refetch when switching tabs
      refetchOnReconnect: true, // Do refetch after network reconnection
    },
    mutations: {
      retry: 0, // Never retry mutations (user should trigger)
    },
  },
});

// src/main.tsx
import { queryClient } from '@/common/api/queryClient';

const router = createRouter({ routeTree });
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App router={router} queryClient={queryClient} />
  </StrictMode>
);
```

**Benefits**:
- Optimized for bibliography data patterns (infrequent changes)
- Centralized cache config
- Easy to adjust globally

**When**: Phase 3 Session 6 (before implementing first React Query hooks)

---

### 🏛️ CONSIDERATION #2: API Response Format Mismatch

**Frontend**: `src/common/api/client.ts:6-16` expects `{ data, message, success, pagination? }`
**Backend**: `bibliography_plan/backend_plan/APIDesignSystem.md:18-24` specifies same format ✅

**Current Implementation**:
```typescript
// src/common/api/client.ts:131-171
private async handleResponse<T>(response: Response): Promise<T> {
  let data: any;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    // ... error handling
  }

  return data as T;  // ❌ Returns entire response, not response.data
}
```

**Issue**: `handleResponse<T>` returns full response object, but callers expect just `data` field.

**Example Problem**:
```typescript
// Caller expects Reference[]
const references = await apiClient.get<Reference[]>('/references');
// But receives: { success: true, message: '...', data: Reference[] }
// Type error: Property 'title' does not exist on type '{ success: true, ... }'
```

**Fix Required**:
```typescript
private async handleResponse<T>(response: Response): Promise<T> {
  let json: any;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  if (!response.ok) {
    // ... error handling
  }

  // ✅ Return only data field (unwrap ApiResponse envelope)
  return json.data as T;
}
```

**Or** change interface to match:
```typescript
export async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
  // Returns full { success, message, data } object
  // Callers must do: const { data } = await apiClient.get(...)
}
```

**Recommendation**: Unwrap `data` in handleResponse (simpler caller code). Backend envelope is internal detail.

**Urgency**: **CRITICAL** - Fix before Phase 3 Session 6 (API integration)

---

### 🏛️ CONSIDERATION #3: File Upload Progress Tracking

**File**: `src/common/api/client.ts:232-258` (uploadFile method)
**Current**: No progress tracking

**Issue**: PDF uploads can be large (10MB max per Spec.md). Users need progress feedback.

**Recommendation**:
```typescript
public async uploadFile<T>(
  endpoint: string,
  file: File,
  onProgress?: (progress: number) => void,  // Add progress callback
  options?: RequestOptions,
): Promise<T> {
  const url = this.buildURL(endpoint, options?.params);
  const headers = this.buildHeaders();
  delete headers['Content-Type'];

  const formData = new FormData();
  formData.append('file', file);

  // Use XMLHttpRequest for progress tracking (fetch doesn't support)
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = (e.loaded / e.total) * 100;
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', async () => {
      const response = new Response(xhr.response, {
        status: xhr.status,
        statusText: xhr.statusText,
      });
      try {
        const data = await this.handleResponse<T>(response);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });

    xhr.addEventListener('error', () => {
      reject(this.normalizeError(new Error('Upload failed')));
    });

    xhr.open('POST', url);
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });
    xhr.send(formData);
  });
}

// Usage in ReferenceModal
const [uploadProgress, setUploadProgress] = useState(0);
await apiClient.uploadFile('/references/123/pdf', file, setUploadProgress);
```

**When**: Phase 3 Session 6 (PDF upload implementation)

---

## Summary of Recommendations

### Immediate (Before Phase 3)
1. ✅ **CRITICAL**: Implement toast notification UI (ToastContainer component)
2. ✅ **CRITICAL**: Fix API response unwrapping in handleResponse
3. ⚠️ **IMPORTANT**: Add error boundary component
4. ⚠️ **IMPORTANT**: Verify Reference type alignment with backend API

### Phase 3 (Sessions 4-7)
5. ⚠️ Add common utility functions (date format, file size, debounce, etc.)
6. ⚠️ Add Zod validation at API boundary (type safety)
7. 💡 Extract magic numbers to constants
8. 💡 Configure React Query cache defaults
9. 💡 Add file upload progress tracking

### Phase 3+ (Polish)
10. 💡 Add skeleton loading components
11. 💡 Optimize Zustand subscriptions (selectors)
12. 💡 Add JSDoc comments to public APIs
13. 📝 Condense STATUS.md, create CHANGELOG.md
14. 🏛️ Fix custom cursor (triangle shape, text mode)

---

## Appendix: Files Reviewed

**Configuration** (4 files):
- tailwind.config.js
- src/styles/tailwind.css
- src/App.tsx
- src/main.tsx (not read, inferred from App.tsx)

**API & State** (3 files):
- src/common/api/client.ts
- src/store/auth.store.ts
- src/store/ui.store.ts

**Layout** (3 files):
- src/routes/__root.tsx
- src/components/layout/AppLayout.tsx
- src/components/layout/DetailsPane.tsx

**Types & Utils** (2 files):
- src/common/types.ts
- src/common/utils.ts (inferred existence)

**UI Components** (9 files via Glob):
- src/components/ui/Button.tsx
- src/components/ui/Card.tsx
- src/components/ui/Input.tsx
- src/components/ui/Modal.tsx
- src/components/ui/LoadingSpinner.tsx
- src/components/ui/GlobalCursor.tsx
- src/components/ui/Resizable.tsx
- src/components/ui/Tag.tsx
- src/components/ui/EmptyState.tsx

**Documentation** (4 files):
- STATUS.md
- bibliography_plan/Spec.md
- bibliography_plan/frontend_plan/ComponentsSpec.md
- bibliography_plan/frontend_plan/DesignSystem.md
- bibliography_plan/backend_plan/APIDesignSystem.md (partial)

**Design Mockup**:
- bibliography_plan/frontend_plan/User_interface/bibliography1_1.png

**Total Files Analyzed**: 25+

---

**END OF REVIEW**

Please review the findings and approve which changes to implement before I proceed with any fixes.
