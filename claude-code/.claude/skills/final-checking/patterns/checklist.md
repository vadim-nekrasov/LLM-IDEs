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
- [ ] Design Principles respected (per CLAUDE.md).
- [ ] No dead code (commented blocks, unused imports).

## Documentation
- [ ] Comments up-to-date, concise, English.
- [ ] External APIs verified via Context7 (Zero Hallucination).
- [ ] If public API/behaviour/architecture changed → `docs/index.md` updated.
- [ ] If inaccurate docs were spotted during exploration → corrected.

## Critical Restrictions
- [ ] No edits to `node_modules/` or `target/`.
- [ ] Build/lint/format configs unchanged unless required by the task.
