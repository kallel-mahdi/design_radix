---
name: bibliography-planning-docs
description: References comprehensive planning documentation (Spec.md, ComponentsSpec.md, APIDesignSystem.md, Roadmap.md, UnifiedImplementationChecklist.md) for bibliography manager implementation. Auto-loads when working on features, components, API endpoints, or discussing implementation. Triggers on component names (ReferenceCard, CollectionTree), features (library, search, duplicates), or planning discussions.
---

# Bibliography Planning Documentation Reference

When implementing features for the bibliography manager, ALWAYS reference the comprehensive planning documentation. This skill ensures you stay aligned with the unified spec and don't duplicate work.

---

## Primary Documentation

### 1. Unified Specification
**Location:** `/home/mahdi/Desktop/bibliography/bibliography_plan/Spec.md`

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
**Location:** `/home/mahdi/Desktop/bibliography/bibliography_plan/frontend_plan/ComponentsSpec.md`

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
**Location:** `/home/mahdi/Desktop/bibliography/bibliography_plan/frontend_plan/DesignSystem.md`

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
**Location:** `/home/mahdi/Desktop/bibliography/bibliography_plan/backend_plan/APIDesignSystem.md`

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

### 5. Implementation Checklist
**Location:** `/home/mahdi/Desktop/bibliography/bibliography_plan/UnifiedImplementationChecklist.md`

**Use for session planning:**
- 20 sessions with specific tasks
- Frontend + Backend tasks integrated
- Dependencies between tasks
- Acceptance criteria for each task
- Estimated time per task

**Example:** "What should I work on in Session 3?"
→ Go to UnifiedImplementationChecklist.md → Session 3 → See all frontend + backend tasks with dependencies

---

### 6. Development Roadmap
**Location:** `/home/mahdi/Desktop/bibliography/bibliography_plan/Roadmap.md`

**For understanding phasing:**
- MVP features (Sessions 1-10)
- Phase 2 features (Sessions 11-15)
- Phase 3 features (Sessions 16-20)
- Dependencies between phases
- Timeline and priorities

---

## Reference Documentation

### Backend Specifics
**Location:** `/home/mahdi/Desktop/bibliography/bibliography_plan/backend_plan/`

- **ServiceLayerSpec.md** - Service layer architecture, business logic patterns
- **zotero.md** - Zotero implementation notes, duplicate detection algorithm
- **CLAUDE.md** - Backend-specific context and patterns

---

### Frontend Specifics
**Location:** `/home/mahdi/Desktop/bibliography/bibliography_plan/frontend_plan/`

- **CLAUDE.md** - Frontend-specific context and patterns

---

## Quick Decision Tree

```
I'm implementing a feature...

├─ Is it a React component?
│  └─ → ComponentsSpec.md (what props/behavior?)
│     → DesignSystem.md (how to style?)
│
├─ Is it a backend API endpoint?
│  └─ → APIDesignSystem.md (what's the spec?)
│     → ServiceLayerSpec.md (how to organize logic?)
│
├─ Do I need to understand duplicates?
│  └─ → backend_plan/zotero.md (how does it work?)
│
├─ What should I work on next?
│  └─ → UnifiedImplementationChecklist.md (Session #?)
│
└─ What's the big picture?
   └─ → Roadmap.md (Phase timeline?)
      → Spec.md (MVP vs Phase 2/3?)
```

---

## Examples by Feature

### Implementing Library Feature (ReferenceCard, CollectionTree)
1. **Planning:** Spec.md → "Library" section
2. **Components:** ComponentsSpec.md → ReferenceCard, CollectionTree
3. **Styling:** DesignSystem.md → Colors, spacing, card variants
4. **API:** APIDesignSystem.md → GET /references, POST /collections
5. **Business Logic:** backend_plan/ServiceLayerSpec.md
6. **Session Tasks:** UnifiedImplementationChecklist.md → Find which sessions cover library

### Implementing Duplicate Detection
1. **Overall Requirements:** Spec.md → "Duplicate Detection" section
2. **Frontend UI:** ComponentsSpec.md → DuplicateDetector component
3. **Algorithm:** backend_plan/zotero.md → How Zotero detects duplicates
4. **API Endpoints:** APIDesignSystem.md → Duplicate endpoints
5. **Services:** backend_plan/ServiceLayerSpec.md → Duplicate detection service
6. **Sessions:** UnifiedImplementationChecklist.md → Sessions 5-6 (duplicate detection)

### Implementing Import Feature
1. **Requirements:** Spec.md → "Import/Export" section
2. **Frontend UI:** ComponentsSpec.md → ImportDialog component
3. **Form Validation:** APIDesignSystem.md → Import endpoint validation
4. **Backend Processing:** backend_plan/ServiceLayerSpec.md → Import service
5. **Error Handling:** APIDesignSystem.md → Import error codes
6. **Sessions:** UnifiedImplementationChecklist.md → Session 7 (import)

---

## Priority Order for Feature Implementation

**ALWAYS follow this sequence:**

1. **Read Spec.md** (feature requirements section)
   - Understand MVP vs future phases
   - Check dependencies on other features

2. **Read component/endpoint-specific doc**
   - ComponentsSpec.md for frontend
   - APIDesignSystem.md for backend
   - Both for integrated features

3. **Check editor_frontend/backend for patterns**
   - Copy component structure from editor_frontend
   - Copy service patterns from editor_backend

4. **Check Zotero (if reference app feature)**
   - Look in zotero/chrome/content/zotero/
   - See how they solved the problem

5. **Code & Test**
   - Follow patterns from guidelines skills
   - Use examples from planning docs
   - Write comprehensive tests

6. **Update relevant session in UnifiedImplementationChecklist.md**
   - Mark task as complete
   - Document decisions made
   - Note blockers if any

---

## When You're Stuck

**I don't know what to implement next**
→ UnifiedImplementationChecklist.md → Find current session → Follow tasks in order

**I don't know how to implement X component**
→ ComponentsSpec.md → Find component → Read spec → Check editor_frontend for pattern

**I don't know the API contract**
→ APIDesignSystem.md → Find endpoint → See schema, validation, error codes

**I don't understand how duplicate detection should work**
→ backend_plan/zotero.md → Read algorithm section

**I need to understand the big picture**
→ Spec.md → MVP section → See all core features and how they interact

**I need styling guidance**
→ DesignSystem.md → Find relevant section (colors, spacing, components)

---

## Key Principles

- ✅ Spec.md is the source of truth
- ✅ ComponentsSpec.md and APIDesignSystem.md are binding contracts
- ✅ Always check dependencies before starting a feature
- ✅ Reference editor_frontend/backend for implementation patterns
- ✅ Reference Zotero for UX/algorithm inspiration
- ✅ Follow UnifiedImplementationChecklist.md sessions strictly
- ✅ If doc is unclear, note it as "Open Item" in Roadmap.md
- ✅ Keep all docs updated as decisions evolve

---

## Related Skills

- **bibliography-backend-guidelines** - Implementation patterns for backend
- **bibliography-frontend-guidelines** - Implementation patterns for frontend
- **skill-developer** - How to create and manage skills

---

**Last Updated**: 2025-01-09
**Status**: Reference documentation complete
**Next**: Start Session 1 per UnifiedImplementationChecklist.md
