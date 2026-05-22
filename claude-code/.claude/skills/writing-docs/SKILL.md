---
name: writing-docs
description: Lean Markdown documentation — what to include/exclude, size budget, code-vs-doc authority.
when_to_use: Triggers when authoring or editing README.md, docs/index.md, ADRs, or other repo Markdown docs by hand.
paths:
  - "**/README.md"
  - "**/docs/**/*.md"
---

# Writing Markdown Docs

When writing or editing repo Markdown docs, follow
[`../_shared/markdown-doc-principles.md`](../_shared/markdown-doc-principles.md).

- Applies to hand-authored docs: READMEs, `docs/index.md`, ADRs, runbooks. For
  bulk generation from a folder, use `/generate-docs` instead (same rubric).
- The shared file is the single source for the include/exclude lists, the
  ~1–3k token budget, the optional `docs/index.md` skeleton, and the code-vs-doc
  authority note. This skill only routes you there.
- README = human onboarding; `docs/index.md` = agent orientation — same
  principles, different emphasis.
