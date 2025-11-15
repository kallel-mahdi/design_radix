Session Finish: <User provides session number>

You are finishing Session X of the Bibliography Manager project.

**Executive Summary**
- **Objective:** Document work, commit changes, and archive the Session X plan once tests are done.
- **Required tools:** Read (`docs/sessions/XX-plan.md`, checklist), Write/Edit for CHANGELOG/checklist updates, git add/commit/mv, Skill `bibliography-planning-docs` for cross-checks.
- **Outputs:** Updated CHANGELOG + checklist, structured commit with references, plan moved to `docs/sessions/completed/`.

## CRITICAL: Read Context First

1. **Read plan**: `docs/sessions/XX-plan.md` (what was implemented)
2. **Read checklist**: `docs/02-delivery/checklist/sessions-XX-XX.md` (what to mark complete)

## Phase 1: Update Documentation

### Step 1: Update CHANGELOG.md

Add entry with session summary:

```markdown
## [Unreleased]

### Session X - [Feature Name] (YYYY-MM-DD)

**Backend:**
- Added [feature/endpoint/model]
- Implemented [algorithm/logic] (based on Zotero xpcom/[file])

**Frontend:**
- Created [component/page]
- Added [feature] (adapted from editor_frontend pattern)

**Tests:**
- [X] Backend unit tests ([N] tests)
- [X] Backend integration tests ([N] tests)
- [X] Frontend unit tests ([N] tests)
- [X] E2E tests (if applicable)

**Deviations from Zotero:**
- [Deviation 1]: [Why we differ]

**References:**
- Zotero: [file paths]
- Editor: [file paths]
```

### Step 2: Mark Session Complete in Checklist

Update `docs/02-delivery/checklist/sessions-XX-XX.md`:
- Change `[ ]` to `[x]` for completed session tasks
- Add completion date

### Step 3: Doc Sync Check (Required)

- Compare `CLAUDE.md`, `.claude/skills`, and `docs/INDEX.md` for path or instruction drift introduced this session.
- If updates were needed, note them in CHANGELOG before continuing.

## Phase 2: Create Commit

### Step 1: Stage Changes

```bash
git add .
```

### Step 2: Create Commit with References

Use structured commit message:

```bash
git commit -m "$(cat <<'EOF'
feat(session-X): [Brief feature description]

Session X: [Full feature name]

Backend:
- Added [details]
- Implemented [details]

Frontend:
- Created [details]
- Added [details]

Tests:
- Backend: [X unit + Y integration]
- Frontend: [X unit + Y integration]
- E2E: [if applicable]

References:
- Zotero: [file paths that informed implementation]
- Editor: [file paths copied/adapted]

Deviations:
- [Deviation 1]: [Why we differ]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### Step 3: Verify Commit

```bash
git log -1 --stat
```

## Phase 3: Archive Plan File

Move plan to completed directory:

```bash
mv docs/sessions/XX-plan.md docs/sessions/completed/XX-plan.md
```

## Completion Message

```
✅ Session X complete!

**Documentation:**
- ✅ CHANGELOG.md updated
- ✅ Checklist marked complete

**Commit:**
- ✅ Changes committed with references
- ✅ Commit hash: [hash]

**Archived:**
- ✅ Plan moved to docs/sessions/completed/

**Next session:** Run `/session-plan [X+1]`
```

---

**CRITICAL REMINDERS**:
- ✅ DO reference Zotero/editor files in commit message
- ✅ DO document deviations in CHANGELOG
- ✅ DO verify all tests pass before committing
- ❌ DO NOT push to remote (unless user explicitly requests)
- ❌ DO NOT skip commit message structure
