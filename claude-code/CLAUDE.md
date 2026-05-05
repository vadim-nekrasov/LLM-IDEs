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

Skills load focused patterns into context — they aren't gates and shouldn't be
invoked for trivial edits. Claude Code surfaces relevant skills by their
frontmatter (`description`, `paths`); language and review skills auto-trigger
on matching files.

`applying-workflow` is the router entry point: it links to docs-first discovery,
Three Lenses, and confidence-check patterns. Start there for non-trivial work.

## Design Principles

Always evaluate proposed changes through SOLID, GRASP, DRY, KISS, YAGNI. The
detailed Three Lenses pass lives in `skills/_shared/three-lenses.md`; this
bullet exists so the principles stay in always-loaded context regardless of
which skill is invoked.

## Documentation

- Read every `docs/index.md` from the project root down to the file you intend
  to edit. Adjacent component docs too, when present.
- A change requires a `docs/index.md` update when it touches: barrel
  exports / entry points, public API contracts, CLI / URL surface,
  configuration or environment variables, public hooks, components,
  Redux slices, React contexts, or `mod.rs` / `lib.rs` boundaries. The
  session-summary hook flags this post-factum, but the responsibility is on
  the change author — don't wait for the hook.

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
