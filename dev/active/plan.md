 Sessions 4-5 Implementation Plan: Collections & Tags

     Overview

     Implement Collections (nested tree with colors) and Tags (with max 9 colored tags) together. Estimated time: 8-10 hours 
     total.

     ---
     Session 4: Collections with Tree View & Colors (4-5 hours)

     Backend (2-2.5 hours)

     1. Collection Model (bibliography_backend/src/models/Collection.ts)
     - Fields: userId, name, parentId, position, color, deleted, deletedAt, timestamps
     - Indexes: { userId, parentId, position }, { userId, deleted }
     - Validation: Max depth 5 levels, prevent circular references

     2. CollectionService (bibliography_backend/src/services/CollectionService.ts)
     - create() - Auto-assign position, validate depth ≤5
     - list() - Return flat array (frontend builds tree)
     - update() - Rename, change color
     - move() - Move to different parent, validate depth after move
     - softDelete() - Cascade delete to all descendants recursively
     - restore() - Restore collection and descendants
     - Helper: calculateDepth() to enforce 5-level limit

     3. CollectionController + Routes
     - Standard CRUD endpoints
     - Validation schemas with Joi

     Frontend (2-2.5 hours)

     4. TreeNode Component (bibliography_frontend/src/features/library/components/TreeNode.tsx)
     - Recursive rendering with 16px indentation per level
     - Chevron icon (expand/collapse)
     - Color dot indicator (if collection has color)
     - Active state highlighting
     - Item count badge

     5. TreeView Component (bibliography_frontend/src/features/library/components/TreeView.tsx)
     - Tree building algorithm (filter by parentId, sort by position, recurse)
     - Expand/collapse state management
     - Persist expanded IDs to localStorage
     - Default: All collapsed

     6. Collection Color Picker Modal (bibliography_frontend/src/features/library/components/CollectionColorPickerModal.tsx)
     - 9-color palette matching tag colors
     - Apply color to collection
     - Remove color button

     7. Collection Queries + Store Integration
     - React Query hooks: useCollectionsQuery, useCreateCollectionMutation, useUpdateCollectionMutation, etc.
     - Update library.store.ts: Add activeCollectionId, expandedCollectionIds, setActiveCollection, toggleCollectionExpanded
     - Wire TreeView to ReferenceTable filtering

     ---
     Session 5: Tags with Color Assignment (4-5 hours)

     Backend (2-2.5 hours)

     1. Tag Model (bibliography_backend/src/models/Tag.ts)
     - Fields: userId, name (unique per user), color, position (1-9), automatic, timestamps
     - Unique index: { userId, name }
     - NO usageCount field (calculated on-the-fly)

     2. TagService (bibliography_backend/src/services/TagService.ts)
     - create() - Create tag
     - list() - Return tags with calculated usage counts (MongoDB aggregation on Reference collection)
     - setColor() - Assign/remove color, enforce max 9 colored tags with atomic check
     - rename() - Rename tag, cascade update to all references using Reference.updateMany({ tags: oldName }, { $set: { 'tags.$':
      newName } })
     - delete() - Delete tag, remove from all references using Reference.updateMany({ tags: name }, { $pull: { tags: name } })

     3. TagController + Routes
     - CRUD endpoints
     - Special: PATCH /tags/:name/color, PATCH /tags/:oldName/rename

     Frontend (2-2.5 hours)

     4. TagItem Component (bibliography_frontend/src/features/library/components/TagItem.tsx)
     - Color dot indicator (if tag has color)
     - Tag name + usage count
     - Active state styling
     - Context menu trigger (right-click)

     5. TagSelector Component (bibliography_frontend/src/features/library/components/TagSelector.tsx)
     - Header with settings menu + collapse button
     - Search box (client-side filter)
     - Render tags sorted by usage count descending
     - Multi-select support (AND logic)

     6. TagColorPickerModal (bibliography_frontend/src/features/library/components/TagColorPickerModal.tsx)
     - 9-color palette with position labels (1-9)
     - Disable buttons for positions already taken by other tags
     - Show which tags occupy which positions
     - Remove color button

     7. Tag Context Menu (Headless UI Menu)
     - Assign Color → Opens TagColorPickerModal
     - Rename Tag → Opens rename dialog
     - Delete Tag → Confirmation + delete mutation

     8. Tag Queries + Store Integration
     - React Query hooks: useTagsQuery, useSetTagColorMutation, useRenameTagMutation, useDeleteTagMutation
     - Update library.store.ts: Add activeTagNames (string[]), toggleTagFilter, clearTagFilters
     - Wire TagSelector to ReferenceTable filtering

     ---
     Implementation Order

     Phase 1: Session 4 Backend (2 hours)

     1. Create Collection model with depth validation
     2. Implement CollectionService (CRUD + cascade delete)
     3. Create controller and routes
     4. Test with Postman: Create nested collections (5 levels), soft delete parent (children deleted), restore

     Phase 2: Session 4 Frontend (2.5 hours)

     5. Build TreeNode component (single node)
     6. Build TreeView component (tree builder + state management)
     7. Create CollectionColorPickerModal
     8. Wire up React Query hooks
     9. Integrate with library store and ReferenceTable
     10. Test: Expand/collapse, persistence, color assignment, filtering

     Phase 3: Session 5 Backend (2 hours)

     11. Create Tag model with unique constraint
     12. Implement TagService (including aggregation for usage counts, max 9 enforcement, rename/delete cascade)
     13. Create controller and routes
     14. Test with curl: Create tags, assign 9 colors, attempt 10th (should fail), rename tag (check references updated)

     Phase 4: Session 5 Frontend (2.5 hours)

     15. Build TagItem component
     16. Build TagSelector component with search
     17. Create TagColorPickerModal for tags
     18. Build context menu
     19. Wire up React Query hooks
     20. Integrate with library store and ReferenceTable
     21. Test: Color assignment (max 9), rename, delete, multi-select filtering

     ---
     Key Technical Decisions

     ✅ Collection colors: Implemented in Session 4 (UI + backend)
     ✅ Tag usage counts: Calculated on-the-fly via MongoDB aggregation
     ✅ Max tree depth: 5 levels (validated in backend)
     ✅ Default tree state: Collapsed (user expands on demand)

     ---
     Testing Checklist

     Collections:
     - Create 5-level nested collections
     - Attempt 6-level nest → Validation error
     - Soft delete parent → All descendants deleted
     - Restore parent → All descendants restored
     - Move collection → Depth recalculated, max 5 enforced
     - Assign color → TreeNode shows color dot
     - Expand/collapse → State persists across page refresh
     - Click collection → References filtered

     Tags:
     - Create tags
     - List tags → Sorted by usage count (aggregation works)
     - Assign 9 colors → All positions 1-9 occupied
     - Attempt 10th color → Error "MAX_COLORED_TAGS"
     - Rename tag → All references updated
     - Delete tag → Removed from all references
     - Search tags → Client-side filter works
     - Multi-select tags → AND logic filters references correctly

     ---
     Estimated Timeline

     - Session 4: 4-5 hours (2-2.5h backend + 2-2.5h frontend)
     - Session 5: 4-5 hours (2-2.5h backend + 2-2.5h frontend)
     - Total: 8-10 hours

     Sessions are independent and can be done sequentially or with interleaved work (backend for both → frontend for both).