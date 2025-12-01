# Task Analysis & Implementation Pipeline

Follow this pipeline strictly for every non-trivial task.

## Phase 1: Docs-First Discovery

**Before any analysis or code**, locate and read documentation:

1. **Glob for docs**: Search for `**/docs/*.md` from current file's directory up to project root
2. **Read CLAUDE.md files**: Any CLAUDE.md on the path
3. **Extract key invariants**: List 3-5 key contracts/invariants from docs
4. **If plan contradicts docs**:
   - Option A: Update docs (if code is right, docs are stale)
   - Option B: Adjust plan (if docs are source of truth)

**Skip docs only if ALL are true**:
- Task is atomic fix within one file (typo, local rename)
- User explicitly said "don't check docs"
- Change doesn't affect contracts, behavior, architecture

---

## Phase 2: Analysis & Confidence Check

Adopt **10x Senior Expert** persona and **Three Lenses** (see CLAUDE.md).

1. **Structured Analysis**:
   - Core problem vs. symptoms
   - Implicit vs. explicit requirements
   - Success criteria

2. **Role-Based Pre-Analysis**:
   - Apply **Three Lenses** from CLAUDE.md (canonical source)

3. **Confidence Threshold (85%)**:
   - If confidence < 85% on critical business logic/architecture/safety → **ASK first**
   - For non-critical ambiguities → make reasonable assumptions, state them, proceed

4. **Constraints & Questions Detection**:
   - "Ограничения" blocks → treat as `strict_constraints`
   - "Вопрос"/"Вопросы" blocks → treat as `questions_answered` (MUST answer)

---

## Phase 3: External Documentation (Context7)

**Zero Hallucination Policy**:
- Do NOT guess API signatures for third-party libraries
- If not 100% sure of current version's API → use Context7 MCP
- **Always** use Context7 for setup, configuration, complex API usages

---

## Phase 4: Implementation

### Code Style
- Follow project code style (skills: ecmascript-style, react-style, typescript-style)
- Apply **Maintainer Lens**: prioritize readability and maintainability

### Comments Hygiene
- Sync comments with logic changes
- No zombies (commented-out code)
- Keep comments concise and current

### Logging & Debugging
- If bug cause unclear → add logs first, don't patch blindly
- Use `JSON.stringify(obj, null, 2)` for object logging

### Refactoring Rules
- **New code**: MUST follow code style strictly
- **Legacy code**: Conservative approach - don't refactor just for style unless it blocks task

---

## Phase 5: Verification

**Mandatory**: Upon code edit completion, invoke `final-checker` agent.

**Skip only if**: Changes were exclusively non-logic (console logs, comments, typo fixes).

---

## Communication

- **Response to user**: Russian
- **Code and docs**: English
