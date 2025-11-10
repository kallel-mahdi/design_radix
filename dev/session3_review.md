 Frontend Findings (Sessions 1‑3 scope)

  - Session 1 calls for reusing the editor’s ESLint/Prettier stack, but there is still no ESLint config in the repo—only the scripts
    in bibliography_frontend/package.json:6-17 reference eslint. Without .eslintrc.* the agreed lint rules and plugins from the
    editor project are never enforced.
  - The only global store shipped so far is bibliography_frontend/src/store/ui.store.ts:1-118; Session 1 also asked for
    auth.store.ts (theme/profile/token state), so authentication context is still missing.
  - The shared API client is a handwritten fetch wrapper with a hard-coded x-user-id header (bibliography_frontend/src/common/api/
    client.ts:22-65). The docs require copying the editor’s Axios client with interceptors for auth injection, error normalization,
    and retry hooks, so this implementation violates both the stack requirement and security expectations.
  - Reference typing is inconsistent: bibliography_frontend/src/common/types.ts:3-34 defines a Reference with id, while the React
    Query hook expects _id objects (bibliography_frontend/src/features/library/api/references.queries.ts:4-35). This mismatch
    already leaks into ReferenceTable and will cause type confusion everywhere else.
  - Session 3 explicitly requires a ReferenceCard (TaskCard adaptation) and wiring the details pane to real data. Instead, the
    library view still renders a basic table (bibliography_frontend/src/features/library/components/ReferenceTable.tsx:29-83), and
    AppLayout feeds DetailsPane a fake activeReferenceId (bibliography_frontend/src/components/layout/AppLayout.tsx:27-31). Row
    clicks (ReferenceTable.tsx:42-53) never toggle detailsPaneOpen, so the pane can’t open at all.
  - The React Query layer only exposes list + create mutations (bibliography_frontend/src/features/library/api/
    references.queries.ts:45-80). Update/delete mutations from Session 3 are missing, so Reference CRUD can’t be completed from
    the UI.
  - There are no unit/integration/E2E specs under bibliography_frontend/src/ yet, so the “Manual QA of layout responsiveness + theme
    switching” acceptance criteria for Sessions 1‑3 are not encoded in automated tests.

  Backend Findings (Sessions 1‑3 scope)

  - npm run build currently fails because IReferenceService.list promises an array (bibliography_backend/src/interfaces/
    IReferenceService.ts:44-58), ReferenceService.list returns { references, total } (bibliography_backend/src/services/
    ReferenceService.ts:56-85), and ReferenceController destructures that shape (bibliography_backend/src/controllers/
    ReferenceController.ts:34-56). The interface/implementation/controller need to agree on a single contract before anything
    compiles.
  - The references router already registers import/export/PDF routes (bibliography_backend/src/routes/references.ts:46-75),
    duplicates router registers a refresh endpoint (bibliography_backend/src/routes/duplicates.ts:18-22), and routes/search.ts:1-
    12 tries to resolve a SearchController, but none of those controller methods exist yet. These stubs cause the TypeScript errors
    seen in the failed build and would crash at runtime if hit.
  - Session 2’s Tag model is incomplete: usageCount is missing from the schema (bibliography_backend/src/models/Tag.ts:5-23) even
    though the verification script writes usageCount (bibliography_backend/src/scripts/testModels.ts:72-82). The script will throw
    when Mongoose strips that field, and the backend can’t report tag usage for ordering the nine colored tags.
  - The DI container never binds a SearchController/service (bibliography_backend/src/config/container.ts:15-34), so even once the
    file exists the router will still fail to resolve it.
  - bibliography_backend/tests/unit and bibliography_backend/tests/integration are empty, meaning the Session 1 verification steps
    (health check, model compilation, docker-up sanity) remain manual. There’s also no Jest config targeting those folders.
  - Similar to the frontend, there are no automated smoke tests for the health endpoint or ReferenceService even though the
    checklist calls that out for Week 1.

  Testing Performed

  - npm run build in bibliography_backend/ → ❌ fails with the TypeScript errors described above.
  - npm run build in bibliography_frontend/ → ✅ succeeds (Vite + tsc). No other automated tests are present to run.

  Recommended Next Steps

  1. Align the backend Reference service contract (interface, service return type, controller usage) and either remove or stub out
     the future routes until the controllers exist so the build passes again.
  2. Finish the remaining Session 1‑3 deliverables on the frontend: add the shared ESLint/Prettier configs and auth.store.ts,
     replace the fetch client with the editor Axios wrapper, implement ReferenceCard + detail-pane wiring, and add the missing
     update/delete mutations plus smoke tests so the MVP foundation matches the documentation.