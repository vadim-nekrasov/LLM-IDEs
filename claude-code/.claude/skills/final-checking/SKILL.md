---
name: final-checking
description: Final verification routine — linting, type checking, structured checklist, and Three Lenses pass. Invoke after completing implementation, bug fix, or refactor before stopping.
---

# Final Verification Router

Skip this routine only when changes were exclusively non-logic (comments, console-log removal, single typo). Otherwise run all phases.

1. **Phase 1 — Automated Validation.** See `patterns/validation.md`. Goal: 0 errors/warnings on the lines you changed this session (your fresh diff vs `git HEAD`) — scope rules live in `../_shared/linter-policy.md`; the **Linter Warnings Policy** below holds the gate specifics and remediation loop.
2. **Phase 2 — Three Lenses pass.** See `../_shared/three-lenses.md`.
3. **Phase 3 — Structured Checklist.** See `patterns/checklist.md`.
4. **Phase 4 — Critical Audit (optional).** Are all changes necessary? Any avoidable complexity? Could it be simpler? Local consistency with surrounding code.
5. **Phase 5 — Cleanup.** Remove temporary `console.log`s.

## Linter Warnings Policy

Scope, no-mass-autofix, and fix-in-code-not-config rules live in
`../_shared/linter-policy.md`. Gate specifics here: the Stop gate (`lint-touched.ts`) scopes
to lines changed vs `git HEAD`, derives the touched-file set from the session transcript (a
compaction that truncates it may miss earlier edits — an accepted edge), and degrades to
errors-only where git is unavailable. It blocks with a per-file → line:rule reason; fix in
code and stop again. If a flag is a genuine false positive, needs a config change, or sits on
a line you were told not to modify, say so explicitly and stop — the anti-loop lets the next
stop through, so the session always terminates.

The session-summary hook prints docs read, doc-update verdict, and skills used automatically — no need to recreate it in chat.
