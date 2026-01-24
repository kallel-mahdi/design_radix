 Figma Parity Implementation Plan                                                                                                                             │
     │                                                                                                                                                              │
     │ Date: 2025-11-25                                                                                                                                             │
     │ Goal: Achieve complete Figma parity with 13 design frames                                                                                                    │
     │ Approach: Hybrid UI-First + Incremental Value Delivery                                                                                                       │
     │ Total Estimated Time: 15-17 hours                                                                                                                            │
     │                                                                                                                                                              │
     │ ---                                                                                                                                                          │
     │ Executive Summary                                                                                                                                            │
     │                                                                                                                                                              │
     │ The codebase is ~80% complete for Figma parity. Backend APIs are production-ready (Duplicates, Tags, References all complete). Frontend has strong           │
     │ infrastructure but placeholder views. This plan focuses on UI completion with strategic deferrals.                                                           │
     │                                                                                                                                                              │
     │ User Decisions:                                                                                                                                              │
     │ - ✅ Complete Figma Parity (all 13 frames addressed)                                                                                                         │
     │ - ✅ Figma placeholders for Phase 2 features (Sharing, Notes, Settings)                                                                                      │
     │ - ⏸️ Defer Filters Panel (complex backend work)                                                                                                              │
     │ - ⏸️ Skip Projects UI (integration blocker)                                                                                                                  │
     │                                                                                                                                                              │
     │ Current State:                                                                                                                                               │
     │ - Activity Bar: 5/7 icons (missing Tags, Sharing)                                                                                                            │
     │ - Duplicates: Backend complete, UI placeholder only                                                                                                          │
     │ - Tags: Backend complete, no dedicated management view                                                                                                       │
     │ - Notes Tab: Shows "Phase 2" message instead of Figma empty state                                                                                            │
     │ - Sharing/Settings: Not implemented                                                                                                                          │
     │                                                                                                                                                              │
     │ ---                                                                                                                                                          │
     │ Implementation Strategy                                                                                                                                      │
     │                                                                                                                                                              │
     │ Phase 1: Quick Wins (3 hours)                                                                                                                                │
     │                                                                                                                                                              │
     │ Goal: Improve navigation and polish existing features                                                                                                        │
     │ Risk: LOW (no backend changes)                                                                                                                               │
     │                                                                                                                                                              │
     │ 1.1 Activity Bar: Add Tags + Sharing Icons (1 hour)                                                                                                          │
     │                                                                                                                                                              │
     │ Files to Modify:                                                                                                                                             │
     │ - bibliography_frontend/src/components/layout/ActivityBar.tsx                                                                                                │
     │ - bibliography_frontend/src/store/ui.store.ts                                                                                                                │
     │                                                                                                                                                              │
     │ Tasks:                                                                                                                                                       │
     │ 1. Import TagIcon and ShareIcon from @heroicons/react/24/outline                                                                                             │
     │ 2. Update ActivityBarProps interface:                                                                                                                        │
     │ activeView: 'library' | 'search' | 'projects' | 'duplicates' | 'tags' | 'sharing' | 'trash'                                                                  │
     │ 3. Update ui.store.ts activeView type to match                                                                                                               │
     │ 4. Add items to ActivityBar array:                                                                                                                           │
     │ { id: 'tags' as const, icon: TagIcon, label: 'Tags' },                                                                                                       │
     │ { id: 'sharing' as const, icon: ShareIcon, label: 'Sharing' }                                                                                                │
     │ 5. Verify navigation works (AppLayout already has generic handler)                                                                                           │
     │                                                                                                                                                              │
     │ Success Criteria:                                                                                                                                            │
     │ - Activity Bar shows 7 icons (6 top, 1 bottom)                                                                                                               │
     │ - Clicking Tags/Sharing navigates to respective routes                                                                                                       │
     │ - No TypeScript errors                                                                                                                                       │
     │                                                                                                                                                              │
     │ ---                                                                                                                                                          │
     │ 1.2 Notes Tab: Figma-Compliant Empty State (30 min)                                                                                                          │
     │                                                                                                                                                              │
     │ File to Modify:                                                                                                                                              │
     │ - bibliography_frontend/src/components/layout/DetailsPane.tsx (lines 304-309)                                                                                │
     │                                                                                                                                                              │
     │ Tasks:                                                                                                                                                       │
     │ 1. Replace Phase 2 message with Figma Frame 31 design:                                                                                                       │
     │   - Neon green document icon                                                                                                                                 │
     │   - "NOTES" header (text-app-accent)                                                                                                                         │
     │   - "No notes have been added" subtitle (text-app-text-muted)                                                                                                │
     │ 2. Optional: Add disabled "Add Note" button with Phase 2 tooltip                                                                                             │
     │                                                                                                                                                              │
     │ Success Criteria:                                                                                                                                            │
     │ - Empty state matches Figma Frame 31                                                                                                                         │
     │ - Professional appearance                                                                                                                                    │
     │ - Existing Info/PDF tabs unaffected                                                                                                                          │
     │                                                                                                                                                              │
     │ ---                                                                                                                                                          │
     │ 1.3 Tags Management View (1.5 hours)                                                                                                                         │
     │                                                                                                                                                              │
     │ Files to Create:                                                                                                                                             │
     │ - bibliography_frontend/src/routes/tags.tsx                                                                                                                  │
     │                                                                                                                                                              │
     │ Tasks:                                                                                                                                                       │
     │ 1. Create new route file (copy structure from library.tsx)                                                                                                   │
     │ 2. Reuse existing TagSelector component logic                                                                                                                │
     │ 3. Layout: Full-width tag grid showing:                                                                                                                      │
     │   - All tags with colors (9 max)                                                                                                                             │
     │   - Usage counts                                                                                                                                             │
     │   - Context menu actions (rename, color, delete)                                                                                                             │
     │ 4. Call setActiveView('tags') in useEffect                                                                                                                   │
     │ 5. Add header: "Tags" with count badge                                                                                                                       │
     │                                                                                                                                                              │
     │ Success Criteria:                                                                                                                                            │
     │ - Tags view accessible from Activity Bar                                                                                                                     │
     │ - Shows all tags with colors and counts                                                                                                                      │
     │ - Matches existing TagSelector functionality                                                                                                                 │
     │ - No duplicate code (reuse components)                                                                                                                       │
     │                                                                                                                                                              │
     │ ---                                                                                                                                                          │
     │ Phase 2: Duplicates Resolution UI (8-10 hours)                                                                                                               │
     │                                                                                                                                                              │
     │ Goal: Complete critical duplicate resolution workflow                                                                                                        │
     │ Risk: MEDIUM (complex UI, backend proven)                                                                                                                    │
     │                                                                                                                                                              │
     │ 2.1 DuplicateComparisonCard Component (4-5 hours)                                                                                                            │
     │                                                                                                                                                              │
     │ Files to Create:                                                                                                                                             │
     │ - bibliography_frontend/src/features/library/components/DuplicateComparisonCard.tsx                                                                          │
     │ - bibliography_frontend/src/features/library/components/FieldComparison.tsx (helper)                                                                         │
     │                                                                                                                                                              │
     │ Component Structure (Figma Frame 36):                                                                                                                        │
     │ ┌────────────────────────────────────────────────────┐                                                                                                       │
     │ │ ⚠️ WARNING - Potential Duplicate Detected          │                                                                                                       │
     │ │ Matched on: DOI (90% confidence)                   │                                                                                                       │
     │ ├─────────────────────┬──────────────────────────────┤                                                                                                       │
     │ │ Existing Reference  │ New Import (Duplicate)       │                                                                                                       │
     │ ├─────────────────────┼──────────────────────────────┤                                                                                                       │
     │ │ Title: ...          │ Title: ...                   │  ← blue if different                                                                                  │
     │ │ Authors: ...        │ Authors: ...                 │                                                                                                       │
     │ │ Year: 2023          │ Year: 2023                   │                                                                                                       │
     │ │ DOI: 10.1234/ex     │ DOI: 10.1234/ex              │  ← match highlight                                                                                    │
     │ │ PDF: ✓              │ PDF: ✗                       │                                                                                                       │
     │ ├─────────────────────┴──────────────────────────────┤                                                                                                       │
     │ │ [Keep Existing]  [Merge Fields ▾]  [Keep Both]    │                                                                                                        │
     │ └────────────────────────────────────────────────────┘                                                                                                       │
     │                                                                                                                                                              │
     │ Implementation Details:                                                                                                                                      │
     │ 1. Two-column layout using Tailwind grid                                                                                                                     │
     │ 2. FieldComparison helper - compares fields, highlights differences in blue                                                                                  │
     │ 3. Match reason badge - ISBN/DOI/title-creator with confidence %                                                                                             │
     │ 4. Radio selection - User can pick master reference (for merge)                                                                                              │
     │ 5. Action buttons:                                                                                                                                           │
     │   - "Keep Existing" (green) - Deletes duplicate via resolve API                                                                                              │
     │   - "Merge Fields" (dropdown, DISABLED) - Show "Phase 2" tooltip                                                                                             │
     │   - "Keep Both" (ghost) - Marks as resolved without deletion                                                                                                 │
     │                                                                                                                                                              │
     │ Props:                                                                                                                                                       │
     │ interface DuplicateComparisonCardProps {                                                                                                                     │
     │   duplicate: DuplicateCandidate; // from API (populated refs)                                                                                                │
     │   onResolve: (action: 'keep-existing' | 'keep-new') => void;                                                                                                 │
     │   onKeepBoth: () => void;                                                                                                                                    │
     │ }                                                                                                                                                            │
     │                                                                                                                                                              │
     │ Success Criteria:                                                                                                                                            │
     │ - Side-by-side comparison clear and readable                                                                                                                 │
     │ - Differences immediately obvious (blue highlighting)                                                                                                        │
     │ - Confidence score displayed prominently                                                                                                                     │
     │ - Action buttons have loading/disabled states                                                                                                                │
     │                                                                                                                                                              │
     │ ---                                                                                                                                                          │
     │ 2.2 Duplicates API Integration (2 hours)                                                                                                                     │
     │                                                                                                                                                              │
     │ Files to Create:                                                                                                                                             │
     │ - bibliography_frontend/src/features/library/api/duplicates.queries.ts                                                                                       │
     │ - bibliography_frontend/src/features/library/api/duplicates.mutations.ts                                                                                     │
     │                                                                                                                                                              │
     │ React Query Hooks:                                                                                                                                           │
     │ 1. useDuplicatesQuery()                                                                                                                                      │
     │   - Fetch: GET /api/bibliography/duplicates                                                                                                                  │
     │   - Returns: Array of DuplicateCandidate with populated references                                                                                           │
     │   - Cache key: ['duplicates']                                                                                                                                │
     │ 2. useResolveDuplicateMutation()                                                                                                                             │
     │   - POST: /api/bibliography/duplicates/:id/resolve                                                                                                           │
     │   - Body: { action: 'keep-existing' | 'keep-new' }                                                                                                           │
     │   - Invalidates: ['duplicates'] query                                                                                                                        │
     │   - Shows success toast                                                                                                                                      │
     │                                                                                                                                                              │
     │ Success Criteria:                                                                                                                                            │
     │ - Queries fetch real backend data                                                                                                                            │
     │ - Mutations update UI optimistically                                                                                                                         │
     │ - Error handling shows user-friendly messages                                                                                                                │
     │                                                                                                                                                              │
     │ ---                                                                                                                                                          │
     │ 2.3 Duplicates Page Layout (2 hours)                                                                                                                         │
     │                                                                                                                                                              │
     │ File to Modify:                                                                                                                                              │
     │ - bibliography_frontend/src/routes/duplicates.tsx                                                                                                            │
     │                                                                                                                                                              │
     │ Tasks:                                                                                                                                                       │
     │ 1. Replace placeholder with functional UI                                                                                                                    │
     │ 2. Call useDuplicatesQuery() to fetch data                                                                                                                   │
     │ 3. Map over duplicates array, render DuplicateComparisonCard for each                                                                                        │
     │ 4. Add header: "Potential Duplicates" with count badge                                                                                                       │
     │ 5. Empty state: "No duplicates found" with checkmark icon                                                                                                    │
     │ 6. Loading state: Skeleton cards                                                                                                                             │
     │                                                                                                                                                              │
     │ Layout:                                                                                                                                                      │
     │ ┌─────────────────────────────────────────────┐                                                                                                              │
     │ │ Potential Duplicates (3)                    │                                                                                                              │
     │ │ Review and resolve references that may be   │                                                                                                              │
     │ │ duplicates in your library                  │                                                                                                              │
     │ ├─────────────────────────────────────────────┤                                                                                                              │
     │ │ [DuplicateComparisonCard #1]                │                                                                                                              │
     │ │ [DuplicateComparisonCard #2]                │                                                                                                              │
     │ │ [DuplicateComparisonCard #3]                │                                                                                                              │
     │ └─────────────────────────────────────────────┘                                                                                                              │
     │                                                                                                                                                              │
     │ Success Criteria:                                                                                                                                            │
     │ - Page shows all unresolved duplicates                                                                                                                       │
     │ - Resolving a duplicate removes it from list                                                                                                                 │
     │ - Badge count in Activity Bar updates                                                                                                                        │
     │ - Empty state shows when no duplicates                                                                                                                       │
     │                                                                                                                                                              │
     │ ---                                                                                                                                                          │
     │ 2.4 Testing (2 hours)                                                                                                                                        │
     │                                                                                                                                                              │
     │ Files to Create:                                                                                                                                             │
     │ - bibliography_frontend/src/features/library/components/__tests__/DuplicateComparisonCard.test.tsx                                                           │
     │ - bibliography_frontend/e2e/duplicates-resolution.spec.ts                                                                                                    │
     │                                                                                                                                                              │
     │ Test Coverage:                                                                                                                                               │
     │ 1. Unit tests (Vitest + React Testing Library):                                                                                                              │
     │   - DuplicateComparisonCard renders correctly                                                                                                                │
     │   - Field differences highlighted                                                                                                                            │
     │   - Action buttons call correct handlers                                                                                                                     │
     │   - Match reason badge displays confidence                                                                                                                   │
     │ 2. E2E tests (Playwright):                                                                                                                                   │
     │   - Navigate to Duplicates view                                                                                                                              │
     │   - See duplicate comparison cards                                                                                                                           │
     │   - Click "Keep Existing" → duplicate removed                                                                                                                │
     │   - Click "Keep Both" → duplicate marked resolved                                                                                                            │
     │   - Badge count updates in Activity Bar                                                                                                                      │
     │                                                                                                                                                              │
     │ Success Criteria:                                                                                                                                            │
     │ - All tests pass                                                                                                                                             │
     │ - Coverage >80% for duplicate components                                                                                                                     │
     │ - No console errors or warnings                                                                                                                              │
     │                                                                                                                                                              │
     │ ---                                                                                                                                                          │
     │ Phase 3: Figma Placeholders (2 hours)                                                                                                                        │
     │                                                                                                                                                              │
     │ Goal: Professional empty states for Phase 2 features                                                                                                         │
     │ Risk: NONE                                                                                                                                                   │
     │                                                                                                                                                              │
     │ 3.1 Sharing View Placeholder (1 hour)                                                                                                                        │
     │                                                                                                                                                              │
     │ Files to Create:                                                                                                                                             │
     │ - bibliography_frontend/src/routes/sharing.tsx                                                                                                               │
     │                                                                                                                                                              │
     │ Tasks:                                                                                                                                                       │
     │ 1. Create route matching Figma Frame 34 (empty state)                                                                                                        │
     │ 2. Layout:                                                                                                                                                   │
     │   - Sidebar: "Owned" and "Shared with me" sections (empty lists)                                                                                             │
     │   - Main pane: Centered empty state                                                                                                                          │
     │       - Collaboration icon (UserGroupIcon)                                                                                                                   │
     │     - "START COLLABORATING" heading                                                                                                                          │
     │     - "Invite others to work together" subtitle                                                                                                              │
     │     - Disabled email input + invite button                                                                                                                   │
     │     - "Coming in Phase 2" badge                                                                                                                              │
     │ 3. Call setActiveView('sharing') in useEffect                                                                                                                │
     │                                                                                                                                                              │
     │ Success Criteria:                                                                                                                                            │
     │ - Professional appearance matching Figma                                                                                                                     │
     │ - Clear "Phase 2" messaging                                                                                                                                  │
     │ - No functional buttons (all disabled)                                                                                                                       │
     │                                                                                                                                                              │
     │ ---                                                                                                                                                          │
     │ 3.2 Settings Menu Placeholder (1 hour)                                                                                                                       │
     │                                                                                                                                                              │
     │ Files to Create:                                                                                                                                             │
     │ - bibliography_frontend/src/components/layout/SettingsMenu.tsx                                                                                               │
     │ - bibliography_frontend/src/components/modals/SettingsModal.tsx                                                                                              │
     │                                                                                                                                                              │
     │ Tasks:                                                                                                                                                       │
     │ 1. Add Settings icon (CogIcon) to Activity Bar bottom (near Trash)                                                                                           │
     │ 2. Create dropdown menu (Figma Frame 38):                                                                                                                    │
     │   - General                                                                                                                                                  │
     │   - Project Defaults                                                                                                                                         │
     │   - Shortcuts                                                                                                                                                │
     │   - Storage/Sync                                                                                                                                             │
     │ 3. Each option opens modal showing "Coming in Phase 2"                                                                                                       │
     │                                                                                                                                                              │
     │ Success Criteria:                                                                                                                                            │
     │ - Settings icon visible in Activity Bar                                                                                                                      │
     │ - Menu shows all 4 options                                                                                                                                   │
     │ - Clicking shows Phase 2 modal                                                                                                                               │
     │ - Matches Figma design                                                                                                                                       │
     │                                                                                                                                                              │
     │ ---                                                                                                                                                          │
     │ Phase 4: Polish & Testing (2 hours)                                                                                                                          │
     │                                                                                                                                                              │
     │ Goal: Final QA, fix bugs, ensure quality                                                                                                                     │
     │ Risk: LOW                                                                                                                                                    │
     │                                                                                                                                                              │
     │ 4.1 Visual Polish (1 hour)                                                                                                                                   │
     │                                                                                                                                                              │
     │ Tasks:                                                                                                                                                       │
     │ 1. Verify all Figma frames addressed:                                                                                                                        │
     │   - Frame 33: Library ✓ (existing)                                                                                                                           │
     │   - Frame 29: Details Info ✓ (existing)                                                                                                                      │
     │   - Frame 30: Details PDF ✓ (existing)                                                                                                                       │
     │   - Frame 31: Notes empty state ✓ (Phase 1)                                                                                                                  │
     │   - Frame 32: Notes with content (defer Phase 2)                                                                                                             │
     │   - Frame 19: Filters Panel (defer)                                                                                                                          │
     │   - Frame 35: Projects (skip per user)                                                                                                                       │
     │   - Frame 36: Duplicates ✓ (Phase 2)                                                                                                                         │
     │   - Frame 34: Sharing empty ✓ (Phase 3)                                                                                                                      │
     │   - Frame 37: Sharing with users (defer Phase 2)                                                                                                             │
     │   - Frame 38-40: Settings ✓ (Phase 3 placeholder)                                                                                                            │
     │ 2. Spot-check styling consistency:                                                                                                                           │
     │   - All components use design system colors                                                                                                                  │
     │   - Spacing consistent (Tailwind classes)                                                                                                                    │
     │   - Icons from @heroicons                                                                                                                                    │
     │   - Buttons use CVA variants                                                                                                                                 │
     │                                                                                                                                                              │
     │ ---                                                                                                                                                          │
     │ 4.2 Integration Testing (1 hour)                                                                                                                             │
     │                                                                                                                                                              │
     │ Tasks:                                                                                                                                                       │
     │ 1. Manual testing flow:                                                                                                                                      │
     │   - Navigate through all 7 Activity Bar views                                                                                                                │
     │   - Import PDF → triggers duplicate detection                                                                                                                │
     │   - Resolve duplicate → verify it disappears                                                                                                                 │
     │   - Check all empty states render correctly                                                                                                                  │
     │ 2. Run test suites:                                                                                                                                          │
     │ pnpm --filter bibliography-frontend test:unit                                                                                                                │
     │ pnpm --filter bibliography-frontend test:e2e                                                                                                                 │
     │ pnpm --filter bibliography-backend test:integration                                                                                                          │
     │ 3. Fix any failing tests or TypeScript errors                                                                                                                │
     │                                                                                                                                                              │
     │ Success Criteria:                                                                                                                                            │
     │ - All tests pass                                                                                                                                             │
     │ - No console errors                                                                                                                                          │
     │ - No broken links or 404s                                                                                                                                    │
     │ - Performance acceptable (<500ms page loads)                                                                                                                 │
     │                                                                                                                                                              │
     │ ---                                                                                                                                                          │
     │ Time Estimates Summary                                                                                                                                       │
     │                                                                                                                                                              │
     │ | Phase   | Description                            | Estimated Time |                                                                                        │
     │ |---------|----------------------------------------|----------------|                                                                                        │
     │ | Phase 1 | Quick Wins (Activity Bar, Notes, Tags) | 3 hours        |                                                                                        │
     │ | Phase 2 | Duplicates Resolution UI               | 8-10 hours     |                                                                                        │
     │ | Phase 3 | Figma Placeholders (Sharing, Settings) | 2 hours        |                                                                                        │
     │ | Phase 4 | Polish & Testing                       | 2 hours        |                                                                                        │
     │ | TOTAL   |                                        | 15-17 hours    |                                                                                        │
     │                                                                                                                                                              │
     │ Optimistic: 13 hours                                                                                                                                         │
     │ Realistic: 15-17 hours                                                                                                                                       │
     │ Pessimistic: 20 hours                                                                                                                                        │
     │                                                                                                                                                              │
     │ ---                                                                                                                                                          │
     │ Deferred Items (User Approved)                                                                                                                               │
     │                                                                                                                                                              │
     │ Filters Panel - DEFER                                                                                                                                        │
     │                                                                                                                                                              │
     │ - Reason: Current filtering works well (collections, tags, search)                                                                                           │
     │ - Effort: 7-9 hours (backend aggregation + year slider UI)                                                                                                   │
     │ - Decision: Defer to post-MVP based on user feedback                                                                                                         │
     │                                                                                                                                                              │
     │ Projects UI - SKIP                                                                                                                                           │
     │                                                                                                                                                              │
     │ - Reason: Integration blocker (needs editor-service project list)                                                                                            │
     │ - Backend Status: Complete (ProjectLink API ready)                                                                                                           │
     │ - Decision: Skip UI until editor integration scoped                                                                                                          │
     │                                                                                                                                                              │
     │ Phase 2 Features - Placeholder Only                                                                                                                          │
     │                                                                                                                                                              │
     │ - Notes with content (Frame 32): Rich text editor integration                                                                                                │
     │ - Sharing collaboration (Frame 37): Multi-user infrastructure                                                                                                │
     │ - Settings full UI (Frames 39-40): User preferences storage                                                                                                  │
     │                                                                                                                                                              │
     │ ---                                                                                                                                                          │
     │ Critical Files Reference                                                                                                                                     │
     │                                                                                                                                                              │
     │ Files to Read (Context)                                                                                                                                      │
     │                                                                                                                                                              │
     │ 1. /home/mahdi/Desktop/bibliography/FINDINGS.md - Figma gap analysis                                                                                         │
     │ 2. /home/mahdi/Desktop/bibliography/docs/01-specification/frontend/ComponentsSpec.md - Component specs                                                       │
     │ 3. /home/mahdi/Desktop/bibliography/docs/screenshots_figma/ - Figma frames                                                                                   │
     │                                                                                                                                                              │
     │ Files to Modify                                                                                                                                              │
     │                                                                                                                                                              │
     │ Phase 1:                                                                                                                                                     │
     │ - bibliography_frontend/src/components/layout/ActivityBar.tsx                                                                                                │
     │ - bibliography_frontend/src/store/ui.store.ts                                                                                                                │
     │ - bibliography_frontend/src/components/layout/DetailsPane.tsx (lines 304-309)                                                                                │
     │                                                                                                                                                              │
     │ Phase 2:                                                                                                                                                     │
     │ - bibliography_frontend/src/routes/duplicates.tsx                                                                                                            │
     │ - bibliography_frontend/src/features/library/components/DuplicateComparisonCard.tsx (NEW)                                                                    │
     │ - bibliography_frontend/src/features/library/api/duplicates.queries.ts (NEW)                                                                                 │
     │ - bibliography_frontend/src/features/library/api/duplicates.mutations.ts (NEW)                                                                               │
     │                                                                                                                                                              │
     │ Phase 3:                                                                                                                                                     │
     │ - bibliography_frontend/src/routes/tags.tsx (NEW)                                                                                                            │
     │ - bibliography_frontend/src/routes/sharing.tsx (NEW)                                                                                                         │
     │ - bibliography_frontend/src/components/layout/SettingsMenu.tsx (NEW)                                                                                         │
     │                                                                                                                                                              │
     │ Backend APIs (Reference Only - Already Complete)                                                                                                             │
     │                                                                                                                                                              │
     │ - GET /api/bibliography/duplicates - List unresolved duplicates                                                                                              │
     │ - POST /api/bibliography/duplicates/:id/resolve - Resolve duplicate                                                                                          │
     │ - GET /api/bibliography/tags - List tags with counts                                                                                                         │
     │                                                                                                                                                              │
     │ ---                                                                                                                                                          │
     │ Success Criteria                                                                                                                                             │
     │                                                                                                                                                              │
     │ Overall Success                                                                                                                                              │
     │                                                                                                                                                              │
     │ - ✅ All 13 Figma frames addressed (complete or placeholder)                                                                                                 │
     │ - ✅ Activity Bar has 7 icons                                                                                                                                │
     │ - ✅ Duplicates resolution workflow functional                                                                                                               │
     │ - ✅ Phase 2 features have professional placeholders                                                                                                         │
     │ - ✅ Test coverage >80% for new components                                                                                                                   │
     │ - ✅ No TypeScript errors or console warnings                                                                                                                │
     │                                                                                                                                                              │
     │ Phase 2 Success (Most Critical)                                                                                                                              │
     │                                                                                                                                                              │
     │ - ✅ User can view duplicates side-by-side                                                                                                                   │
     │ - ✅ Field differences immediately obvious                                                                                                                   │
     │ - ✅ Resolution actions work correctly                                                                                                                       │
     │ - ✅ UI updates in real-time                                                                                                                                 │
     │ - ✅ Performance <500ms for typical operations                                                                                                               │
     │                                                                                                                                                              │
     │ ---                                                                                                                                                          │
     │ Implementation Notes                                                                                                                                         │
     │                                                                                                                                                              │
     │ Key Patterns to Follow                                                                                                                                       │
     │                                                                                                                                                              │
     │ 1. Copy from editor_frontend: Use existing Button, Card, Modal components                                                                                    │
     │ 2. CVA variants: Follow established styling patterns                                                                                                         │
     │ 3. React Query: Use existing patterns from tags.queries.ts                                                                                                   │
     │ 4. Zustand store: Update ui.store.ts for new views                                                                                                           │
     │ 5. TanStack Router: File-based routes in /routes/                                                                                                            │
     │                                                                                                                                                              │
     │ Testing Strategy                                                                                                                                             │
     │                                                                                                                                                              │
     │ - Unit tests (Vitest): Component logic and rendering                                                                                                         │
     │ - Integration tests (React Testing Library): User workflows                                                                                                  │
     │ - E2E tests (Playwright): Critical paths only                                                                                                                │
     │                                                                                                                                                              │
     │ Performance Considerations                                                                                                                                   │
     │                                                                                                                                                              │
     │ - Duplicates list may be long - consider virtualization if >50 items                                                                                         │
     │ - Backend pagination already exists (limit 1000)                                                                                                             │
     │ - React Query caching prevents unnecessary refetches                                                                                                         │
     │                                                                                                                                                              │
     │ ---                                                                                                                                                          │
     │ Next Steps After This Plan                                                                                                                                   │
     │                                                                                                                                                              │
     │ 1. Review Figma screenshots in /docs/screenshots_figma/                                                                                                      │
     │ 2. Read ComponentsSpec.md Section 2.5 for DuplicateCard spec                                                                                                 │
     │ 3. Start with Phase 1 (quick wins build momentum)                                                                                                            │
     │ 4. Test incrementally (don't wait until end)                                                                                                                 │
     │ 5. Commit frequently (atomic commits per feature)                                                                                                            │
     │                                                                                                                                                              │
     │ ---                                                                                                                                                          │
     │ Plan Created: 2025-11-25                                                                                                                                     │
     │ Estimated Completion: 2-3 days (assuming 6-8 hours per day)                                                                                                  │
     │ Ready for Execution: YES    