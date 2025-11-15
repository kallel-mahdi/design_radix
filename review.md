Key Findings

  - pnpm test is red in both apps. Frontend vitest run currently fails 11 files/50 specs (see bibliography_frontend/test-output.txt:1), so CI can’t promote UI code; backend jest run fails units/integration including
    ReferenceService and all project-link specs (bibliography_backend/test-results.txt:1). We need these suites green before trusting any new work.
  - Tag rename API contracts do not match. The client calls PATCH /tags/:oldName with {name:newName} (bibliography_frontend/src/features/library/api/tags.queries.ts:93-101), but the service exposes PATCH /tags/:oldName/
    rename and reads newName from the body (bibliography_backend/src/routes/tags.ts:25-33, bibliography_backend/src/controllers/TagController.ts:82-112). Renames are currently 404/400s.
  - Reference creation explodes when a UI passes non-ObjectId collection IDs and also enforces citation keys globally. ReferenceService blindly wraps every collectionIds entry with new mongoose.Types.ObjectId and catches
    no casting errors (bibliography_backend/src/services/ReferenceService.ts:46-48), and generateCitationKey only checks Reference.findOne({ citationKey }) without scoping by user (bibliography_backend/src/services/
    ReferenceService.ts:210-224). One user can block another from creating a reference whose key happens to collide, and malformed IDs crash the request.
  - Search feature coverage is far behind the spec. The spec requires filters such as authors, year ranges, venues, tags, and a dedicated search surface (docs/01-specification/Spec.md:174). Backend filtering
    only supports {collectionId,tags,deleted,search} (bibliography_backend/src/interfaces/IReferenceService.ts:34-47), there is no /search endpoint, and the /search route renders a stub with incorrect styles
    (bibliography_frontend/src/routes/search.tsx:19-33), so the documented experience does not exist.
  - /api/bibliography/references/test-cleanup is exposed in all environments with no guard (bibliography_backend/src/routes/references.ts:32-38). Anyone with network access can nuke every reference by sending DELETE
    requests; this needs to be behind a test flag or removed before deploy.
  - UI state/types are inconsistent: the store only allows 'library' | 'search' | 'projects' | 'duplicates' yet we write 'trash' in the routes and Activity Bar (bibliography_frontend/src/store/ui.store.ts:22-64,
    bibliography_frontend/src/routes/trash.tsx:12-28). TypeScript can’t protect us here, and we’ll show the wrong active state if you switch to Trash.
  - Several placeholder screens and shared components use CSS classes that don’t exist in our Tailwind theme (text-text-*, bg-bg-*, etc. in bibliography_frontend/src/routes/search.tsx:17-34, bibliography_frontend/src/
    routes/projects.tsx:17-34, bibliography_frontend/src/routes/duplicates.tsx:17-33, and bibliography_frontend/src/features/library/components/ReferenceList.tsx:30-38). They silently fall back to browser defaults,
    giving a different look than the design tokens defined in src/styles/tailwind.css.
  - The DOI import flow still contains verbose console logging in both the modal and the mutation hook (bibliography_frontend/src/features/library/components/ImportModal.tsx:44-94 and bibliography_frontend/src/features/
    library/api/import.queries.ts:18-40). This spams DevTools/CI logs and could leak DOI inputs in production.
  - Project link endpoints produce duplicate-key errors and status-code mismatches (tests expect 200 while the controller returns 201 for first links), per bibliography_backend/test-results.txt:1. That entire slice needs
    debugging before Linked Projects work can begin.
  - Documentation lags reality: docs/03-quality/TESTING.md still says “TBD” for coverage (docs/03-quality/TESTING.md:8), and the backend README still claims we use Joi even though Zod is in place (bibliography_backend/
    README.md:34-43). These inconsistencies confuse new contributors.
  - Frontend package.json pulls in stack-approved libraries, but several (e.g., react-hook-form, @hookform/resolvers, i18next, react-i18next) are unused anywhere in bibliography_frontend/src (bibliography_frontend/
    package.json:25-63). They add attack surface and slower installs without value.

  Open Questions

  - Should /references/test-cleanup exist outside automated test environments? If yes, how do we authenticate/lock it down?
  - Do we want to keep DOI e2e tests hitting real Crossref (tests/e2e/doi-import.spec.ts:1) despite rate limits, or should we stub Crossref for deterministic CI runs?

  Architecture Overview

  - Backend: src/index.ts wires Express, helmet/cors, the gateway-trust middleware, and Inversify DI (bibliography_backend/src/index.ts:1-73). Each router (src/routes/*.ts) resolves a controller from the container, and
    controllers are thin wrappers that validate headers, call services, and format responses—for example, ReferenceController handles CRUD and DOI imports (bibliography_backend/src/controllers/ReferenceController.ts:1-
    205). Business logic lives in services such as ReferenceService, CollectionService, TagService, and DuplicateService, all interacting directly with Mongoose models in src/models/*. Zod schemas from the shared
    package are reused both for request validation (via middleware/validate.ts) and for frontend runtime checks. Crossref ingestion is encapsulated in src/services/CrossrefService.ts:1-212, so DOI imports follow the path
    “ImportModal ➜ /references/import-doi ➜ CrossrefService ➜ ReferenceService ➜ Mongo ➜ duplicate detector”.
  - Frontend: Vite bootstraps the app in src/main.tsx, creating a TanStack Router from the generated route tree and a shared QueryClient. Layout is centralized in components/layout/AppLayout.tsx:1-124, which renders
    the ActivityBar, sidebar (collections + tags via React Query hooks), main outlet, and a resizable DetailsPane (components/layout/DetailsPane.tsx:1-146). UI state uses Zustand stores: src/store/ui.store.ts for global
    chrome and features/library/store/library.store.ts for library-specific selections and filters. Data fetching is grouped per feature under features/library/api/*, each hook wrapping apiClient (which injects tokens
    or dev headers, handles timeouts/retries, and unwraps the backend envelope in src/common/api/client.ts:1-210). UI primitives (Button, Modal, Tag, Toast, etc.) live under src/components/ui, mirroring patterns from
    editor_frontend. Suspense isn’t used yet; loading states are handled manually with skeletons/spinners.

  Testing & Coverage

  - Planning doc still reads “TBD” for all coverage buckets (docs/03-quality/TESTING.md:8-40), but we currently have ~250 frontend specs (with 50 failing) plus backend unit/integration suites (two suites failing). E2E
    coverage is limited to the DOI import Playwright file (tests/e2e/doi-import.spec.ts:1-155) and relies on external Crossref, so it is flaky and can trigger rate limits. No automated search/collection/tag workflow
    tests exist yet despite feature specs.
  - Goal per docs is 60/30/10 unit/integration/E2E. Today we’re closer to 100/0/0, because E2E has only one scenario, integration tests are failing (projects), and the unit suites cover mostly store utilities. High-value
    additions would be: backend integration specs for /references/import-doi happy/error paths, /projects linking flows once fixed, and frontend workflow tests across ActivityBar navigation and tag filtering (beyond
    store-only tests).

  Libraries & Dependencies

  - Backend package.json matches the required stack (Node 22, Express, Mongoose, Inversify, Winston, Multer, Joi→Zod) (bibliography_backend/package.json:18-61). Remaining question is whether we still need Joi listed
    anywhere (docs).
  - Frontend package.json aligns with React 19, Vite 6, TanStack Router/Query, Zustand, Tailwind4+Vite plugin, CVA, etc. (bibliography_frontend/package.json:17-72), but forms/i18n/table libraries are unused in code and
    can be removed or implemented soon to avoid dead weight.

  Actionable Next Steps

  1. Stabilize the pipeline: Fix the existing vitest/jest failures before writing new code (front: update selectors/act wrappers in tests; back: handle ObjectId casting, update project tests to expect 201 or change the
     controller). This keeps the repo shippable.
  2. Align tag rename contract: Either change the frontend hook to call /tags/:oldName/rename with { newName } or add an alias endpoint. Add regression tests on both sides to prevent future drift.
  3. Harden ReferenceService: Wrap collectionIds.map(ObjectId) with validation/logout to avoid 500s, and scope generateCitationKey uniqueness under { userId, citationKey }. Add unit coverage for these branches.
  4. Implement/guard destructive endpoints: Gate /references/test-cleanup and any future test-only routes behind NODE_ENV === 'test' or remove them from production bundles; add supertest coverage proving the guard works.
  5. Bring search in line with the spec: Design the /search API (aggregation filters, pagination) and flesh out the frontend search route so it reflects docs/01-specification/Spec.md:174. Until then, update docs/status
     to make it clear search is pending.
  6. Fix UI state/types and styling tokens: Extend activeView’s union to include 'trash', audit placeholder components for text-app-* tokens, and add snapshot/unit tests to stop regressions.
  7. Clean up noisy logging & unused deps: Remove console debugging from DOI flows, purge unused packages (react-hook-form/i18next or wire them up per plan), and update README/testing docs to reflect Zod + current
     coverage.
  8. Testing roadmap: After fixes, add (a) backend integration tests for /references/import-doi and /projects/*, (b) frontend interaction tests for the ActivityBar + Library view, and (c) a mocked Crossref Playwright
     flow so CI isn’t throttled. Document progress in docs/03-quality/TESTING.md.

  Let me know if you’d like help implementing any of the fixes or expanding the test suites.