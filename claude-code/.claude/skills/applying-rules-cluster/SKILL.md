---
name: applying-rules-cluster
description: Cross-cutting drafting rules for comments, diffs, .claude config, and project docs. Read the matching section before emitting any edit.
when_to_use: Auto-loaded on every edit via `paths: ['**/*']`. Read the section matching your current action before drafting.
paths:
  - "**/*"
user-invocable: false
---

# Drafting Rules — Read the Matching Section Before You Write

## When drafting a comment

Default: write no comment.

- Opt in only for non-obvious "why": hidden constraint, subtle invariant, surprising workaround.
- Hard cap: any single comment block ≤ 2 lines (JSDoc and `/* */` included). 3+ lines forbidden — split into code-level clarity instead.
- Touch only comments on code you edited in this diff; do not retouch comments on lines you did not modify.
- Don't write: `// iterate over users` · `// now we save` · `// TODO(ABC-123)` · `// existing behaviour preserved` · `// added for issue #42`.

## When extending a diff

Default: change only what the task requires.

- No speculative refactor, no preemptive abstraction, no "while I'm here" cleanup of untouched code.
- No fallback / validation / try-catch around code paths that already have a system-boundary handler.
- DRY only between sites you are already editing; do not extract a helper to deduplicate untouched code.
- Don't write: a new util consumed only by the file you just touched · a try/catch that re-throws unchanged · an `if (!x) return` guard for a value the caller already validated · a feature-flag shim when you can change the code directly.

## When touching .claude config or ~/.claude.json

Default: edit in place; do not back up.

- No `.bak`, `.backup`, `.orig`, timestamped, or duplicate copies of any file under `.claude/` or of `~/.claude.json`.
- No commented-out previous values left next to new values.
- Don't write: `settings.json.bak` · `claude.json.2026-06-01` · `// was: "model": "opus-4-6"` · `settings.json.orig`.

## When writing project docs (README.md, docs/**, CLAUDE.local.md)

Default: English, project-scoped, Claude-internal paths invisible.

- Language: English. No mixed-language paragraphs, no Russian headings, no localised body prose.
- No references to `.claude/`, `.claude/skills/`, `~/.claude.json`, or any Claude Code internal path.
- Describe the project's behaviour and contract, not the assistant's workflow.
- Don't write: "See `.claude/skills/writing-react`" · "Claude will then run …" · a Russian section header · a sentence referencing a skill or hook by name.
