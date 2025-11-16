# Session 7 Plan: Reference Creation/Edit Modal

**Created**: 2025-01-15
**Status**: Approved
**Estimated Time**: 3-4 hours

---

## Research Findings

### Zotero Frontend (UI Patterns)

#### Author/Creator Entry Pattern
- **File**: `zotero/chrome/content/zotero/xpcom/data/creators.js` (lines 176-242)
- **File**: `zotero/chrome/content/zotero/elements/itemBox.js` (lines 1162-1195)
- **Finding**: Zotero uses dual-mode creator system with `fieldMode` property:
  - `fieldMode = 0`: Structured mode with `firstName` + `lastName` fields
  - `fieldMode = 1`: Unstructured mode with single `name` field (for organizations like "WHO" or "NIH")
  - Toggle button switches between modes
  - When fieldMode=1, firstName must be null/empty (enforced validation)
- **Decision**: Implement dual-mode author entry with toggle button. Default to structured mode (given/family), allow switch to single field for institutional authors.

#### Venue/Publication Field Pattern
- **File**: `zotero/resource/schema/system-107.sql` (publicationTitle field)
- **File**: `zotero/chrome/content/zotero/elements/itemBox.js` (line 616)
- **Finding**: Zotero uses unified `publicationTitle` field that changes label based on item type:
  - Journal article → "Journal"
  - Conference paper → "Conference"
  - Book section → "Book Title"
  - Simple text input, no autocomplete in MVP
- **Decision**: Use simple text input labeled "Venue/Publication". Defer autocomplete to Session 11+ (search features).

#### Collection/Tag Assignment During Creation
- **File**: `zotero/chrome/content/zotero/zoteroPane.js` (lines 1431-1488)
- **File**: `zotero/chrome/content/zotero/elements/tagsBox.js` (lines 28-162)
- **Finding**: Zotero does NOT support collection/tag assignment during item creation:
  - New items auto-added to currently selected collection (context-based)
  - Tags added via dedicated tags panel after creation
  - No inline modal for assignment during creation
- **Decision**: Defer collection/tag assignment to post-creation workflows. Follow Zotero's pattern of focused creation flow.

#### New Item Workflow
- **File**: `zotero/chrome/content/zotero/zoteroPane.js` (lines 1431-1488, 1478-1486)
- **Finding**: Zotero uses in-place editing model (NOT modal):
  1. Create item and save to database immediately
  2. Item appears in tree
  3. Right panel opens to Info tab
  4. Title field auto-focused
  5. User edits inline
- **Decision**: Use modal dialog for web UX (better than in-place editing for web apps). Modal closes on save, item appears in ReferenceTable.

---

### Zotero Backend (Logic)

#### Creator Data Model
- **File**: `zotero/chrome/content/zotero/xpcom/data/creators.js` (lines 28-242)
- **Finding**: Creator object structure:
  ```javascript
  this.fields = ['firstName', 'lastName', 'fieldMode'];
  // fieldMode determines structured (0) vs unstructured (1)
  // cleanData() normalizes creator data before save
  ```
- **Decision**: Our backend already supports this via `AuthorInputSchema` (given/family OR full). Form will send appropriate structure based on mode.

---

### Zotero Database

- **File**: `zotero/resource/schema/userdata.sql`
- **Finding**: Collections and tags stored in separate tables with junction tables:
  - `collections` table with self-referencing `parentCollectionID`
  - `collectionItems` junction table (many-to-many)
  - `tags` table with `itemTags` junction
- **Decision**: Our MongoDB schema uses embedded arrays (`collectionIds`, `tags`) which is simpler for MVP. Collections/tags assigned after creation via separate UI.

---

### Editor Patterns

#### Modal Component
- **File**: `editor_frontend/src/components/ui/Modal.tsx`
- **Finding**: Basic modal with backdrop, close button, children props
- **Decision**: Extend with keyboard shortcuts (Cmd+Enter, Escape) and form-specific layout.

#### Form Patterns
- **File**: `editor_frontend/src/features/*/components/*` (various forms)
- **Finding**: Standard pattern:
  - react-hook-form + Zod validation
  - Field-level error display
  - Loading states during submission
  - Toast notifications on success/error
- **Decision**: Follow this pattern for ReferenceModal form.

#### Zustand Store Integration
- **File**: `editor_frontend/src/store/ui.store.ts` (lines 52-80)
- **Finding**: Toast management via `addToast`, modal management via `openModal/closeModal`
- **Decision**: Use UI store for modal state and success/error toasts.

---

### Bibliography Backend Architecture

#### Current Reference Model
- **File**: `bibliography_backend/src/models/Reference.ts`
- **Finding**: Reference schema supports all required fields:
  - `type`: enum of 6 types (default: 'article')
  - `title`: string (required)
  - `authors`: Array<{given?, family?, full}>
  - `year`: number (1000-2100 range, optional)
  - `venue`: string (optional)
  - `doi`, `isbn`, `url`, `abstract`: optional strings
  - `citationKey`: auto-generated, unique per user
  - `tags`: string[]
  - `collectionIds`: ObjectId[]
  - `hasPdf`: boolean
- **Decision**: Form maps directly to this schema. No backend changes needed.

#### ReferenceService Methods
- **File**: `bibliography_backend/src/services/ReferenceService.ts` (lines 15-78)
- **Finding**: `create()` method handles:
  - Author normalization (auto-generates `full` from `given`/`family`)
  - Citation key auto-generation (unique per user)
  - Async duplicate detection (non-blocking)
  - CollectionIds validation as ObjectIds
- **Decision**: Backend handles normalization automatically. Form sends raw author data.

---

### Bibliography Frontend State Management

#### Library Store
- **File**: `bibliography_frontend/src/features/library/store/library.store.ts`
- **Finding**: Zustand store with:
  - `selectedReferenceIds`: Set<string>
  - `activeReferenceId`: string | null
  - Selection actions: selectReference, deselectReference, toggleSelection, etc.
- **Decision**: Modal interacts with store to clear selection after creating reference.

#### UI Store
- **File**: `editor_frontend/src/store/ui.store.ts` (copied pattern)
- **Finding**: Toast management, modal management
- **Decision**: Use `openModal('reference-modal')` and `closeModal('reference-modal')` for state.

---

### React Query API Integration

#### Existing Mutations
- **File**: `bibliography_frontend/src/features/library/api/references.queries.ts`
- **Finding**: Mutations already implemented:
  - `useCreateReferenceMutation()`: POST /references, invalidates query lists
  - `useUpdateReferenceMutation()`: PATCH /references/:id, invalidates lists + detail
  - Both include toast notifications
- **Decision**: Wire these mutations directly to form. No new API calls needed.

---

### Shared Zod Schemas

#### Available Schemas
- **File**: `shared/src/schemas.ts` (lines 1-150)
- **Finding**:
  - `AuthorSchema`: {given?, family?, full (required)}
  - `AuthorInputSchema`: {given?, family?, full?} + refine for validation
  - `ReferenceTypeSchema`: enum of 6 types
  - `ReferenceSchema`: Full reference object (API response)
- **Decision**: Create form-specific schema in `src/features/library/types/schemas.ts` that extends these for default values and form-specific rules.

---

### WebSearch Verification

#### Query: "Zotero add item manually author name entry field structure"
- **Finding**: Confirmed dual-mode pattern from documentation:
  - Default: Two fields (Last || First) for individual authors
  - Single field mode: For institutional/organizational authors
  - Shift+Enter shortcut to add new author field
  - Switch button to toggle between modes
- **Decision**: Implement toggle button with clear labeling ("Use single field" / "Use two fields").

---

## Architecture Decisions

### Decision 1: Author Entry Mode (Structured vs Unstructured)
**Options**:
- A: Single full name field only (simpler)
- B: Structured firstName/lastName fields only (more data quality)
- C: Dual-mode with toggle (most flexible)

**Choice**: C (Dual-mode with toggle)

**Rationale**:
- Matches Zotero's proven UX pattern
- Handles both individual authors ("Doe, John") and institutions ("World Health Organization")
- Backend already supports both via `AuthorInputSchema`
- Slightly more complex UI but significantly better UX

**Trade-off**: Additional UI complexity (toggle button, conditional field rendering), but worth it for data quality and user flexibility.

---

### Decision 2: Venue Field Autocomplete
**Options**:
- A: Free-text with autocomplete suggestions from existing venues
- B: Combobox (must select from existing or add new)
- C: Simple text field (no autocomplete)

**Choice**: C (Simple text field for MVP)

**Rationale**:
- Zotero uses simple text input in MVP
- Autocomplete is an advanced feature that can be added in Session 11+ (search features)
- Keeps Session 7 focused on core CRUD functionality
- Users can still type any venue name

**Trade-off**: Less data consistency (users might type "NeurIPS" vs "NeurIPS 2024" vs "Thirty-Eighth Conference on Neural Information Processing Systems"), but acceptable for MVP. Can normalize later.

---

### Decision 3: Keyboard Shortcuts Support
**Options**:
- A: Add keyboard shortcuts (Cmd+Enter to save, Escape to cancel)
- B: Defer keyboard shortcuts to system-wide keyboard navigation session

**Choice**: A (Add keyboard shortcuts)

**Rationale**:
- Power-user feature that's trivial to implement
- Standard UX pattern across applications
- Matches Zotero's keyboard-first approach
- Minimal implementation cost for significant UX improvement

**Trade-off**: None - pure win.

---

### Decision 4: Collection/Tag Assignment in Modal
**Options**:
- A: Include collection/tag pickers in creation modal (full-featured)
- B: Defer to post-creation workflows (focused modal)

**Choice**: B (Defer to post-creation)

**Rationale**:
- Zotero follows this pattern (no assignment during creation)
- Collections auto-assigned based on current context (implement in Session 8+)
- Tags added via dedicated tags panel after creation
- Keeps modal focused and implementation faster
- Users can multi-select references and bulk-assign collections/tags later

**Trade-off**: One extra step for users who want to assign during creation, but more aligned with Zotero's proven workflow and keeps Session 7 scope manageable.

---

### Decision 5: Modal vs In-Place Editing
**Options**:
- A: Modal dialog (web app pattern)
- B: In-place editing like Zotero (desktop app pattern)

**Choice**: A (Modal dialog)

**Rationale**:
- Zotero's in-place editing works well for desktop with always-visible panels
- Web UX benefits from modal focus (no need for persistent right panel)
- Consistent with other web bibliography managers
- Modal can close after save, keeping UI clean

**Trade-off**: Deviation from Zotero's UX, but justified by web vs desktop platform differences.

---

## Deviations from Zotero

### 1. Modal Dialog Instead of In-Place Editing
**Zotero**: Creates item immediately, opens right panel for inline editing, title field auto-focused
**Ours**: Modal dialog with form, saves on submit, modal closes on success
**Rationale**: Web UX pattern vs desktop app pattern. Modal provides better focus and cleaner UI for web applications.
**Future**: No plan to align - this is a justified platform-specific difference.

---

### 2. No Automatic Collection Assignment Based on Context
**Zotero**: If user has collection selected in tree, new item auto-added to that collection
**Ours**: Collections assigned after creation via separate UI (Session 8+)
**Rationale**: Context-based auto-assignment adds complexity to MVP. Can implement in future session when collection tree interactions are more mature.
**Future**: May implement in Session 10+ when collection tree supports drag-drop and context menus.

---

### 3. No "Most Recently Used" Item Type Tracking
**Zotero**: Stores last 5 item types user created, shows in "New Item" menu
**Ours**: Default to 'article' type every time
**Rationale**: MVP simplification. Item type dropdown still available in form.
**Future**: Can implement in Session 15+ (UI polish) if user feedback indicates it's valuable.

---

## Implementation Checklist

### Frontend (3-4 hours)

#### 1. Create Form Schema (0.5 hours)
- [ ] Create `src/features/library/types/schemas.ts`
- [ ] Export `ReferenceFormSchema` extending shared schemas:
  - Use `ReferenceTypeSchema` for type field
  - Use `AuthorInputSchema` for authors array
  - Add form-specific defaults (type: 'article', authors: [], tags: [])
  - Year validation: optional, 1000-2100 range
  - DOI validation: optional, regex pattern
  - URL validation: optional, URL format
- [ ] Export TypeScript type: `ReferenceFormData = z.infer<typeof ReferenceFormSchema>`

#### 2. Create ReferenceModal Component (2 hours)
- [ ] Create `src/features/library/components/ReferenceModal.tsx`
- [ ] Set up react-hook-form with Zod resolver:
  ```tsx
  const form = useForm<ReferenceFormData>({
    resolver: zodResolver(ReferenceFormSchema),
    defaultValues: { type: 'article', authors: [], tags: [] }
  })
  ```
- [ ] Implement modal structure:
  - Header: "Create Reference" or "Edit Reference" based on mode
  - Body: Form fields (see below)
  - Footer: Cancel (ghost) | Save (primary green)
- [ ] Add form fields:
  - Reference type dropdown (6 types)
  - Title input (required, auto-focused)
  - Authors dynamic array (see Author Fields section below)
  - Year input (number, optional)
  - Venue/Publication input (text, optional)
  - DOI input (text with validation, optional)
  - URL input (text with validation, optional)
  - Abstract textarea (optional, defer to Session 9+)
  - PDF upload placeholder (disabled, "Coming in Phase 2" message)
- [ ] Add loading state during mutation (disable form, spinner on Save button)
- [ ] Add validation error display:
  - Inline errors below each field
  - Toast fallback for form-level errors

#### 3. Implement Dynamic Author Fields (1 hour)
- [ ] Create author field mode state: `const [authorModes, setAuthorModes] = useState<Record<number, 'structured' | 'single'>>({})` (default all to 'structured')
- [ ] Render author array with `useFieldArray`:
  ```tsx
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'authors'
  })
  ```
- [ ] For each author, render based on mode:
  - **Structured mode** (default):
    - Two inputs: "First Name" (given) | "Last Name" (family)
    - Toggle button: "Use single field" (switches to single mode)
  - **Single mode**:
    - One input: "Name" (full)
    - Toggle button: "Use two fields" (switches to structured mode)
- [ ] Add author controls:
  - Remove button (X icon) for each author (disabled if only one)
  - "Add Author" button below list (ghost variant)
  - Auto-focus first field of newly added author
- [ ] Keyboard shortcut: Shift+Enter in last author field adds new author

#### 4. Wire Mutations (0.5 hours)
- [ ] Import mutations from `references.queries.ts`:
  - `useCreateReferenceMutation()`
  - `useUpdateReferenceMutation()`
- [ ] Handle form submission:
  ```tsx
  const onSubmit = async (data: ReferenceFormData) => {
    try {
      if (editMode) {
        await updateMutation.mutateAsync({ id: referenceId, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      closeModal('reference-modal');
      form.reset();
    } catch (error) {
      // Error toast handled by mutation
    }
  }
  ```
- [ ] Add optimistic UI: Mutations already invalidate queries, ReferenceTable will update automatically

#### 5. Add Keyboard Shortcuts (0.25 hours)
- [ ] Add keyboard event listener to modal:
  ```tsx
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        form.handleSubmit(onSubmit)();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal('reference-modal');
      }
    };
    // Add/remove listener
  }, []);
  ```
- [ ] Add keyboard hint to Save button: "⌘↩" or "Ctrl+↩"

#### 6. Edit Mode Support (0.5 hours)
- [ ] Accept `referenceId` prop (optional, if provided = edit mode)
- [ ] Fetch reference data if in edit mode:
  ```tsx
  const { data: reference } = useQuery({
    queryKey: referenceKeys.detail(referenceId),
    enabled: !!referenceId
  })
  ```
- [ ] Pre-fill form with reference data when loaded:
  ```tsx
  useEffect(() => {
    if (reference) {
      form.reset({
        type: reference.type,
        title: reference.title,
        authors: reference.authors,
        year: reference.year,
        // ... other fields
      });
    }
  }, [reference]);
  ```
- [ ] Update modal title and button text based on mode

#### 7. UI Polish (0.25 hours)
- [ ] Style validation errors with red text + icon
- [ ] Add field descriptions where helpful (e.g., "DOI format: 10.xxxx/xxxxx")
- [ ] Ensure proper focus management (title field auto-focused on open)
- [ ] Add smooth transitions for author field add/remove
- [ ] Test responsive layout (mobile, tablet, desktop)

#### 8. Integration with ReferenceTable (0.25 hours)
- [ ] Add "New Reference" button above ReferenceTable (primary variant)
- [ ] Wire button to open modal: `openModal('reference-modal')`
- [ ] Add edit action to ReferenceTable row menu:
  - Right-click context menu or action dropdown
  - Opens modal with `referenceId` prop

---

### Backend
**No changes needed** - mutations already implemented in `references.queries.ts` and backend endpoints exist.

---

### Tests (Deferred to /session-test 7)

#### Unit Tests
- [ ] `ReferenceModal.test.tsx`: Component rendering, mode switching, form validation
- [ ] `schemas.test.ts`: Zod schema validation edge cases

#### Integration Tests
- [ ] Create reference flow: Fill form → submit → verify appears in table
- [ ] Edit reference flow: Open edit modal → modify → save → verify updates
- [ ] Validation: Submit invalid data → verify errors displayed
- [ ] Author fields: Add/remove authors, toggle modes, verify submission

#### E2E Tests
- [ ] Full create workflow from button click to reference appearing in table
- [ ] Keyboard shortcuts: Cmd+Enter saves, Escape cancels

---

### Documentation (0.25 hours)
- [ ] Update `CHANGELOG.md`:
  ```markdown
  ## Session 7 - Reference Creation/Edit Modal
  - Created ReferenceModal component with full form fields
  - Added dual-mode author entry (structured firstName/lastName OR single name)
  - Implemented keyboard shortcuts (Cmd+Enter to save, Escape to cancel)
  - Wired create/update mutations with optimistic updates
  - Added form validation with inline error display
  ```
- [ ] Mark Session 7 complete in `docs/02-delivery/checklist/sessions-06-10.md`
- [ ] Add inline code comments documenting deviations from Zotero

---

## Definition of Done

- ✅ Can create reference with title only (minimal required field)
- ✅ Can create reference with all metadata fields populated (type, title, authors, year, venue, DOI, URL)
- ✅ Validation errors display correctly:
  - Required field errors (title missing)
  - Invalid DOI format
  - Invalid URL format
  - Invalid year range (must be 1000-2100)
- ✅ Edit mode pre-fills existing reference data
- ✅ Edit mode saves updates and reflects changes in ReferenceTable
- ✅ Author fields support dual-mode:
  - Structured mode: firstName + lastName inputs with toggle to single
  - Single mode: Full name input with toggle to structured
  - Add/remove author buttons work correctly
  - Newly added author field auto-focuses
- ✅ Keyboard shortcuts work:
  - Cmd+Enter (or Ctrl+Enter) saves form
  - Escape closes modal
- ✅ Newly created references immediately appear in ReferenceTable
- ✅ Loading states display during mutation (spinner on Save button, disabled form)
- ✅ Success toasts appear after create/update
- ✅ Modal closes automatically on successful save
- ✅ Form resets after closing modal
- ✅ PDF upload field shows "Coming in Phase 2" placeholder (disabled)
- ✅ Collections and tags are NOT in modal (deferred to post-creation workflows)

---

## References

**Zotero Implementation:**
- Creator data model: `zotero/chrome/content/zotero/xpcom/data/creators.js:28-242`
- Creator UI (dual-mode): `zotero/chrome/content/zotero/elements/itemBox.js:1162-1195`
- New item workflow: `zotero/chrome/content/zotero/zoteroPane.js:1431-1488`
- Tags panel: `zotero/chrome/content/zotero/elements/tagsBox.js:28-162`
- Database schema: `zotero/resource/schema/userdata.sql`

**Editor Patterns:**
- Modal component: `editor_frontend/src/components/ui/Modal.tsx`
- UI store (toasts/modals): `editor_frontend/src/store/ui.store.ts:52-80`
- Form patterns: Various forms in `editor_frontend/src/features/*/components/`

**Bibliography Backend:**
- Reference model: `bibliography_backend/src/models/Reference.ts`
- Reference service: `bibliography_backend/src/services/ReferenceService.ts:15-78`

**Bibliography Frontend:**
- Existing mutations: `bibliography_frontend/src/features/library/api/references.queries.ts`
- Library store: `bibliography_frontend/src/features/library/store/library.store.ts`
- Shared schemas: `shared/src/schemas.ts:1-150`

**WebSearch:**
- Zotero manual item creation: Verified dual-mode author entry, Shift+Enter shortcut, toggle button pattern
