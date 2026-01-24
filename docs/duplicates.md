# Duplicate Detection API Reference

## Overview

The Bibliography Manager includes automatic duplicate detection for references. When a reference is created, the backend detects potential duplicates using a 3-stage matching algorithm and stores them as `DuplicateCandidate` objects. Users can review and resolve duplicates via the API.

**Status**: Backend fully implemented. Frontend UI optional (not required for MVP).

---

## Backend Files Reference

| File | Purpose |
|------|---------|
| `backend/services/bibliography-service/src/services/DuplicateService.ts` | Core duplicate detection logic |
| `backend/services/bibliography-service/src/controllers/DuplicateController.ts` | API request handlers |
| `backend/services/bibliography-service/src/routes/duplicates.ts` | Route definitions |
| `backend/services/bibliography-service/src/models/DuplicateCandidate.ts` | Data model & TypeScript types |
| `backend/services/bibliography-service/src/shared/schemas.ts` | Zod validation schemas |

---

## API Endpoints

### 1. List Unresolved Duplicates

```
GET /api/bibliography/duplicates
```

Lists all pending duplicate candidates for the authenticated user.

**Request Headers**
```
x-user-id: string (required)
```

**Response (200)**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "user123",
      "existingReferenceId": {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Original Paper",
        "doi": "10.1234/ml.2024",
        "authors": [
          { "given": "John", "family": "Doe", "full": "John Doe" }
        ]
      },
      "duplicateReferenceId": {
        "_id": "507f1f77bcf86cd799439013",
        "title": "ML Paper Duplicate",
        "doi": "10.1234/ml.2024",
        "authors": [
          { "given": "John", "family": "Doe", "full": "John Doe" }
        ]
      },
      "matchReason": "doi",
      "confidence": 0.9,
      "status": "pending",
      "createdAt": "2024-12-24T10:00:00Z"
    }
  ]
}
```

---

### 2. Resolve a Duplicate

```
POST /api/bibliography/duplicates/:id/resolve
```

Resolve a duplicate candidate by choosing which reference to keep.

**Request**
```
POST /api/bibliography/duplicates/507f1f77bcf86cd799439011/resolve
Content-Type: application/json
x-user-id: user123

{
  "action": "keep-existing"
}
```

**Valid Actions**
| Action | Behavior |
|--------|----------|
| `keep-existing` | Delete `duplicateReferenceId`, keep `existingReferenceId` |
| `keep-new` | Delete `existingReferenceId`, keep `duplicateReferenceId` |
| `merged` | ❌ Not implemented in MVP (throws error) |

**Response (200) - Success**
```json
{
  "success": true,
  "message": "Duplicate resolved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "keep-existing",
    "actionTakenBy": "user123",
    "resolvedAt": "2024-12-24T10:05:00Z"
  }
}
```

**Error (400) - Invalid Action**
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Invalid action type"
}
```

**Error (400) - Merge Not Implemented**
```json
{
  "success": false,
  "message": "MERGE_NOT_IMPLEMENTED: Merge functionality not available in MVP"
}
```

**Error (404) - Not Found**
```json
{
  "success": false,
  "message": "Duplicate not found"
}
```

---

## TypeScript Types

```typescript
// Duplicate Candidate object returned from API
interface IDuplicateCandidate {
  _id: string;
  userId: string;
  existingReferenceId: Reference;  // Populated - full reference object
  duplicateReferenceId: Reference; // Populated - full reference object
  matchReason: 'isbn' | 'doi' | 'title-creator';
  confidence: number;              // 0-1 scale
  status: 'pending' | 'keep-existing' | 'keep-new' | 'merged';
  actionTakenBy?: string;
  resolvedAt?: Date;
  createdAt: Date;
}

// Resolution request payload
type DuplicateResolution = {
  action: 'keep-existing' | 'keep-new' | 'merged';
}
```

---

## Detection Algorithm

The backend uses a **3-stage matching approach** (inspired by Zotero):

### Stage 1: ISBN Match
- **Confidence**: 0.95
- **Trigger**: Exact ISBN match found
- **Query**: `isbn === reference.isbn`

### Stage 2: DOI Match
- **Confidence**: 0.9
- **Trigger**: Exact DOI match found
- **Query**: `doi === reference.doi`
- **Deduplication**: Skips matches already found by ISBN

### Stage 3: Title + First Author Match
- **Confidence**: >0.85 (based on Levenshtein similarity)
- **Trigger**: First author family name matches AND normalized title similarity >85%
- **Normalization**:
  - Remove diacritics (é → e)
  - Lowercase
  - Strip punctuation
  - Collapse whitespace
- **Deduplication**: Skips matches already found by ISBN or DOI

---

## Auto-Detection

Duplicate detection runs **automatically when a reference is created**:

```typescript
// Inside ReferenceService.ts - reference creation flow
const newReference = await Reference.create({...});
await this.duplicateService.detectForReference(userId, referenceId);
```

No manual refresh required. Duplicates appear in the list immediately.

---

## Data Model

```typescript
// From DuplicateCandidate.ts
export interface IDuplicateCandidate extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;                                    // User who owns the references
  existingReferenceId: mongoose.Types.ObjectId;    // Original reference (usually older)
  duplicateReferenceId: mongoose.Types.ObjectId;   // Potential duplicate (usually newer)
  matchReason: 'isbn' | 'doi' | 'title-creator';   // Which stage detected this
  confidence: number;                               // 0-1, higher = more likely duplicate
  status: 'pending' | 'keep-existing' | 'keep-new' | 'merged';
  actionTakenBy?: string;                          // User ID who resolved this
  resolvedAt?: Date;                               // When resolved
  createdAt: Date;                                 // When detected
}
```

**Database Indexes**:
- `{userId, status}` - Fast lookup of pending duplicates
- `{existingReferenceId}` - Fast lookup by original reference
- `{duplicateReferenceId}` - Fast lookup by duplicate reference
- `{userId, existingReferenceId, duplicateReferenceId}` - Unique constraint (prevents duplicate pairs)

---

## Frontend Integration

### Quick Start

```typescript
// 1. Fetch unresolved duplicates
const response = await fetch('/api/bibliography/duplicates', {
  headers: { 'x-user-id': userId }
});
const duplicates = await response.json();

// 2. Display to user
duplicates.data.forEach(dup => {
  console.log(`Match: "${dup.existingReferenceId.title}" vs "${dup.duplicateReferenceId.title}"`);
  console.log(`Reason: ${dup.matchReason} (confidence: ${dup.confidence})`);
});

// 3. Resolve duplicate
const resolved = await fetch(`/api/bibliography/duplicates/${duplicateId}/resolve`, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-user-id': userId
  },
  body: JSON.stringify({ action: 'keep-existing' })
});
```

### Implementation Checklist

- [ ] Create query hook for `GET /api/bibliography/duplicates`
- [ ] Create mutation hook for `POST /api/bibliography/duplicates/:id/resolve`
- [ ] Build duplicate pair comparison UI
- [ ] Display match reason and confidence score
- [ ] Show populated reference data (title, authors, DOI, etc.)
- [ ] Handle validation errors (invalid action, missing fields)
- [ ] Handle 404 errors (duplicate not found)
- [ ] Show success message after resolution
- [ ] Refresh duplicate list after resolution
- [ ] Consider batch resolution UI for power users

### UI Recommendations

**Confidence Score Display**
- **0.95** (ISBN): "Exact ISBN match - Very likely duplicate"
- **0.90** (DOI): "Exact DOI match - Very likely duplicate"
- **0.85-0.99** (Title): "Similar title + author - Possibly duplicate"

**Match Reason Icons**
- 📚 ISBN
- 🔗 DOI
- 📄 Title + Author

---

## Known Limitations & Future Work

| Feature | Status | Notes |
|---------|--------|-------|
| Duplicate detection | ✅ Complete | Auto-triggered on reference creation |
| List unresolved | ✅ Complete | GET endpoint working |
| Keep existing/new | ✅ Complete | Deletes the chosen reference |
| Merge functionality | ❌ Not Implemented | Will throw error if attempted; planned for Phase 2 |
| Bulk resolution | ❌ Not Implemented | Refresh endpoint (POST /refresh) pending |
| Manual re-detection | ❌ Not Implemented | Can't manually trigger detection on existing references |
| Cross-collection deduplication | ❌ Not Implemented | Only detects within user's library |

---

## Testing

Full test suite available at:
- `backend/services/bibliography-service/tests/integration/duplicates.test.ts`
- `backend/services/bibliography-service/tests/unit/services/DuplicateService.test.ts`

Run tests:
```bash
cd backend/services/bibliography-service
npm run test:integration -- duplicates.test.ts
```

---

## Examples

### Example 1: User imports PDF with existing reference

```
User has reference A (imported 3 months ago with DOI 10.1234/paper)
User imports PDF B (same paper, extracts DOI 10.1234/paper)

Result:
✅ Reference B created successfully
✅ DuplicateCandidate created (matchReason: 'doi', confidence: 0.9)
✅ Appears in GET /api/bibliography/duplicates

User Action: Click "Keep Original" → Reference B deleted
```

### Example 2: Similar title detection

```
User has: "Machine Learning for NLP" by John Smith (2023)
User imports: "Machine Learning and NLP" by John Smith (2023)

Result:
✅ Both references created
✅ DuplicateCandidate created (matchReason: 'title-creator', confidence: 0.87)

User Action: Clicks "Keep New" → Original reference deleted
```

### Example 3: No match

```
User imports two completely different papers
(different DOI, ISBN, title, authors)

Result:
✅ Both references created
❌ No DuplicateCandidate created
```

---

## MVP Status

**Duplicate detection is optional for beta launch.** The backend is fully implemented and tested, but frontend UI is not required for MVP. Implement if you want to offer duplicate management to users, otherwise skip.

---

**Last Updated**: December 2024
**Status**: Backend Complete, Frontend Optional
