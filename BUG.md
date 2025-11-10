# Network Error on Empty Collection - Investigation

**Date**: 2025-11-10
**Reported By**: User
**Status**: Under Investigation

## Symptom

When launching the dev servers, the library page shows:
1. "Loading..." briefly
2. Then "Error loading references: Network error. Please check your connection."

## Context

This error was observed during initial app startup when:
- Frontend dev server (Vite) starts quickly on `http://localhost:5173`
- Backend dev server (Express + TypeScript) starts on `http://localhost:8005`
- User navigates to `/library` page
- Empty references collection (no data in database)

## What Fixed It (Temporarily)

Adding sample reference data to the database eliminated the error. After adding 3 sample papers via API, references loaded successfully.

## Initial Hypothesis (INCORRECT)

**Zod Validation Error**: Initially suspected that the Zod schema validation was failing because backend returned `undefined` for optional fields while schema expected `null`.

**Evidence Against**:
- Empty array `[]` is perfectly valid for `z.array()` schema
- Backend properly returns `{"success":true,"data":[],"pagination":{...}}` for empty collections
- No Zod validation error would occur with this response

## Current Leading Theory

**Server Startup Race Condition**:

### Sequence of Events
1. User runs `npm run dev` for backend (starts compilation + MongoDB connection)
2. User runs `pnpm dev` for frontend (Vite starts instantly)
3. Frontend loads and immediately calls `useReferencesQuery()`
4. Backend is still:
   - Compiling TypeScript with `tsx watch`
   - Connecting to MongoDB
   - Starting Express server
5. Frontend fetch() call hits `http://localhost:8005/api/bibliography/references` **before server is ready**
6. Connection refused → `TypeError` in fetch
7. API client's `normalizeError()` catches `TypeError` and returns:
   ```typescript
   {
     message: 'Network error. Please check your connection.',
     code: 'NETWORK_ERROR'
   }
   ```

### Why Adding Data "Fixed" It

By the time the sample data was added via curl, the backend was fully initialized and running. Subsequent page loads didn't hit the race condition.

## Evidence

### Backend Startup Logs
```
> tsx watch src/index.ts

[timestamp] info: bibliography-service: MongoDB connected
[timestamp] info: bibliography-service: Bibliography service started
```
Typical startup time: **2-5 seconds**

### Frontend Immediate Query
- React Query automatically fetches on component mount
- No retry logic for initial load
- No health check before first API call

### API Client Error Handling
Location: `bibliography_frontend/src/common/api/client.ts` lines 104-129

```typescript
private normalizeError(error: unknown): ApiError {
  if (error instanceof TypeError) {
    if (error.name === 'AbortError') {
      return { message: 'Request timeout', code: 'TIMEOUT' };
    }
    return {
      message: 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR',
    };
  }
  // ...
}
```

**Problem**: All `TypeError` instances (including connection refused) are classified as generic "Network error"

## Reproduction Steps

1. Stop both dev servers
2. Clear MongoDB database: `db.references.deleteMany({})`
3. Start backend: `cd bibliography_backend && npm run dev`
4. **Immediately** start frontend: `cd bibliography_frontend && pnpm dev`
5. Navigate to `http://localhost:5173/library` within 2 seconds
6. Observe "Network error" message

## Proposed Solutions

### Option 1: Retry Logic with Exponential Backoff
Add retry mechanism for initial queries:
```typescript
// In references.queries.ts
export function useReferencesQuery(params) {
  return useQuery({
    queryKey: referenceKeys.list(params || {}),
    queryFn: async () => { /* ... */ },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: QUERY_STALE_TIME_MS
  });
}
```

### Option 2: Health Check Before Queries
```typescript
// Add health check endpoint: GET /health
// Frontend checks health before first query
const isBackendReady = await fetch('/health').then(r => r.ok);
if (!isBackendReady) {
  throw new Error('Server starting...');
}
```

### Option 3: Better Error Messages
Distinguish error types in `normalizeError()`:
- Connection refused: "Server starting, please wait..."
- Timeout: "Request timeout"
- Zod validation: "Invalid data format from server"
- Other TypeError: "Network error"

### Option 4: Wait Script
Add startup orchestration:
```bash
# wait-for-backend.sh
until curl -s http://localhost:8005/health > /dev/null; do
  sleep 0.5
done
pnpm dev
```

## Additional Context

### Files Modified in Fix Session
- `shared/src/schemas.ts` - Changed `.nullable()` to `.nullish()` (accepts both `null` and `undefined`)
- `bibliography_frontend/src/routes/library.tsx` - Moved toolbar outside conditional (UX fix, unrelated)
- Backend API - Added 3 sample references

### Test With Empty Collection
```bash
curl http://localhost:8005/api/bibliography/references -H "x-user-id: test-user-empty"
# Response: {"success":true,"data":[],...}  ✅ Valid response
```

## Next Steps for Investigation

1. **Confirm race condition**:
   - Add console timestamps to backend startup
   - Add console timestamp to frontend first query
   - Compare timings

2. **Test with delay**:
   - Add artificial 5-second delay before first query
   - See if error disappears

3. **Implement retry logic** (recommended quick fix)

4. **Long-term**: Add proper health check + startup orchestration

## Related Files

- `bibliography_frontend/src/common/api/client.ts` - API client and error handling
- `bibliography_frontend/src/features/library/api/references.queries.ts` - React Query hooks
- `bibliography_backend/src/index.ts` - Server startup
- `shared/src/schemas.ts` - Zod validation schemas

---

**Status**: Ready for next agent to implement retry logic or health check mechanism.
