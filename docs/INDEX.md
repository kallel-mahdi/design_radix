# Bibliography Manager Documentation

Central hub for all project documentation.

---

## 📁 Documentation Structure

### [01-specification/](01-specification/) - Complete Specifications

**Main Specs:**
- **[Spec.md](01-specification/Spec.md)** - Complete frontend + backend specification
- **[INTEGRATION.md](01-specification/INTEGRATION.md)** - Architecture & integration guide

**Backend Specifications:**
- [APIDesignSystem.md](01-specification/backend/APIDesignSystem.md) - API endpoints, validation, error codes
- [ServiceLayerSpec.md](01-specification/backend/ServiceLayerSpec.md) - Service layer architecture
- [DatabaseDesign.md](01-specification/backend/DatabaseDesign.md) - MongoDB schemas, indexes
- [RecommendedLibraries.md](01-specification/backend/RecommendedLibraries.md) - Approved libraries
- [zotero.md](01-specification/backend/zotero.md) - Zotero implementation reference

**Frontend Specifications:**
- [ComponentsSpec.md](01-specification/frontend/ComponentsSpec.md) - Component specifications
- [DesignSystem.md](01-specification/frontend/DesignSystem.md) - Colors, typography, CVA patterns

---

### [02-delivery/](02-delivery/) - Implementation Roadmap

**[Checklist](02-delivery/checklist/)** - Session-by-session tasks:
- [Sessions 01-05](02-delivery/checklist/sessions-01-05.md) - Foundation & core CRUD
- [Sessions 06-10](02-delivery/checklist/sessions-06-10.md) - Library view & collections
- [Sessions 11-15](02-delivery/checklist/sessions-11-15.md) - Search & import/export
- [Sessions 16-20](02-delivery/checklist/sessions-16-20.md) - Polish & testing
- [Future](02-delivery/checklist/future.md) - Post-MVP features

**[Roadmap](02-delivery/roadmap/)** - Weekly milestones:
- [Week 1: Foundation](02-delivery/roadmap/mvp-week-01-foundation.md)
- [Week 2: Library](02-delivery/roadmap/mvp-week-02-library.md)
- [Week 3: Search](02-delivery/roadmap/mvp-week-03-search.md)
- [Week 4: Polish](02-delivery/roadmap/mvp-week-04-polish.md)
- [Future Phases](02-delivery/roadmap/future-phases.md)

---

### [sessions/](sessions/) - Active Session Plans

Created by `/session-plan X`, archived by `/session-finish X`.

**Format**: `XX-plan.md` (e.g., `06-plan.md`)

**Archived plans**: [sessions/completed/](sessions/completed/)

---

## 🎯 Quick Navigation

### For Implementation
1. Check current session: [02-delivery/checklist/](02-delivery/checklist/)
2. Read session plan: [sessions/](sessions/) (if exists)
3. Reference specs: [01-specification/Spec.md](01-specification/Spec.md)
4. Check API/component details: [01-specification/backend/](01-specification/backend/) or [01-specification/frontend/](01-specification/frontend/)

### For Planning
1. Review roadmap: [02-delivery/roadmap/](02-delivery/roadmap/)
2. Check feature specs: [01-specification/Spec.md](01-specification/Spec.md)
3. Track progress: [02-delivery/checklist/](02-delivery/checklist/)

---

## 🔗 Related Documentation

### Root Level
- `CLAUDE.md` - AI agent project context
- `03-quality/TESTING.md` - Test coverage tracking

### Active Codebases
- `bibliography_frontend/README.md` - Frontend quick start
- `bibliography_frontend/CHANGELOG.md` - Frontend changes
- `bibliography_frontend/STATUS.md` - Current status
- `bibliography_backend/README.md` - Backend quick start
- `bibliography_backend/CHANGELOG.md` - Backend changes

---

**Last Updated**: 2025-11-11
