---
name: writing-docs
description: Lean Markdown documentation — what to include/exclude, size budget, code-vs-doc authority. Auto-trigger on README.md / docs/**/*.md edits.
paths:
  - "**/README.md"
  - "**/docs/**/*.md"
---

# Writing Markdown Docs

When writing or editing repo Markdown docs, follow
[`../_shared/markdown-doc-principles.md`](../_shared/markdown-doc-principles.md).

Before adding any line to an existing doc, apply the 30-second-grep test
from the linked rubric — if a future agent can recover the fact in < 30 s,
omit. Readers are expected to verify claims against code (see
[`../applying-workflow/patterns/docs-first.md#trust-calibration`](../applying-workflow/patterns/docs-first.md#trust-calibration))
— write claims that *earn* that trust (invariants, cross-file intent), not
claims that demand it (restated current behaviour, which rots).

- Applies to hand-authored docs: READMEs, `docs/index.md`, ADRs, runbooks. For
  bulk generation from a folder, use `/generate-docs` instead (same rubric).
- The shared file is the single source for the include/exclude lists, the
  ~1–3k token budget, the optional `docs/index.md` skeleton, and the code-vs-doc
  authority note. This skill only routes you there.
- README = human onboarding; `docs/index.md` = agent orientation — same
  principles, different emphasis. In monorepos where humans don't read
  repo docs at all, even README leans towards the agent audience.
