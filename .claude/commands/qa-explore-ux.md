---
name: /qa-explore-ux
description: Explore UX issues and compare with editor/Zotero patterns
---

@qa-engineer explore UX quality issues in the bibliography manager

Focus on discovering:
1. **Non-premium issues** - Things like toolbar disappearing, state not persisting, UI inconsistencies
2. **Editor pattern compliance** - How we compare to editor_frontend/editor_backend patterns (PRIMARY)
3. **Zotero UX comparison** - How we compare to Zotero's proven UX (SECONDARY)
4. **Accessibility & keyboard navigation** - WCAG patterns, keyboard shortcuts
5. **Component state management** - State persistence, view switching, modal interactions

Manual testing approach:
- Playwright navigate and interact to discover actual UX issues
- Take screenshots of problems
- Identify exact reproduction steps
- Compare editor component patterns from editor_frontend/src/components/ui/

Provide findings with specific locations and code comparison examples.

Ask clarifying questions about:
- Specific areas to focus on (library view, PDF reader, collections, tags, etc.)
- Which patterns are most important (editor compatibility vs Zotero consistency)
