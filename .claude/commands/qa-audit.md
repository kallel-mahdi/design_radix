---
name: /qa-audit
description: Run comprehensive QA audit across UX, testing, security, performance
---

@qa-engineer comprehensive audit of the bibliography manager

Analyze all six capability domains:
1. **UX Quality** - Non-premium issues, editor patterns, Zotero comparison, accessibility
2. **Functional Testing** - Coverage gaps, test pyramid (target 60/30/10), E2E status
3. **Security** - User isolation, validation, injection risks, secret exposure
4. **Performance** - Rendering bottlenecks, virtual scrolling, caching, bundle size
5. **Integration Contracts** - API Gateway, microservices, MSW consistency
6. **Edge Cases** - Network failures, concurrency, invalid data, boundary conditions

Provide:
- Detailed findings with severity, evidence, and specific fixes
- Risk assessment prioritization
- Quick wins (high impact, low effort)
- Must-fix before launch items
- Phase 2 improvements

Ask clarifying questions if needed to focus the audit.
