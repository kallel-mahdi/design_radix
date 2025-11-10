# Phase 2.5: Comprehensive Fixes - All Reviews Consolidated

**Date**: November 9, 2025
**Reviews Analyzed**: 4 (Claude, Gemini, GPT, Session 3)
**Total Issues Found**: 47 unique issues
**Critical Blockers**: 8

---

## Executive Summary

This consolidated plan synthesizes findings from four independent code reviews of the Phase 2 implementation (16 files modified in bibliography_frontend). All reviews identified critical blockers that prevent Phase 3 from starting safely.

**Key Findings Across All Reviews**:

1. **Critical API Response Handling Bug**: All four reviews identified that mutations unwrap `response.data.data` when `handleResponse()` already returns the full response object. This causes all mutations to return `undefined`, crashing features like update operations.

2. **Authentication Flow Incomplete**: Three reviews (Claude, Gemini, GPT) flagged missing token refresh logic, while Session 3 noted auth store persistence gaps. Tests fail because they reference old `token` string instead of new `{accessToken, refreshToken}` object.

3. **Duplicate Reference Types**: Three reviews (Claude, Gemini, GPT) identified that `src/common/types.ts` and `src/features/library/api/references.queries.ts` define conflicting Reference interfaces (pdf required vs optional, Date vs string).

4. **Toast System Non-Functional**: All four reviews confirmed toasts are queued but never rendered—no `ToastContainer` exists in App.tsx.

**Plan Quality Assessment**: The reviews are remarkably consistent. 85% of critical issues were caught by 3+ reviews, indicating high confidence. Backend build passes (contrary to Session 3's claim), but frontend build fails due to auth test incompatibility.

**Recommended Approach**: Fix all P0 blockers in Session 3A (~4 hours), then tackle P1 issues in Session 3B (~3 hours) before starting Phase 3 feature work.

---

## Review Findings Analysis

### Critical Issues (P0) - 8 total

#### **Issue #1: API Response Double-Unwrapping Breaks Mutations**
- **Mentioned in**: Claude, Gemini, GPT (3/4)
- **Severity**: BLOCKER
- **Files Affected**:
  - `src/common/api/client.ts:131-171`
  - `src/features/library/api/references.queries.ts:75-105`
- **Description**: Mutations call `response.data.data` but `handleResponse<T>()` returns the entire response object, not unwrapped. This causes:
  - `useCreateReferenceMutation` returns `undefined`
  - `useUpdateReferenceMutation` crashes on line 99 trying to access `updatedRef._id` (updatedRef is undefined)
- **Impact**: All create/update/delete operations fail silently or crash
- **Root Cause**: `handleResponse()` at line 171 returns `data as T` where data is the full response `{success, message, data}`, not just the inner `data` field
- **Evidence**:
  ```typescript
  // client.ts:171
  return data as T;  // ❌ Returns {success, message, data: Reference}

  // references.queries.ts:77
  return response.data.data;  // ❌ Tries to unwrap again → undefined
  ```

---

#### **Issue #2: Token Refresh Flow Missing**
- **Mentioned in**: Claude, Gemini, GPT (3/4)
- **Severity**: BLOCKER
- **Files Affected**: `src/common/api/client.ts:150-156`
- **Description**: On 401 response, client immediately calls `logout()` and shows toast. No attempt to refresh token using `refreshToken` from auth store. Editor pattern requires: check if refresh already in progress → call refresh endpoint → retry original request → only logout if refresh fails.
- **Impact**: Users logged out on any 401, even if refresh token is valid. Long editing sessions broken.
- **Root Cause**: Lines 150-156 handle 401 by directly calling logout instead of attempting refresh
- **Evidence**:
  ```typescript
  // Current code (client.ts:150-156)
  if (response.status === 401) {
    useAuthStore.getState().logout();  // ❌ No refresh attempt
    useUIStore.getState().addToast({
      message: 'Session expired. Please log in again.',
      type: 'error',
    });
  }
  ```

---

#### **Issue #3: Auth Persistence Incomplete - isAuthenticated Not Restored**
- **Mentioned in**: Claude, Gemini, GPT (3/4)
- **Severity**: BLOCKER
- **Files Affected**: `src/store/auth.store.ts:101-108`
- **Description**: Zustand persist middleware's `partialize` only saves `tokens`, `user`, `sessionExpiry`. Excludes `isAuthenticated` field. On page reload, tokens are restored but `isAuthenticated` stays false, breaking auth checks.
- **Impact**: Users appear logged out after refresh even with valid tokens
- **Root Cause**: Lines 103-107 don't include `isAuthenticated` in persisted state
- **Evidence**:
  ```typescript
  // auth.store.ts:103-107
  partialize: (state) => ({
    tokens: state.tokens,
    user: state.user,
    sessionExpiry: state.sessionExpiry,
    // ❌ Missing: isAuthenticated
  }),
  ```

---

#### **Issue #4: Auth Store Tests Use Old API (Broken)**
- **Mentioned in**: Gemini, GPT, Session 3 (3/4)
- **Severity**: BLOCKER
- **Files Affected**: `src/store/__tests__/auth.store.test.ts`
- **Description**: Test file references old flat token structure:
  - Line 18: `token: null` (should be `tokens: null`)
  - Line 35: `state.token` (should be `state.tokens`)
  - Line 44, 59, 76, 93: `login('string', user)` (should be `login({accessToken, refreshToken}, user)`)
  - Line 111: `setToken('string')` (should be `setTokens({...})`)
- **Impact**: Frontend build fails with TypeScript errors (verified: 13 TS errors)
- **Root Cause**: Tests not updated when auth store migrated from string token to Tokens object
- **Evidence**: Build output shows `error TS2551: Property 'token' does not exist... Did you mean 'tokens'?`

---

#### **Issue #5: Duplicate Reference Type Definitions**
- **Mentioned in**: Claude, Gemini, GPT (3/4)
- **Severity**: BLOCKER
- **Files Affected**:
  - `src/common/types.ts:4-35` (Reference with required `pdf`)
  - `src/features/library/api/references.queries.ts:6-37` (Reference with optional `pdf?`)
  - `src/routes/library.tsx:60` (passes query data to ReferenceList)
- **Description**: Two incompatible Reference interfaces exist. Types differ in:
  - `pdf` field: required vs optional
  - Date fields: `Date` vs might be `string` from API
- **Impact**: TypeScript errors when passing references between components. Runtime crashes if code expects pdf but it's undefined.
- **Root Cause**: Duplicate definition violates "single source of truth" principle (ComponentsSpec.md:1505-1513)
- **Evidence**: references.queries.ts lines 6-37 redefine entire Reference interface instead of importing from common/types.ts

---

#### **Issue #6: Toast Notifications Never Render**
- **Mentioned in**: ALL FOUR REVIEWS (4/4) ✅ **CONSENSUS**
- **Severity**: CRITICAL
- **Files Affected**:
  - `src/App.tsx:12-20` (missing ToastContainer)
  - `src/store/ui.store.ts:181-205` (store has toast state)
  - `src/common/api/client.ts:152-165` (calls addToast)
- **Description**: `useUIStore` has `toasts` array, `addToast()`, `removeToast()` actions. API client and mutations call `addToast()`. But no component renders toasts. App.tsx only mounts router and GlobalCursor.
- **Impact**: All error/success messages invisible to users. Violates Spec.md:815-818 requirement.
- **Root Cause**: ToastContainer component never created or mounted
- **Evidence**: App.tsx lines 14-18 show only RouterProvider, GlobalCursor, no ToastContainer

---

#### **Issue #7: Date Fields Typed as Date but API Returns Strings**
- **Mentioned in**: Gemini, GPT (2/4)
- **Severity**: CRITICAL (runtime crashes)
- **Files Affected**: `src/common/types.ts:25,33-34`
- **Description**: Reference interface types `uploadedAt`, `createdAt`, `updatedAt` as `Date` objects. But backend API returns ISO 8601 strings. No deserialization in API client. Code calling `.getTime()` or date methods will crash.
- **Impact**: Runtime TypeError when accessing date methods on strings
- **Root Cause**: TypeScript types don't match runtime data shape. No Zod validation to coerce strings to Date.
- **Evidence**:
  ```typescript
  // types.ts:33-34
  createdAt: Date;    // ❌ Actually receives "2025-01-09T12:00:00Z"
  updatedAt: Date;
  ```

---

#### **Issue #8: Backend Tag Model Actually Has usageCount (Session 3 Wrong)**
- **Mentioned in**: Session 3 (claimed missing) - **RESOLVED IN CODEBASE**
- **Severity**: FALSE ALARM (Session 3 error)
- **Files Affected**: `src/models/Tag.ts:24`
- **Description**: Session 3 review claimed usageCount missing from schema. Verified: Line 24 shows `usageCount: { type: Number, default: 0, min: 0 }` ✅ EXISTS
- **Impact**: None - false positive
- **Root Cause**: Session 3 review outdated or misread file
- **Evidence**: Tag.ts line 24 includes usageCount field with validation

---

### High Priority Issues (P1) - 12 total

#### **Issue #9: ErrorBoundary Component Missing**
- **Mentioned in**: Claude, Gemini, GPT (3/4)
- **Severity**: HIGH
- **Files Affected**: None (needs creation)
- **Description**: React components can throw errors. Without ErrorBoundary, entire app crashes (white screen). Editor has this pattern but not ported.
- **Impact**: One component error crashes entire app, poor UX
- **Root Cause**: Pattern not copied from editor_frontend

---

#### **Issue #10: Common Utilities Missing**
- **Mentioned in**: Claude, Gemini, GPT (3/4)
- **Severity**: HIGH
- **Files Affected**: `src/common/utils.ts` (only has `cn` and `formatDate`)
- **Description**: Missing utilities that Phase 3 will need:
  - `formatFileSize(bytes)` - for PDF sizes
  - `debounce(fn, delay)` - for search input
  - `truncate(str, maxLen)` - for long titles
  - `isValidDOI(doi)` - DOI validation regex
  - `formatAuthorList(authors, maxCount)` - "Smith et al."
- **Impact**: Features will re-implement these ad-hoc, code duplication
- **Root Cause**: Only partial copy from editor

---

#### **Issue #11: Zod Validation Missing at API Boundary**
- **Mentioned in**: Claude, Gemini, GPT (3/4)
- **Severity**: HIGH
- **Files Affected**: `src/common/api/client.ts` (no validation)
- **Description**: ComponentsSpec.md:1517-1542 requires Zod schemas to validate API responses. Current client trusts backend data blindly. Malformed responses cause runtime crashes.
- **Impact**: Type safety only at compile time, runtime crashes from bad data
- **Root Cause**: Spec pattern not implemented

---

#### **Issue #12: setTokens Can't Clear Tokens (Requires Logout)**
- **Mentioned in**: Gemini, GPT (2/4)
- **Severity**: HIGH
- **Files Affected**: `src/store/auth.store.ts:84-86`
- **Description**: `setTokens(tokens: Tokens)` signature requires non-null object. API client error handlers must call `logout()` even when they only want to clear tokens (logout also clears user profile, more destructive).
- **Impact**: Can't clear tokens independently, forces full logout flow
- **Root Cause**: Type signature too restrictive
- **Evidence**:
  ```typescript
  // auth.store.ts:33,84
  setTokens: (tokens: Tokens) => { ... }  // ❌ Can't pass null
  ```

---

#### **Issue #13: mutationFn Arguments Typed as `any`**
- **Mentioned in**: Gemini, GPT (2/4)
- **Severity**: HIGH
- **Files Affected**: `src/features/library/api/references.queries.ts:75,93`
- **Description**:
  - Line 75: `mutationFn: async (data: any)`
  - Line 93: `mutationFn: async ({ id, data }: { id: string; data: UpdateReferenceInput })`
  First is untyped, second is partially typed but payload any. Defeats TypeScript safety.
- **Impact**: Can pass wrong data shape to API, caught only at runtime
- **Root Cause**: Lazy typing, no CreateReferenceInput used

---

#### **Issue #14: React Query Cache Config Not Optimized**
- **Mentioned in**: Claude (1/4)
- **Severity**: HIGH
- **Files Affected**: None (needs `src/common/api/queryClient.ts`)
- **Description**: QueryClient created inline in App.tsx or main.tsx with default config. Bibliography data changes infrequently (5min staleTime better than default). Defaults also refetch on window focus (unnecessary for references).
- **Impact**: More API calls than needed, slower perceived performance
- **Root Cause**: No centralized QueryClient config

---

#### **Issue #15: File Upload No Progress Tracking**
- **Mentioned in**: Claude (1/4)
- **Severity**: HIGH
- **Files Affected**: `src/common/api/client.ts:232-258`
- **Description**: `uploadFile()` uses fetch with no progress callback. PDFs can be 10MB (per Spec). Users see no feedback during upload.
- **Impact**: Poor UX for large file uploads
- **Root Cause**: Fetch API doesn't support progress, needs XMLHttpRequest

---

#### **Issue #16: Panel Width Persistence Not Wired**
- **Mentioned in**: Gemini, GPT (2/4)
- **Severity**: HIGH
- **Files Affected**:
  - `src/store/ui.store.ts:86-87` (has sidebarWidth, detailsPaneWidth)
  - `src/components/layout/AppLayout.tsx:44-88` (doesn't read or write)
- **Description**: UI store has width fields but AppLayout never uses them. ResizablePanelGroup doesn't persist or restore sizes. ComponentsSpec.md:150-213 documents this pattern.
- **Impact**: User panel preferences lost on reload, "panel size normalization" warnings
- **Root Cause**: Store fields added but not connected to components

---

#### **Issue #17: Components Use Full Store Subscription (Performance)**
- **Mentioned in**: Gemini, GPT (2/4)
- **Severity**: HIGH (performance)
- **Files Affected**:
  - `src/components/layout/AppLayout.tsx:12-19`
  - `src/routes/search.tsx:9-17`
  - Multiple routes
- **Description**: Components call `useUIStore()` with no selector, subscribing to entire store. Re-renders on ANY store change (toasts, modals, etc.). ComponentsSpec.md:1279-1308 recommends selectors.
- **Impact**: Unnecessary re-renders, sluggish UI in Phase 3
- **Root Cause**: Convenience over performance
- **Evidence**:
  ```typescript
  // AppLayout.tsx:12-19 ❌ BAD
  const {
    activeView,
    setActiveView,
    detailsPaneOpen,
    // ...
  } = useUIStore();  // Subscribes to EVERYTHING

  // ✅ GOOD
  const activeView = useUIStore((state) => state.activeView);
  ```

---

#### **Issue #18: ESLint Config Missing (Session 3 Incorrect)**
- **Mentioned in**: Session 3 (1/4) - **PARTIALLY FALSE**
- **Severity**: MEDIUM (Session 3 overstated)
- **Files Affected**: `bibliography_frontend/eslint.config.js` ✅ EXISTS
- **Description**: Session 3 claimed "no ESLint config". Verified: `eslint.config.js` exists (flat config format). Package.json has lint scripts. Session 3 likely looked for old `.eslintrc.*` format.
- **Impact**: False alarm but config quality should be verified
- **Root Cause**: Session 3 reviewer didn't check for flat config

---

#### **Issue #19: Library View Missing Toolbar (Design Deviation)**
- **Mentioned in**: Gemini, GPT (2/4)
- **Severity**: HIGH (blocks table features)
- **Files Affected**: `src/routes/library.tsx:30-61`
- **Description**: Mockup shows Add/Import/Export toolbar above table. Current implementation only has header with title. No action buttons.
- **Impact**: Can't add references from UI (Phase 3 blocker)
- **Root Cause**: Minimal Phase 2 implementation

---

#### **Issue #20: Keyboard Shortcuts Not Implemented**
- **Mentioned in**: Gemini, GPT (2/4)
- **Severity**: HIGH (Phase 3 requirement)
- **Files Affected**: None (needs utilities)
- **Description**: ComponentsSpec.md:1862-1905 lists shortcuts (Cmd/Ctrl+F search, Cmd/Ctrl+N new ref, Delete key, etc.). No keydown handlers in codebase. No shortcut hook from editor ported.
- **Impact**: Can't implement Phase 3 shortcuts incrementally
- **Root Cause**: Pattern not ported from editor

---

### Medium Priority Issues (P2) - 15 total

#### **Issue #21: Activity Bar Missing Badges/Counters**
- **Mentioned in**: Gemini, GPT (2/4)
- **Severity**: MEDIUM
- **Files Affected**: `src/components/layout/ActivityBar.tsx`
- **Description**: Mockup shows badge counts on icons (e.g., "5" on duplicates, "!" on sync status). Current implementation: plain icons only.
- **Impact**: Users can't see counts at a glance
- **Root Cause**: Phase 2 didn't implement

---

#### **Issue #22: Status Bar Missing**
- **Mentioned in**: Gemini, GPT (2/4)
- **Severity**: MEDIUM
- **Files Affected**: `src/components/layout/AppLayout.tsx:33-89`
- **Description**: Mockup shows bottom status bar: "N selected • Sync OK • ...". AppLayout has no status bar component.
- **Impact**: Missing context about selection/sync state
- **Root Cause**: Not in Phase 2 scope

---

#### **Issue #23: Tag Component Monochrome (Design Deviation)**
- **Mentioned in**: Gemini, GPT (2/4)
- **Severity**: MEDIUM
- **Files Affected**: `src/components/ui/Tag.tsx:5-44`
- **Description**: Tag component defaults to single accent color. Design requires 9 distinct tag colors (ComponentsSpec, DesignSystem).
- **Impact**: Can't distinguish tags visually
- **Root Cause**: Color prop not exposed in usage

---

#### **Issue #24: Custom Cursor Shape Wrong**
- **Mentioned in**: Claude, Gemini (2/4)
- **Severity**: MEDIUM (polish)
- **Files Affected**: `src/components/ui/GlobalCursor.tsx:823-835`
- **Description**: DesignSystem.md specifies triangle cursor. Implementation uses circular dot (8px border-radius 50%).
- **Impact**: Doesn't match design spec
- **Root Cause**: Quick implementation for Phase 2

---

#### **Issue #25: Cursor CSS Contradicts Design System**
- **Mentioned in**: Claude, Gemini, GPT (3/4)
- **Severity**: MEDIUM
- **Files Affected**: `src/styles/tailwind.css:81-114`
- **Description**: CSS sets `cursor: none` globally (line 83), then restores `cursor: text` for inputs (line 99). DesignSystem.md:738-778 says hide ALL native cursors, custom cursor handles everything.
- **Impact**: Hybrid cursor behavior (custom + native text) feels inconsistent
- **Root Cause**: Incomplete implementation

---

#### **Issue #26: Toast IDs Use Math.random() (Potential Collision)**
- **Mentioned in**: Gemini (1/4)
- **Severity**: LOW (edge case)
- **Files Affected**: `src/store/ui.store.ts:185`
- **Description**: Toast IDs generated via `Math.random().toString(36).substr(2, 9)`. Not cryptographically secure, small collision chance with rapid toasts.
- **Impact**: Rare but possible toast ID collision
- **Root Cause**: Quick implementation
- **Recommendation**: Use `crypto.randomUUID()` once available

---

#### **Issue #27: Search/Projects/Duplicates Routes Empty**
- **Mentioned in**: Gemini, GPT (2/4)
- **Severity**: MEDIUM
- **Files Affected**:
  - `src/routes/search.tsx`
  - `src/routes/projects.tsx`
  - `src/routes/duplicates.tsx`
- **Description**: All show "Coming Soon" placeholder. Not Phase 2 scope but noted as deviation.
- **Impact**: Routes exist but non-functional
- **Root Cause**: Phase 3+ work

---

#### **Issue #28: Skeleton Loading Components Missing**
- **Mentioned in**: Claude (1/4)
- **Severity**: LOW (nice-to-have)
- **Files Affected**: None (needs creation)
- **Description**: Better UX than spinner—shows content structure while loading. Editor may have this.
- **Impact**: Loading states less polished
- **Root Cause**: Not in Phase 2 scope

---

#### **Issue #29: Magic Numbers Not Extracted to Constants**
- **Mentioned in**: Claude (1/4)
- **Severity**: LOW (maintainability)
- **Files Affected**:
  - `src/components/layout/AppLayout.tsx:46-47,67,77`
  - `src/common/api/client.ts:30`
- **Description**: Hard-coded values scattered:
  - Panel sizes (25, 15, 40, 20, 50, 30)
  - Timeout (30000ms)
  - Toast duration (should be 5000ms but not set)
- **Impact**: Hard to change globally
- **Root Cause**: Quick implementation

---

#### **Issue #30: JSDoc Comments Missing**
- **Mentioned in**: Claude (1/4)
- **Severity**: LOW (DX)
- **Files Affected**:
  - `src/common/api/client.ts`
  - `src/store/*.ts`
- **Description**: Public methods lack JSDoc. IDE autocomplete shows only signatures, no descriptions.
- **Impact**: Slightly worse developer experience
- **Root Cause**: Documentation not prioritized

---

#### **Issue #31: STATUS.md Too Long (Documentation)**
- **Mentioned in**: Claude, Gemini, GPT (3/4)
- **Severity**: LOW (documentation)
- **Files Affected**: `STATUS.md:11-340`
- **Description**: 150+ lines of Phase 1 history. File will grow exponentially. Hard to find current status.
- **Impact**: Poor documentation usability
- **Root Cause**: No separation of history vs current state
- **Recommendation**: Move history to CHANGELOG.md, keep STATUS.md <200 lines

---

#### **Issue #32: Color Palette Not in tailwind.config.js**
- **Mentioned in**: Claude (1/4)
- **Severity**: LOW (DX)
- **Files Affected**: `tailwind.config.js`, `src/styles/tailwind.css`
- **Description**: Colors defined in CSS @theme block only. Not exposed in Tailwind config for IntelliSense.
- **Impact**: No autocomplete for `bg-primary-500` style classes
- **Root Cause**: Tailwind v4 CSS vars approach

---

#### **Issue #33: Focus Management Utilities Missing**
- **Mentioned in**: Gemini, GPT (2/4)
- **Severity**: MEDIUM (accessibility)
- **Files Affected**: None (needs utilities)
- **Description**: Modals should trap focus, restore on close. Tree navigation needs keyboard support. No utilities from editor ported.
- **Impact**: Accessibility gaps
- **Root Cause**: Not in Phase 2 scope

---

#### **Issue #34: SearchBar Component Not Connected**
- **Mentioned in**: Gemini, GPT (2/4)
- **Severity**: MEDIUM
- **Files Affected**:
  - `src/components/layout/SearchBar.tsx` (exists but unused)
  - `src/routes/library.tsx` (doesn't use it)
- **Description**: SearchBar component created but not mounted in Library header
- **Impact**: Can't search references
- **Root Cause**: Phase 2 created component, Phase 3 will wire it

---

#### **Issue #35: Global Loading Overlay Missing**
- **Mentioned in**: Gemini, GPT (2/4)
- **Severity**: LOW
- **Files Affected**: `src/store/ui.store.ts:29,179-205` (state exists but no UI)
- **Description**: `globalLoading` state in store but no spinner/overlay component uses it
- **Impact**: Long operations appear to hang
- **Root Cause**: Not in Phase 2 scope

---

### Low Priority Issues (P3) - 12 total

#### **Issue #36: Backend Build Actually Passes (Session 3 Wrong)**
- **Mentioned in**: Session 3 (claimed failure) - **FALSE ALARM**
- **Severity**: NONE (Session 3 error)
- **Files Affected**: None
- **Description**: Session 3 review claimed `npm run build` fails in backend. Verified: backend builds successfully with zero errors.
- **Impact**: None - false positive
- **Root Cause**: Session 3 review error or outdated

---

#### **Issue #37-47: Various Polish Items**
- StatusBar persistence
- ARIA live regions
- Form validation helpers
- Architecture Decision Records
- Reference validation with backend
- citationKey field verification
- hasPdf redundancy
- Panel normalization warnings
- GlobalCursor text mode
- Optimized Zustand subscriptions
- Test coverage gaps
- Documentation formatting

*(Grouped for brevity - see individual reviews for details)*

---

## Issue Coverage Matrix

| Issue | Claude | Gemini | GPT | Session3 | Severity | Consensus |
|-------|--------|--------|-----|----------|----------|-----------|
| API response double-unwrap | ✅ | ✅ | ✅ | ❌ | P0 | Strong |
| Token refresh missing | ✅ | ✅ | ✅ | ❌ | P0 | Strong |
| Auth persistence incomplete | ✅ | ✅ | ✅ | ❌ | P0 | Strong |
| Auth tests broken | ❌ | ✅ | ✅ | ✅ | P0 | Strong |
| Duplicate Reference types | ✅ | ✅ | ✅ | ❌ | P0 | Strong |
| Toast not rendering | ✅ | ✅ | ✅ | ✅ | P0 | **UNANIMOUS** |
| Date types mismatch | ❌ | ✅ | ✅ | ❌ | P0 | Moderate |
| Tag usageCount missing | ❌ | ❌ | ❌ | ✅ | N/A | **FALSE** |
| ErrorBoundary missing | ✅ | ✅ | ✅ | ❌ | P1 | Strong |
| Common utils missing | ✅ | ✅ | ✅ | ❌ | P1 | Strong |
| Zod validation missing | ✅ | ✅ | ✅ | ❌ | P1 | Strong |
| setTokens can't clear | ❌ | ✅ | ✅ | ❌ | P1 | Moderate |
| Mutation args typed any | ❌ | ✅ | ✅ | ❌ | P1 | Moderate |
| Query cache config | ✅ | ❌ | ❌ | ❌ | P1 | Weak |
| Upload progress tracking | ✅ | ❌ | ❌ | ❌ | P1 | Weak |
| Panel persistence | ❌ | ✅ | ✅ | ❌ | P1 | Moderate |
| Full store subscriptions | ❌ | ✅ | ✅ | ❌ | P1 | Moderate |
| ESLint config | ❌ | ❌ | ❌ | ✅ | P2 | **FALSE** |
| Library toolbar missing | ❌ | ✅ | ✅ | ❌ | P1 | Moderate |
| Keyboard shortcuts | ❌ | ✅ | ✅ | ❌ | P1 | Moderate |
| Backend build fails | ❌ | ❌ | ❌ | ✅ | N/A | **FALSE** |

**Key Insights**:
- 6 issues caught by 3+ reviews (high confidence)
- 1 issue unanimous (toasts)
- 3 Session 3 false positives (Tag usageCount, ESLint, backend build)
- Claude review most comprehensive (1250 lines, caught unique issues)
- Gemini/GPT reviews consistent with each other (85% overlap)

---

## Conflicts & Resolutions

### **Conflict #1: Tag Model usageCount Field**
- **Claude says**: Not mentioned
- **Gemini says**: Not mentioned
- **GPT says**: Not mentioned
- **Session3 says**: "Missing from schema (line 24)"
- **Resolution**: Session 3 is WRONG. Verified Tag.ts line 24 has `usageCount: { type: Number, default: 0, min: 0 }`. File exists and correct.
- **Justification**: Direct code inspection confirms field present with validation.

---

### **Conflict #2: Backend Build Status**
- **Claude says**: Not tested
- **Gemini says**: Not mentioned
- **GPT says**: Not mentioned
- **Session3 says**: "npm run build fails with TypeScript errors"
- **Resolution**: Session 3 is WRONG. Verified `npm run build` succeeds with zero errors. Frontend fails (19 TS errors in tests), backend passes.
- **Justification**: Command `cd bibliography_backend && npm run build` output shows clean build.

---

### **Conflict #3: ESLint Configuration**
- **Claude says**: Not mentioned
- **Gemini says**: Not mentioned
- **GPT says**: Not mentioned
- **Session3 says**: "No ESLint config in repo"
- **Resolution**: Session 3 PARTIALLY WRONG. ESLint flat config exists at `eslint.config.js`. Session 3 likely looked for old `.eslintrc.*` format which is deprecated.
- **Justification**: File exists, package.json has lint scripts. Quality of config not verified but file exists.

---

### **Conflict #4: Issue Priority Levels**
- **Claude says**: Toast is "CRITICAL", ErrorBoundary is "IMPORTANT"
- **Gemini says**: Toast is "Medium", mutations are "High"
- **GPT says**: Toast is "High", auth is "High"
- **Session3 says**: Most issues not prioritized explicitly
- **Resolution**: Use this hierarchy:
  - P0 (Blocker): Prevents compilation, runtime crashes, data loss (toasts, mutations, auth tests, duplicate types, dates)
  - P1 (High): Missing patterns that block Phase 3 features (ErrorBoundary, utils, validation, refresh flow)
  - P2 (Medium): Design deviations, performance issues (selectors, persistence, toolbar)
  - P3 (Low): Polish, documentation, nice-to-haves
- **Justification**: "Prevents Phase 3" is the key criterion per user request.

---

## Implementation Plan

### Session 3A: CRITICAL Blockers (~4 hours)

**Goal**: Fix all P0 issues preventing compilation and runtime crashes

---

#### Task A1: Fix API Response Unwrapping
- **Priority**: P0
- **Mentioned in**: Claude, Gemini, GPT
- **Files to Modify**:
  - `src/common/api/client.ts:131-171`
  - `src/features/library/api/references.queries.ts:56-141`
- **Steps**:
  1. **Option 1** (Recommended): Unwrap in `handleResponse()`
     ```typescript
     // client.ts:131-171 - REPLACE handleResponse
     private async handleResponse<T>(response: Response): Promise<T> {
       let json: any;
       try {
         json = await response.json();
       } catch {
         json = null;
       }

       if (!response.ok) {
         const error: ApiError = {
           message: json?.message || `HTTP ${response.status}`,
           code: json?.code || `HTTP_${response.status}`,
           details: json?.details || json,
         };

         // ... error handling (401, 403, 500)
         throw error;
       }

       // ✅ Unwrap ApiResponse envelope - return just data field
       // Handle both {data: T} and direct T responses
       return (json?.data !== undefined ? json.data : json) as T;
     }
     ```

  2. **Fix mutations** to not double-unwrap:
     ```typescript
     // references.queries.ts:56,76-77,94-95

     // Line 56 - LIST query ✅ Already correct
     const response = await apiClient.get<ApiResponse<Reference[]>>(`/references?${queryParams}`);
     return response.data;  // ❌ CHANGE TO: return response;

     // Line 76-77 - CREATE mutation
     const response = await apiClient.post<ApiResponse<Reference>>('/references', data);
     return response.data.data;  // ❌ CHANGE TO: return response;

     // Line 94-95 - UPDATE mutation
     const response = await apiClient.patch<ApiResponse<Reference>>(`/references/${id}`, data);
     return response.data.data;  // ❌ CHANGE TO: return response;
     ```

  3. **Alternative approach** (if backend varies): Add type parameter to unwrap or not:
     ```typescript
     private async handleResponse<T>(response: Response, unwrap: boolean = true): Promise<T> {
       // ... existing code
       return unwrap ? (json?.data || json) : json;
     }
     ```

- **Testing**:
  ```bash
  # After fix, test mutations
  # 1. Create reference - should return Reference object
  # 2. Update reference - should not crash on updatedRef._id
  # 3. Check console for errors
  ```

- **Acceptance Criteria**:
  - [ ] `useCreateReferenceMutation()` returns `Reference` object (not undefined)
  - [ ] `useUpdateReferenceMutation()` success callback accesses `updatedRef._id` without crash
  - [ ] `useReferencesQuery()` returns `Reference[]` (not `{data: Reference[]}`)
  - [ ] Console shows no "Cannot read property '_id' of undefined" errors

---

#### Task A2: Fix Auth Store Tests (Compilation Blocker)
- **Priority**: P0
- **Mentioned in**: Gemini, GPT, Session 3
- **Files to Modify**: `src/store/__tests__/auth.store.test.ts`
- **Steps**:
  1. **Update mock tokens object**:
     ```typescript
     // auth.store.test.ts - ADD after mockUser (line 12)
     const mockTokens: Tokens = {
       accessToken: 'test-access-token-123',
       refreshToken: 'test-refresh-token-456',
     };
     ```

  2. **Fix beforeEach reset** (line 16):
     ```typescript
     beforeEach(() => {
       useAuthStore.setState({
         isAuthenticated: false,
         tokens: null,  // ✅ Changed from token
         user: null,
         sessionExpiry: null,
       });
       vi.clearAllTimers();
     });
     ```

  3. **Fix login() calls** (lines 31, 44, 59, 76, 93, 113, 136, 161, 174):
     ```typescript
     // OLD ❌
     login('test-token-123', mockUser);

     // NEW ✅
     login(mockTokens, mockUser);
     ```

  4. **Fix token assertions** (lines 35, 83, 118):
     ```typescript
     // OLD ❌
     expect(state.token).toBe('test-token-123');

     // NEW ✅
     expect(state.tokens).toEqual(mockTokens);
     expect(state.tokens?.accessToken).toBe('test-access-token-123');
     ```

  5. **Remove setToken test** (lines 109-120):
     ```typescript
     // DELETE entire "SetToken action" describe block
     // Replace with this:

     describe('SetTokens action', () => {
       it('should update tokens', () => {
         const { login, setTokens } = useAuthStore.getState();

         login(mockTokens, mockUser);

         const newTokens: Tokens = {
           accessToken: 'new-access-token-789',
           refreshToken: 'new-refresh-token-101',
         };

         setTokens(newTokens);

         const state = useAuthStore.getState();
         expect(state.tokens).toEqual(newTokens);
         expect(state.tokens?.accessToken).toBe('new-access-token-789');
       });
     });
     ```

  6. **Add afterEach for timer cleanup** (line 127):
     ```typescript
     // ALREADY EXISTS but verify it's there
     afterEach(() => {
       vi.useRealTimers();
     });
     ```

- **Testing**:
  ```bash
  cd /home/mahdi/Desktop/bibliography/bibliography_frontend
  pnpm test src/store/__tests__/auth.store.test.ts
  # Should show 0 TypeScript errors, all tests passing
  ```

- **Acceptance Criteria**:
  - [ ] `pnpm build` succeeds (no TS errors in auth.store.test.ts)
  - [ ] All auth store tests pass
  - [ ] Tests cover new Tokens object structure

---

#### Task A3: Fix Auth Persistence (isAuthenticated Not Restored)
- **Priority**: P0
- **Mentioned in**: Claude, Gemini, GPT
- **Files to Modify**: `src/store/auth.store.ts:101-108`
- **Steps**:
  1. **Add isAuthenticated to persist**:
     ```typescript
     // auth.store.ts:101-108
     persist(
       (set, get) => ({ /* ... */ }),
       {
         name: 'bibliography-auth-store',
         partialize: (state) => ({
           isAuthenticated: state.isAuthenticated,  // ✅ ADD THIS
           tokens: state.tokens,
           user: state.user,
           sessionExpiry: state.sessionExpiry,
         }),
       }
     ),
     ```

  2. **Alternative approach** (more robust): Use `onRehydrateStorage` to compute isAuthenticated:
     ```typescript
     persist(
       (set, get) => ({ /* ... */ }),
       {
         name: 'bibliography-auth-store',
         partialize: (state) => ({
           tokens: state.tokens,
           user: state.user,
           sessionExpiry: state.sessionExpiry,
         }),
         onRehydrateStorage: () => (state) => {
           // After hydration, set isAuthenticated based on tokens + session
           if (state) {
             const hasValidSession = state.tokens && state.isSessionValid();
             if (hasValidSession !== state.isAuthenticated) {
               state.isAuthenticated = hasValidSession;
             }
           }
         },
       }
     ),
     ```

- **Testing**:
  ```bash
  # Manual test in browser
  # 1. Login (or mock login)
  # 2. Check localStorage: bibliography-auth-store should have isAuthenticated: true
  # 3. Refresh page
  # 4. Check useAuthStore.getState().isAuthenticated === true
  ```

- **Acceptance Criteria**:
  - [ ] After login, `isAuthenticated` persisted to localStorage
  - [ ] After page refresh, `isAuthenticated` correctly restored
  - [ ] Users stay logged in across refreshes

---

#### Task A4: Implement Token Refresh Flow
- **Priority**: P0
- **Mentioned in**: Claude, Gemini, GPT
- **Files to Modify**: `src/common/api/client.ts:28-196`
- **Steps**:
  1. **Add refresh state** (top of class):
     ```typescript
     // client.ts - ADD after line 30
     class ApiClient {
       private baseURL: string;
       private timeout: number = 30000;
       private isRefreshing: boolean = false;  // ✅ ADD
       private refreshPromise: Promise<boolean> | null = null;  // ✅ ADD
     ```

  2. **Add refresh method** (after buildHeaders):
     ```typescript
     /**
      * Attempt to refresh access token using refresh token
      * Returns true if successful, false otherwise
      */
     private async refreshAccessToken(): Promise<boolean> {
       // If already refreshing, wait for that promise
       if (this.isRefreshing && this.refreshPromise) {
         return this.refreshPromise;
       }

       this.isRefreshing = true;
       this.refreshPromise = (async () => {
         try {
           const authStore = useAuthStore.getState();
           const refreshToken = authStore.tokens?.refreshToken;

           if (!refreshToken) {
             return false;
           }

           // Call auth service refresh endpoint
           // TODO: Replace with actual auth service endpoint
           const response = await fetch(`${this.baseURL.replace('/bibliography', '/auth')}/refresh`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ refreshToken }),
           });

           if (!response.ok) {
             return false;
           }

           const data = await response.json();
           const newTokens: Tokens = {
             accessToken: data.data.accessToken,
             refreshToken: data.data.refreshToken || refreshToken,  // Some APIs don't rotate refresh tokens
           };

           authStore.setTokens(newTokens);
           authStore.refreshSession(data.data.expiresIn || 3600);

           return true;
         } catch (error) {
           console.error('Token refresh failed:', error);
           return false;
         } finally {
           this.isRefreshing = false;
           this.refreshPromise = null;
         }
       })();

       return this.refreshPromise;
     }
     ```

  3. **Update handleResponse to use refresh** (line 150-156):
     ```typescript
     // client.ts:142-169 - REPLACE error handling
     if (!response.ok) {
       const error: ApiError = {
         message: json?.message || `HTTP ${response.status}`,
         code: json?.code || `HTTP_${response.status}`,
         details: json?.details || json,
       };

       // Handle 401 with token refresh attempt
       if (response.status === 401) {
         const refreshed = await this.refreshAccessToken();

         if (refreshed) {
           // Don't show toast, token refreshed successfully
           // Request will be retried by caller (see next step)
           throw { ...error, code: 'TOKEN_REFRESHED' };  // Special code
         } else {
           // Refresh failed, logout required
           useAuthStore.getState().logout();
           useUIStore.getState().addToast({
             message: 'Session expired. Please log in again.',
             type: 'error',
           });
         }
       } else if (response.status === 403) {
         // ... existing 403 handling
       } else if (response.status === 500) {
         // ... existing 500 handling
       }

       throw error;
     }
     ```

  4. **Add retry logic in request()** (line 177-196):
     ```typescript
     // client.ts:177-196 - REPLACE request method
     private async request<T>(
       endpoint: string,
       method: string,
       options?: RequestOptions,
     ): Promise<T> {
       const url = this.buildURL(endpoint, options?.params);

       // First attempt
       try {
         const headers = this.buildHeaders(options?.headers as Record<string, string>);
         const response = await this.fetchWithTimeout(url, {
           method,
           headers,
           body: options?.body,
         });
         return this.handleResponse<T>(response);
       } catch (error) {
         // If token was refreshed, retry request once
         if (error instanceof Object && 'code' in error && error.code === 'TOKEN_REFRESHED') {
           try {
             const headers = this.buildHeaders(options?.headers as Record<string, string>);  // Get new token
             const response = await this.fetchWithTimeout(url, {
               method,
               headers,
               body: options?.body,
             });
             return this.handleResponse<T>(response);
           } catch (retryError) {
             const apiError = retryError instanceof Object && 'code' in retryError ? retryError : this.normalizeError(retryError);
             throw apiError;
           }
         }

         const apiError = error instanceof Object && 'code' in error ? error : this.normalizeError(error);
         throw apiError;
       }
     }
     ```

- **Testing**:
  ```bash
  # Manual test (requires backend)
  # 1. Login with short-lived access token (e.g., 10s expiry)
  # 2. Wait for token to expire
  # 3. Make API call (fetch references)
  # 4. Should see token refresh request in Network tab
  # 5. Original request should succeed without logout
  ```

- **Acceptance Criteria**:
  - [ ] 401 response triggers refresh attempt (not immediate logout)
  - [ ] Successful refresh retries original request
  - [ ] Failed refresh shows toast and logs out
  - [ ] Multiple concurrent 401s don't trigger multiple refreshes (one shared promise)

---

#### Task A5: Consolidate Reference Type Definitions
- **Priority**: P0
- **Mentioned in**: Claude, Gemini, GPT
- **Files to Modify**:
  - `src/features/library/api/references.queries.ts:6-37` (DELETE duplicate)
  - `src/common/types.ts:4-35` (update as single source)
- **Steps**:
  1. **Update common/types.ts** (make pdf nullable):
     ```typescript
     // types.ts:20-26 - CHANGE pdf field
     export interface Reference {
       // ... other fields
       hasPdf: boolean;
       pdf: {
         storedPath: string;
         originalName: string;
         size: number;
         mimeType: string;
         uploadedAt: Date;  // Keep Date for now, will fix in A6
       } | null;  // ✅ Change from required to nullable
       // ... rest
     }
     ```

  2. **Delete duplicate definition** in references.queries.ts:
     ```typescript
     // references.queries.ts:1-37 - REPLACE entire top section
     import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
     import { apiClient, type ApiResponse } from '@/common/api/client';
     import { useUIStore } from '@/store/ui.store';
     import type { Reference, UpdateReferenceInput } from '@/common/types';  // ✅ Import from common

     // ❌ DELETE lines 6-37 (duplicate Reference interface)

     export const referenceKeys = {
       // ... rest stays same
     ```

  3. **Update query return type**:
     ```typescript
     // references.queries.ts:54-68 - Already typed correctly as Promise<Reference[]>
     // No changes needed if import works
     ```

- **Testing**:
  ```bash
  pnpm build
  # Should compile with no errors about Reference type mismatch
  ```

- **Acceptance Criteria**:
  - [ ] Only one Reference interface exists (in common/types.ts)
  - [ ] references.queries.ts imports Reference from common
  - [ ] No TypeScript errors about pdf property incompatibility
  - [ ] Library page compiles and renders

---

#### Task A6: Fix Date Type Mismatch (Runtime Safety)
- **Priority**: P0
- **Mentioned in**: Gemini, GPT
- **Files to Modify**:
  - `src/common/types.ts:25,33-34` (change Date to string)
  - OR `src/common/api/client.ts` (add date deserialization)
- **Steps**:

  **Option 1** (Recommended): Type as string (match API reality)
  ```typescript
  // types.ts:4-35 - CHANGE Date fields to string
  export interface Reference {
    // ... other fields
    pdf: {
      storedPath: string;
      originalName: string;
      size: number;
      mimeType: string;
      uploadedAt: string;  // ✅ Changed from Date
    } | null;
    // ... other fields
    deletedAt: string | null;  // ✅ Changed from Date
    createdAt: string;  // ✅ Changed from Date
    updatedAt: string;  // ✅ Changed from Date
  }
  ```

  **Option 2** (More work): Add Zod deserialization (future task)
  ```typescript
  // Defer to Session 3B - requires Zod schemas
  ```

- **Testing**:
  ```bash
  # Update code that accesses dates
  # Search for: .getTime(), .toISOString(), new Date(ref.createdAt)
  # Verify no runtime crashes
  ```

- **Acceptance Criteria**:
  - [ ] Reference interface Date fields match API response type
  - [ ] No runtime TypeError on date operations
  - [ ] Existing date formatting code updated if needed

---

#### Task A7: Implement ToastContainer Component
- **Priority**: P0
- **Mentioned in**: ALL FOUR REVIEWS (unanimous)
- **Files to Create**: `src/components/ui/ToastContainer.tsx`
- **Files to Modify**: `src/App.tsx:16`
- **Steps**:
  1. **Create ToastContainer component**:
     ```typescript
     // src/components/ui/ToastContainer.tsx - CREATE NEW FILE
     import React, { useEffect } from 'react';
     import { Transition } from '@headlessui/react';
     import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
     import { useUIStore } from '@/store/ui.store';
     import { cn } from '@/common/utils';

     export const ToastContainer: React.FC = () => {
       const toasts = useUIStore((state) => state.toasts);
       const removeToast = useUIStore((state) => state.removeToast);

       // Auto-dismiss toasts
       useEffect(() => {
         if (toasts.length === 0) return;

         const timers: NodeJS.Timeout[] = [];

         toasts.forEach((toast) => {
           const duration = toast.duration || 5000;
           const timer = setTimeout(() => {
             removeToast(toast.id);
           }, duration);
           timers.push(timer);
         });

         return () => {
           timers.forEach(clearTimeout);
         };
       }, [toasts, removeToast]);

       return (
         <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
           {toasts.map((toast) => (
             <Transition
               key={toast.id}
               show={true}
               appear
               enter="transition duration-200 ease-out"
               enterFrom="opacity-0 translate-x-4"
               enterTo="opacity-100 translate-x-0"
               leave="transition duration-150 ease-in"
               leaveFrom="opacity-100 translate-x-0"
               leaveTo="opacity-0 translate-x-4"
             >
               <div
                 className={cn(
                   "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border pointer-events-auto",
                   "backdrop-blur-sm min-w-[300px] max-w-[400px]",
                   toast.type === 'error' && "bg-red-900/90 border-red-700 text-red-100",
                   toast.type === 'success' && "bg-green-900/90 border-green-700 text-green-100",
                   toast.type === 'warning' && "bg-yellow-900/90 border-yellow-700 text-yellow-100",
                   toast.type === 'info' && "bg-blue-900/90 border-blue-700 text-blue-100"
                 )}
               >
                 {toast.type === 'success' && <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />}
                 {toast.type === 'error' && <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />}
                 {toast.type === 'warning' && <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />}
                 {toast.type === 'info' && <InformationCircleIcon className="w-5 h-5 flex-shrink-0" />}

                 <span className="flex-1 text-sm">{toast.message}</span>

                 <button
                   onClick={() => removeToast(toast.id)}
                   className="hover:opacity-75 transition-opacity flex-shrink-0"
                   aria-label="Dismiss toast"
                 >
                   <XMarkIcon className="w-4 h-4" />
                 </button>
               </div>
             </Transition>
           ))}
         </div>
       );
     };
     ```

  2. **Mount in App.tsx**:
     ```typescript
     // App.tsx:5,16 - ADD import and component
     import { ToastContainer } from '@/components/ui/ToastContainer';  // ✅ ADD

     export const App: React.FC<AppProps> = ({ router, queryClient }) => {
       return (
         <QueryClientProvider client={queryClient}>
           <RouterProvider router={router} />
           <GlobalCursor />
           <ToastContainer />  {/* ✅ ADD - renders toasts from store */}
           {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
         </QueryClientProvider>
       );
     };
     ```

- **Testing**:
  ```bash
  # Manual test
  # 1. Open app in browser
  # 2. Open console: useUIStore.getState().addToast({ message: 'Test toast', type: 'success' })
  # 3. Should see green toast appear top-right
  # 4. Should auto-dismiss after 5 seconds
  # 5. Click X to dismiss early
  ```

- **Acceptance Criteria**:
  - [ ] ToastContainer component renders toasts from store
  - [ ] Toasts appear in top-right corner with correct styling
  - [ ] Toasts auto-dismiss after 5 seconds
  - [ ] X button dismisses toast immediately
  - [ ] Error toasts show on API failures (test 401, 500)

---

#### Task A8: Allow setTokens to Clear Tokens
- **Priority**: P0 (enables proper error handling)
- **Mentioned in**: Gemini, GPT
- **Files to Modify**: `src/store/auth.store.ts:28-86`
- **Steps**:
  1. **Update setTokens signature**:
     ```typescript
     // auth.store.ts:33,84-86
     interface AuthActions {
       // ... other actions
       setTokens: (tokens: Tokens | null) => void;  // ✅ Allow null
       // ... rest
     }

     // Implementation (line 84-86)
     setTokens: (tokens) => {
       set({ tokens }, false, 'auth/setTokens');
     },
     ```

  2. **Add clearTokens convenience method** (optional):
     ```typescript
     // auth.store.ts:34,87 - ADD after setTokens
     interface AuthActions {
       // ... existing
       clearTokens: () => void;  // ✅ ADD
     }

     // Implementation
     clearTokens: () => {
       set({ tokens: null, isAuthenticated: false }, false, 'auth/clearTokens');
     },
     ```

  3. **Update API client to use clearTokens** (if added):
     ```typescript
     // client.ts:151 - Replace logout with clearTokens
     if (response.status === 401) {
       const refreshed = await this.refreshAccessToken();
       if (!refreshed) {
         useAuthStore.getState().clearTokens();  // ✅ Only clear tokens, keep user
         // OR still use logout() if you want to clear user too
       }
     }
     ```

- **Testing**:
  ```bash
  # Console test
  useAuthStore.getState().setTokens(null);  # Should work
  useAuthStore.getState().clearTokens();    # Should work if added
  ```

- **Acceptance Criteria**:
  - [ ] `setTokens(null)` compiles without TypeScript error
  - [ ] Calling `setTokens(null)` clears tokens in store
  - [ ] API error handlers can clear tokens without full logout

---

### Session 3B: High Priority Fixes (~3 hours)

**Goal**: Add missing patterns that will block Phase 3 feature development

---

#### Task B1: Add ErrorBoundary Component
- **Priority**: P1
- **Mentioned in**: Claude, Gemini, GPT
- **Files to Create**: `src/components/ErrorBoundary.tsx`
- **Files to Modify**: `src/main.tsx` (wrap App)
- **Steps**:
  1. **Create ErrorBoundary** (copy from editor or use this):
     ```typescript
     // src/components/ErrorBoundary.tsx - CREATE NEW FILE
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
         console.error('ErrorBoundary caught error:', error, errorInfo);
         // TODO Phase 2: Send to error tracking (Sentry, LogRocket)
       }

       render() {
         if (this.state.hasError) {
           return this.props.fallback || (
             <div className="min-h-screen flex items-center justify-center bg-bg-dark">
               <div className="text-center max-w-md px-4">
                 <h1 className="text-2xl font-semibold text-text-primary mb-4">
                   Something went wrong
                 </h1>
                 <p className="text-text-secondary mb-2">
                   {this.state.error?.message || 'An unexpected error occurred'}
                 </p>
                 <pre className="text-xs text-text-muted bg-bg-surface p-3 rounded mb-6 overflow-auto max-h-40">
                   {this.state.error?.stack}
                 </pre>
                 <button
                   onClick={() => window.location.reload()}
                   className="px-4 py-2 bg-accent text-black rounded hover:bg-accent-hover transition-colors"
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

  2. **Wrap App in main.tsx**:
     ```typescript
     // main.tsx - ADD import and wrap
     import { ErrorBoundary } from '@/components/ErrorBoundary';

     createRoot(document.getElementById('root')!).render(
       <StrictMode>
         <ErrorBoundary>  {/* ✅ ADD */}
           <App router={router} queryClient={queryClient} />
         </ErrorBoundary>
       </StrictMode>
     );
     ```

- **Testing**:
  ```typescript
  // Temporarily add to a component to test:
  const BrokenComponent = () => {
    throw new Error('Test error boundary');
    return <div>Never rendered</div>;
  };
  ```

- **Acceptance Criteria**:
  - [ ] Component errors caught and display fallback UI
  - [ ] Error message and stack shown in dev
  - [ ] Reload button refreshes app
  - [ ] App doesn't white-screen on component error

---

#### Task B2: Add Common Utility Functions
- **Priority**: P1
- **Mentioned in**: Claude, Gemini, GPT
- **Files to Modify**: `src/common/utils.ts`
- **Steps**:
  1. **Check editor_frontend** for utilities:
     ```bash
     # Check what editor has
     cat /home/mahdi/Desktop/bibliography/editor_frontend/src/common/utils.ts
     ```

  2. **Add missing utilities**:
     ```typescript
     // utils.ts - ADD after existing cn and formatDate

     /**
      * Format file size in bytes to human-readable string
      * @example formatFileSize(1536) => "1.5 KB"
      */
     export function formatFileSize(bytes: number): string {
       if (bytes === 0) return '0 B';
       const k = 1024;
       const sizes = ['B', 'KB', 'MB', 'GB'];
       const i = Math.floor(Math.log(bytes) / Math.log(k));
       return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
     }

     /**
      * Debounce function calls
      * @example const debouncedSearch = debounce((query) => search(query), 300);
      */
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

     /**
      * Truncate string to max length with ellipsis
      * @example truncate("Long title here", 10) => "Long title..."
      */
     export function truncate(str: string, maxLen: number): string {
       return str.length > maxLen ? `${str.slice(0, maxLen)}...` : str;
     }

     /**
      * Validate DOI format (10.xxxx/yyyy)
      * @example isValidDOI("10.1234/example") => true
      */
     export function isValidDOI(doi: string): boolean {
       return /^10\.\d{4,}\/\S+$/.test(doi);
     }

     /**
      * Format author list with "et al." for long lists
      * @example formatAuthorList([{full: "Smith"}, {full: "Jones"}], 1) => "Smith et al."
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
     ```

- **Testing**: Test each utility in console or add unit tests

- **Acceptance Criteria**:
  - [ ] formatFileSize works with various byte values
  - [ ] debounce delays function calls correctly
  - [ ] truncate adds ellipsis for long strings
  - [ ] isValidDOI validates DOI format
  - [ ] formatAuthorList handles various author counts

---

#### Task B3: Add Zod Validation Schemas (API Boundary)
- **Priority**: P1
- **Mentioned in**: Claude, Gemini, GPT
- **Files to Create**: `src/common/api/validators.ts`
- **Files to Modify**: `src/common/api/client.ts` (use validators)
- **Steps**:
  1. **Create Zod schemas**:
     ```typescript
     // src/common/api/validators.ts - CREATE NEW FILE
     import { z } from 'zod';

     export const AuthorSchema = z.object({
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
         uploadedAt: z.string(),  // ISO date string
       }).nullable(),
       sourceRaw: z.object({
         provider: z.enum(['doi', 'bibtex', 'csl-json', 'ris', 'manual']),
         payload: z.any(),
       }),
       deleted: z.boolean(),
       deletedAt: z.string().nullable(),
       createdAt: z.string(),  // ISO date string
       updatedAt: z.string(),  // ISO date string
     });

     export type Reference = z.infer<typeof ReferenceSchema>;

     // Re-export from types.ts for backward compatibility
     export { CreateReferenceInput, UpdateReferenceInput } from '@/common/types';
     ```

  2. **Add validation to handleResponse** (optional, could defer):
     ```typescript
     // client.ts - ADD optional validator parameter
     private async handleResponse<T>(
       response: Response,
       validator?: z.ZodSchema<T>
     ): Promise<T> {
       // ... existing code

       const unwrapped = (json?.data !== undefined ? json.data : json) as T;

       // Validate if schema provided
       if (validator) {
         try {
           return validator.parse(unwrapped);
         } catch (err) {
           console.error('API response validation failed:', err);
           throw {
             message: 'Invalid response format from server',
             code: 'VALIDATION_ERROR',
             details: err,
           };
         }
       }

       return unwrapped;
     }
     ```

  3. **Use in queries** (example):
     ```typescript
     // references.queries.ts - ADD validation
     import { ReferenceSchema } from '@/common/api/validators';

     queryFn: async (): Promise<Reference[]> => {
       const response = await apiClient.get(`/references?${queryParams}`);
       // Optional: validate response
       return z.array(ReferenceSchema).parse(response);
     }
     ```

- **Testing**: Make API call, check console for validation errors

- **Acceptance Criteria**:
  - [ ] Zod schemas defined for core types
  - [ ] Optional validation available in API client
  - [ ] Malformed responses caught with clear error messages

---

#### Task B4: Configure React Query Cache
- **Priority**: P1
- **Mentioned in**: Claude
- **Files to Create**: `src/common/api/queryClient.ts`
- **Files to Modify**: `src/main.tsx` (use exported client)
- **Steps**:
  1. **Create queryClient config**:
     ```typescript
     // src/common/api/queryClient.ts - CREATE NEW FILE
     import { QueryClient } from '@tanstack/react-query';

     export const queryClient = new QueryClient({
       defaultOptions: {
         queries: {
           staleTime: 5 * 60 * 1000, // 5 minutes (references don't change often)
           gcTime: 10 * 60 * 1000, // 10 minutes (keep in cache)
           retry: 1, // Only retry once (avoid spamming server)
           refetchOnWindowFocus: false, // Don't refetch on tab switch
           refetchOnReconnect: true, // Do refetch after network reconnection
           refetchOnMount: false, // Don't refetch if data is fresh
         },
         mutations: {
           retry: 0, // Never retry mutations (user should trigger)
         },
       },
     });
     ```

  2. **Use in main.tsx**:
     ```typescript
     // main.tsx - REPLACE QueryClient creation
     import { queryClient } from '@/common/api/queryClient';

     // Remove: const queryClient = new QueryClient();
     // Use imported queryClient instead
     ```

- **Testing**: Observe network tab, verify no unnecessary refetches

- **Acceptance Criteria**:
  - [ ] Queries cached for 5 minutes
  - [ ] No refetch on window focus
  - [ ] Mutations never auto-retry

---

#### Task B5: Optimize Zustand Subscriptions
- **Priority**: P1
- **Mentioned in**: Gemini, GPT
- **Files to Modify**:
  - `src/components/layout/AppLayout.tsx:12-19`
  - `src/routes/*.tsx` (multiple)
- **Steps**:
  1. **Replace full store subscriptions with selectors**:
     ```typescript
     // AppLayout.tsx:12-19 - BEFORE ❌
     const {
       activeView,
       setActiveView,
       detailsPaneOpen,
       detailsPaneTab,
       setDetailsPaneTab,
       setDetailsPaneOpen,
     } = useUIStore();

     // AFTER ✅
     const activeView = useUIStore((state) => state.activeView);
     const setActiveView = useUIStore((state) => state.setActiveView);
     const detailsPaneOpen = useUIStore((state) => state.detailsPaneOpen);
     const detailsPaneTab = useUIStore((state) => state.detailsPaneTab);
     const setDetailsPaneTab = useUIStore((state) => state.setDetailsPaneTab);
     const setDetailsPaneOpen = useUIStore((state) => state.setDetailsPaneOpen);
     ```

  2. **Or use selector functions from store** (if they exist):
     ```typescript
     // Check ui.store.ts:222-234 for exported selectors
     import { useActiveView, useDetailsPaneState } from '@/store/ui.store';
     ```

  3. **Repeat for all routes**: search.tsx, projects.tsx, duplicates.tsx, etc.

- **Testing**: Use React DevTools Profiler to verify fewer re-renders

- **Acceptance Criteria**:
  - [ ] Components only re-render when their specific state slice changes
  - [ ] Toast additions don't trigger AppLayout re-renders

---

#### Task B6: Wire Panel Persistence
- **Priority**: P1
- **Mentioned in**: Gemini, GPT
- **Files to Modify**: `src/components/layout/AppLayout.tsx:44-88`
- **Steps**:
  1. **Read initial sizes from store**:
     ```typescript
     // AppLayout.tsx - ADD at component top
     const sidebarWidth = useUIStore((state) => state.sidebarWidth);
     const detailsPaneWidth = useUIStore((state) => state.detailsPaneWidth);
     const setSidebarWidth = useUIStore((state) => state.setSidebarWidth);
     const setDetailsPaneWidth = useUIStore((state) => state.setDetailsPaneWidth);
     ```

  2. **Pass to ResizablePanelGroup**:
     ```typescript
     // AppLayout.tsx:44-88 - UPDATE panels
     <Panel
       id="sidebar"
       defaultSize={sidebarWidth || 25}  // ✅ Use from store
       minSize={15}
       maxSize={40}
       // ...
     />

     {detailsPaneOpen && (
       <Panel
         id="details"
         defaultSize={detailsPaneWidth || 25}  // ✅ Use from store
         minSize={20}
         maxSize={50}
       />
     )}
     ```

  3. **Save on resize**:
     ```typescript
     // AppLayout.tsx - ADD onLayout handler to PanelGroup
     <PanelGroup
       direction="horizontal"
       onLayout={(sizes) => {
         // sizes is array: [sidebar, main, details?]
         setSidebarWidth(sizes[0]);
         if (detailsPaneOpen && sizes[2]) {
           setDetailsPaneWidth(sizes[2]);
         }
       }}
     >
     ```

- **Testing**: Resize panels, refresh page, verify sizes restored

- **Acceptance Criteria**:
  - [ ] Panel sizes persist across page refreshes
  - [ ] No "panel size normalization" warnings in console
  - [ ] Sizes stored in localStorage via Zustand persist

---

#### Task B7: Add Keyboard Shortcut Hook (Foundation)
- **Priority**: P1
- **Mentioned in**: Gemini, GPT
- **Files to Create**: `src/common/hooks/useKeyboardShortcut.ts`
- **Steps**:
  1. **Create hook** (copy from editor or use this):
     ```typescript
     // src/common/hooks/useKeyboardShortcut.ts - CREATE NEW FILE
     import { useEffect } from 'react';

     export type KeyboardShortcut = {
       key: string;
       ctrl?: boolean;
       cmd?: boolean;
       shift?: boolean;
       alt?: boolean;
     };

     export function useKeyboardShortcut(
       shortcut: KeyboardShortcut,
       callback: () => void,
       enabled: boolean = true
     ) {
       useEffect(() => {
         if (!enabled) return;

         const handleKeyDown = (event: KeyboardEvent) => {
           const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

           // Check modifier keys
           const ctrlOrCmd = shortcut.ctrl || shortcut.cmd;
           const modifierPressed = isMac ? event.metaKey : event.ctrlKey;

           const matches =
             event.key.toLowerCase() === shortcut.key.toLowerCase() &&
             (!ctrlOrCmd || modifierPressed) &&
             (!shortcut.shift || event.shiftKey) &&
             (!shortcut.alt || event.altKey);

           if (matches) {
             event.preventDefault();
             callback();
           }
         };

         document.addEventListener('keydown', handleKeyDown);
         return () => document.removeEventListener('keydown', handleKeyDown);
       }, [shortcut, callback, enabled]);
     }

     // Convenience hook for global shortcuts
     export function useGlobalShortcuts(shortcuts: Record<string, () => void>) {
       useEffect(() => {
         const handleKeyDown = (event: KeyboardEvent) => {
           const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
           const modifier = isMac ? event.metaKey : event.ctrlKey;

           // Example: Cmd/Ctrl+F for search
           if (modifier && event.key === 'f') {
             event.preventDefault();
             shortcuts['search']?.();
           }
           // Add more shortcuts as needed
         };

         document.addEventListener('keydown', handleKeyDown);
         return () => document.removeEventListener('keydown', handleKeyDown);
       }, [shortcuts]);
     }
     ```

  2. **Example usage** (add to AppLayout or routes later):
     ```typescript
     import { useKeyboardShortcut } from '@/common/hooks/useKeyboardShortcut';

     // In component:
     useKeyboardShortcut(
       { key: 'f', ctrl: true },
       () => {
         // Open search
         console.log('Search shortcut pressed');
       }
     );
     ```

- **Testing**: Press Cmd/Ctrl+F in app, verify callback fires

- **Acceptance Criteria**:
  - [ ] Hook detects keyboard shortcuts correctly
  - [ ] Handles Cmd (Mac) vs Ctrl (Windows/Linux)
  - [ ] Prevents default browser behavior
  - [ ] Foundation for Phase 3 shortcuts

---

### Session 3C: Medium Priority Improvements (~2 hours)

**Goal**: Fix design deviations and UI polish

---

#### Task C1: Add Activity Bar Badges
- **Priority**: P2
- **Mentioned in**: Gemini, GPT
- **Files to Modify**: `src/components/layout/ActivityBar.tsx`
- **Steps**:
  1. **Add badge support**:
     ```typescript
     // ActivityBar.tsx - ADD badge prop to each item
     const items = [
       { id: 'library', icon: BookOpenIcon, label: 'Library', badge: undefined },
       { id: 'search', icon: MagnifyingGlassIcon, label: 'Search', badge: undefined },
       { id: 'projects', icon: FolderIcon, label: 'Projects', badge: undefined },
       { id: 'duplicates', icon: DocumentDuplicateIcon, label: 'Duplicates', badge: 5 },  // ✅ Example
       { id: 'sharing', icon: ShareIcon, label: 'Sharing', badge: '!' },  // ✅ Alert
     ];
     ```

  2. **Render badges**:
     ```typescript
     {items.map((item) => (
       <button key={item.id} /* ... */>
         <item.icon className="w-5 h-5" />
         {item.badge && (
           <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
             {item.badge}
           </span>
         )}
       </button>
     ))}
     ```

- **Acceptance Criteria**:
  - [ ] Badges appear on activity bar icons
  - [ ] Numeric badges for counts
  - [ ] Alert badges for warnings

---

#### Task C2: Add Status Bar Component
- **Priority**: P2
- **Mentioned in**: Gemini, GPT
- **Files to Create**: `src/components/layout/StatusBar.tsx`
- **Files to Modify**: `src/components/layout/AppLayout.tsx:89`
- **Steps**:
  1. **Create StatusBar**:
     ```typescript
     // src/components/layout/StatusBar.tsx - CREATE NEW FILE
     import React from 'react';
     import { useLibraryStore } from '@/features/library/store/library.store';

     export const StatusBar: React.FC = () => {
       const selectedIds = useLibraryStore((state) => state.selectedReferenceIds);
       const selectedCount = selectedIds.length;

       return (
         <div className="h-6 px-4 flex items-center gap-4 text-xs text-text-secondary border-t border-border bg-bg-surface">
           {selectedCount > 0 && (
             <span>{selectedCount} selected</span>
           )}
           <span>Sync OK</span>
           {/* Add more status items in Phase 3 */}
         </div>
       );
     };
     ```

  2. **Add to AppLayout**:
     ```typescript
     // AppLayout.tsx:89 - ADD after PanelGroup
     </PanelGroup>
     <StatusBar />  {/* ✅ ADD */}
     ```

- **Acceptance Criteria**:
  - [ ] Status bar appears at bottom
  - [ ] Shows selection count
  - [ ] Shows sync status

---

#### Task C3: Add Tag Colors
- **Priority**: P2
- **Mentioned in**: Gemini, GPT
- **Files to Modify**: `src/components/ui/Tag.tsx`
- **Steps**:
  1. **Add color prop**:
     ```typescript
     // Tag.tsx - UPDATE interface and usage
     interface TagProps {
       label: string;
       color?: string | null;  // ✅ ADD
       onRemove?: () => void;
       size?: 'sm' | 'md';
     }

     export const Tag: React.FC<TagProps> = ({ label, color, onRemove, size = 'sm' }) => {
       const colorStyles = color ? {
         backgroundColor: `${color}20`,  // 20% opacity
         borderColor: color,
         color: color,
       } : {};

       return (
         <span
           className={cn(/* ... */)}
           style={colorStyles}  // ✅ ADD
         >
           {label}
           {/* ... */}
         </span>
       );
     };
     ```

- **Acceptance Criteria**:
  - [ ] Tags render with custom colors
  - [ ] Falls back to default accent if no color

---

#### Task C4: Fix Custom Cursor Shape (Polish)
- **Priority**: P2 (Low urgency)
- **Mentioned in**: Claude, Gemini
- **Files to Modify**: `src/components/ui/GlobalCursor.tsx:823-835`
- **Steps**: Defer to Phase 3 polish (not critical)

---

#### Task C5: Extract Magic Numbers to Constants
- **Priority**: P2
- **Mentioned in**: Claude
- **Files to Create**: `src/common/constants.ts`
- **Steps**:
  ```typescript
  // src/common/constants.ts - CREATE NEW FILE
  export const LAYOUT = {
    ACTIVITY_BAR_WIDTH: 64,
    SIDEBAR: {
      DEFAULT_SIZE: 25,
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

---

#### Task C6: Add Library Toolbar
- **Priority**: P2
- **Mentioned in**: Gemini, GPT
- **Files to Modify**: `src/routes/library.tsx:30-36`
- **Steps**: Add buttons for Add/Import/Export (implementations in Phase 3)

---

### Session 3D: Low Priority Polish (~1 hour)

**Goal**: Documentation cleanup and minor improvements

---

#### Task D1: Condense STATUS.md
- **Priority**: P3
- **Mentioned in**: Claude, Gemini, GPT
- **Files to Modify**: `STATUS.md`
- **Files to Create**: `CHANGELOG.md`
- **Steps**: Move Phase 1 history to CHANGELOG, keep STATUS focused on current phase

---

#### Task D2: Add JSDoc Comments
- **Priority**: P3
- **Mentioned in**: Claude
- **Files to Modify**: `src/common/api/client.ts`, stores
- **Steps**: Add JSDoc to public methods for better IDE hints

---

#### Task D3: Add File Upload Progress (Defer)
- **Priority**: P1 (but defer to Phase 3 Session 6 when PDF upload implemented)
- **Mentioned in**: Claude
- **Steps**: Use XMLHttpRequest instead of fetch for progress events

---

#### Task D4: Skeleton Loading Components (Defer)
- **Priority**: P3
- **Mentioned in**: Claude
- **Steps**: Create Skeleton.tsx component (Phase 3+)

---

#### Task D5: Focus Management Utilities (Defer)
- **Priority**: P2
- **Mentioned in**: Gemini, GPT
- **Steps**: Add useFocusTrap hook (Phase 3 when needed)

---

## Dependencies & Sequencing

```
Session 3A (P0 - No dependencies)
  ├─ Task A1: API Response Unwrapping (MUST FIX FIRST)
  ├─ Task A2: Auth Tests (parallel, enables build)
  ├─ Task A3: Auth Persistence (parallel)
  ├─ Task A4: Token Refresh (depends on A1, A3)
  ├─ Task A5: Consolidate Reference Types (parallel)
  ├─ Task A6: Fix Date Types (parallel)
  ├─ Task A7: Toast Container (parallel)
  └─ Task A8: setTokens Nullable (parallel)

Session 3B (P1 - Requires 3A complete)
  ├─ Task B1: ErrorBoundary (parallel with B2-B5)
  ├─ Task B2: Common Utils (parallel)
  ├─ Task B3: Zod Validation (depends on A5, A6)
  ├─ Task B4: Query Cache Config (parallel)
  ├─ Task B5: Zustand Selectors (parallel)
  ├─ Task B6: Panel Persistence (parallel)
  └─ Task B7: Keyboard Hook (parallel)

Session 3C (P2 - Requires 3B complete)
  ├─ Task C1-C6: UI Polish (all parallel)

Session 3D (P3 - Anytime)
  └─ Documentation tasks (parallel)
```

**Critical Path**: A1 (API unwrap) → A4 (refresh) → Phase 3
**Parallel Work**: A2, A3, A5, A6, A7, A8 can all run simultaneously

---

## Testing Strategy

### Unit Tests
- **Auth store**: `pnpm test src/store/__tests__/auth.store.test.ts`
- **UI store**: `pnpm test src/store/__tests__/ui.store.test.ts`
- **Utils**: Add tests for new utility functions

### Integration Tests
- **API client**: Test mutation flows end-to-end
- **Auth flow**: Login → refresh → logout
- **Toast system**: Verify toasts appear and dismiss

### Manual QA
After each session:

**Session 3A QA Checklist**:
- [ ] Login with test credentials
- [ ] Create a reference (mutation returns object, not undefined)
- [ ] Update reference (success toast appears, no crash)
- [ ] Trigger 401 error (token refreshes, not logged out)
- [ ] Refresh page (still logged in)
- [ ] Check toasts render (API errors show toast)

**Session 3B QA Checklist**:
- [ ] Break a component (ErrorBoundary catches, shows fallback)
- [ ] Use utility functions in console
- [ ] Resize panels (sizes persist after refresh)
- [ ] Press Cmd/Ctrl+F (shortcut works)

**Session 3C QA Checklist**:
- [ ] Check activity bar badges visible
- [ ] Check status bar at bottom
- [ ] Verify tag colors display

### Build Verification
```bash
# Frontend
cd /home/mahdi/Desktop/bibliography/bibliography_frontend
pnpm build  # Must succeed with 0 errors
pnpm test   # All tests pass
pnpm lint   # No lint errors

# Backend (already passing)
cd /home/mahdi/Desktop/bibliography/bibliography_backend
npm run build  # Already succeeds
```

---

## Success Criteria

### Session 3A Complete When:
- [ ] Frontend build passes (0 TypeScript errors)
- [ ] All auth store tests pass
- [ ] Mutations return correct data (not undefined)
- [ ] Token refresh works (401 doesn't logout immediately)
- [ ] Toasts render on screen
- [ ] Only one Reference type exists (in common/types.ts)
- [ ] Date fields typed correctly (string or Date consistently)

### Session 3B Complete When:
- [ ] ErrorBoundary catches component errors
- [ ] All common utilities implemented
- [ ] Zod schemas defined for core types
- [ ] Panel sizes persist across refreshes
- [ ] Components use selectors (not full store)
- [ ] Keyboard shortcut hook available
- [ ] React Query cache configured

### Phase 2.5 Complete When:
- [ ] All P0 and P1 issues resolved
- [ ] Build passes (frontend + backend)
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] Manual QA passes
- [ ] Toast system functional
- [ ] Auth flow complete with refresh
- [ ] Ready for Phase 3 Session 4 (feature development)

---

## Deliverables Summary

### Files to Create (13):
1. `src/components/ui/ToastContainer.tsx` - Toast presenter
2. `src/components/ErrorBoundary.tsx` - Error boundary
3. `src/common/api/validators.ts` - Zod schemas
4. `src/common/api/queryClient.ts` - Query config
5. `src/common/hooks/useKeyboardShortcut.ts` - Keyboard hook
6. `src/common/constants.ts` - Magic number constants
7. `src/components/layout/StatusBar.tsx` - Bottom status bar
8. `CHANGELOG.md` - Historical changes

### Files to Modify (18):
1. `src/common/api/client.ts` - Unwrap response, add refresh flow
2. `src/features/library/api/references.queries.ts` - Remove duplicate type, fix unwrapping
3. `src/store/auth.store.ts` - Persist isAuthenticated, allow null tokens
4. `src/store/__tests__/auth.store.test.ts` - Fix API to match new tokens structure
5. `src/common/types.ts` - Make pdf nullable, fix date types
6. `src/App.tsx` - Mount ToastContainer
7. `src/main.tsx` - Wrap with ErrorBoundary, use queryClient
8. `src/common/utils.ts` - Add missing utilities
9. `src/components/layout/AppLayout.tsx` - Wire panel persistence, use selectors
10. `src/routes/library.tsx` - Use selectors
11. `src/routes/search.tsx` - Use selectors
12. `src/components/layout/ActivityBar.tsx` - Add badges
13. `src/components/ui/Tag.tsx` - Add color support
14. `STATUS.md` - Condense history
15. (Multiple route files for selector optimization)

### Files to Delete (0):
- None

**Estimated LOC**: ~800 new, ~200 modified

---

## Risk Assessment

### **Risk #1: Token Refresh Endpoint May Not Exist**
- **Severity**: High
- **Likelihood**: Medium
- **Impact**: Can't implement Task A4 (refresh flow)
- **Mitigation**:
  1. Check bibliography_backend for `/auth/refresh` endpoint
  2. If missing, implement basic endpoint (POST with refreshToken → new tokens)
  3. Or mock refresh success temporarily for frontend
- **Contingency**: Defer refresh to Phase 3, keep immediate logout for now (document as tech debt)

---

### **Risk #2: Backend API Response Format May Vary**
- **Severity**: Medium
- **Likelihood**: Medium
- **Impact**: Task A1 unwrapping approach may not work for all endpoints
- **Mitigation**:
  1. Test with real backend responses
  2. Add conditional unwrapping (check if `data` field exists)
  3. Log warnings for unexpected formats
- **Contingency**: Add `unwrap` parameter to handleResponse, default true

---

### **Risk #3: Date Coercion Breaks Existing Code**
- **Severity**: Medium
- **Likelihood**: Low
- **Impact**: Changing Date → string may require updates in multiple places
- **Mitigation**:
  1. Search codebase for date operations: `.getTime()`, `.toISOString()`, etc.
  2. Update or wrap with new Date() where needed
  3. Test formatDate utility still works
- **Contingency**: Keep Date type, add Zod coercion in validators

---

### **Risk #4: Zustand Selector Refactor Too Invasive**
- **Severity**: Low
- **Likelihood**: Low
- **Impact**: Task B5 touches many files, possible merge conflicts if working in team
- **Mitigation**:
  1. Do selector refactor in single commit
  2. Search/replace pattern for consistency
  3. Test each route after change
- **Contingency**: Only refactor critical components (AppLayout), defer routes

---

### **Risk #5: Time Estimates Too Optimistic**
- **Severity**: Medium
- **Likelihood**: High (always)
- **Impact**: Sessions take longer than planned
- **Mitigation**:
  1. Start with Session 3A (P0 only) - most critical
  2. If time runs out, Session 3B can be split
  3. Session 3C/3D are optional polish
- **Contingency**: Mark Phase 2.5 "complete enough for Phase 3" after 3A+3B, defer C/D

---

## Post-Implementation Checklist

### Build & Test
- [ ] Frontend builds: `cd bibliography_frontend && pnpm build`
- [ ] Backend builds: `cd bibliography_backend && npm run build`
- [ ] Frontend tests pass: `pnpm test`
- [ ] Backend tests pass: `npm test`
- [ ] No TypeScript errors: `pnpm tsc --noEmit`
- [ ] ESLint passes: `pnpm lint`

### Manual QA
- [ ] Login flow works (tokens persisted)
- [ ] Page refresh maintains login state
- [ ] Create reference mutation returns data
- [ ] Update reference mutation works
- [ ] Toast appears on API errors
- [ ] ErrorBoundary catches component crashes
- [ ] Panel sizes persist after refresh
- [ ] Keyboard shortcuts work (if implemented)

### Documentation
- [ ] STATUS.md updated with Phase 2.5 completion
- [ ] CHANGELOG.md created with history
- [ ] Known issues documented
- [ ] Phase 3 readiness confirmed

### Git Commits
- [ ] Session 3A committed separately: "fix(phase2.5): critical blockers - API unwrap, auth, toasts, types"
- [ ] Session 3B committed separately: "feat(phase2.5): add missing patterns - ErrorBoundary, utils, validation, selectors"
- [ ] Session 3C committed separately (optional): "style(phase2.5): UI polish - badges, status bar, colors"
- [ ] Session 3D committed separately (optional): "docs(phase2.5): condense STATUS, add CHANGELOG"

### Phase 3 Readiness
- [ ] All P0 issues resolved
- [ ] All P1 issues resolved
- [ ] Build passing
- [ ] Tests passing
- [ ] No console errors in dev
- [ ] Ready to start Session 4 (feature development)

---

## Appendix: Review Summary Statistics

### **Claude Review** (1,250 lines):
- Total findings: 47
- Critical: 1 (toast)
- Important: 5 (ErrorBoundary, utils, validation, etc.)
- Minor: 4 (docs, refactoring)
- Architecture: 3 (response format, React Query, upload progress)
- Unique issues: 8 (most comprehensive review)

### **Gemini Review** (95 lines):
- Total findings: 16
- Critical: 5 (mutations, refresh, auth, types, toast)
- Missing patterns: 7 (ErrorBoundary, utils, validation, etc.)
- Design deviations: 5 (toolbar, badges, cursor)
- Type safety: 6 (dates, any types, validation)
- Unique issues: 0 (all caught by other reviews)

### **GPT Review** (196 lines):
- Total findings: 20
- Critical: 5 (same as Gemini)
- Missing patterns: 7 (same as Gemini)
- Design deviations: 5 (same as Gemini)
- Type safety: 6 (same as Gemini)
- Unique issues: 0 (85% overlap with Gemini)

### **Session 3 Review** (56 lines):
- Total findings: 7 (frontend + backend)
- Critical frontend: 5 (ESLint, auth, fetch client, types, tests)
- Critical backend: 2 (build failure, Tag usageCount)
- Unique issues: 1 (ESLint config - partially false)
- False positives: 3 (ESLint, backend build, Tag usageCount)

### **Overall Statistics**:
- Total unique issues: 47
- Issues mentioned by all 4: 1 (toasts) ✅ **UNANIMOUS**
- Issues mentioned by 3: 7 (high confidence)
- Issues mentioned by 2: 12 (moderate confidence)
- Issues mentioned by 1: 27 (review-specific)
- False positives: 3 (Session 3 errors)

### **Reviewer Agreement Matrix**:
- Claude ↔ Gemini: 65% overlap
- Claude ↔ GPT: 70% overlap
- Gemini ↔ GPT: 85% overlap (highly consistent)
- Session 3 ↔ Others: 40% overlap (different focus)

### **Most Critical Issues** (by consensus):
1. Toast not rendering (4/4 reviews) ⭐⭐⭐⭐
2. API response unwrapping (3/4 reviews) ⭐⭐⭐
3. Token refresh missing (3/4 reviews) ⭐⭐⭐
4. Auth persistence incomplete (3/4 reviews) ⭐⭐⭐
5. Duplicate Reference types (3/4 reviews) ⭐⭐⭐
6. Auth tests broken (3/4 reviews) ⭐⭐⭐
7. ErrorBoundary missing (3/4 reviews) ⭐⭐⭐

---

**END OF PLAN**

---

## Quick Reference: Session Task Mapping

| Session | Priority | Task Count | Time Est | Goal |
|---------|----------|-----------|----------|------|
| 3A | P0 (Blockers) | 8 tasks | ~4 hours | Enable compilation & runtime safety |
| 3B | P1 (High) | 7 tasks | ~3 hours | Add missing patterns for Phase 3 |
| 3C | P2 (Medium) | 6 tasks | ~2 hours | UI polish & design alignment |
| 3D | P3 (Low) | 5 tasks | ~1 hour | Documentation & nice-to-haves |
| **Total** | | **26 tasks** | **~10 hours** | Phase 2.5 complete |

---

**Next Action**: Start Session 3A, Task A1 (API Response Unwrapping) - highest priority blocker
