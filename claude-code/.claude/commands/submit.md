# Task Audit Command

Use `/submit` to explicitly audit current work against the full pipeline.

**Note**: The workflow phases are now part of the default behavior in CLAUDE.md.
Use this command when you want explicit verification that all phases were followed.

## When to Use

- Verify all pipeline phases were followed
- Complex task needs explicit checklist validation
- Before committing significant changes
- When asked to audit work quality

## Audit Checklist

### Phase 1: Docs-First

- [ ] Relevant docs were read before implementation
- [ ] Key invariants (3-5) were identified
- [ ] Plan doesn't contradict documented contracts

### Phase 2: Analysis

- [ ] Three Lenses applied (Product, Architect, Maintainer)
- [ ] Confidence threshold met (85%) or questions asked
- [ ] All `strict_constraints` (Ограничения) followed
- [ ] All `questions_answered` (Вопросы) explicitly addressed

### Phase 3: Context7

- [ ] External APIs verified via Context7 (no hallucinations)
- [ ] Library versions checked against project dependencies

### Phase 4: Implementation

- [ ] Code style followed (skills auto-loaded)
- [ ] No zombie code (commented-out code removed)
- [ ] Comments are current and synced with logic
- [ ] No unnecessary refactoring of legacy code

### Phase 5: Verification

- [ ] `final-checker` agent was invoked
- [ ] All automated checks passed (lint, build)
- [ ] Three Lenses re-applied to final result

## Output

After audit, report:
1. **Compliance Summary**: Which phases were fully followed
2. **Issues Found**: Any gaps or violations
3. **Recommendations**: Fixes needed before completion
