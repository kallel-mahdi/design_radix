Session Execute: <User provides session number>

You are implementing Session X of the Bibliography Manager project based on the approved plan.

**Executive Summary**
- **Objective:** Execute the backend → checkpoint → frontend tasks listed in `docs/sessions/XX-plan.md`.
- **Required tools:** Skill `bibliography-backend-guidelines`, Skill `bibliography-frontend-guidelines`, Read/TodoWrite, Edit/MultiEdit/Write, pnpm test/build commands.
- **Outputs:** Completed backend + frontend work items, passing test/build logs, summarized status before handing off to `/session-test` or `/session-finish`.

## CRITICAL: Read Plan File First

1. Use Read tool: `docs/sessions/XX-plan.md`
2. Extract implementation checklist
3. Use TodoWrite tool with ALL backend + frontend tasks from plan

## Phase 1: Backend Implementation

### Step 1: Load Backend Skill
- Use Skill tool: bibliography-backend-guidelines

### Step 2: Implement Backend Tasks

Work through backend tasks from TodoWrite:
- Mark each task as `in_progress` when starting
- Mark as `completed` immediately after finishing
- Reference plan file for architecture decisions
- Add code comments referencing Zotero/editor patterns
- Document any deviations from plan

**Backend structure** (if creating from scratch):
```
bibliography_backend/
├── src/
│   ├── controllers/    # Request handlers
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routes
│   ├── services/       # Business logic
│   ├── middleware/     # Auth, validation, errors
│   ├── utils/          # Helpers, logger
│   └── index.ts        # App entry point
└── tests/
    ├── unit/
    └── integration/
```

### Step 3: Run Backend Tests

```bash
# Run backend unit tests
pnpm --filter bibliography-backend test:unit

# Run backend integration tests (if applicable)
pnpm --filter bibliography-backend test:integration

# Check TypeScript compilation
pnpm --filter bibliography-backend build
```

### Step 4: Backend Summary

After completing all backend tasks:

"✅ **Backend Phase Complete!**

**Created/Modified**:
- [List all files created or modified]

**Tests**: X/X passing
**Build**: Success ✓

**Backend checklist**:
- ✅ Models created with Mongoose schemas
- ✅ Services implement business logic
- ✅ Controllers handle requests
- ✅ Routes registered
- ✅ Validation schemas (Joi)
- ✅ Error handling
- ✅ Unit tests passing
- ✅ Integration tests passing

---

## 🛑 CHECKPOINT

Review backend implementation before proceeding to frontend.

**Type 'continue' or 'yes' to proceed with frontend phase.**"

## Phase 2: Frontend Implementation (After User Approval)

### Step 1: Load Frontend Skill
- Use Skill tool: bibliography-frontend-guidelines

### Step 2: Implement Frontend Tasks

Work through frontend tasks from TodoWrite:
- Mark each task as `in_progress` when starting
- Mark as `completed` immediately after finishing
- Reference plan file for architecture decisions
- Copy UI patterns from editor_frontend
- Add code comments referencing editor/Zotero patterns
- Document any deviations from plan

**Frontend structure** (if creating from scratch):
```
bibliography_frontend/
├── src/
│   ├── features/       # Feature-based organization
│   ├── components/     # Shared components
│   │   ├── layout/
│   │   └── ui/
│   ├── store/          # Zustand stores
│   ├── routes/         # TanStack Router
│   ├── common/
│   │   ├── api/
│   │   └── types.ts
│   └── styles/
│       └── tailwind.css
└── tests/
```

### Step 3: Run Frontend Tests

```bash
# Run frontend unit tests
pnpm --filter bibliography-frontend test:unit

# Check TypeScript compilation
pnpm --filter bibliography-frontend build

# Optionally run dev server to verify visually
pnpm --filter bibliography-frontend dev
```

### Step 4: Frontend Summary

After completing all frontend tasks:

"✅ **Frontend Phase Complete!**

**Created/Modified**:
- [List all files created or modified]

**Tests**: X/X passing
**Build**: Success ✓

**Frontend checklist**:
- ✅ Components created with CVA variants
- ✅ API queries using TanStack Query
- ✅ Store slices created (Zustand)
- ✅ Routes configured (TanStack Router)
- ✅ Forms with react-hook-form + Zod
- ✅ Tailwind styling with design tokens
- ✅ Unit tests passing
- ✅ TypeScript compilation clean

---

## ✅ Session X Execution Complete!

**Backend**: [X tasks complete]
**Frontend**: [Y tasks complete]

**Total files created/modified**: [N files]

---

## Next Steps

**Option 1: Write Tests Now** (Test-Driven Development)
Run: `/session-test X`

**Option 2: Test Later** (Traditional Approach)
You can write tests later by running `/session-test X` at any time.

**When tests are done**:
Run: `/session-finish X` (documentation + commit + archive)

---

## Troubleshooting

**If backend tests fail**:
- Check backend implementation against plan
- Review Zotero reference files
- Check editor_backend patterns

**If frontend tests fail**:
- Check frontend implementation against plan
- Review editor_frontend UI patterns
- Check component props and types

**If integration issues**:
- Check API endpoint matches frontend queries
- Verify request/response types match
- Check CORS and auth headers

**If you need to modify the plan**:
- Document changes in code comments
- Note deviations for `/session-finish` documentation update
