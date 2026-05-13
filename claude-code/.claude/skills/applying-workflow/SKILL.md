---
name: applying-workflow
description: Structured development workflow router (docs-first discovery, Three Lenses analysis, Context7 verification, final checking).
when_to_use: Triggers on edits to .ts/.tsx/.js/.jsx/.py/.go/.rs/.wgsl files, when implementing a feature, or fixing a non-trivial bug.
---

# Workflow Router

Five phases. Open the linked file when the phase is relevant; trivial changes (typos, log removal) — see `examples/small-fix.md`.

1. **Phase 0 — Skill Activation.** For each file extension, the matching `writing-*` skill loads patterns into context. Invoke when patterns are non-trivial; skip for cosmetic edits.
2. **Phase 1 — Docs-First Discovery.** See `patterns/docs-first.md`.
3. **Phase 2 — Three Lenses Analysis.** See `../_shared/three-lenses.md`. Confidence < 85 % on critical logic → `patterns/confidence-check.md`.
4. **Phase 3 — Implementation.** Sync comments with logic. No zombie code. Add logs first when bug cause is unclear; never patch blindly.
5. **Phase 4 — Verification.** Invoke `final-checking` skill (typecheck + lint + Three Lenses).

External knowledge: see `../researching/SKILL.md`.

Project-specific overrides (stack, scripts, conventions): see `${CLAUDE_PROJECT_DIR}/CLAUDE.local.md` if present.
