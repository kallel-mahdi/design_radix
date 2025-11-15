# Roadmap — Sessions 01-05 (Week 1: Foundation & Setup)

**Last Updated**: 2025-01-08
**Status**: Unified roadmap (Frontend + Backend)

---

## Overview

This roadmap outlines the phased development timeline for the complete bibliography manager (frontend + backend). Development is organized into 4 phases, prioritizing core functionality (MVP) before adding advanced features and production polish.

**Total Estimated Time**: 11-12 weeks (full-time equivalent)

---

## Phase 0: MVP — Core Bibliography Management

**Duration**: 4 weeks
**Frontend**: 165-200 hours | **Backend**: 80-120 hours | **Total**: 245-320 hours

**Goal**: Deliver a functional bibliography manager with essential features for reference management, organization, and basic import/export.

**Target Users**: Individual researchers who need to manage references, organize them in collections, and export to BibTeX for LaTeX documents.

**Success Criteria**:
- Can import references via DOI, BibTeX, CSL JSON, RIS
- Can manually create/edit references
- Can organize references in nested collections
- Can tag and color-code tags (9 max)
- Can detect and resolve duplicates automatically on import
- Can search and filter references in real-time
- Can export references to BibTeX format
- Can upload and view PDFs (simple iframe viewer)
- Can link collections to projects (for future editor integration)
- Responsive, accessible, tested (unit + integration + E2E)

---

## Week 1: Foundation & Setup

**Focus**: Project infrastructure, database models, core UI layout, UI primitives

#### Frontend Deliverables (35-40 hours)
- [x] Vite + React 19 project setup
- [x] TanStack Router configuration (file-based routes)
- [x] Tailwind CSS 4 setup with dark theme extension
- [x] ESLint + Prettier configuration (match editor)
- [x] `AppLayout` component (4-column grid: ActivityBar | Sidebar | MainPane | DetailsPane)
- [x] `ActivityBar` component (6 icons, active state, badge support)
- [x] Sidebar container (resizable, persist width to localStorage)
- [x] Routing structure (`/library`, `/search`, `/projects`, `/duplicates`)
- [x] UI primitives: Button, Input, Modal, Checkbox, Toggle, Tag (with CVA variants)
- [x] Global Zustand stores: `ui.store.ts` (theme, panels, modals, toasts), `auth.store.ts`

**Testing**: Manual QA of layout responsiveness, theme switching

#### Backend Deliverables (15-20 hours)
- [x] Project setup & infrastructure (Winston logger, error handling, Docker)
- [x] Mongoose models: Reference, Collection, Tag, ProjectLink, DuplicateCandidate
- [x] Database indexes (userId, deleted, doi, etc.)
- [x] Health check endpoint
- [x] Basic route scaffolding
- [x] Trust gateway auth middleware

**Testing**: Health check passes, models compile, Docker up successfully

---
