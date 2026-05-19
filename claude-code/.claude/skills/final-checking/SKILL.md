---
name: final-checking
description: Final verification routine — linting, type checking, structured checklist, and Three Lenses pass.
when_to_use: Triggers after completing any implementation, bug fix, or refactor before stopping the session.
---

# Final Verification Router

Skip this routine only when changes were exclusively non-logic (comments, console-log removal, single typo). Otherwise run all phases.

1. **Phase 1 — Automated Validation.** See `patterns/validation.md`. Goal: 0 errors and 0 warnings on touched files — see the **Linter Warnings Policy** below for the exact scope and the remediation loop.
2. **Phase 2 — Three Lenses pass.** See `../_shared/three-lenses.md`.
3. **Phase 3 — Structured Checklist.** See `patterns/checklist.md`.
4. **Phase 4 — Critical Audit (optional).** Are all changes necessary? Any avoidable complexity? Could it be simpler? Local consistency with surrounding code.
5. **Phase 5 — Cleanup.** Remove temporary `console.log`s.

## Linter Warnings Policy

Every file you create or modify this session must end it with **zero linter
warnings attributable to that file** — whatever linter the stack uses (eslint,
clippy, ruff, …), **including pre-existing warnings in a file you touched**,
not only ones you introduced. A large, deliberate pre-existing warning
backlog is normal — it is precisely the signal-only part for *untouched*
files and never exempts a file you touched.

- **Overrides "signal-only".** A project framing warnings as advisory (config
  at `warn`, CI not failing on them, a `CLAUDE.local.md` note) applies *only
  to files you did not touch this session* — any file you authored or modified
  must be driven to zero.
- **Fix in code, never in config** — never relax/disable a rule or edit a
  lint/format/build manifest; a targeted inline-disable is acceptable only for
  a justified false positive.
- **Remediation loop.** A Stop gate blocks with a per-file → rule reason; fix
  in code and stop again. If a warning is a genuine false positive, needs a
  config change, or is pre-existing in a file you were told not to modify, say
  so explicitly and stop — the anti-loop lets the next stop through, so the
  session always terminates. Never reach for a raw-linter `--fix`.

The gate derives the touched set from the session transcript; if a compaction
truncates it, edits before the truncation may be missed (an accepted edge).

The session-summary hook prints docs read, doc-update verdict, and skills used automatically — no need to recreate it in chat.
