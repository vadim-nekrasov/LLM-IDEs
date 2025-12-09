---
name: applying-workflow
description: Applies structured development workflow with docs-first discovery, Three Lenses analysis, Context7 verification, and final checking. Use PROACTIVELY when editing code files, implementing features, fixing bugs, or making any code changes. Triggers on TypeScript, JavaScript, React, Python, Go, Rust development tasks.
---

# Development Workflow

## Phase 0: Skill Activation (MANDATORY)

**STOP** — before ANY code changes, invoke language-specific skills:

| File Pattern | Required Skills |
|--------------|-----------------|
| `.js`  | `writing-ecmascript` |
| `.ts, .tsx`  | `writing-ecmascript` + `writing-typescript` |
| `.jsx, .tsx` | `writing-ecmascript` + `writing-react` |
| `.lua`       | `writing-lua` |

Invoke the skill(s) FIRST. This loads code patterns into context before you write code.

## Phase 1: Docs-First Discovery (MANDATORY)

**⛔ BLOCK YOURSELF** until ALL steps are completed:

### Checklist (complete BEFORE any code)
- [ ] Traverse from edited file up to project root
- [ ] For each `docs/index.md` found → **READ** it with Read tool
- [ ] Read `README.md` in project root
- [ ] Check `package.json` for scripts and dependencies
- [ ] Record 3-5 invariants that must NOT be violated

### Why This Is Critical
Skipping documentation → regressions → wasted time on fixes.
This is a **workflow requirement**, not a suggestion.

## Phase 2: Analysis & Three Lenses

### The Three Lenses Framework

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

### Confidence Check
- If confidence < 85% on critical business logic/architecture → **ASK first**
- Detect "Ограничения" in user prompt → treat as `strict_constraints`
- Detect "Вопрос"/"Вопросы" → **must answer explicitly**

## Phase 3: External Documentation (Context7)

**Zero Hallucination Policy**:
- Do NOT guess API signatures for third-party libraries
- If not 100% sure of current version's API → use Context7 MCP
- **Always** use Context7 for setup, configuration, complex API usages

## Phase 4: Implementation

### Code Guidelines

- Sync comments with logic changes
- No zombie code (commented-out code)
- If bug cause unclear → add logs first, don't patch blindly

## Phase 5: Verification

Upon completing code edits, invoke `final-checking` skill.

**Skip only if**: changes were exclusively non-logic (comments, logs, typos).
