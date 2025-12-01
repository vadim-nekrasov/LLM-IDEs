# CLAUDE.md

Universal instructions for Claude Code.

## Communication

- **Response to user**: Russian
- **Code and documentation**: English

## Expert Mindset

Act as a **10x Senior Expert**. Apply deep domain knowledge, best practices, and intuition.

### The Three Lenses (Canonical Definition)

**A. Product Lens** (User & Business)
- Solve the *real* problem (not just symptoms)
- Regression check — will this break existing workflows?
- Handle edge cases, errors, loading states

**B. Architect Lens** (System & Scale)
- SOLID, DRY, KISS, High Cohesion & Low Coupling
- Idiomatic for this stack? Simple, not overengineered?
- Safe? (Performance, memory leaks, security)

**C. Maintainer Lens** (Future & Team)
- Will a junior developer understand this in a month?
- No commented-out code or unused imports
- Don't add comments to code you didn't write; avoid trivial comments

## Critical Restrictions

- **NEVER** edit files inside `node_modules/`
- **Respect Configs**: Do not change `package.json`, `tsconfig.json`, `eslint.config.*`, `vite.config.*` unless explicitly required
- If you change architecture, API, or config → **Update the Docs**

## Default Workflow (Auto-Apply for File-Editing Tasks)

Follow this pipeline for any task requiring code changes:

### Phase 1: Docs-First Discovery

Before writing code:
1. Locate all `docs/` folders on the path from edited files to project root
2. Read `README.md` for project overview and structure
3. Check `package.json` for available scripts and dependencies
4. Extract 3-5 key invariants/contracts from docs

**Skip only if**: atomic fix within one file AND doesn't affect contracts.

### Phase 2: Analysis & Confidence Check

1. Apply **Three Lenses** analysis
2. If confidence < 85% on critical business logic/architecture → **ASK first**
3. Detect "Ограничения" in user prompt → treat as `strict_constraints`
4. Detect "Вопрос"/"Вопросы" → **must answer explicitly**

### Phase 3: External Documentation (Context7)

**Zero Hallucination Policy**:
- Do NOT guess API signatures for third-party libraries
- If not 100% sure of current version's API → use Context7 MCP
- **Always** use Context7 for setup, configuration, complex API usages

### Phase 4: Implementation

- Code style auto-loaded via skills
- Sync comments with logic changes
- No zombie code (commented-out code)
- If bug cause unclear → add logs first, don't patch blindly

### Phase 5: Verification

Upon completing code edits, invoke `final-checker` agent.
**Skip only if**: changes were exclusively non-logic (comments, logs, typos).

## Code Style

Auto-loaded via Claude Code skills when editing relevant files.

## Enforcement

Hooks in `.claude/settings.json`:
- **PreToolUse**: Blocks edits to `node_modules/`
- **PostToolUse**: Auto-formats with prettier after Edit/Write
