# Docs-First Discovery

Before editing code, locate and read:

1. `README.md` at project root.
2. `package.json` (or `Cargo.toml`, `pyproject.toml`, etc.) — scripts and dependencies.
3. Every `docs/index.md` from the project root down to the directory of the file you intend to edit.
4. Component-local docs adjacent to the file you're editing.
5. `CLAUDE.local.md` at project root if present (per-project overrides).

Record 3–5 invariants that must not be violated. These guide both implementation and the Three Lenses pass.

## Why this matters

Skipping documentation has a recurring failure mode: the change appears correct but breaks a documented invariant (public API contract, ordering guarantee, lifecycle assumption). The cost of one read pass is a few seconds; the cost of a regression is a follow-up PR plus context loss.

## When to skip

- Pure typo fix in a string literal or comment.
- Removing a dead `console.log`.
- Mechanical lint-fix that doesn't change behaviour.

For anything else, prefer reading.
