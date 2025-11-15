Session Plan: <User provides session number (e.g., "6" or "6-10" for range)>

You are creating a comprehensive plan for Session X of the Bibliography Manager project.

**Executive Summary**
- **Objective:** Produce an approved Session X plan grounded in current docs/roadmap research.
- **Required tools:** Skill `bibliography-planning-docs`, Task tool (Explore + Plan agents), WebSearch (as needed), AskUserQuestion for every ambiguity.
- **Outputs:** Research log, clarified questions, proposed plan structure, and—after approval—the finalized `docs/sessions/XX-plan.md` file.

## CRITICAL: Use Task Tool with Agents

You MUST use the Task tool with specialized agents for research:

ALL PHASES MUST BE EXECUTED!!

### Phase 1: Exploration (Use Explore Agent)

Launch Task tool with `subagent_type: "Explore"` and `description: "Research for Session X"`:

```
Use Task tool to launch Explore agent with prompt:

"Explore the codebase and external references for Session X implementation:

1. Read session checklist:
   - File: docs/02-delivery/checklist/sessions-XX-XX.md
   - Extract ALL tasks for session X
   - Understand goals and deliverables

2. Research Zotero FRONTEND (if UI feature):
   - Search: zotero/chrome/content/zotero/components/**/*<feature>*
   - Read relevant component files
   - Document UI patterns, interactions, keyboard shortcuts

3. Research Zotero BACKEND (ALWAYS check):
   - Search: zotero/chrome/content/zotero/xpcom/**/*<feature>*
   - Read relevant logic files (duplicates.js, search.js, etc.)
   - Document algorithms, validation rules, business logic

4. Research Zotero DATABASE (if data model involved):
   - Read: zotero/resource/schema/userdata.sql
   - Document table structures, indexes, relationships

5. Research Editor FRONTEND (ALWAYS check):
   - Search: editor_frontend/src/components/**/*<similar-pattern>*
   - Search: editor_frontend/src/features/**/*<similar-feature>*
   - Document reusable components, patterns

6. Research Editor BACKEND (ALWAYS check):
   - Search: editor_backend/services/**/*<similar-service>*
   - Document service layer patterns, middleware, error handling

7. Read testing strategy:
   - File: TESTING.md
   - Understand 60/30/10 split (unit/integration/E2E)

Return: Comprehensive research findings with file references"
```

### Phase 2: Verification (Use WebSearch if needed)

If research reveals uncertainties, use WebSearch:

**When to search**:
- Algorithm verification (e.g., "ISBN normalization algorithm")
- Library documentation (e.g., "TanStack Query v5 optimistic updates")
- Best practices (e.g., "React 19 modal accessibility patterns")
- API documentation (e.g., "Crossref API rate limits")

**Examples**:
```
WebSearch: "Levenshtein vs Jaro-Winkler string similarity comparison"
WebSearch: "TanStack Table v8 column filtering patterns"
WebSearch: "React 19 useActionState hook usage"
```

### Phase 3: Planning (Use Plan Agent if complex)

For complex architecture decisions, launch Task tool with `subagent_type: "Plan"`:

```
Use Task tool to launch Plan agent with prompt:

"Based on research findings, create architecture plan for Session X:

1. Synthesize research:
   - What we'll copy from Zotero (frontend + backend)
   - What we'll reuse from editor
   - What's new/different

2. Identify decisions needed:
   - List all architectural choices (A vs B options)
   - Document tradeoffs for each
   - Recommend approach with rationale

3. Identify deviations from Zotero:
   - Why we're deviating
   - Trade-offs of deviation
   - Future alignment plan (if any)

Return: Architecture decisions with clear recommendations"
```

## Phase 4: Clarifying Questions (REQUIRED)

Use AskUserQuestion tool for EVERY ambiguity discovered during research:

**Question categories**:
1. **Architecture choices**: "Zotero uses X, editor uses Y. Which should we use?"
2. **Feature scope**: "Should we include feature B or defer to Phase 2?"
3. **Implementation details**: "Support both ISBN-10 and ISBN-13, or only ISBN-13?"
4. **Deviations**: "Zotero does X manually, should ours be automatic?"

**Example**:
```
AskUserQuestion with questions:
1. "Zotero uses manual duplicate detection. Should ours be automatic on import?"
2. "Should PDF viewer use react-pdf (better UX) or iframe (smaller bundle)?"
3. "Support multiple PDFs per reference (like Zotero) or single PDF (MVP scope)?"
```

## Phase 5: Plan Structure Proposal

After research and clarification, propose plan structure:

"I've completed research for Session X. Here's what I'll include in the plan:

**Research Findings**:
- Zotero frontend: [summary with file refs]
- Zotero backend: [summary with file refs]
- Editor patterns: [summary with file refs]
- WebSearch verification: [summary if done]

**Architecture Decisions**:
- Decision 1: [choice with rationale]
- Decision 2: [choice with rationale]
...

**Implementation Checklist**:
- Backend: [X tasks]
- Frontend: [Y tasks]
- Tests: [deferred to /session-test]
- Documentation: [Z tasks]

**Deviations from Zotero**:
- Deviation 1: [why + trade-off]
...

**Definition of Done**:
- [criteria 1]
- [criteria 2]
...

Approve to write to docs/sessions/XX-plan.md?"

## Phase 6: Write Plan File (ONLY after approval)

After user approves, create file: `docs/sessions/XX-plan.md`

**Use Write tool** with complete plan following this structure:

```markdown
# Session X Plan: [Feature Name]

**Created**: [date]
**Status**: Approved
**Estimated Time**: [X-Y hours]

---

## Research Findings

### Zotero Frontend (UI Patterns)
- File: `[path]`
- Finding: [what you learned]
- Decision: [how we'll use it]

### Zotero Backend (Logic)
- File: `[path]`
- Finding: [what you learned]
- Decision: [how we'll use it]

### Zotero Database
- File: `[path]`
- Finding: [what you learned]
- Decision: [how we'll use it]

### Editor Patterns
- File: `[path]`
- Finding: [what you learned]
- Decision: [how we'll use/adapt it]

### WebSearch Verification
- Query: "[search query]"
- Finding: [what you learned]
- Decision: [how it informs implementation]

---

## Architecture Decisions

### Decision 1: [Topic]
**Options**:
- A: [option A description]
- B: [option B description]

**Choice**: [A or B]
**Rationale**: [why]
**Trade-off**: [cons of chosen approach]

[Repeat for all decisions...]

---

## Deviations from Zotero

### 1. [Deviation name]
**Zotero**: [how Zotero does it]
**Ours**: [how we're doing it]
**Rationale**: [why different]
**Future**: [will we align later?]

[Repeat for all deviations...]

---

## Implementation Checklist

### Backend (X-Y hours)
- [ ] Task 1
- [ ] Task 2
...

### Frontend (X-Y hours)
- [ ] Task 1
- [ ] Task 2
...

### Tests (Deferred to /session-test)
- [ ] Backend unit tests
- [ ] Frontend unit tests
- [ ] Integration tests
- [ ] E2E tests (if needed)

### Documentation
- [ ] Update CHANGELOG.md
- [ ] Mark session complete in checklist
- [ ] Add deviation comments in code

---

## Definition of Done

- ✅ [Criterion 1]
- ✅ [Criterion 2]
...

---

## References

- Zotero: [file 1] (purpose)
- Zotero: [file 2] (purpose)
- Editor: [file 3] (purpose)
- WebSearch: [topic verified]
```

## Completion Message

After writing plan file:

"✅ Session X plan created!

**File**: docs/sessions/XX-plan.md

**Next steps**:
1. Review the plan
2. Run: /session-execute X (implement)
3. Run: /session-test X (write tests)
4. Run: /session-finish X (commit + docs)

**Estimated time**: [X-Y hours]"

---

**CRITICAL REMINDERS**:
- ❌ Do NOT start coding during planning phase
- ✅ DO use Task tool with Explore agent for research
- ✅ DO use WebSearch for verification when needed
- ✅ DO ask clarifying questions for EVERY ambiguity
- ✅ DO get user approval BEFORE writing plan file
- ❌ Do NOT skip Zotero backend research (xpcom/)
