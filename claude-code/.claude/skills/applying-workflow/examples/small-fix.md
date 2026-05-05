# Small Fix — when to skip the workflow

Trivial changes don't need the full pipeline. Examples:

- Typo in a comment, string literal, or visible label (no behavioural impact).
- Removing a `console.log` left from debugging.
- Fixing an `eslint`/`stylelint` violation that doesn't change runtime behaviour.
- Renaming a local variable inside a single function.

For these, skip docs-first and skill activation. Still do:

- Run `prettier`/`eslint` on the file (project formatter handles it via PostToolUse hook).
- A quick visual scan for unintended changes in the diff.

When in doubt, do the full workflow. The cost of an extra `Read` is small; the cost of a missed invariant is large.
