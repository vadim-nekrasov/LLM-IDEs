# Three Lenses Analysis

Apply each lens to the proposed change before writing code.

## A. Product Lens — User & Business
- Does this solve the *real* problem, or only a symptom?
- Regression check: which existing user flows touch this code path?
- Edge cases: empty state, error state, loading state, slow network, offline.
- Accessibility and i18n implications.

## B. Architect Lens — System & Scale
- SOLID — name the principle most at risk in this change and cite its predicate from `solid-audit.md`; apply tier (per that file's trigger table) emits the full YAML evidence block, skip tier requires the citation or an explicit "N/A — <reason>".
- GRASP, DRY, KISS, YAGNI applied (qualitative — no evidence block required).
- Idiomatic for this stack? Conventions, hook rules, file layout.
- Safety: memory leaks, race conditions, security boundaries.
- Scalability: does cost grow worse than O(n) with users / data / events?
- Performance: re-renders, subscriptions, unnecessary work.

## C. Maintainer Lens — Future & Team

- Will a junior developer understand this in a month?
- No commented-out code, no unused imports.
- Comments policy (Claude is the sole editor of this codebase):
  - Write a comment ONLY if it will help a future Claude edit — hidden constraint, subtle invariant, non-obvious workaround, surprising behaviour. No WHAT-comments, no narration, no task/PR references.
  - Hard cap: any single comment block ≤ 2 lines, including JSDoc / `/* */`. A 3+ line comment block is forbidden — split into code-level clarity instead.
  - Don't add comments to code you didn't touch in this edit.
- Names express intent; variables are scoped narrowly.
