---
name: applying-rules-cluster
description: Cross-cutting drafting rules for comments, diffs, .claude config, and project docs. Read the matching section before emitting any edit.
paths:
  - "**/*"
---

# Drafting Rules — Read the Matching Section Before You Write

## When drafting a comment

Default: write no comment. Opt in only for a non-obvious "why" — hidden constraint, subtle
invariant, surprising workaround. Touch only comments on lines you edited this diff.

**Hard cap: any single comment block ≤ 2 lines** (JSDoc, `/* */`, `//`-run, `#`-run all
included) — `edit-guard.ts` denies a 3+-line block before it lands, so split into
code-level clarity instead. Don't write narration (`// iterate over users`, `// now we
save`), issue refs (`// TODO(ABC-123)`), or churn notes (`// existing behaviour preserved`).

## When extending a diff

Change only what the task requires. No speculative refactor, preemptive abstraction, or
"while I'm here" cleanup of untouched code. No fallback / validation / try-catch around a
path that already has a system-boundary handler. DRY only between sites you are already
editing — don't extract a helper for untouched code, or add an `if (!x) return` guard for a
value the caller already validated.

## When touching .claude config or ~/.claude.json

Edit in place; do not back up. No `.bak` / `.backup` / `.orig` / timestamped / duplicate
copies of any file under `.claude/` or of `~/.claude.json`, and no commented-out previous
values left beside the new ones.

## When writing project docs (README.md, docs/**, CLAUDE.local.md)

English, project-scoped, Claude-internal paths invisible. No mixed-language or Russian body
prose. No references to `.claude/`, `~/.claude.json`, or any Claude Code internal path —
skill and hook names included. Describe the project's behaviour and contract, not the
assistant's workflow.
