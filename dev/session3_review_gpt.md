React Query mutations unwrap ApiResponse twice (response.data.data), so useCreateReferenceMutation returns undefined and useUpdateReferenceMutation crashes
    when it dereferences updatedRef._id on success. Fix the generic handling (return response.data) before building Phase 3 mutations. src/features/library/api/
    references.queries.ts:75-105
  - The new fetch client immediately logs a user out on any 401 and has no refresh/backoff path, diverging from the documented pattern we’re meant to copy from
    the editor. Without a refresh gate Phase 3 API work will keep dumping users back to the login screen. Implement the shared refresh flow (pending-request queue,
    refreshToken API, retry) per frontend_plan/CLAUDE.md:122-134. src/common/api/client.ts:141-196
  - Auth persistence is incomplete: persist.partialize skips isAuthenticated, so every reload clears the logged-in flag even when tokens were restored,
    and the Vitest suite can’t compile because auth.store.test.ts still references the old flat token string and setToken API. Update the store to hydrate
    isAuthenticated, allow setTokens(null), and migrate the tests to the { accessToken, refreshToken } shape. src/store/auth.store.ts:45-107, src/store/__tests__/
    auth.store.test.ts:16-118
  - We now maintain two incompatible Reference interfaces (one in src/common/types.ts, another inside useReferencesQuery), which TypeScript rejects when
    LibraryPage passes query data into ReferenceList—the pdf field is required in one type and optional in the other. Collapse to the shared type per the “single
    source of truth” guidance. src/features/library/api/references.queries.ts:6-37, src/common/types.ts:4-35, src/routes/library.tsx:23-61, frontend_plan/
    ComponentsSpec.md:1505-1513
  - Toast notifications never actually render: useUIStore.addToast is invoked in the API client and mutations, yet App.tsx only mounts the router and cursor. This
    directly conflicts with the spec (“Frontend shows toast on error”) and the earlier reviewer’s directive to add a ToastContainer. Build the presenter (even a
    lightweight portal that reads useToasts) so Phase 3 errors surface. src/App.tsx:12-18, src/store/ui.store.ts:71-204, Spec.md:815-818, dev/active/session3-phase2-
    review/session3-code-review.md:120-134

  Missing Patterns

  - The editor’s ErrorBoundary wrapper (and its workflow for catching/rendering fatal UI errors) is still absent, even though the review plan flagged it as
    required before Phase 3. Port src/components/ErrorBoundary.tsx from the editor and wrap <App /> in main.tsx. dev/active/session3-phase2-review/session3-code-
    review.md:132-205
  - We also never copied the toast presenter pattern. Add the ToastContainer suggested in that same review so the existing Zustand store has a visible outlet,
    complete with auto-dismiss timers. dev/active/session3-phase2-review/session3-code-review.md:120-129
  - src/common/utils.ts only exposes cn and formatDate, but the editor’s utilities include debounce/throttle, string truncation, DOI/email validators, etc.—all of
    which the spec calls out for reuse. Import the missing helpers from editor_frontend/src/common/utils.ts (session3 review “Pattern #2”). dev/active/session3-
    phase2-review/session3-code-review.md:208-220, src/common/utils.ts:1-23
  - Despite shipping react-hook-form, @hookform/resolvers, and zod, none of the new components use the documented “React Hook Form + Zod” flow (labelled in
    ComponentsSpec). Start by wiring the Reference modal/forms to RHF + Zod and validate API responses with shared schemas. frontend_plan/ComponentsSpec.md:931-971,
    frontend_plan/ComponentsSpec.md:1517-1542, package.json
  - Panel persistence from the editor (update Zustand on resize, restore widths on load) is missing—sidebarWidth/detailsPaneWidth live in the store but AppLayout
    never reads or writes them. Reuse the documented resizable pattern so Session 4’s tree/tag work lands on a stable layout. frontend_plan/ComponentsSpec.md:150-
    213, src/components/layout/AppLayout.tsx:44-88, src/store/ui.store.ts:85-154
  - We’re still destructuring entire stores (useUIStore() in AppLayout, SearchPage, etc.), contrary to the “Selectors (Recommended)” guidance. Switch to per-field
    selectors (possibly with shallow) to avoid global re-renders once Phase 3 adds heavy UI state. frontend_plan/ComponentsSpec.md:1279-1308, src/components/layout/
    AppLayout.tsx:12-19, src/routes/search.tsx:9-17
  - No keyboard shortcut hook, focus-management utilities, or accessibility helpers have been ported—even though the spec explicitly lists them as Phase 2
    patterns. Start by implementing the global shortcut map and aria-live helpers from the design docs. frontend_plan/ComponentsSpec.md:967-971, frontend_plan/
    ComponentsSpec.md:1862-1905, rg results (no keydown handlers)

  Design Deviations

  - Status bar and ActivityBar badges/counters promised in the mockups (e.g., “N selected • Sync OK…”, per User_interface/claude.md:14-18) are entirely missing from
    AppLayout, so users lose key context; severity = Medium. src/components/layout/AppLayout.tsx:33-89
  - Library view renders a vertical card list with no Add/Import/Export toolbar or multi-column table, diverging from the spec screenshot (User_interface/
    claude.md:25-29). This UI gap will block Phase 3 table sorting/filter work; severity = High. src/features/library/components/ReferenceList.tsx:1-54
  - Search, Projects, Duplicates, Sharing, and Settings routes are all placeholder “Coming Soon” panels, but Phase 2 is supposed to ship the filter sidebar, linked-
    collection toggles, duplicate cards, sharing table, and settings modals (User_interface/claude.md:49-114). Severity = High. src/routes/search.tsx:1-36, src/
    routes/projects.tsx:1-38, src/routes/duplicates.tsx:1-34
  - Tag colors & ActivityBar badges remain monochrome even though the design emphasizes diverse tag colors and per-icon counters (User_interface/claude.md:17-18,129-
    138). Expose color props in Tag usage and surface badge counts/alerts on the bar; severity = Medium. src/components/ui/Tag.tsx:1-44, src/components/layout/
    ActivityBar.tsx:6-63
  - The custom cursor CSS assigns cursor: text to every interactive element, contradicting the design system directive to hide the native cursor entirely
    (DesignSystem.md:738-778). This creates confusing text-caret hover states; severity = Medium. src/styles/tailwind.css:81-114

  Type Safety Gaps

  - Date fields (createdAt, updatedAt, pdf.uploadedAt) are typed as Date everywhere, but the API returns ISO strings and no deserialization occurs, so consumers
    think they have Date objects when they don’t. Either coerce to Date in the client or change the shared types to string. src/common/types.ts:4-35
  - mutationFn arguments are typed as any, forfeiting the benefit of the new shared types and making API drift invisible. Replace any with CreateReferenceInput /
    UpdateReferenceInput and add return types. src/features/library/api/references.queries.ts:75-97, src/common/types.ts:90-114
  - No Zod (or any runtime) validation guards API responses despite the spec’s “Validation at Boundaries” requirement, so malformed backend data will crash the UI
    later. Introduce the shared schemas noted in frontend_plan/ComponentsSpec.md:1517-1542 and parse inside api/client.
  - setTokens only accepts a Tokens object, so neither the API client nor an error boundary can clear tokens without calling logout() (which also nukes user info).
    Allow Tokens | null and expose a clearTokens action to simplify session expiry flows. src/store/auth.store.ts:30-87
  - Duplicate Reference definitions (see Critical Issues) violate the “single source” rule and create compound tsconfig errors; merge them per frontend_plan/
    ComponentsSpec.md:1505-1513.
  - The toast store IDs are generated via Math.random() without type branding or collision handling; consider crypto.randomUUID() once the presenter lands to
    guarantee uniqueness when multiple toasts fire concurrently. src/store/ui.store.ts:181-205

  Documentation Recommendations

  - STATUS.md devotes ~150 lines to historic Phase 1 tasks (STATUS.md:11-150). Move that history into /docs/archive/Phase1.md and keep STATUS focused on the current
    phase and open risks so it stays actionable.
  - The “Phase 2 Files Modified” section is a plain checklist (STATUS.md:193-228); consider converting it into a markdown table (File | Change | Notes | Follow-up)
    so reviewers can see at a glance which files still need verification.
  - Multiple sections continue to declare “100% complete” even though we just identified regressions (“Overall Status: Phase 2 Code Updates 100% COMPLETE ✅” at
    STATUS.md:9-74). Reword to reflect the new findings and add an “Open Issues” subsection that links back to this review.
  - Spin out a CHANGELOG.md so STATUS can stay concise; right now STATUS doubles as a release log, architecture summary, and roadmap, which makes it hard to parse.
  - The “Additional Phase 1 Work” narrative (STATUS.md:282-340) crowds out current priorities. Archive that block (or collapse it behind a link) and replace it with
    a short reference to where the detailed investigation now lives.

  Optional Improvements

  - Wire the new SearchBar component into the Library header (currently unused) and pair it with toolbar buttons to match the mockup’s table controls. src/
    components/layout/SearchBar.tsx, src/routes/library.tsx:30-61
  - Persist PanelGroup layouts by passing defaultSize from Zustand and handling onLayout callbacks so react-resizable-panels stops warning about normalization when
    the Details pane mounts/unmounts. src/components/layout/AppLayout.tsx:44-88
  - Add a global loading overlay that listens to useGlobalLoading and React Query’s isFetching, fulfilling both the design system’s loading guidance and the existing
    store API. src/store/ui.store.ts:29,179-205
  - Tag writing surfaces (inputs, textareas, editors) with .writing-surface or switch interactive-element cursors back to pointer so the GlobalCursor can actually
    enter “text mode”. src/styles/tailwind.css:81-114, src/components/ui/GlobalCursor.tsx:39-87
  - Implement the documented keyboard shortcuts and focus-management utilities (e.g., Cmd/Ctrl+F, Cmd/Ctrl+Shift+N, aria-live helpers) before Phase 3 features ship;
    there are currently zero keydown handlers in src/. frontend_plan/ComponentsSpec.md:1862-1905, frontend_plan/ComponentsSpec.md:967-971, rg -n "keydown" src (no
    matches)

  Next steps: prioritize fixing the mutation/API/auth issues and adding the toast/error-boundary scaffolding, then rerun pnpm test (the current auth tests will fail
  until you update them). Once those blockers are cleared, we can tackle the sidebar/tree work for Session 4 with confidence.Critical Issues

  - High – React Query mutations still unwrap response.data.data, so every create/update/delete returns undefined and useUpdateReferenceMutation immediately throws
    when it tries to read _id in onSuccess (see src/features/library/api/references.queries.ts:75-105). Replace the axios-era double .data with return response.data
    (or destructure) so TanStack Query receives the actual Reference record before you invalidate caches.
  - High – The fetch client logs users out on any 401 and never attempts the token refresh flow that the editor and CLAUDE docs require (src/common/api/
    client.ts:141-168 vs. frontend_plan/CLAUDE.md:122-134). Add the same isRefreshing/refreshPromise guard, call the auth API’s refresh endpoint, and only fall back
    to logout() when refresh fails so Phase 3 doesn’t boot users during long editing sessions.
  - High – Persisted auth state is inconsistent: only tokens, user, and sessionExpiry are stored, so a fresh page load leaves isAuthenticated=false even when
    tokens are present (src/store/auth.store.ts:45-107). On top of that, src/store/__tests__/auth.store.test.ts:16-118 still references the old flat state.token
    and login('token', user) signature, so Vitest/TS can’t compile the suite. Store isAuthenticated (or derive it during rehydrate) and update the tests to use
    { accessToken, refreshToken }.
  - High – There are two divergent Reference interfaces: one defined in src/common/types.ts:4-35 (mandatory pdf and Date objects) and another inside src/features/
    library/api/references.queries.ts:6-37 (optional pdf, Date objects). Because LibraryPage passes that second type into ReferenceList (src/routes/library.tsx:23-
    61), TypeScript flags ReferenceList’s props (the pdf property can be undefined). ComponentsSpec explicitly calls for a single shared type source to avoid this
    drift (frontend_plan/ComponentsSpec.md:1505-1513). Consolidate on common/types.ts, allow pdf to be null | undefined, and either parse ISO strings into Date or
    type them as string.
  - Medium – Every API toast is enqueued via useUIStore.addToast, but nothing renders useToasts() at the app root, so users never see error/success feedback even
    though the spec mandates it (Spec.md:815-818, dev/active/session3-phase2-review/session3-code-review.md:120-129). Add a ToastContainer next to GlobalCursor in
    src/App.tsx:12-18 that subscribes to useToasts() and auto-dismisses entries.

  Missing Patterns

  - ErrorBoundary from the editor repo still isn’t ported even though Session 3 notes flag it as urgent (dev/active/session3-phase2-review/session3-code-
    review.md:132-205). Add src/components/ErrorBoundary.tsx, wrap <App /> in main.tsx, and forward errors to whatever logging backend you choose.
  - Toast presenter pattern from the editor is also absent (same review doc lines 120‑129). Introduce a lightweight ToastContainer that maps useToasts() to
    dismissible toasts and clears them on navigation so the error/toast requirement is actually satisfied.
  - Shared utility helpers (debounce, truncate, DOI/email validators, etc.) mentioned in the review doc (dev/active/session3-phase2-review/session3-code-
    review.md:208-220) are missing; src/common/utils.ts:1-23 only exposes cn() and formatDate. Copy the editor’s helpers so upcoming tree/tag work doesn’t
    re‑implement them ad hoc.
  - React Hook Form + Zod patterns from ComponentsSpec (frontend_plan/ComponentsSpec.md:931-971 & 1517-1542) aren’t used anywhere even though the dependencies are
    installed (package.json). Add the common/api/validators.ts guard layer and wire RHF+Zod into the next modal or import form so data is validated at the boundary
    per spec.
  - The resizable sidebar/detail panel pattern that persists widths to Zustand/localStorage (frontend_plan/ComponentsSpec.md:150-213) isn’t wired up: sidebarWidth/
    detailsPaneWidth exist in src/store/ui.store.ts:85-154 but AppLayout never reads or writes them (src/components/layout/AppLayout.tsx:44-88). Hook
    ResizablePanelGroup’s onLayout into those setters so users stop seeing “panel size normalization” warnings and their preferences survive reloads.
  - CLAUDE’s guidance about selectors vs. full-store subscriptions (frontend_plan/ComponentsSpec.md:1279-1308) hasn’t been followed—components like AppLayout and
    every route call useUIStore() with no selector (src/components/layout/AppLayout.tsx:12-19, src/routes/search.tsx:9-17). Refactor to selector hooks to avoid
    global re‑renders when toasts or modals change.
  - Keyboard shortcut maps, focus management, and accessibility helpers called out in ComponentsSpec (frontend_plan/ComponentsSpec.md:967-971 & 1862-1905) are not
    ported; there are zero keydown listeners in src/. Bring over the editor’s shortcut hook and ARIA live-region utilities before implementing Phase 3 workflows.

  Design Deviations (vs. frontend_plan/User_interface/claude.md)

  - High – Library view shows a simple header and a vertical card list, but the mockups require an Add/Import/Export toolbar and a multi-column table
    (User_interface/claude.md:25-29 vs. src/routes/library.tsx:30-61 + src/features/library/components/ReferenceList.tsx:1-46).
  - High – Search, Projects, Duplicates, Sharing, and Settings screens are placeholders that just say “View coming soon,” while the spec depicts fully functional
    filter sidebars, project toggles, duplicate cards, collaborator tables, and settings modals (User_interface/claude.md:49-114 vs. src/routes/search.tsx,
    projects.tsx, duplicates.tsx).
  - Medium – The activity bar lacks badges, Sharing, and Settings icons, and there’s no bottom status bar (“N selected • Sync OK • …”) that the prompt calls out
    (User_interface/claude.md:14-18; see src/components/layout/ActivityBar.tsx:1-55 & AppLayout.tsx:33-89).
  - Medium – Tag chips still default to a single accent color even though the design demands up to nine distinct colored tags (User_interface/claude.md:17-18 & 129-
    138; src/components/ui/Tag.tsx:5-44).
  - Low – The cursor CSS restores a native text cursor on interactive elements (src/styles/tailwind.css:81-114), contradicting the “hide all native cursors” rule in
    DesignSystem (frontend_plan/DesignSystem.md:738-778). The resulting hybrid of custom + text cursors feels off-brand.

  Type Safety Gaps

  - API models assume hydrated Date instances and mandatory pdf objects (src/common/types.ts:4-35), but the backend returns ISO strings and may omit pdf; align the
    types to string | null or run data through a parser.
  - useCreateReferenceMutation accepts data: any, and no runtime Zod parsing is happening even though ComponentsSpec mandates it (frontend_plan/
    ComponentsSpec.md:1517-1542). Introduce typed payloads (CreateReferenceInput) and schema-based parsing inside the API client.
  - setTokens can’t clear tokens because it only accepts Tokens (src/store/auth.store.ts:30-85), forcing every error path to call logout() even when you only need to
    null the tokens; change the signature to Tokens | null.
  - Duplicate Reference definitions (see Critical Issues) violate the “single source of truth” rule (frontend_plan/ComponentsSpec.md:1505-1513) and keep TS from
    catching schema drift early.
  - There’s no keyboard shortcut or accessibility typing around focus traps/ARIA live regions even though ComponentsSpec enumerates them (frontend_plan/
    ComponentsSpec.md:967-971, 1862-1905); add typed helpers so shortcuts aren’t ad hoc document.addEventListener code later.

  Documentation Recommendations

  - STATUS.md spends ~150 lines reiterating completed Phase 1 work (lines 11‑128 & 243‑340). Move that history into an archived doc and keep STATUS laser-focused on
    current blockers/progress.
  - The “All 20 critical issues resolved ✅” claim (line 29) and “No console errors” note (lines 150‑156) contradict today’s findings—add a “Known Issues” section
    that tracks the open API client, auth, and type-safety bugs until they’re fixed.
  - The “Phase 2 Files Modified” section (lines 193‑231) is effectively a changelog; convert it into a table with columns for file, change type, and link to diff,
    and migrate the full narrative to a dedicated CHANGELOG.md.
  - Session summaries (lines 130‑190) duplicate content already in session3_review.md; link out instead to keep STATUS lightweight.
  - Consider adding a short “Next Verification Steps” block (tests to run, docs to update) so contributors know what validation is still pending each session.

  Optional Improvements

  - Wire the new SearchBar component into LibraryPage and the upcoming /search route so users can actually filter (src/components/layout/SearchBar.tsx:1-66, src/
    routes/library.tsx:30-61).
  - Feed ResizablePanelGroup events back into setSidebarWidth/setDetailsPaneWidth and give the group an autoSaveId to eliminate the recurring “panel size
    normalization” warnings mentioned in STATUS (src/components/layout/AppLayout.tsx:44-88).
  - Either add .writing-surface classes to text-editable regions or change the fallback cursor to pointer so the custom cursor’s text mode ever activates (src/
    components/ui/GlobalCursor.tsx:39-87, src/styles/tailwind.css:81-114).
  - Surface useUIStore.globalLoading with a simple overlay/spinner so long-running API calls don’t silently stall (src/store/ui.store.ts:29-179).
  - Introduce keyboard shortcut hooks and announceable screen-reader helpers per ComponentsSpec (frontend_plan/ComponentsSpec.md:967-971, 1862-1905); there are
    currently zero keydown listeners in src/, so Phase 3 shortcuts can’t be added incrementally.
  - Add an afterEach in src/store/__tests__/auth.store.test.ts to reset timers/store state and prevent leakage between suites (ties back to the TypeScript fixes
    above).

  Next steps: prioritize fixing the mutations, auth persistence/tests, token refresh, and toast presenter, then rerun pnpm test/pnpm lint to confirm the suite
  compiles cleanly. Once those blockers are resolved, tackle the missing editor patterns (ErrorBoundary, utilities, Zod validators) before starting Phase 3 feature
  work.