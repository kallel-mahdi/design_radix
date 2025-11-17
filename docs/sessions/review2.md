 Executive Summary
  Overall grade: C. The foundation (virtualized reference table, shared Zod schemas, centralized React Query config) is solid, but
  core MVP workflows break due to a mis-wired PDF upload flow, tag-color tooling never reaching the UI, and the entire automated
  test suite currently failing. These issues block Sessions 6‑10 deliverables and breach multiple spec requirements (API base URL,
  keyboard-accessible tree, nine-color tags, global cursor).

  Critical issues

  1. PDF uploads cannot succeed because useUploadPdfMutation pushes FormData through apiClient.post, which always JSON‑stringifies
     bodies and forces Content-Type: application/json. Files never reach the backend (src/features/library/api/pdf.mutations.ts:45-
     61, src/common/api/client.ts:323-329).
  2. pnpm test fails with 50 Vitest failures (QueryClient missing in component tests, Zustand selector loops, accessibility tests)
     so the Playwright suite never runs (test-output.txt:1-80, test-output.txt:3785-3789).
  3. Tag color assignment/positioning (nine colored tags, context menu) is not surfaced anywhere—TagColorPickerModal is only
     exercised in its unit test and TagSelector never opens it (src/features/library/components/TagSelector.tsx:54-112 vs.
     requirements in docs/01-specification/frontend/ComponentsSpec.md:654-759 and docs/01-specification/Spec.md:417-420).

  Strengths

  - ReferenceTable implements TanStack Table + virtualization, multi-selection shortcuts, and ARIA sorting states (src/features/
    library/components/ReferenceTable.tsx:1-230).
  - React Query defaults use exponential backoff and network-aware retries (src/common/config/reactQuery.ts:1-74).
  - Import modal normalizes DOIs, enforces validation, and keeps the modal open for sequential imports (src/features/library/
    components/ImportModal.tsx:1-118).
  - Layout uses react-resizable-panels so sidebars and details panes resize persistently (src/components/layout/AppLayout.tsx:76-
    146).

  ———

  Architecture & Component Design (Score: 5/10)
  Strengths: Virtualized library table, modular modal components.
  Issues:

  - [Severity 2] Tag color/position management is architected but not integrated. TagColorPickerModal is never imported outside its
    test, and TagSelector only toggles filters—no settings menu, context menu, or modal trigger—so key Session 5 UX never renders
    (src/features/library/components/TagSelector.tsx:54-112). Spec explicitly mandates a settings menu, context menu, and nine
    colored tags (docs/01-specification/frontend/ComponentsSpec.md:654-759).
  - [Severity 2] AppLayout runs library-specific queries (useReferencesQuery, useCollectionsQuery, useTagsQuery) for every route,
    even when the user is on Search, Projects, or Duplicates (src/components/layout/AppLayout.tsx:33-58). Spec 2.3 calls for
    feature-scoped modules/routes (docs/01-specification/Spec.md:321-336), so these data dependencies should move into the /library
    route (and lazy routes) to avoid unnecessary network chatter and to keep other pages isolated.

  Accessibility (Score: 4/10)
  Strengths: Buttons include focus-visible rings; table headers expose aria-sort.
  Issues:

  - [Severity 2] Collections tree renders as plain <div> + buttons without role="tree", role="treeitem", or aria-expanded, so screen
    readers and keyboard users cannot navigate hierarchies (src/features/library/components/TreeView.tsx:137-160, src/features/
    library/components/TreeNode.tsx:25-75). ComponentsSpec requires tree semantics and arrow-key support (docs/01-specification/
    frontend/ComponentsSpec.md:541-649).
  - [Severity 2] Tag buttons do not expose aria-pressed, search input lacks a label, and the settings gear/context menu described in
    the spec is absent (src/features/library/components/TagItem.tsx:24-52, src/features/library/components/TagSelector.tsx:68-90).
    As a result, assistive tech cannot tell whether a tag filter is active (docs/01-specification/frontend/ComponentsSpec.md:697-
    759).

  Performance & Optimization (Score: 5/10)
  Strengths: Virtualized list plus memoized column definitions keep the main table snappy.
  Issues:

  - [Severity 3] TagSelector calls useLibraryStore() without a selector, so it subscribes to the entire Zustand state (src/features/
    library/components/TagSelector.tsx:18-21). Any change—selection, sorting, search—re-renders the entire tag list, which will hurt
    as the library grows.
  - [Severity 3] Every TreeItem also consumes the whole store (src/features/library/components/TreeView.tsx:71-90), so a single
    selection toggle causes all nodes to re-render and re-run hooks (already causing “Rendered fewer hooks than expected” test
    failures).
  - [Severity 3] AppLayout fetches trash counts (useReferencesQuery({ deleted: true, limit: 1 })) and the full collection/tag lists
    on every route (src/components/layout/AppLayout.tsx:33-58). Consider moving these queries into the /library route loader or
    using lazy routes to avoid wasted work on e.g. /search.

  Code Quality & Maintainability (Score: 5/10)
  Strengths: Shared React Query config + Zod validation make server interactions predictable.
  Issues:

  - [Severity 2] ReferenceCard mixes presentation with useDeleteReferenceMutation, so every UI render requires a QueryClient
    provider. This coupling is the root cause of the 18 failing card tests (“No QueryClient set”) and makes the component harder
    to reuse (src/features/library/components/ReferenceCard.tsx:24-84, test-output.txt:120-160). Consider injecting callbacks or
    wrapping mutation logic in a hook used by higher-level containers.
  - [Severity 3] PdfTab hardcodes /api/bibliography/references/:id/pdf instead of using VITE_API_BASE_URL or the API client,
    scattering environment knowledge and making staging/prod deployments brittle (src/features/library/components/PdfTab.tsx:62).

  Testing & Quality Assurance (Score: 2/10)
  Strengths: There are 249 unit/integration specs plus detailed fixture docs (TESTING.md).
  Issues:

  - [Severity 1] pnpm test currently fails with 50 Vitest failures and therefore never reaches Playwright (test-output.txt:1-
    80, test-output.txt:3785-3789). Failures include missing QueryClient providers, Zustand selector loops (“Maximum update depth
    exceeded”), and MSW handlers (server.getHandlers is not a function).
  - [Severity 2] Because the script chains vitest run src/ && playwright test, the E2E suite has not run since Vitest started
    failing. No evidence that the PDF upload flow, import modal, or keyboard interactions pass end-to-end.

  Design System & UI Consistency (Score: 4/10)
  Strengths: Buttons, cards, and tags all use CVA variants so variants remain type-safe.
  Issues:

  - [Severity 2] Base theme tokens set the sans font to Inter and mono font to Fira Code, ignoring the prescribed Josefin Sans and
    JetBrains Mono tokens (src/styles/tailwind.css:3-20 vs. docs/01-specification/frontend/DesignSystem.md:256-263).
  - [Severity 2] The global cursor spec requires hiding the OS cursor across the app (docs/01-specification/frontend/
    DesignSystem.md:738-778), but the base layer never sets cursor: none, so users see two cursors (src/styles/tailwind.css:30-37).
  - [Severity 3] Tag color palette/position UI (1‑9 slots, “Remove color”), mandated in both the design system and TagSelector spec,
    is absent (src/features/library/components/TagSelector.tsx:54-112, docs/01-specification/frontend/DesignSystem.md:200-210).

  State Management & Data Flow (Score: 4/10)
  Strengths: Shared Zustand stores persist only necessary slices (src/features/library/store/library.store.ts:1-112).
  Issues:

  - [Severity 1] useUploadPdfMutation sends FormData into apiClient.post, which JSON-stringifies the body and sets Content-Type:
    application/json, so uploads silently fail. Use apiClient.uploadFile or fetch directly for multipart requests (src/features/
    library/api/pdf.mutations.ts:45-61, src/common/api/client.ts:323-329). This blocks Session 10 goals (docs/02-delivery/checklist/
    sessions-06-10.md:246-297).
  - [Severity 2] PDF viewer downloads via a hard-coded relative path (src/features/library/components/PdfTab.tsx:62), ignoring
    VITE_API_BASE_URL even though the spec defines that base (docs/01-specification/Spec.md:794-812). Deployed frontends served from
    a CDN will 404 unless they live on the same origin as the API gateway.

  Specification Adherence (Score: 4/10)
  Strengths: Reference modal includes all required fields and PDF upload slot (src/features/library/components/
  ReferenceModal.tsx:248-490).
  Issues:

  - [Severity 2] API client defaults to http://localhost:3000/api/bibliography, conflicting with the documented default http://
    localhost:8005/api/bibliography (src/common/api/client.ts:5-7, docs/01-specification/Spec.md:794-812). Developers following the
    spec will hit 404s until they override the env.
  - [Severity 2] Tag system requirements (color assignment, nine colored tags, keyboard positions) are unmet, as described earlier
    (docs/01-specification/Spec.md:417-420, docs/01-specification/frontend/ComponentsSpec.md:654-759).
  - [Severity 2] Tree view keyboard/ARIA requirements are unimplemented (docs/01-specification/frontend/ComponentsSpec.md:541-649,
    actual implementation src/features/library/components/TreeView.tsx:137-160).

  ———

  Accessibility Audit Report

  | Criterion | Status | Issues Found |
  |-----------|--------|--------------|
  | 1.1 Text Alternatives | ✅ | Icon buttons include labels, SVGs are decorative. |
  | 1.4 Distinguishable | ⚠️ | Tag color selection relies on color alone because no textual status or aria-pressed indicator exists.
  |
  | 2.1 Keyboard Accessible | ❌ | Collections tree lacks role="tree" / aria-expanded, so arrow-key navigation required by spec
  cannot function (src/features/library/components/TreeNode.tsx:25-75). |
  | 2.4 Navigable | ⚠️ | No skip link or tree semantics; screen readers cannot announce nested collections. |
  | 3.1 Readable | ✅ | Typography and contrast meet AA via CSS variables. |
  | 3.2 Predictable | ⚠️ | Tag filter buttons change state without programmatic indication (aria-pressed). |
  | 3.3 Input Assistance | ⚠️ | Sidebar search input is unlabeled (placeholder only) so screen readers can’t report its purpose (src/
  features/library/components/TagSelector.tsx:68-74). |
  | 4.1 Compatible | ⚠️ | Missing ARIA roles for tree widgets create invalid markup relative to spec. |

  Performance Audit

  Bundle Metrics: not collected (Vite analyze not run).
  Runtime Observations:
  - TagSelector subscribes to the entire Zustand store, forcing re-render on any library state change (`src/features/library/
  components/TagSelector.tsx:18-21`).
  - Every TreeItem subscribes to the full store, triggering hook mismatches and rendering all nodes on each toggle (`src/features/
  library/components/TreeView.tsx:71-90`).
  - Trash count query runs globally via AppLayout, even when not on /library (`src/components/layout/AppLayout.tsx:33-40`).

  Test Coverage Report

  Overall Coverage: unavailable (pnpm test fails before reporting).
  Vitest: 11 files failed, 50 tests failing (QueryClient missing, Zustand selector loops, Tag/Tree specs) — see test-output.txt:1-
  160 & 3755-3789.
  Playwright: never executed because the preceding Vitest command exits non-zero.

  Design System Compliance

  | Item | Status | Notes |
  |------|--------|-------|
  | Font tokens | ❌ | --font-family-sans / --font-family-mono use Inter & Fira Code instead of Josefin Sans & JetBrains Mono (src/
  styles/tailwind.css:3-20, docs/01-specification/frontend/DesignSystem.md:256-263). |
  | Global cursor | ⚠️ | GlobalCursor component mounts, but base styles never hide the OS cursor (src/styles/tailwind.css:30-37,
  docs/01-specification/frontend/DesignSystem.md:738-778). |
  | Tag color palette | ❌ | No settings gear/context menu or TagColorPicker wiring; nine-slot palette unused (src/features/library/
  components/TagSelector.tsx:54-112, docs/01-specification/frontend/DesignSystem.md:200-210). |
  | CVA usage | ✅ | Buttons, cards, tags all use CVA variants with sensible defaults (src/components/ui/Button.tsx:1-54, src/
  components/ui/Card.tsx:1-60). |

  Recommendations Summary

  Immediate (Severity 1)

  1. Fix PDF upload by routing FormData through apiClient.uploadFile or a dedicated fetch client, and verify POST /references/:id/
     upload-pdf succeeds end-to-end.
  2. Restore the CI signal: wrap React Query mutations in providers/mocks, adjust Zustand selectors (e.g., return specific slices),
     and re-run pnpm test.
  3. Wire the tag color tooling—surface the settings menu/context menu in TagSelector, open TagColorPickerModal, and enforce the max
     nine colored tags rule.

  Next Sprint (Severity 2)

  1. Add tree semantics/keyboard handling per spec to TreeView/TreeNode.
  2. Respect VITE_API_BASE_URL everywhere (PDF viewer, API client defaults) and move library-specific queries into their routes.
  3. Update tailwind.css tokens and base cursor styles to match the design system; mount the GlobalCursor with cursor: none.

  Backlog (Severity 3)

  1. Refactor components like ReferenceCard to accept callbacks instead of calling mutations directly to ease testing.
  2. Introduce selectors (useLibraryStore((state) => state.toggleTag)) so sidebar widgets don’t re-render on every store change.
  3. Collect real bundle metrics (e.g., pnpm vite build --report) to ensure react-pdf and other heavy deps are code-split.

  Next Steps

  - When tag color assignment and TreeView semantics are wired, re-audit keyboard navigation and WCAG compliance (axe or jest-axe).
  - Once fonts/cursor tokens are corrected, spot-check against the Figma tokens to ensure there are no remaining CSS var drift
    issues.