# Session 6 Plan: DOI Import & Crossref Integration

**Created**: 2025-01-11
**Status**: Approved
**Estimated Time**: 2-3 hours (Backend: 1-1.5h, Frontend: 1-1.5h)

---

## Research Findings

### Zotero Frontend (DOI Lookup UI)

**File**: `zotero/chrome/content/zotero/lookup.js`

**Key Findings**:
- Zotero extracts identifiers from textbox using `Zotero.Utilities.extractIdentifiers()`
- Supports batch import (DOI, PMID, ISBN simultaneously) - our MVP focuses on **single DOI only**
- Uses progress toggles during fetch (spinner/loading state)
- Error handling: Alert dialogs for failures

**Decision**: We use React state + Button `loading` prop from editor's CVA Button component. Modal-based import instead of popup panel.

---

### Zotero Backend (DOI Translation)

**File**: `zotero/chrome/content/zotero/lookup.js` (lines 101-121)

**Key Findings**:
- Zotero uses complex **translator system** with multiple metadata sources
- Translation flow: `new Zotero.Translate.Search()` → `setIdentifier()` → `translate()`
- Supports multiple registries (CrossRef, PubMed, WorldCat, etc.)

**Decision**: Our approach is **direct Crossref API** (simpler for MVP). Can add translator pattern in Phase 2.

---

### Zotero Abstract Handling

**WebSearch Confirmation**:
- Zotero forum discussions confirm: "Data provided by CrossRef is typically quite accurate, but does not include abstracts or keywords" (historically)
- However: "CrossRef does, increasingly, have abstracts"
- **Zotero behavior**: Saves abstracts when Crossref provides them
- Users noted abstracts are missing from DOI lookup but available when saving from article page

**Decision**: Save abstracts when Crossref provides them (matches Zotero behavior). Crossref coverage is improving per WebSearch findings.

---

### Crossref API Research

**Endpoint**: `https://api.crossref.org/works/{DOI}`

**Rate Limits** (WebSearch - 2025 Updates):
- Public pool: Standard rate limits (50 req/sec currently)
- **Polite pool**: Higher priority with `mailto` parameter in User-Agent
- Best practice: Include email in User-Agent header for polite pool access
- Cache results to avoid repeated requests

**Sample Response** for DOI `10.1145/3411764.3445518`:
```json
{
  "status": "ok",
  "message": {
    "DOI": "10.1145/3411764.3445518",
    "title": ["\"Everyone wants to do the model work, not the data work\": Data Cascades in High-Stakes AI"],
    "author": [
      { "given": "Nithya", "family": "Sambasivan" },
      { "given": "Shivani", "family": "Kapania" }
    ],
    "published": { "date-parts": [[2021, 5, 6]] },
    "container-title": ["Proceedings of the 2021 CHI Conference..."],
    "publisher": "ACM",
    "type": "proceedings-article",
    "abstract": "..." // Optional - when available
  }
}
```

**Mapping to Reference Schema**:

| Crossref Field | Reference Schema Field | Transform |
|----------------|------------------------|-----------|
| `DOI` | `doi` | Lowercase |
| `title[0]` | `title` | Direct |
| `author[]` | `authors` | Map `{given, family}` (full auto-generated) |
| `published.date-parts[0][0]` | `year` | Extract year |
| `container-title[0]` | `venue` | Direct |
| `URL` | `url` | Direct |
| `abstract` | `abstract` | Save if present, else null |
| `type` | `type` | Map to our enum (see TYPE_MAP below) |

---

### Editor Frontend Patterns

**Modal Component**: `editor_frontend/src/components/ui/Modal.tsx`
- Pattern: Backdrop + centered card with `border-2 border-accent`
- Props: `isOpen`, `onClose`, `title`, `children`

**Button Component**: `editor_frontend/src/components/ui/Button.tsx`
- CVA variants: primary, secondary, outline, ghost, destructive, gradient
- Built-in loading state: `<Button loading={true}>Fetching...</Button>`

**Input Component**: `editor_frontend/src/components/ui/Input.tsx`
- CVA variants: default, error, success
- Usage: `<Input variant={error ? "error" : "default"} />`

**Tab Pattern**: `editor_frontend/src/features/latex-editor/components/SidebarTabs.tsx`
- State: `const [activeTab, setActiveTab] = useState<TabType>("doi")`
- Render content with switch statement

**Decision**: Reuse all editor UI primitives. Single DOI tab only (file upload hidden until Session 7).

---

### Editor Backend Patterns

**ReferenceService Pattern**: `bibliography_backend/src/services/ReferenceService.ts`
- Injectable service with DI
- `create()` method: normalizes authors, generates citation key, creates in MongoDB, triggers async duplicate detection

**ReferenceController Pattern**: `bibliography_backend/src/controllers/ReferenceController.ts`
- Injectable controller with service injection
- Extracts `userId` from `x-user-id` header
- Returns 201 status with created resource

**Decision**: Create CrossrefService following same injectable pattern, inject into ReferenceController.

---

### Shared Zod Schemas

**File**: `shared/src/schemas.ts`

**CreateReferenceInputSchema**:
```typescript
{
  type: ReferenceTypeSchema,
  title: z.string().min(1),
  authors: z.array(AuthorInputSchema).optional(),
  year: z.number().optional(),
  venue: z.string().optional(),
  doi: z.string().optional(),
  abstract: z.string().optional(),
  sourceRaw: SourceRawSchema  // { provider: 'doi', payload: {...} }
}
```

**AuthorInputSchema**:
```typescript
{
  given: z.string().optional(),
  family: z.string().optional(),
  full: z.string().optional()
}
```

**Decision**: Crossref provides `given` and `family`. Backend auto-generates `full = "Family, Given"`.

---

### React Query Patterns

**File**: `bibliography_frontend/src/features/library/api/references.queries.ts`

**Query Key Pattern**:
```typescript
export const referenceKeys = {
  all: ['references'] as const,
  lists: () => [...referenceKeys.all, 'list'] as const,
  // ...
};
```

**Mutation Pattern**:
```typescript
export function useCreateReferenceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => apiClient.post('/references', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: referenceKeys.lists() });
      useUIStore.getState().addToast({ message: 'Success', type: 'success' });
    }
  });
}
```

**Decision**: Create `useImportFromDoiMutation()` with similar pattern.

---

### Testing Strategy

**File**: `docs/03-quality/TESTING.md`

**60/30/10 Split**:
- **60% Unit**: CrossrefService mapping, error handling, validation
- **30% Integration**: API endpoint `POST /references/import-doi` (mock Crossref API)
- **10% E2E**: Playwright test (open modal → enter DOI → verify reference created)

**Decision**: Defer tests to `/session-test 6` command.

---

## Architecture Decisions

### Decision 1: Abstract Handling
**Options**:
- A) Display abstracts when available from Crossref
- B) Leave null for all DOI imports (MVP)

**Choice**: A - Display when available from Crossref

**Rationale**:
- Zotero does the same (confirmed via WebSearch)
- Crossref abstract coverage is improving
- Users get more complete data when publishers provide it
- No extra complexity - just map the field if present

**Trade-off**: Inconsistent abstract availability across references (publisher-dependent)

---

### Decision 2: Duplicate Detection
**Options**:
- A) Auto-trigger duplicate detection (like manual creation)
- B) Skip duplicate detection for DOI imports

**Choice**: A - Auto-trigger duplicate detection

**Rationale**:
- User confirmed preference
- Prevents duplicates when same paper was manually added without DOI
- ReferenceService.create() already calls duplicateService asynchronously (no code change needed)

**Trade-off**: Slightly slower import (but async, so user doesn't wait)

---

### Decision 3: DOI Validation Regex
**Options**:
- A) Use Crossref-recommended regex
- B) Handle all DOI edge cases (Wiley `<>`, etc.)

**Choice**: A - Use Crossref regex: `/^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i`

**Rationale**:
- WebSearch confirmed: Matches 74.4M of 74.9M Crossref DOIs (99.3% coverage)
- Simpler implementation
- MVP scope - edge cases deferred

**Trade-off**: May reject rare valid DOIs from other registries

---

### Decision 4: Rate Limiting Strategy
**Options**:
- A) Use public pool (no special headers)
- B) Use polite pool with `mailto` header

**Choice**: B - Use polite pool

**Rationale**:
- WebSearch confirmed: Polite pool gives priority processing
- Simple to implement: Add `User-Agent: BibliographyManager/1.0 (mailto:your@email.com)`
- No downside

**Trade-off**: None

---

### Decision 5: File Upload Tab Visibility
**Options**:
- A) Show as disabled with tooltip 'Coming soon'
- B) Hide completely until Session 7

**Choice**: B - Hide completely until Session 7

**Rationale**:
- User confirmed preference
- Cleaner MVP UI - only show what works
- Will add file tab in Session 7

**Trade-off**: Users don't see future feature yet

---

### Decision 6: Error UX
**Options**:
- A) Keep modal open with error toast
- B) Close modal on error

**Choice**: A - Keep modal open with error toast

**Rationale**:
- User confirmed preference
- Better UX for fixing typos without reopening modal
- Consistent with modern web patterns

**Trade-off**: Need to manage error state in modal component

---

### Decision 7: Crossref Type Mapping
**Options**:
- A) Map common types, fallback to 'other'
- B) Store raw Crossref type, map on display

**Choice**: A - Map common types, fallback to 'other'

**Mapping**:
```typescript
const TYPE_MAP: Record<string, ReferenceType> = {
  'journal-article': 'article',
  'proceedings-article': 'conference',
  'book': 'book',
  'book-chapter': 'chapter',
  'dissertation': 'thesis',
  // default: 'other'
};
```

**Rationale**:
- Clean data model (our canonical types)
- Raw Crossref data stored in `sourceRaw.payload` as backup
- Simpler frontend display logic

**Trade-off**: May lose some type nuance (but have raw data in sourceRaw)

---

## Deviations from Zotero

### 1. Direct Crossref API vs Translator System
**Zotero**: Uses complex translator system with multiple metadata sources (Crossref, PubMed, WorldCat, etc.)

**Ours**: Direct Crossref REST API call

**Rationale**:
- MVP simplicity - Zotero's translator system is powerful but overkill for DOI-only import
- Can add translator pattern in Phase 2 for BibTeX/RIS imports

**Future**: May add translator pattern for Session 7+ (file imports)

---

### 2. Single DOI Import
**Zotero**: Supports batch identifier import (multiple DOIs, ISBNs, PMIDs simultaneously from one textbox)

**Ours**: Single DOI per import operation

**Rationale**:
- MVP scope constraint
- Simpler UX for initial version
- Batch import deferred to Phase 2

**Future**: Session 10+ may add batch import feature

---

### 3. Modal-Based Import
**Zotero**: Uses popup panel from toolbar (desktop UI pattern)

**Ours**: Full modal dialog (web UI pattern)

**Rationale**:
- Web UX patterns differ from desktop apps
- Modal fits our React architecture better (consistent with other modals)
- Better accessibility on web

**Future**: No plan to align - this is appropriate for web

---

## Implementation Checklist

### Backend (1-1.5 hours)

#### 1. Create CrossrefService (`src/services/CrossrefService.ts`)
- [ ] Injectable service with `@injectable()` decorator
- [ ] Implement `fetchMetadata(doi: string): Promise<CrossrefResponse>`
  - Endpoint: `https://api.crossref.org/works/{doi}`
  - Headers:
    - `User-Agent: BibliographyManager/1.0 (mailto:your@email.com)` (polite pool)
    - `Accept: application/json`
  - Timeout: 10s with `AbortSignal.timeout(10000)`
  - Error handling:
    - 404 → throw `new Error('DOI not found')`
    - 429 → throw `new Error('Rate limit exceeded')`
    - Network → throw `new Error('Network error')`
- [ ] Implement `mapToReferenceInput(crossrefData): CreateReferenceInput`
  - Map title: `crossrefData.title?.[0]` (array to string)
  - Map authors: `crossrefData.author?.map(a => ({ given: a.given, family: a.family }))`
  - Map year: `crossrefData.published?.['date-parts']?.[0]?.[0]`
  - Map venue: `crossrefData['container-title']?.[0]`
  - Map DOI: `crossrefData.DOI.toLowerCase()`
  - Map URL: `crossrefData.URL`
  - Map abstract: `crossrefData.abstract || null` (save when available)
  - Map type using TYPE_MAP
  - Set sourceRaw: `{ provider: 'doi', payload: crossrefData }`
- [ ] Create TYPE_MAP constant (Crossref type → Reference type)
- [ ] Add TypeScript interfaces for Crossref API response

#### 2. Add Import Route (`src/controllers/ReferenceController.ts`)
- [ ] Add method `importFromDoi(req: Request, res: Response)`
- [ ] Extract DOI from request body
- [ ] Extract userId from `req.headers['x-user-id']`
- [ ] Call `crossrefService.fetchMetadata(doi)`
- [ ] Call `crossrefService.mapToReferenceInput(metadata)`
- [ ] Call `referenceService.create(userId, referenceInput)` (auto-triggers duplicate detection)
- [ ] Return created reference with 201 status
- [ ] Handle errors: 404, 429, validation, network

#### 3. Add Route Definition (`src/routes/reference.routes.ts`)
- [ ] `POST /references/import-doi`
- [ ] Add Joi validation middleware: `{ doi: Joi.string().required() }`
- [ ] Map to `referenceController.importFromDoi`

#### 4. Update Dependency Injection (`src/di/container.ts`)
- [ ] Bind `CrossrefService` to container
- [ ] Add to TYPES constant if needed
- [ ] Inject into `ReferenceController` constructor

#### 5. Error Handling
- [ ] Add Crossref-specific error messages to error middleware
- [ ] Return structured errors: `{ success: false, error: { message, code } }`
- [ ] Log all Crossref API calls with Winston

---

### Frontend (1-1.5 hours)

#### 1. Create ImportModal Component (`src/features/library/components/ImportModal.tsx`)
- [ ] Copy Modal structure from `editor_frontend/src/components/ui/Modal.tsx`
- [ ] Props: `isOpen: boolean`, `onClose: () => void`
- [ ] Title: "Import Reference"
- [ ] State: `doi` (string), `preview` (Reference | null), `error` (string | null)
- [ ] Single-tab layout (no file upload tab - hidden until Session 7)

#### 2. DOI Input Section
- [ ] Import Input component from `src/components/ui/Input.tsx`
- [ ] Label: "DOI"
- [ ] Placeholder: "10.xxxx/xxxxx"
- [ ] Value: `doi` state
- [ ] onChange: Update `doi` state
- [ ] Client-side validation with DOI_REGEX
- [ ] Variant: `error` if validation fails

#### 3. Fetch Button
- [ ] Import Button from `src/components/ui/Button.tsx`
- [ ] Variant: "primary"
- [ ] Text: "Fetch Metadata"
- [ ] Loading state: `loading={importMutation.isPending}`
- [ ] onClick: Call `handleFetch()` function
- [ ] Disabled if DOI invalid

#### 4. Preview Section
- [ ] Show skeleton loader during fetch
- [ ] Render ReferencePreview component when metadata loaded
- [ ] Display: title, authors, year, venue, DOI, abstract (if present)
- [ ] "Add to Library" button at bottom (Button variant="primary")

#### 5. Error Handling
- [ ] Show error toast for: invalid DOI, not found, rate limit, network error
- [ ] Use `useUIStore.getState().addToast()`
- [ ] Keep modal open on error (user confirmed)
- [ ] Clear error when user edits DOI

#### 6. Create Import Mutation (`src/features/library/api/import.queries.ts`)
- [ ] Create file if doesn't exist
- [ ] Export `useImportFromDoiMutation()`
- [ ] mutationFn: `POST /references/import-doi` with `{ doi }`
- [ ] onSuccess:
  - Invalidate `referenceKeys.lists()`
  - Show success toast: "Reference imported from DOI"
  - Return reference for preview
- [ ] onError:
  - Show error toast with specific message
  - Keep modal open

#### 7. Integrate with Library Page
- [ ] Add "Import" button to library toolbar (next to "New Reference")
- [ ] State: `isImportModalOpen` (boolean)
- [ ] onClick: Set `isImportModalOpen = true`
- [ ] Render `<ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />`

#### 8. Create DOI Validation Utility (`src/common/utils/validation.ts`)
- [ ] Export `DOI_REGEX` constant
- [ ] Export `isValidDoi(doi: string): boolean` function

---

### Tests (Deferred to `/session-test 6`)
- [ ] Backend unit tests: CrossrefService.mapToReferenceInput()
- [ ] Backend unit tests: CrossrefService error handling
- [ ] Backend integration tests: POST /references/import-doi (mock Crossref API)
- [ ] Frontend unit tests: ImportModal component
- [ ] Frontend unit tests: DOI validation
- [ ] E2E test: Full DOI import flow (Playwright)

---

### Documentation
- [ ] Update CHANGELOG.md: "Session 6: DOI Import & Crossref Integration"
- [ ] Mark session 6 complete in `docs/02-delivery/checklist/sessions-06-10.md`
- [ ] Add code comment in CrossrefService explaining type mapping
- [ ] Add code comment documenting deviation from Zotero translator system

---

## Definition of Done

- ✅ User can click "Import" button on Library page
- ✅ ImportModal opens with DOI input field
- ✅ User can enter DOI `10.1145/3411764.3445518`
- ✅ Click "Fetch Metadata" shows loading spinner on button
- ✅ Preview section displays correct metadata:
  - Title: "Everyone wants to do the model work, not the data work": Data Cascades in High-Stakes AI
  - Authors: Sambasivan, Kapania, etc.
  - Year: 2021
  - Venue: Proceedings of the 2021 CHI Conference...
  - DOI: 10.1145/3411764.3445518
  - Abstract: (if Crossref provides it)
- ✅ Click "Add to Library" creates reference in database
- ✅ Reference appears in library table after modal closes
- ✅ Duplicate detection runs asynchronously in background
- ✅ Invalid DOI shows error toast: "Invalid DOI format"
- ✅ Modal stays open after error (user can fix typo)
- ✅ DOI not found (404) shows error toast: "DOI not found"
- ✅ Backend logs all Crossref API calls with Winston
- ✅ sourceRaw.payload contains full Crossref response as backup

---

## Technical Implementation Details

### Crossref API Configuration

```typescript
// Backend: src/services/CrossrefService.ts
const CROSSREF_API = 'https://api.crossref.org/works';

const headers = {
  'User-Agent': 'BibliographyManager/1.0 (mailto:your@email.com)',
  'Accept': 'application/json'
};

const response = await fetch(`${CROSSREF_API}/${encodeURIComponent(doi)}`, {
  headers,
  signal: AbortSignal.timeout(10000)  // 10s timeout
});
```

### Type Mapping Constants

```typescript
// Backend: src/services/CrossrefService.ts
const TYPE_MAP: Record<string, ReferenceType> = {
  'journal-article': 'article',
  'proceedings-article': 'conference',
  'book': 'book',
  'book-chapter': 'chapter',
  'dissertation': 'thesis',
  'report': 'report',
  'dataset': 'other',
  'posted-content': 'other'
  // default fallback: 'other'
};
```

### DOI Validation

```typescript
// Frontend: src/common/utils/validation.ts
// Crossref-recommended regex (matches 99.3% of Crossref DOIs)
export const DOI_REGEX = /^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;

export function isValidDoi(doi: string): boolean {
  return DOI_REGEX.test(doi.trim());
}
```

### Abstract Mapping

```typescript
// Backend: src/services/CrossrefService.ts
// Save abstract when Crossref provides it (matches Zotero behavior)
abstract: crossrefData.abstract || null
```

### Error Handling

```typescript
// Backend: src/services/CrossrefService.ts
if (!response.ok) {
  if (response.status === 404) {
    throw new Error('DOI not found');
  }
  if (response.status === 429) {
    throw new Error('Rate limit exceeded, please try again later');
  }
  throw new Error(`Crossref API error: ${response.statusText}`);
}
```

### Frontend Error Display

```typescript
// Frontend: src/features/library/components/ImportModal.tsx
try {
  const metadata = await importMutation.mutateAsync({ doi });
  setPreview(metadata);
} catch (error) {
  const message = error.message || 'Failed to fetch DOI metadata';
  useUIStore.getState().addToast({
    message,
    type: 'error'
  });
  // Modal stays open for retry
}
```

---

## Sample Crossref Response

For verification testing, use DOI: `10.1145/3411764.3445518`

Expected response structure:
```json
{
  "status": "ok",
  "message-type": "work",
  "message": {
    "DOI": "10.1145/3411764.3445518",
    "type": "proceedings-article",
    "title": ["\"Everyone wants to do the model work, not the data work\": Data Cascades in High-Stakes AI"],
    "author": [
      {
        "given": "Nithya",
        "family": "Sambasivan",
        "sequence": "first",
        "affiliation": []
      },
      {
        "given": "Shivani",
        "family": "Kapania",
        "sequence": "additional",
        "affiliation": []
      }
    ],
    "published": {
      "date-parts": [[2021, 5, 6]]
    },
    "container-title": ["Proceedings of the 2021 CHI Conference on Human Factors in Computing Systems"],
    "publisher": "ACM",
    "page": "1-15",
    "URL": "http://dx.doi.org/10.1145/3411764.3445518",
    "abstract": "..." // May or may not be present
  }
}
```

---

## References

### Zotero Files
- `zotero/chrome/content/zotero/lookup.js` - DOI lookup UI patterns, identifier extraction
- WebSearch findings: Zotero saves abstracts when Crossref provides them

### Editor Pattern Files
- `editor_frontend/src/components/ui/Modal.tsx` - Modal component with backdrop
- `editor_frontend/src/components/ui/Button.tsx` - Button with loading state and CVA variants
- `editor_frontend/src/components/ui/Input.tsx` - Input with error/success variants
- `editor_frontend/src/features/latex-editor/components/SidebarTabs.tsx` - Tab pattern (reference)

### Existing Bibliography Files
- `bibliography_backend/src/services/ReferenceService.ts` - Injectable service pattern
- `bibliography_backend/src/controllers/ReferenceController.ts` - Controller pattern with DI
- `bibliography_frontend/src/features/library/api/references.queries.ts` - React Query mutation pattern
- `shared/src/schemas.ts` - Zod schemas for validation

### External Documentation
- WebSearch: Crossref API best practices (polite pool with mailto)
- WebSearch: DOI regex validation (Crossref official recommendation)
- WebSearch: Crossref abstract availability (publisher-dependent, improving)
- WebSearch: Crossref rate limits (50 req/sec, changes coming Dec 2025)

### Testing Documentation
- `docs/03-quality/TESTING.md` - 60/30/10 testing log + gaps
- `docs/02-delivery/checklist/sessions-06-10.md` - Session 6 verification criteria

---

## Next Steps

After plan approval:

1. **Execute**: Run `/session-execute 6` to implement backend + frontend
2. **Test**: Run `/session-test 6` to write comprehensive tests (60/30/10 split)
3. **Finish**: Run `/session-finish 6` to commit and update documentation

**Verification DOI**: `10.1145/3411764.3445518` (use this for testing)
