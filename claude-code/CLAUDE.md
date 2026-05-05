# CLAUDE.md

Universal instructions shared across projects (this file is a symlinked overlay
in each project that uses the same Claude Code config).

## Communication

- Replies to user: Russian.
- Code, identifiers, inline comments, commit messages: English.

## Project-specific overrides

Each project may add `${CLAUDE_PROJECT_DIR}/CLAUDE.local.md` with stack, layout,
scripts, and conventions. Read it first when present — it's the authoritative
overlay for that project. The shared file (this one) intentionally avoids
project specifics.

## Research Hierarchy

1. **Context7 MCP** — third-party library APIs (zero-hallucination policy: never
   guess signatures; verify with the installed version).
2. **Perplexity MCP** — architecture, best practices, comparisons, current
   trends. Treat the output critically; don't act on a single citation.
3. **WebSearch** — fallback for general queries.

## Skills

Skills load focused patterns into context. Use them when relevant — they aren't
gates and shouldn't be invoked for trivial edits. Common ones:
`applying-workflow`, `writing-typescript`, `writing-react`, `writing-ecmascript`,
`writing-wgsl`, `writing-rust`, `final-checking`, `debugging`,
`searching-solutions`, `reviewing-state`, `reviewing-apis`.

The `applying-workflow` skill is a router: it links to docs-first discovery,
Three Lenses, and confidence-check patterns.

## Documentation

- Read every `docs/index.md` from the project root down to the file you intend
  to edit. Adjacent component docs too, when present.
- Update `docs/index.md` after changes to: public API contracts, barrel
  exports, configuration / environment variables, hooks, components, slices,
  contexts. The session-summary hook flags when an update is likely needed.

## Critical Restrictions

- Don't edit `node_modules/`, `target/`, or anything inside `.claude/` unless
  the task explicitly requires it (this directory is the shared config repo).
- Don't run `git commit` or `git push` — the user handles version control.
- Don't modify build/lint/format manifests (`package.json`, `tsconfig.json`,
  `eslint.config.*`, `Cargo.toml`, etc.) unless required by the task.

## After Code Edits

Invoke the `final-checking` skill before stopping — it covers typecheck, lint,
the Three Lenses pass, and a structured checklist. The Stop hook reminds you
once if it's missing; on a second Stop it lets the session end (anti-loop).

The `session-summary` hook prints docs read, doc-update verdict, and skills
used automatically — no need to recreate that block in chat.
