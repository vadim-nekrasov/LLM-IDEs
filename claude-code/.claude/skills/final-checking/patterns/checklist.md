# Final Checklist

## Functionality & Stability
- [ ] All requirements from the prompt met.
- [ ] All `strict_constraints` followed.
- [ ] All `questions_answered` explicitly answered.
- [ ] Existing functionality still works (regression check).
- [ ] No performance regressions (unnecessary work, N+1 queries, etc.).
- [ ] No resource leaks (subscriptions, listeners, connections, file handles).
- [ ] Edge cases handled (empty/error/loading/offline).

## Code Quality
- [ ] Modern language features used where appropriate.
- [ ] Code complies with project style.
- [ ] SRP — `../../_shared/solid-audit.md#srp` (single axis of change).
- [ ] OCP — `../../_shared/solid-audit.md#ocp` (foreseeable extension does not edit existing logic).
- [ ] LSP — `../../_shared/solid-audit.md#lsp` (no weakened guarantees in subtypes).
- [ ] ISP — `../../_shared/solid-audit.md#isp` (no consumer has unused interface members).
- [ ] DIP — `../../_shared/solid-audit.md#dip` (no high-level → concrete low-level import).
- [ ] No dead code (commented blocks, unused imports).

## Documentation
- [ ] Comments up-to-date, concise, English.
- [ ] External APIs verified via Context7 (Zero Hallucination).
- [ ] If public API/behaviour/architecture changed → invoke `writing-docs` skill and update `docs/index.md`.
- [ ] If inaccurate docs were spotted during exploration → invoke `writing-docs` skill and correct them.

## Critical Restrictions
- [ ] No edits to `node_modules/` or `target/`.
- [ ] Build/lint/format configs unchanged unless required by the task.
