# Bibliography Manager Project - Context for AI Agents

## Project Overview

You are working on a **bibliography manager** - part of a larger research ecosystem that combines the collaborative power of Overleaf with the organizational capabilities of Zotero. Think of it as building a modern, elegant alternative to Zotero that will eventually integrate with a collaborative LaTeX editor.

**Vision**: Overleaf + Zotero combined, but more elegant and tightly integrated.

**Current Status**: MVP development - standalone bibliography manager that will later integrate with the collaborative editor.

> **Reuse hierarchy**: (1) copy patterns from `editor_frontend` / `editor_backend`, (2) mirror Zotero’s proven UX/algorithms, (3) write net-new code only when neither exists. Document deviations inline when you diverge.

---

## Team Structure & Your Role

**The Team**:
- **Editor Team**: Your friends are building the collaborative LaTeX editor (frontend + backend)
- **You (Bibliography Team)**: Building the bibliography manager (frontend + backend)
- **Your Background**: PhD student in ML with basic software engineering knowledge

**Important Context**:
- You are NOT a professional developer - the documentation is written to be beginner-friendly
- Your team will handle the eventual integration with the editor
- You can copy/reuse anything from the editor codebase
- Always check Zotero's implementation for reference (they've solved these problems before)

---

## Project Structure

```
/home/mahdi/Desktop/bibliography/                # Single monorepo (pnpm workspace)
│
├── bibliography_backend/        # Backend service (no .git)
│   ├── src/
│   │   ├── controllers/         # Express request handlers
│   │   ├── models/              # Mongoose schemas
│   │   ├── routes/              # Express routes
│   │   ├── services/            # Business logic
│   │   ├── middleware/          # Auth, validation, errors
│   │   └── utils/               # Helpers, logger
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── package.json
│   └── docker-compose.yml
│
├── bibliography_frontend/       # Frontend app (no .git)
│   ├── src/
│   │   ├── features/            # Feature modules
│   │   │   ├── library/
│   │   │   ├── search/
│   │   │   ├── projects/
│   │   │   └── duplicates/
│   │   ├── components/          # Reusable components
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   ├── store/               # Zustand stores
│   │   ├── routes/              # TanStack Router
│   │   ├── common/              # Shared utilities
│   │   └── styles/              # Tailwind CSS
│   ├── e2e/                     # Playwright E2E tests
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── shared/                      # @bibliography/shared package
│   ├── src/
│   │   ├── types/               # TypeScript interfaces
│   │   ├── schemas/             # Zod validation schemas
│   │   └── utils/               # Shared utilities
│   └── package.json
│
├── editor_frontend/             # REFERENCE - Editor's React frontend (submodule)
├── editor_backend/              # REFERENCE - Editor's backend (submodule)
├── zotero/                      # REFERENCE - Zotero source code (submodule)
│
├── docs/                        # Project documentation
│   ├── 01-specification/        # Specs (frontend + backend)
│   ├── 02-delivery/             # Session roadmap + checklist
│   └── sessions/                # Session plans and reviews
│
├── .git/                        # Single monorepo git history
├── pnpm-workspace.yaml          # pnpm workspace configuration
└── package.json                 # Root workspace config
```

**Repository**: `https://github.com/Citable-io/bibliography`
**Type**: Single monorepo with pnpm workspaces
**Git History**: Unified history across all packages (Sessions 6-10+)

---

## Architecture Principles

### 1. **Monorepo with pnpm Workspaces**

**STRUCTURE**: Single git repository with separate frontend/backend packages (not separate repos).

```
bibliography/                           # Single monorepo
├── bibliography_backend/                # Backend package (@bibliography/backend)
├── bibliography_frontend/               # Frontend package (@bibliography/frontend)
├── shared/                              # Shared types/schemas (@bibliography/shared)
├── pnpm-workspace.yaml                  # Defines workspace packages
└── .git/                                # Single git history
```

**Benefits of this approach**:
- ✅ Single git history: Atomic commits across frontend/backend/shared
- ✅ Zero-friction type sharing: Changes to shared types immediately visible
- ✅ Simple development: `pnpm install` at root installs all workspaces
- ✅ Workspace protocol: `workspace:*` dependencies prevent version mismatches
- ✅ Separate deployment: Each package can be deployed independently
- ✅ Matches pnpm best practices: Monorepo for tight coupling during MVP

**No separate folders needed**:
- ❌ **WRONG**: `/home/mahdi/Desktop/bibliography/src/` (mixed frontend/backend)
- ✅ **CORRECT**: All packages coexist in single repo with pnpm workspaces

### 2. **Microservices Pattern** (Backend)

The editor uses microservices architecture:
- `auth-service` - User authentication (JWT)
- `document-service` - Document CRUD + file storage
- `latex-service` - LaTeX compilation → PDF
- `bibliography-service` - **YOUR SERVICE**
- `api-gateway` - Routes requests, handles auth

**Your bibliography-service**:
- Standalone service (can run independently)
- Communicates with other services via API Gateway
- Trusts gateway auth headers (no JWT validation in service itself)
- Uses MongoDB (like other services)

### 3. **Tech Stack Constraints**

**YOU MUST MATCH THE EDITOR'S TECH STACK**:

**Frontend**:
- React 19 + TypeScript
- Vite (build tool)
- TanStack Router (routing)
- Zustand (state management)
- TanStack React Query (server state)
- Tailwind CSS + CVA (styling)
- react-hook-form + Zod (forms)
- @headlessui/react (accessible components)
- @heroicons/react (icons)
- Vitest + Playwright (testing)

**Backend**:
- Node.js 22+
- Express + TypeScript
- Mongoose (MongoDB ODM)
- Winston (logging)
- Multer (file uploads)
- Zod (validation - shared with frontend)
- Jest or Vitest (testing)

**Why**: Team consistency, code sharing, future integration, no surprises.

---

## CRITICAL UPDATE: Editor Frontend Patterns

⚠️ **IMPORTANT**: The editor_frontend does NOT have a "task-management" feature with TaskCard/TaskModal components. References to copying task-management patterns in this document (and ComponentsSpec.md) are outdated.

**ACTUAL PATTERNS TO COPY FROM EDITOR**:
- ✅ **UI Primitives**: Button, Card, Input, Modal in `src/components/ui/`
- ✅ **Zustand Stores**: `src/store/ui.store.ts` (with devtools middleware)
- ✅ **API Client**: `src/common/api/client.ts` (fetch-based, NOT axios)
- ✅ **React Query Setup**: `src/features/*/api/` folder structure
- ✅ **Router Setup**: TanStack Router with file-based routes
- ✅ **Styling**: Tailwind v4 with CSS custom properties in `src/styles/tailwind.css`
- ✅ **GlobalCursor**: Custom cursor component in `src/components/ui/GlobalCursor.tsx`

**DO NOT copy**:
- ❌ TaskCard, TaskModal (these don't exist - they're placeholders in old plans)
- ❌ LaTeX editor patterns (editor-specific, not relevant to bibliography)
- ❌ Collaboration features (Phase 2+, not MVP)

---

## Code Reuse Strategy

### Priority Order for Implementation

When implementing ANY feature:

**1. CHECK EDITOR FIRST** (highest priority)
- Look in `editor_frontend/src/` for similar patterns
- Copy UI primitives from `src/components/ui/` (Button, Card, Input, Modal)
- Copy Zustand store patterns from `src/store/` (see devtools middleware)
- Copy API client from `src/common/api/client.ts` (fetch-based, not axios)
- Copy form validation patterns from existing forms
- **Document in code**: `// Adapted from editor_frontend pattern`

**2. CHECK ZOTERO SECOND** (reference implementation)
- Look in `zotero/chrome/content/zotero/` for UI/UX patterns
- Look in `zotero/chrome/content/zotero/xpcom/` for backend logic
- Understand their duplicate detection algorithm
- See how they handle imports/exports
- Learn from their trash/restore system
- **Document deviations**: If we do it differently, explain why in code comments

**3. BUILD NEW ONLY IF NECESSARY** (last resort)
- If neither editor nor Zotero has it, build from scratch
- Follow patterns established in Spec.md and ComponentsSpec.md
- Write comprehensive tests (we own this code)

### What to Copy Directly from Editor

**Frontend**:
- ✅ UI Primitives: Button, Card, Input, Modal from `src/components/ui/`
- ✅ Zustand store patterns: `src/store/ui.store.ts` (with devtools middleware!)
- ✅ API client: Fetch-based class from `src/common/api/client.ts` (NOT axios)
- ✅ React Query setup: `src/features/*/api/` folder structure
- ✅ Form validation: react-hook-form + Zod patterns
- ✅ CVA variant patterns: See Button.tsx and other primitives
- ✅ Layout patterns: `src/components/layout/` (Sidebar, etc.)
- ✅ GlobalCursor: Custom cursor component (copy to bibliography)

**Backend**:
- ✅ Winston logger setup
- ✅ Mongoose connection pattern
- ✅ Trust gateway auth middleware
- ✅ Error handling middleware
- ✅ Multer file upload configuration
- ✅ Zod validation schemas (in @bibliography/shared package)
- ✅ Health check route pattern

### What to Reference from Zotero

**Frontend**:
- 📖 Keyboard shortcuts (see ComponentsSpec.md for full map)
- 📖 Tag selector UI (9 max colored tags)
- 📖 Collection tree (expand/collapse, nested structure)
- 📖 Duplicate card layout (two-column comparison)
- 📖 Trash bin behavior (soft delete + restore)
- 📖 Confirmation dialog patterns

**Backend**:
- 📖 Duplicate detection algorithm (ISBN → DOI → Title+Creator)
- 📖 Database schema inspiration (but use MongoDB not SQLite)
- 📖 Import/export translators (we use simpler approach)
- 📖 Search implementation (they use SQLite FTS, we use MongoDB text index)

---

## Development Workflow

Use the **session-based workflow** for all feature development:

1. **Plan**: `/session-plan X` - Research (Zotero + editor + WebSearch), clarify ambiguities, create plan document
2. **Execute**: `/session-execute X` - Implement backend + frontend with checkpoint between phases
3. **Test**: `/session-test X` - Write comprehensive tests (optional timing: before or after implementation)
4. **Finish**: `/session-finish X` - Update documentation, commit with references, archive plan

Each session follows: Research → Clarify → Plan → Implement → Test → Document → Commit

See `.claude/commands/session-*.md` for detailed workflow steps.

---

## Skills Usage (CRITICAL)

**Skills auto-suggest based on context**:
- `bibliography-planning-docs` - Activates when implementing features, components, or endpoints
- `bibliography-frontend-guidelines` - Activates when working on frontend code (components, pages, styling)
- `bibliography-backend-guidelines` - Activates when working on backend code (routes, controllers, services)
- `skill-developer` - Activates when discussing skill system or hooks

The skill activation system analyzes your prompts and project files to suggest relevant skills automatically. You don't need to manually invoke them—they'll appear when contextually appropriate based on keywords and file patterns.

---

## Critical Context: Differences from Zotero

Our implementation differs from Zotero in these ways (ALWAYS DOCUMENT IN CODE):

1. **Automatic Duplicate Detection**: We detect on import, Zotero requires manual trigger
2. **Single PDF per Reference**: MVP constraint, Zotero supports multiple attachments
3. **Manual Reference Ordering**: Phase 2 feature, not MVP (Zotero has this in MVP)
4. **No Offline Support**: MVP is online-only, offline in Phase 2
5. **Collections User-Scoped**: MVP, Zotero has group libraries from start
6. **Browser Native PDF Viewer**: MVP uses iframe, Phase 2 uses react-pdf (Zotero has custom viewer)
7. **Web-Based**: We're building web app, Zotero is Electron desktop app

---

## Common Tasks & Where to Look

### "Implement a new component"
1. Read `docs/01-specification/Spec.md` (section 2: Frontend Requirements)
2. Read `docs/01-specification/frontend/ComponentsSpec.md` (find component spec)
3. Check `editor_frontend/src/components/ui/` for UI primitives (Button, Card, Input, Modal)
4. Copy structure and CVA patterns, adapt for bibliography domain
5. Check `docs/01-specification/frontend/DesignSystem.md` for colors, spacing, variants (Tailwind v4 CSS vars)
6. Write tests (see `docs/02-delivery/checklist/` Session 19 tasks)

### "Add a new API endpoint"
1. Read `docs/01-specification/Spec.md` (section 3: Backend Requirements + section 6: Integration Points)
2. Read `docs/01-specification/backend/APIDesignSystem.md` (endpoint details)
3. Check `editor_backend/services/document-service/src/routes/` for route patterns
4. Check `editor_backend/services/auth-service/src/controllers/` for controller patterns
5. Implement in `bibliography-service/src/`
6. Write tests (unit + integration)

### "Implement Zotero feature X"
1. Check if it's in MVP scope (`docs/01-specification/Spec.md` sections 2 & 3)
2. If in scope, check Zotero implementation: `zotero/chrome/content/zotero/` or `zotero/chrome/content/zotero/xpcom/`
3. Read `docs/01-specification/backend/zotero.md` for algorithm details
4. Adapt to our tech stack (React not XUL, MongoDB not SQLite)
5. Document any deviations

### "Set up a new service/module"
1. Copy structure from existing editor service
2. Update `package.json` dependencies to match
3. Copy logger setup, error handling, DB connection
4. Add to docker-compose.yml (if backend)

---

## File Organization Rules

### Frontend Structure (when you create it)

```
bibliography_frontend/
├── src/
│   ├── features/              # Feature-based organization (COPY FROM EDITOR)
│   │   ├── library/
│   │   ├── search/
│   │   ├── projects/
│   │   └── duplicates/
│   ├── components/
│   │   ├── layout/
│   │   └── ui/
│   ├── store/                 # Global Zustand stores
│   ├── routes/                # TanStack Router
│   ├── common/
│   │   ├── api/
│   │   ├── types.ts
│   │   └── utils.ts
│   └── styles/
│       └── tailwind.css
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

### Backend Structure (when you create it)

```
bibliography_backend/
├── src/
│   ├── controllers/           # Request handlers
│   ├── models/                # Mongoose schemas
│   ├── routes/                # Express routes
│   ├── services/              # Business logic
│   ├── middleware/            # Auth, validation, errors
│   ├── utils/                 # Helpers, logger
│   └── index.ts               # App entry point
├── tests/
│   ├── unit/
│   └── integration/
├── package.json
├── tsconfig.json
├── .env.example
└── Dockerfile
```

---

## Environment & Setup

### Editor Setup (for reference)

**Frontend**: `editor_frontend/`
- Dev: `npm run dev` (Vite dev server)
- Build: `npm run build`
- Test: `npm run test` (Vitest)
- E2E: `npx playwright test`

**Backend**: `editor_backend/`
- Dev: `docker-compose up` (all services)
- Or individual service: `cd services/auth-service && npm run dev`
- Test: `npm run test`

### Bibliography Monorepo Setup (Complete ✅)

**Repository**: https://github.com/Citable-io/bibliography

**Structure**: Single monorepo with pnpm workspaces
- `bibliography_backend/` - Backend Express service
- `bibliography_frontend/` - Frontend React app
- `shared/` - Shared types (@bibliography/shared)

**Development Setup**:

```bash
# Clone
git clone https://github.com/Citable-io/bibliography
cd bibliography

# Install all workspaces
pnpm install

# Run all services
pnpm dev                    # Starts all dev servers in parallel

# Or individual services
pnpm --filter @bibliography/backend dev
pnpm --filter @bibliography/frontend dev
```

**Environment Variables** (from Spec.md):
```env
# Frontend (bibliography_frontend/.env)
VITE_API_BASE_URL=http://localhost:8005/api/bibliography

# Backend (bibliography_backend/.env)
MONGODB_URL=mongodb://localhost:27017/bibliography
PORT=8005
NODE_ENV=development
```

**pnpm Workspace Commands**:
```bash
pnpm -r list                # List all packages
pnpm --filter @bibliography/backend build
pnpm --filter @bibliography/frontend build
pnpm build                  # Build all packages
pnpm test                   # Test all packages
pnpm lint                   # Lint all packages
```

---

## Testing Requirements

### Frontend (Comprehensive - see ImplementationChecklist Session 19)
- **Unit**: Utils, hooks, stores (Vitest)
- **Integration**: Component workflows (React Testing Library)
- **E2E**: Critical paths (Playwright)
- **Coverage**: >80% for critical paths

### Backend
- **Unit**: Services, utils (Jest/Vitest)
- **Integration**: API endpoints (Supertest)
- **Coverage**: >80% for core logic

---

## Key Contacts / Documentation

**Primary Documentation** (Unified):
- **Spec.md** (`docs/01-specification/Spec.md`) - Complete frontend + backend specification
- **Roadmap folder** (`docs/02-delivery/roadmap/`) - Phased development timeline (MVP → Phase 3)
- **Session checklists** (`docs/02-delivery/checklist/`) - 20 sessions with detailed tasks
- **RecommendedLibraries.md** (`docs/01-specification/backend/RecommendedLibraries.md`) - Library guide for all phases

**Frontend-Specific Documentation**:
- Component specs → `docs/01-specification/frontend/ComponentsSpec.md`
- Design tokens → `docs/01-specification/frontend/DesignSystem.md`
- Frontend context → `docs/01-specification/frontend/CLAUDE.md`

**Backend-Specific Documentation**:
- API details → `docs/01-specification/backend/APIDesignSystem.md`
- Service layer → `docs/01-specification/backend/ServiceLayerSpec.md`
- Zotero reference → `docs/01-specification/backend/zotero.md`
- Backend context → `docs/01-specification/backend/CLAUDE.md`

**For Clarification**:
- Open questions → See Spec.md section 6 (Open Items)
- Integration points → See Spec.md section 5 (Integration Points)

**Zotero Reference**:
- Data models → `zotero/resource/schema/userdata.sql`
- UI patterns → `zotero/chrome/content/zotero/`
- Backend logic → `zotero/chrome/content/zotero/xpcom/`

**Editor Patterns**:
- UI components → `editor_frontend/src/components/ui/` (Button, Card, Input, Modal with CVA)
- Zustand stores → `editor_frontend/src/store/` (with devtools middleware)
- API client → `editor_frontend/src/common/api/client.ts` (fetch-based)
- Backend patterns → `editor_backend/services/` (logger, error handling, validation)

---

## Coding Philosophy

From user's global `.claude/CLAUDE.md`:
> "Can you remove the unnecessary defensive coding? You own the code it's your job to make sure every function receives the right input gives right output."

**Translation for AI Agents**:
- ✅ Trust TypeScript types (don't add runtime checks for typed data)
- ✅ Use Zod only at system boundaries (API requests, user input)
- ✅ Focus on correct logic, not paranoid error handling
- ✅ Write clean, minimal code
- ❌ Don't add `if (!x) throw new Error()` for every parameter
- ❌ Don't check types at runtime if TypeScript already enforces them

---

## Quick Start Checklist

When starting a new task:
- [ ] **INVOKE SKILLS** (planning-docs always, + frontend/backend guidelines)
- [ ] Read `docs/01-specification/Spec.md` (relevant section)
- [ ] Read the current session checklist in `docs/02-delivery/checklist/`
- [ ] Search editor codebase for similar pattern
- [ ] Check Zotero if UI/UX question (see `docs/01-specification/backend/zotero.md`)
- [ ] Copy pattern, adapt to bibliography domain
- [ ] Write tests (follow `docs/02-delivery/checklist/` Session 19 tasks)
- [ ] Document any deviations from Zotero

---

## Important Reminders

1. **USE monorepo structure**: Front/backend are separate packages in single repo, not separate folders
   - Shared types via `@bibliography/shared` workspace package
   - Use `workspace:*` protocol for dependencies
   - Make atomic commits across packages
2. **ALWAYS check editor first** before implementing anything
3. **ALWAYS document** when you deviate from Zotero's approach
4. **NEVER skip tests** (comprehensive coverage required)
5. **MATCH editor tech stack exactly** (no substitutions without approval)
6. **KEEP code simple** (no unnecessary defensive checks, trust types)

---

**Last Updated**: 2025-01-17
**Status**: Monorepo complete, pushed to GitHub
**Repository**: https://github.com/Citable-io/bibliography
**Next Steps**:
1. Clone from GitHub: `git clone https://github.com/Citable-io/bibliography`
2. Install: `pnpm install` (installs all workspaces)
3. Develop: `pnpm dev` (starts frontend and backend)
