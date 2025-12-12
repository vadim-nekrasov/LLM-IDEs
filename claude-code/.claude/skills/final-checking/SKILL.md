---
name: final-checking
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
- Rust: `cargo check`, `cargo clippy`, `cargo test`
- WGSL: validated at shader compilation (use wgsl_analyzer if available)

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

For detailed criteria, see `applying-workflow` skill.

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
- [ ] SOLID, GRASP, DRY, KISS principles respected
- [ ] Scalable, safe and performant
- [ ] No dead code (commented code, unused imports removed)

### Documentation & Context
- [ ] Comments up-to-date, concise, English
- [ ] External APIs verified via Context7 (Zero Hallucination)

### Documentation Sync
- [ ] If public API/behavior/architecture changed → `docs/index.md` updated
- [ ] If found inaccurate docs during exploration → corrected them
- [ ] If discovered important undocumented aspects → added (within limits)

### Critical Restrictions
- [ ] No edits to `node_modules/` or `target/`
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

For significant changes, consider `/searching-solutions` to find alternative solutions.

If search identifies a better solution than current implementation, apply it.

---

## Step 6: Cleanup

Remove all console logs added during this task (unless explicitly needed for debugging).

---

## Step 7: Session Summary

Before stopping, output the **Session Summary** as required by CLAUDE.md:
- **Docs read**: List documentation files read (`.md` and `/docs/` paths)
- **Docs update**: State if documentation update needed (Yes/No + reason)
- **Skills used**: List all skills with counts

This step is MANDATORY — do not skip it
