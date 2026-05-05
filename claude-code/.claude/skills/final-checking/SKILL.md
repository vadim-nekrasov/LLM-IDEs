---
name: final-checking
description: Final verification routine — linting, type checking, and Three Lenses pass. Triggers after completing any implementation, bug fix, or refactor before stopping the session.
---

# Final Verification Router

Skip this routine only when changes were exclusively non-logic (comments, console-log removal, single typo). Otherwise run all phases.

1. **Phase 1 — Automated Validation.** See `patterns/validation.md`. Goal: 0 errors, 0 warnings on touched files.
2. **Phase 2 — Three Lenses pass.** Reuse `applying-workflow/patterns/three-lenses.md`.
3. **Phase 3 — Structured Checklist.** See `patterns/checklist.md`.
4. **Phase 4 — Critical Audit (optional).** Are all changes necessary? Any avoidable complexity? Could it be simpler? Local consistency with surrounding code.
5. **Phase 5 — Cleanup.** Remove temporary `console.log`s.

The session-summary hook prints docs read, doc-update verdict, and skills used automatically — no need to recreate it in chat.
