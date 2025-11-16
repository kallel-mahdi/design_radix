---
name: bibliography-planning-docs
description: References comprehensive planning documentation (Spec.md, ComponentsSpec.md, APIDesignSystem.md, session checklists, roadmaps) for bibliography manager implementation. Auto-loads when working on features, components, API endpoints, or discussing implementation. Triggers on component names (ReferenceCard, CollectionTree), features (library, search, duplicates), or planning discussions.
---

# Bibliography Planning Documentation Reference

When implementing features for the bibliography manager, ALWAYS reference the comprehensive planning documentation in `docs/` (start with `docs/INDEX.md`). This skill ensures you stay aligned with the unified spec and session-based workflow.

---

## Pre-Implementation Confidence Workflow

1. **Load context**: Use this planning skill to absorb the active session plan and the relevant docs listed below.
2. **Run `@bibliography-confidence`** immediately afterward. The confidence skill records that you:
   - searched for existing implementations,
   - verified architecture alignment with `CLAUDE.md`,
   - reviewed official docs (Spec, ComponentsSpec, APIDesignSystem, etc.),
   - found working OSS/editor references,
   - confirmed the root cause/problem framing.
3. **Gate execution**: Do not begin coding until the confidence score is ≥0.90. If the score is lower, loop back to clarify specs or research editor/Zotero patterns, then rerun the confidence skill.

---

## Documentation Structure

```
docs/
├── INDEX.md                          # Navigation hub
├── 01-specification/                 # Complete specifications
│   ├── Spec.md                       # Unified frontend + backend spec
│   ├── INTEGRATION.md                # Architecture & integration
│   ├── backend/                      # Backend specs
│   └── frontend/                     # Frontend specs
├── 02-delivery/                      # Implementation roadmap
│   ├── checklist/                    # Session tasks (detailed)
│   │   ├── sessions-01-05.md
│   │   ├── sessions-06-10.md
│   │   ├── sessions-11-15.md
│   │   ├── sessions-16-20.md
│   │   └── future.md
│   └── roadmap/                      # Session goals (high-level)
│       ├── sessions-01-05.md
│       ├── sessions-06-10.md
│       ├── sessions-11-15.md
│       ├── sessions-16-20.md
│       └── future-phases.md
└── sessions/                         # Active session plans
    ├── XX-plan.md                    # Created by /session-plan
    └── completed/                    # Archived by /session-finish
```

---

## Primary Documentation

### 1. Unified Specification
**Location:** `docs/01-specification/Spec.md`

**Read this FIRST for any feature:**
- Frontend Requirements (Components, State Management, Routing)
- Backend Requirements (API endpoints, Database schema, Business logic)
- MVP Feature List (what's in scope)
- Phase 2 & 3 Features (future planning)
- Integration Points (API Gateway, Auth, File storage)
- Open Items (decisions still needed)

**Typical path:**
1. Find your feature in Spec.md
2. Read frontend + backend requirements
3. Check integration points
4. Proceed to component/API-specific docs

---

### 2. Frontend Component Specifications
**Location:** `docs/01-specification/frontend/ComponentsSpec.md`

**Use when creating/modifying React components:**
- **ReferenceCard** - Displays individual reference in list
- **CollectionTree** - Nested collection browser
- **TagSelector** - Multi-select tags (max 9 like Zotero)
- **ReferenceModal** - Create/edit reference form
- **DuplicateDetector** - Duplicate detection UI
- **ImportDialog** - File import interface
- Keyboard shortcuts reference
- Drag-drop specifications

**Example:** "Create ReferenceCard component"
→ Go to ComponentsSpec.md → ReferenceCard section → See props, states, interactions

---

### 3. Design System
**Location:** `docs/01-specification/frontend/DesignSystem.md`

**Use for styling decisions:**
- Color palette (primary, secondary, danger, etc.)
- Typography rules (headings, body text, labels)
- Spacing system (margins, padding)
- CVA variant patterns
- Responsive breakpoints
- Accessibility requirements

**Example:** "What color for archived references?"
→ Go to DesignSystem.md → Colors section → Use `text-gray-500` + `line-through`

---

### 4. API Design & Endpoints
**Location:** `docs/01-specification/backend/APIDesignSystem.md`

**Use when creating/modifying backend routes:**
- Complete endpoint specifications (method, path, auth)
- Request/response schemas
- Error codes and messages
- Pagination patterns
- Filter/sort specifications
- Joi validation rules

**Example:** "Create POST /api/bibliography/references endpoint"
→ Go to APIDesignSystem.md → References section → See exact schema, validation, response format

---

### 5. Session Checklists (Detailed Tasks)
**Location:** `docs/02-delivery/checklist/`

**Use for detailed session planning:**
- [sessions-01-05.md](../../../docs/02-delivery/checklist/sessions-01-05.md) - Foundation & core CRUD
- [sessions-06-10.md](../../../docs/02-delivery/checklist/sessions-06-10.md) - Library view & collections
- [sessions-11-15.md](../../../docs/02-delivery/checklist/sessions-11-15.md) - Search & import/export
- [sessions-16-20.md](../../../docs/02-delivery/checklist/sessions-16-20.md) - Polish & testing
- [future.md](../../../docs/02-delivery/checklist/future.md) - Post-MVP features

Each session has:
- Frontend + Backend tasks integrated
- Dependencies between tasks
- Acceptance criteria
- Estimated time

**Example:** "What should I work on in Session 7?"
→ Go to docs/02-delivery/checklist/sessions-06-10.md → Session 7 → See all tasks

---

### 6. Session Roadmaps (High-Level Goals)
**Location:** `docs/02-delivery/roadmap/`

**For understanding session goals and phasing:**
- [sessions-01-05.md](../../../docs/02-delivery/roadmap/sessions-01-05.md) - Foundation goals
- [sessions-06-10.md](../../../docs/02-delivery/roadmap/sessions-06-10.md) - Library goals
- [sessions-11-15.md](../../../docs/02-delivery/roadmap/sessions-11-15.md) - Search goals
- [sessions-16-20.md](../../../docs/02-delivery/roadmap/sessions-16-20.md) - Polish goals
- [future-phases.md](../../../docs/02-delivery/roadmap/future-phases.md) - Post-MVP phases

---

### 7. Active Session Plans
**Location:** `docs/sessions/`

**Created by:** `/session-plan X` command
**Archived by:** `/session-finish X` command

**Structure:**
- `XX-plan.md` (e.g., `06-plan.md`) - Comprehensive plan for Session X
- Contains: Research findings, architecture decisions, implementation checklist, deviations, DoD
- Moved to `sessions/completed/` after session finishes

**Example:** "Read plan for current session"
→ Check docs/sessions/ for latest XX-plan.md

---

## Reference Documentation

### Backend Specifics
**Location:** `docs/01-specification/backend/`

- **ServiceLayerSpec.md** - Service layer architecture, business logic patterns
- **DatabaseDesign.md** - MongoDB schemas, indexes, performance
- **RecommendedLibraries.md** - Approved libraries for all phases
- **zotero.md** - Zotero implementation notes, duplicate detection algorithm

---

## Session-Based Workflow

**CRITICAL**: All development follows this workflow:

### 1. `/session-plan X`
- Reads `docs/02-delivery/checklist/sessions-XX-XX.md`
- Uses Explore/Plan agents to research Zotero + editor patterns
- Asks clarifying questions
- Creates `docs/sessions/XX-plan.md` after approval

### 2. `/session-execute X`
- Reads `docs/sessions/XX-plan.md`
- Implements backend → checkpoint → frontend
- References `docs/01-specification/` for specs

### 3. `/session-test X`
- Writes comprehensive tests (60/30/10 pyramid)
- References testing strategy

### 4. `/session-finish X`
- Updates CHANGELOG
- Commits with references
- Archives plan to `docs/sessions/completed/`

---

## Quick Decision Tree

```
I'm implementing a feature...

├─ Which session am I on?
│  └─ → docs/02-delivery/checklist/sessions-XX-XX.md
│
├─ What's the session plan?
│  └─ → docs/sessions/XX-plan.md
│
├─ Is it a React component?
│  └─ → docs/01-specification/frontend/ComponentsSpec.md (what props/behavior?)
│     → docs/01-specification/frontend/DesignSystem.md (how to style?)
│
├─ Is it a backend API endpoint?
│  └─ → docs/01-specification/backend/APIDesignSystem.md (what's the spec?)
│     → docs/01-specification/backend/ServiceLayerSpec.md (how to organize logic?)
│
├─ Do I need to understand duplicates?
│  └─ → docs/01-specification/backend/zotero.md (how does it work?)
│
└─ What's the big picture?
   └─ → docs/02-delivery/roadmap/sessions-XX-XX.md (Session goals?)
      → docs/01-specification/Spec.md (MVP vs Phase 2/3?)
```

---

## Priority Order for Feature Implementation

**ALWAYS follow this sequence:**

1. **Run `/session-plan X`**
   - Let workflow guide research and planning
   - Creates comprehensive plan in docs/sessions/

2. **Read docs/sessions/XX-plan.md**
   - Understand research findings
   - Review architecture decisions
   - Follow implementation checklist

3. **Reference docs/01-specification/**
   - Spec.md for feature requirements
   - ComponentsSpec.md for frontend
   - APIDesignSystem.md for backend

4. **Check editor_frontend/backend for patterns**
   - Copy component structure from editor_frontend
   - Copy service patterns from editor_backend

5. **Check Zotero (if reference app feature)**
   - Look in zotero/chrome/content/zotero/
   - See how they solved the problem
   - Reference docs/01-specification/backend/zotero.md

6. **Code & Test**
   - Follow patterns from guidelines skills
   - Use examples from planning docs
   - Write comprehensive tests

7. **Run `/session-finish X`**
   - Updates CHANGELOG
   - Commits with references
   - Archives plan

---

## When You're Stuck

**I don't know what to implement next**
→ docs/02-delivery/checklist/sessions-XX-XX.md → Find current session → Follow tasks in order

**I don't know how to implement X component**
→ docs/01-specification/frontend/ComponentsSpec.md → Find component → Read spec → Check editor_frontend for pattern

**I don't know the API contract**
→ docs/01-specification/backend/APIDesignSystem.md → Find endpoint → See schema, validation, error codes

**I don't understand how duplicate detection should work**
→ docs/01-specification/backend/zotero.md → Read algorithm section

**I need to understand the big picture**
→ docs/01-specification/Spec.md → MVP section → See all core features and how they interact

**I need styling guidance**
→ docs/01-specification/frontend/DesignSystem.md → Find relevant section (colors, spacing, components)

**Where is the current session plan?**
→ docs/sessions/ → Look for latest XX-plan.md

---

## Key Principles

- ✅ docs/01-specification/Spec.md is the source of truth
- ✅ Follow session workflow: /session-plan → /session-execute → /session-test → /session-finish
- ✅ Session plans in docs/sessions/ guide implementation
- ✅ docs/02-delivery/checklist/ has detailed tasks per session
- ✅ docs/02-delivery/roadmap/ has high-level goals per session range
- ✅ ComponentsSpec.md and APIDesignSystem.md are binding contracts
- ✅ Always check dependencies before starting a feature
- ✅ Reference editor_frontend/backend for implementation patterns
- ✅ Reference Zotero for UX/algorithm inspiration
- ✅ Keep all docs updated as decisions evolve

---

## Related Skills

- **bibliography-backend-guidelines** - Implementation patterns for backend
- **bibliography-frontend-guidelines** - Implementation patterns for frontend
- **bibliography-testing-skill** - Testing conventions and structure
- **skill-developer** - How to create and manage skills

---

**Last Updated**: 2025-11-11
**Status**: Unified documentation structure complete
**Next**: Run `/session-plan X` to start next session
