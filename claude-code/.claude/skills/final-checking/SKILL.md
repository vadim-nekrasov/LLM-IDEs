---
name: final-checking
description: Final verification routine — linting, type checking, structured checklist, and Three Lenses pass.
when_to_use: Triggers after completing any implementation, bug fix, or refactor before stopping the session.
---

# Final Verification Router

Skip this routine only when changes were exclusively non-logic (comments, console-log removal, single typo). Otherwise run all phases.

1. **Phase 1 — Automated Validation.** See `patterns/validation.md`. Goal: 0 errors/warnings on the lines you changed this session (your fresh diff vs `git HEAD`) — see the **Linter Warnings Policy** below for the exact scope and the remediation loop.
2. **Phase 2 — Three Lenses pass.** See `../_shared/three-lenses.md`.
3. **Phase 3 — Structured Checklist.** See `patterns/checklist.md`.
4. **Phase 4 — Critical Audit (optional).** Are all changes necessary? Any avoidable complexity? Could it be simpler? Local consistency with surrounding code.
5. **Phase 5 — Cleanup.** Remove temporary `console.log`s.

## Linter Warnings Policy

Every file you create or modify this session must end it with **zero linter
warnings on the lines you changed** — your fresh diff vs the committed baseline
(`git HEAD`) — whatever linter the stack uses (eslint, clippy, ruff, …). You
are **not** responsible for pre-existing/legacy warnings on lines you did not
touch: those are signal-only and exempt. A new file is entirely your diff, so
the whole file must be clean. Errors and parse failures are never signal-only —
they block on any line, changed or not.

- **Don't introduce new warnings.** The scope narrows *which* warnings you must
  fix (only your changed lines) — it never licenses adding fresh ones. This
  matches the writing-* legacy-linter rule — be responsible only for your own
  fresh diff (writing-* is the canonical statement of it).
- **Fix in code, never in config** — never relax/disable a rule or edit a
  lint/format/build manifest; a targeted inline-disable is acceptable only for
  a justified false positive.
- **Remediation loop.** A Stop gate blocks with a per-file → line:rule reason;
  fix in code and stop again. If a flagged warning is a genuine false positive,
  needs a config change, or sits on a line you were told not to modify, say so
  explicitly and stop — the anti-loop lets the next stop through, so the session
  always terminates. Never reach for a raw-linter `--fix`.

The gate scopes to lines changed vs `git HEAD` and derives the touched-file set
from the session transcript; if a compaction truncates it, edits before the
truncation may be missed (an accepted edge). Where git is unavailable it
degrades to errors-only — never blocking on legacy warnings it cannot attribute.

The session-summary hook prints docs read, doc-update verdict, and skills used automatically — no need to recreate it in chat.
