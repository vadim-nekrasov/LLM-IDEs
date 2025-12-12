---
description: Review code changes using Three Lenses analysis and code style verification
allowed-tools: Read, Grep, Glob, Skill
---

# Code Review

Analyze proposed changes for quality, correctness, and maintainability.

## Input

Review code changes:
- Diff/patch
- Code snippets
- Pull request description
- File changes

## Analysis

### Three Lenses
- **Product**: Real problem solved? Regressions? Edge cases?
- **Architect**: SOLID, GRASP, DRY, KISS? Scalable? Safe? Performant?
- **Maintainer**: Readable? No dead code? Clean?

### Code Style Compliance

Verify code follows patterns from relevant language/framework skills:
- TypeScript → `writing-typescript` skill
- React/JSX/TSX → `writing-react` skill
- JavaScript → `writing-ecmascript` skill
- Lua → `writing-lua` skill
- State management → `reviewing-state` skill
- API/HTTP clients → `reviewing-apis` skill

### Documentation Updates

If changes affect any of the following, verify docs are updated:
- [ ] Architecture or directory structure
- [ ] Public exports (barrel files, entry points)
- [ ] API contracts, URLs, CLI interfaces
- [ ] Configuration or environment variables
- [ ] Public names (hooks, components, slices, contexts)

Check that all `docs/` folders on the path to modified files have been consulted and updated if needed.

## Output Format

```
## Summary
[1-2 sentence overall assessment]

## Issues Found
- [Issue]: [Description] — Severity: Critical/Major/Minor

## Style Violations
- [File:Line]: [Violation of which skill pattern]

## Documentation Gaps
- [What needs documentation update]

## Suggestions
- [Optional improvement]

## Verdict
APPROVE / REQUEST CHANGES / NEEDS DISCUSSION
```
