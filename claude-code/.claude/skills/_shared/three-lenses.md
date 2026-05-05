# Three Lenses Analysis

Apply each lens to the proposed change before writing code.

## A. Product Lens — User & Business
- Does this solve the *real* problem, or only a symptom?
- Regression check: which existing user flows touch this code path?
- Edge cases: empty state, error state, loading state, slow network, offline.
- Accessibility and i18n implications.

## B. Architect Lens — System & Scale
- SOLID, GRASP, DRY, KISS, YAGNI applied.
- Idiomatic for this stack? Conventions, hook rules, file layout.
- Safety: memory leaks, race conditions, security boundaries.
- Scalability: does cost grow worse than O(n) with users / data / events?
- Performance: re-renders, subscriptions, unnecessary work.

## C. Maintainer Lens — Future & Team
- Will a junior developer understand this in a month?
- No commented-out code, no unused imports.
- Don't add comments to code you didn't write; avoid trivial comments.
- Names express intent; variables are scoped narrowly.
