# Project Status

**Last Updated**: 2025-01-09
**Current Session**: Session 3 (Infrastructure & Polish) - Complete
**Next Session**: Session 4 (Main Layout Implementation)

---

## Overview

The Bibliography Manager frontend is in active development. We've completed foundational infrastructure (Sessions 1-2) and essential polish items (Session 3). The application has a solid foundation with proper state management, API integration, and testing infrastructure.

---

## Completed Sessions

### ✅ Session 1: Project Setup & Core Infrastructure
- [x] Vite + React 19 + TypeScript setup
- [x] TanStack Router (file-based routing)
- [x] Zustand stores (auth, UI, library)
- [x] TanStack React Query integration
- [x] Tailwind CSS v4 configuration
- [x] Basic UI primitives
- [x] API client with token refresh
- [x] Error handling & toast system

### ✅ Session 2: Reference Management Foundation
- [x] Reference CRUD operations
- [x] Collection tree structure
- [x] Tag system
- [x] ReferenceCard component
- [x] ReferenceList component
- [x] Comprehensive test suite (76 tests)

### ✅ Session 3: Infrastructure & Polish
**Session 3B: Core Infrastructure**
- [x] ErrorBoundary component with proper TypeScript overrides
- [x] Optimized React Query configuration
- [x] Panel width persistence hook
- [x] Essential utility functions (5 total)
- [x] Application constants (no magic numbers)
- [x] Fixed auth store `setTokens` signature
- [x] Reverted half-baked Zod work (schemas kept for Step 3)

**Session 3C: Loading States**
- [x] Generic Skeleton component
- [x] ReferenceCardSkeleton component

**Session 3D: Documentation**
- [x] CHANGELOG.md created
- [x] STATUS.md created (this file)

---

## Current State

### Test Coverage
- **Total Tests**: 76 passing
- **Test Files**: 6
- **Coverage**: >80% for critical paths
- **Test Types**: Unit, integration, component

### Code Quality
- ✅ TypeScript strict mode
- ✅ ESLint + Prettier
- ✅ No defensive coding (per user preference)
- ✅ Centralized constants
- ✅ Type-safe mutations
- ✅ Proper error boundaries

### Infrastructure
- ✅ API client with automatic token refresh
- ✅ Query caching (5min stale, 10min GC)
- ✅ Panel persistence via localStorage
- ✅ Loading skeletons
- ✅ Toast notifications

---

## Next Steps (Session 4)

### Main Layout Implementation
1. **Create resizable 3-panel layout** (30 min)
   - Sidebar (collections tree)
   - Main content (reference list)
   - Detail panel (reference details)
   - Use react-resizable-panels with persistence hook

2. **Build CollectionTree component** (1 hour)
   - Recursive tree rendering
   - Expand/collapse state
   - Selection state
   - Keyboard navigation

3. **Build ReferenceDetailPanel component** (1 hour)
   - Display full reference metadata
   - Edit mode toggle
   - PDF viewer integration
   - Tag management

4. **Integrate components into layout** (30 min)
   - Wire up state management
   - Handle selection/navigation
   - Test responsive behavior

---

## Pending Work

### Phase 1 MVP (Current Focus)
- [ ] Main 3-panel layout
- [ ] Collection tree component
- [ ] Reference detail panel
- [ ] Search functionality
- [ ] Import from DOI
- [ ] Export to BibTeX
- [ ] PDF upload & viewer
- [ ] Duplicate detection

### Phase 2 (Future)
- [ ] Manual reference ordering
- [ ] Advanced search filters
- [ ] Offline support
- [ ] Custom PDF viewer (react-pdf)
- [ ] Bulk operations
- [ ] Citation formatting

### Phase 3 (Future)
- [ ] Shared collections
- [ ] Collaboration features
- [ ] Editor integration
- [ ] Activity tracking
- [ ] Advanced analytics

---

## Known Issues

None currently blocking development.

---

## Technical Decisions

### Zod Validation Strategy
- **Current**: Frontend validates with TypeScript types only
- **Future (Step 3)**: Full migration to shared Zod schemas (frontend + backend)
- **Rationale**: Single source of truth, type-safe across stack, saves 4-10 hours long-term

### Testing Philosophy
- **Comprehensive coverage** for critical paths (>80%)
- **Meaningful assertions** (check actual arguments, not just "toHaveBeenCalled()")
- **No test hacking** (caught and fixed in Session 3B)

### Code Style
- **No defensive coding** per user preference
- **Trust TypeScript types** (use non-null assertions where safe)
- **Centralized constants** to avoid magic numbers
- **Clean, minimal code** without paranoid error handling

---

## File Structure

```
src/
├── common/
│   ├── api/
│   │   └── client.ts           # API client with token refresh
│   ├── config/
│   │   └── reactQuery.ts       # Query client configuration
│   ├── hooks/
│   │   ├── usePanelPersistence.ts  # Panel width persistence
│   │   └── index.ts
│   ├── constants.ts            # Application constants
│   ├── schemas.ts              # Zod schemas (for future Step 3)
│   ├── types.ts                # TypeScript types
│   └── utils.ts                # Utility functions
├── components/
│   ├── layout/
│   ├── ui/
│   │   ├── Skeleton.tsx        # Loading skeleton
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   └── ErrorBoundary.tsx       # Error boundary
├── features/
│   └── library/
│       ├── api/
│       │   ├── references.queries.ts
│       │   └── __tests__/
│       ├── components/
│       │   ├── ReferenceCard.tsx
│       │   ├── ReferenceCardSkeleton.tsx
│       │   ├── ReferenceList.tsx
│       │   └── __tests__/
│       └── store/
│           ├── library.store.ts
│           └── __tests__/
├── store/
│   ├── auth.store.ts           # Auth state + actions
│   ├── ui.store.ts             # UI state (toasts, modals)
│   └── __tests__/
└── styles/
    └── tailwind.css
```

---

## Commands

```bash
# Development
npm run dev                     # Start dev server

# Building
npm run build                   # TypeScript check + Vite build

# Testing
npm run test:unit               # Run Vitest unit tests
npm run test:e2e                # Run Playwright E2E tests (future)

# Linting
npm run lint                    # ESLint check
npm run format                  # Prettier format
```

---

## Dependencies

**Core**:
- React 19
- TypeScript 5.7
- Vite 6.3

**State Management**:
- Zustand 5.0
- TanStack React Query 5.64

**Routing**:
- TanStack Router 1.94

**Styling**:
- Tailwind CSS 4.1
- clsx + tailwind-merge (for cn utility)

**UI**:
- @headlessui/react (accessible components)
- @heroicons/react (icons)
- react-resizable-panels (layout)

**Forms & Validation**:
- react-hook-form
- Zod

**Testing**:
- Vitest
- React Testing Library
- Playwright (future E2E)

---

## Notes

- **Architecture**: Following editor_frontend patterns (Button, Card, API client)
- **Testing**: 76 tests passing, comprehensive coverage
- **Type Safety**: Strict TypeScript, proper mutation types
- **Performance**: Optimized query config (5min stale, 1 retry)
- **UX**: Loading skeletons, error boundaries, toast notifications
