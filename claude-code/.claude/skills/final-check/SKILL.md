---
name: final-check
description: Runs final verification checklist with linting, type checking, and Three Lenses analysis. Use PROACTIVELY after completing any implementation task, bug fix, or code modification to validate quality and correctness.
---

# Final Verification Checklist

**Skip if**: Changes were exclusively non-logic updates (console logs, comments, typo fixes).

## Verification Cycle

1. Run checks below
2. If issues found → Fix them
3. Re-run checks
4. Repeat until all pass

---

## Step 1: Automated Validation (Fail Fast)

Before analyzing with eyes, use tools:

### Linter & Type Check
Run the project's lint and build commands from the appropriate directory.
Check project config for available scripts:
- JS/TS: `package.json` → `lint`, `build`, `typecheck`
- Python: `pyproject.toml` → `ruff`, `mypy`, `pytest`
- Go: `go build`, `go vet`, `golangci-lint`
- Rust: `cargo check`, `cargo clippy`

**Goal**: 0 errors, 0 warnings in modified files.

### File Integrity
Read modified files from disk to verify content is saved correctly.
(Writes often fail silently or partially)

---

## Step 2: Three Lenses Analysis

Apply the **Three Lenses** framework:
- **Product Lens** (User & Business): Real problem, regressions, edge cases
- **Architect Lens** (System & Scale): Scalability, idiomaticity, simplicity, safety
- **Maintainer Lens** (Future & Team): Readability, code style, no zombies

For detailed criteria, see `workflow-default` skill.

---

## Step 3: Structured Checklist

### Functionality & Stability
- [ ] All requirements from prompt met
- [ ] All `strict_constraints` followed
- [ ] All `questions_answered` explicitly answered
- [ ] Old functionality works (regression check)
- [ ] No performance regressions (unnecessary work, N+1 queries, etc.)
- [ ] No resource leaks (subscriptions, listeners, connections, file handles)
- [ ] Edge cases handled

### Code Quality & Style
- [ ] Modern language features used (where appropriate)
- [ ] Code complies with project code style
- [ ] SOLID, DRY, KISS principles respected
- [ ] No dead code (commented code, unused imports removed)

### Documentation & Context
- [ ] Comments up-to-date, concise, English
- [ ] If architecture/API/config changed → docs updated
- [ ] External APIs verified via Context7 (Zero Hallucination)

### Critical Restrictions
- [ ] No edits to `node_modules/`
- [ ] Config files unchanged unless required

---

## Step 4: Critical Audit (Optional)

Additional focus points for complex changes:

- [ ] Are all changes necessary?
- [ ] Is there any overengineering or avoidable complexity?
- [ ] Could this task be solved more simply while staying correct?
- [ ] Local consistency: follows the style of the current module/file

**Priority**: Readability & Maintainability > Micro-optimizations

---

## Step 5: Solution Search (Optional)

For significant changes, consider `/tree-search` to find alternative solutions.

If search identifies a better solution than current implementation, apply it.

---

## Step 6: Cleanup

Remove all console logs added during this task (unless explicitly needed for debugging).
