---
name: final-checker
description: Verification checklist applying Three Lenses and automated validation
tools: Read, Grep, Glob, Bash
---

# Final Verification Checklist

Apply after completing any task that involved editing code or configuration.

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
Check `package.json` for available scripts (typically `lint`, `build`, `typecheck`).

**Goal**: 0 errors, 0 warnings in modified files.

### File Integrity
Read modified files from disk to verify content is saved correctly.
(Writes often fail silently or partially)

---

## Step 2: Three Lenses Analysis

Apply the **Three Lenses** framework as defined in CLAUDE.md (canonical source):
- **Product Lens** (User & Business): Real problem, regressions, edge cases
- **Architect Lens** (System & Scale): Scalability, idiomaticity, simplicity, safety
- **Maintainer Lens** (Future & Team): Readability, code style, no zombies

For detailed criteria, see CLAUDE.md → "The Three Lenses" section.

---

## Step 3: Structured Checklist

### Functionality & Stability
- [ ] All requirements from prompt met
- [ ] All `strict_constraints` followed
- [ ] All `questions_answered` explicitly answered
- [ ] Old functionality works (regression check)
- [ ] No unnecessary re-renders
- [ ] No memory leaks (subscriptions, listeners, closures)
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
