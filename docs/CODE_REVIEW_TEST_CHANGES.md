# Code Review - Test Changes Tracking

This document tracks all test modifications required for the code review fixes.

## Pre-Implementation Test Status

| Test Suite | Passed | Failed | Skipped | Notes |
|------------|--------|--------|---------|-------|
| Backend Unit | 194 | 0 | 0 | All passing |
| Backend Integration | 160 | 0 | 3 | Skipped are intentional |
| Frontend Unit | 546 | 3 | 4 | 3 failures in PromptDialog (pre-existing) |
| E2E | 58 | 0 | 16 | Skipped are conditional tests |

## Changes and Their Test Impact

### 1. N+1 Query in TagService.list() - `TagService.ts:38-50`
**Change**: Replace Promise.all + countDocuments with MongoDB aggregation
**Test Impact**: LOW
- **Unit tests**: `TagService.test.ts` - May need minor mock adjustments
- **Integration tests**: No changes needed (tests behavior, not implementation)
- **E2E tests**: No changes needed

### 2. Synchronous File Operations - `ReferenceService.ts:274,345`
**Change**: Replace `fs.unlinkSync` with `fs/promises.unlink`
**Test Impact**: NONE
- Same behavior, just async - all tests should pass unchanged

### 3. Test Cleanup Endpoint Safeguards - `references.ts:45-50`, `tags.ts:46-51`
**Change**: Add additional environment checks
**Test Impact**: NONE
- Tests run in test environment, safeguards won't affect them

### 4. Sanitize MongoDB URL Logging - `index.ts:77`
**Change**: Log only database name instead of full URL
**Test Impact**: NONE
- Logging change only, no functional impact

### 5. Zustand Multiple Subscriptions - `ReferenceTable.tsx:95-105`
**Change**: Group selectors with `useShallow`
**Test Impact**: LOW
- Component tests may need mock adjustments if they mock `useLibraryStore`
- Files to check: `ReferenceTable.test.tsx`

### 6. React.memo on TreeItem - `TreeView.tsx:81`
**Change**: Wrap TreeItem with React.memo
**Test Impact**: NONE
- Memoization doesn't change behavior

### 7. Bundle Splitting - `vite.config.ts`
**Change**: Add manualChunks configuration
**Test Impact**: NONE
- Build configuration only

### 8. Update README - `README.md:24`
**Change**: "Joi" → "Zod"
**Test Impact**: NONE
- Documentation only

### 9. Fix `any` Types
**Change**: Replace `any` with proper types
**Test Impact**: LOW
- May need to update test mocks if type signatures change

## Post-Implementation Checklist

After implementing all changes, run:

```bash
# Backend
pnpm --filter bibliography-backend test:unit
pnpm --filter bibliography-backend test:integration

# Frontend
pnpm --filter bibliography-frontend test:unit

# E2E (requires servers running)
pnpm dev:backend &
pnpm dev:frontend &
pnpm --filter bibliography-frontend test:e2e
```

## Test Files That May Need Updates

### Backend
- [ ] `tests/unit/services/TagService.test.ts` - If aggregation mocks needed
- [ ] `tests/unit/services/ReferenceService.test.ts` - If async file ops affect mocks

### Frontend
- [ ] `src/features/library/components/__tests__/ReferenceTable.test.tsx` - useShallow changes
- [ ] `src/features/library/components/__tests__/TreeNode.test.tsx` - React.memo (unlikely)

## Notes

- Most changes are internal implementation details that don't affect public API
- Integration and E2E tests verify behavior, not implementation
- Pre-existing PromptDialog failures are unrelated to these changes
