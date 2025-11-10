Architecture & Patterns

  - Monorepo uses pnpm workspaces with clean separation between frontend, backend, and shared packages, plus workspace-wide scripts
    for build/test orchestration (package.json:1-22).
  - Backend stack matches the editor baseline (Express 4.19, TypeScript 5.8 strict, Inversify DI, Mongoose, Winston, Multer) per
    dependency manifest (bibliography_backend/package.json:20-68).
  - Frontend stack also aligns (Vite, React 19, TanStack Router/Query, Zustand, Tailwind v4, CVA, react-hook-form, headlessui/
    heroicons) and tooling (Vitest + Playwright) is in place (bibliography_frontend/package.json:1-80).
  - Shared package provides Zod schemas/types as the single source of truth and is already tested via Vitest (shared/src/
    schemas.ts:1-214).
  - DI container wiring follows the editor services pattern (single Container, scoped bindings for services/controllers)
    (bibliography_backend/src/config/container.ts:1-48).

  Implementation vs Plan

  - Backend model layer for Reference/Collection/Tag/ProjectLink/DuplicateCandidate is implemented as required for Sessions 1‑3
    (bibliography_backend/src/models/*.ts).
  - Reference CRUD service/controllers, React Query hooks, and card/list/table primitives exist per Session 3 goals
    (bibliography_backend/src/services/ReferenceService.ts:15-137, bibliography_frontend/src/features/library/api/
    references.queries.ts:33-90, src/features/library/components/*.tsx).
  - However, AppLayout still renders placeholder text instead of the “Collections tree + tag selector” promised in the planning
    docs, so the sidebar isn’t functional yet (CODE_REVIEW_PROMPT.md:83-96, bibliography_frontend/src/components/layout/
    AppLayout.tsx:44-57).
  - The SearchBar component was built but never mounted anywhere in the layout, so Session 2’s “Search input with Heroicons” remains
    absent in the actual UI (bibliography_frontend/src/components/layout/SearchBar.tsx:1-64, src/components/layout/AppLayout.tsx:1-
    24).

  Standards & Compliance

  - API responses do not follow the documented envelope (success, message, data, pagination) nor the prescribed DELETE 204 semantics
    (bibliography_plan/backend_plan/APIDesignSystem.md:13-75, bibliography_backend/src/controllers/ReferenceController.ts:34-205).
  - Required security middleware (express-mongo-sanitize, express-rate-limit) is missing even though it’s part of the agreed stack,
    leaving only helmet/cors/compression configured (CODE_REVIEW_PROMPT.md:48-56, bibliography_backend/src/index.ts:26-41).
  - “Zod only at system boundaries” is not upheld; several state-changing routes (projects link/unlink, duplicate resolution,
    tag color updates) skip validation altogether, meaning arbitrary payloads flow straight to services (CLAUDE.md:480-483,
    bibliography_backend/src/routes/projects.ts:8-35, src/routes/duplicates.ts:8-15, src/routes/tags.ts:25-27).

  Critical Issues List

  1. Reference creation always fails (Critical) – sourceRaw is required by the Reference schema yet omitted from
     CreateReferenceInputSchema, so the validator strips it and controllers never receive the data they need, making /references
     POST unusable on both backend and frontend (shared/src/schemas.ts:177-193, bibliography_backend/src/models/Reference.ts:32-81,
     bibliography_backend/src/routes/references.ts:10-28, bibliography_frontend/src/features/library/api/references.queries.ts:40-
     55). Fix: add sourceRaw to the shared schema/type, populate it in the UI (default to {provider:'manual',payload:{}} for manual
     entries), and ensure the validator preserves it.
  2. Collections service ignores trash & color spec (High) – Spec mandates color assignment plus soft-delete/restore/permanent-
     delete flows, but the current service just hard deletes records, never stores color, and exposes no restore endpoints
     (bibliography_plan/backend_plan/ServiceLayerSpec.md:304-465, bibliography_backend/src/services/CollectionService.ts:8-58, src/
     interfaces/ICollectionService.ts:3-19, src/routes/collections.ts:10-33). Fix: extend DTOs to include color, implement soft
     delete/restore/permanent delete logic, cascade collectionIds cleanup, and add the missing routes.
  3. Security middleware & auth defaults (High) – Despite the contract calling for sanitize + rate limit, neither middleware is
     registered, and trustGatewayAuth defaults to false which silently flips the service into the dev-only bypass unless an env var
     is set (CODE_REVIEW_PROMPT.md:48-56, bibliography_backend/src/index.ts:26-41, bibliography_backend/src/config/environment.ts:5-
     13). Fix: wire express-mongo-sanitize and express-rate-limit, default trustGatewayAuth to true, and only allow bypass when
     explicitly opting into a local profile.
  4. API responses violate the design system (Medium) – Success payloads often omit message, errors return plain
     {success:false,message} without code/details, and DELETE returns 200 instead of 204 (bibliography_plan/backend_plan/
     APIDesignSystem.md:13-75, bibliography_backend/src/controllers/ReferenceController.ts:34-205). Fix: centralize response helpers
     (or use the error handler) so every endpoint emits the documented envelope and status codes.
  5. Unvalidated project/tag/duplicate operations (High) – Linking projects, resolving duplicates, and recoloring tags
     take arbitrary JSON straight into the DB layer, exposing you to CastErrors and malicious input (CLAUDE.md:480-483,
     bibliography_backend/src/routes/projects.ts:8-35, src/routes/duplicates.ts:8-15, src/routes/tags.ts:25-27). Fix: add
     appropriate Zod schemas in @bibliography/shared and reuse the validate middleware.
  6. Jest suite cannot run (Medium) – Test setup imports @jest/globals, but that package isn’t declared anywhere, so running any
     backend test fails with MODULE_NOT_FOUND before executing specs (bibliography_backend/tests/setup.ts:1-6, bibliography_backend/
     package.json:24-68). Fix: add @jest/globals as a devDependency (matching your Jest version) or refactor setup to rely on the
     global jest automatically exposed by ts-jest.
  7. API client retries against a non-existent endpoint (Medium) – The frontend tries to refresh tokens via POST /api/bibliography/
     auth/refresh, but the backend exposes only references/collections/tags/projects/duplicates, so every 401 triggers a doomed
     refresh attempt that ends in logout noise (bibliography_frontend/src/common/api/client.ts:134-166, bibliography_backend/src/
     index.ts:42-48). Fix: remove the refresh flow (gateway injects headers) or proxy refresh requests to the actual auth service.

  Recommendations for Improvement

  - Immediate: unblock reference creation, implement the collections trash/color workflows, register sanitize/rate-limit middleware,
    standardize API responses, and add Zod validation for every mutating route touched above.
  - Short-term: wire the Collections/Tags sidebar and SearchBar into AppLayout so Session 2 deliverables exist in the UI, remove
    the unused axios dependency and any other mismatched libs, and make the React checkbox selection accessible by handling onChange
    (bibliography_frontend/src/components/layout/AppLayout.tsx:44-57, bibliography_frontend/src/components/layout/SearchBar.tsx:1-
    64, bibliography_backend/package.json:24-42, bibliography_frontend/src/features/library/components/ReferenceCard.tsx:74-82).
  - Long-term: add service-level observability (structured request IDs already exist in the logger), build integration tests that go
    through the gateway headers, and start exercising duplicate/project flows before Phase 2 features depend on them.

  Questions Requiring Decisions

  1. Should we auto-populate sourceRaw server-side for manual entries to reduce client burden, or must the UI always send a
     provenance payload (bibliography_backend/src/models/Reference.ts:32-81)?
  2. Is the /auth/refresh logic meant to live inside this client, or will the gateway own refresh entirely (if the latter, we should
     delete that branch) (bibliography_frontend/src/common/api/client.ts:134-166)?
  3. For Collections, do we want to follow Zotero’s “trash can” semantics exactly (parent/child cascading rules from the spec), or
     is a simplified archive acceptable before Session 4 (bibliography_plan/backend_plan/ServiceLayerSpec.md:304-465)?

  Code Smells & Anti-Patterns

  - Backend still declares axios even though the agreed requirement is “fetch-based client only,” adding confusion and bundle bloat
    (CODE_REVIEW_PROMPT.md:40-56, bibliography_backend/package.json:24-42).
  - Reference selection checkbox relies on onClick with a no-op onChange, so keyboard users can’t toggle selection—this is an
    accessibility regression (bibliography_frontend/src/features/library/components/ReferenceCard.tsx:74-82).
  - SearchBar component is orphaned; keeping dead UI code without wiring it in makes the layout harder to reason about
    (bibliography_frontend/src/components/layout/SearchBar.tsx:1-64, src/components/layout/AppLayout.tsx:1-24).
  - Collections sidebar renders placeholder paragraphs rather than data-driven components, so AppLayout doesn’t reflect the
    documented four-panel UX (bibliography_frontend/src/components/layout/AppLayout.tsx:44-57).

  Test Coverage Assessment

  - Backend has both unit and integration suites (e.g., tests/unit/services/CollectionService.test.ts, tests/integration/
    reference.service.test.ts:1-49), and the shared package plus frontend features include Vitest suites (shared/src/__tests__/
    schemas.test.ts, bibliography_frontend/src/features/library/api/__tests__/references.queries.test.tsx:1-140).
  - Because @jest/globals is missing, none of the backend tests can execute right now, so effective coverage is 0% until that
    dependency is added and the runner is re-verified (bibliography_backend/tests/setup.ts:1-6).
  - Once the harness boots, prioritize tests around the newly added collection trash flows, reference creation (with sourceRaw), and
    the unvalidated routes—these are the highest-risk areas.

  Security Audit Summary

  - High-risk gaps: missing sanitize/rate limiting, defaulting to bypass auth unless an env var is set, and multiple JSON endpoints
    that never validate payload shape (bibliography_backend/src/index.ts:26-41, bibliography_backend/src/config/environment.ts:5-13,
    bibliography_backend/src/routes/projects.ts:8-35).
  - Medium risks: inconsistent API envelopes (harder for clients to detect errors) and the frontend refresh loop that hammers a non-
    existent endpoint.
  - Security score: 4/10 until middleware, validation, and auth defaults are corrected.

  Final Readiness Assessment

  - Ready for Session 4? No—reference creation is broken, collections trashing isn’t implemented, and core security controls are
    missing.
  - Blockers: Items 1‑4 in the critical list must be resolved (plus add the missing dependency so CI can run).
  - Nice-to-haves: Wire the sidebar/search UI, clean up the axios dependency, and ensure keyboard accessibility.
  - Overall confidence: 5/10 until the API contract and security posture are brought back in line with the spec.
  - Recommended next steps: land the blocking fixes, run the full backend/frontend/shared test suites, and redo a small regression
    pass on CRUD + sidebar flows once the trash collection feature is actually implemented.