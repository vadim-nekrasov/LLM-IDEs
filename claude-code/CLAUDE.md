# CLAUDE.md

Universal instructions shared across projects (this file is a symlinked overlay
in each project that uses the same Claude Code config).

## Communication

- Replies to user: Russian.
- Code, identifiers, inline comments, commit messages: English.

## Drafting Rules

Recurrent drafting rules (inline comments, minimal diffs, no `.claude/`
config backups, English-only project docs) live in the auto-loaded
`applying-rules-cluster` skill. The 2-line comment-block cap is
hard-enforced by the `edit-guard.ts` PreToolUse hook. Markdown docs
aren't bound by the comment line-count cap.

## Project-specific overrides

Each project may add `${CLAUDE_PROJECT_DIR}/CLAUDE.local.md` with stack, layout,
scripts, and conventions. Read it first when present — it's the authoritative
overlay for that project. The shared file (this one) intentionally avoids
project specifics.

## Research Hierarchy

External info hierarchy and zero-hallucination policy live in the
`researching` skill (`skills/researching/SKILL.md`); invoke via `/researching`
or "иерархия поиска".

Critical-evaluation reminders for `mcp__perplexity__*` and the
`claude-code-guide` subagent are auto-appended by the
`critical-eval-reminder.ts` PostToolUse hook — no need to repeat in prompts.

## Skills & Plugin Commands

Skills are context routers (`writing-*`, `applying-workflow`, `debugging`,
`final-checking`, `reviewing-*`, `claude-md-improver`, `frontend-design`).
They aren't gates; Claude Code surfaces them by frontmatter (`description`,
`paths`). Language and review skills auto-trigger on matching files.

`applying-workflow` is the router entry point for non-trivial edits
(docs-first discovery → Three Lenses → Context7 verification →
final-checking).

Plugin commands (installed via `claude-plugins-official`) cover targeted
scenarios — pick one when its scope matches:

| Command | When to use |
|---|---|
| `/feature-dev:feature-dev` | New feature touching 3+ files and needing architectural decisions. Heavier than `applying-workflow`: 7 phases with code-explorer / code-architect / code-reviewer agents. |
| `/pr-review-toolkit:review-pr` | Before committing a substantial change — 6 specialised agents (comments / tests / errors / types / code / simplify). |
| `/code-review:code-review <PR#>` | Post a review comment on a GitHub PR via `gh pr comment` (requires `gh` CLI and PR access). |
| `/revise-claude-md` | After a session, capture learnings into the project's `CLAUDE.md`. |
| `claude-md-improver` skill | Full audit and update of `CLAUDE.md` — invoke manually for "clean up CLAUDE.md" requests. |
| `frontend-design` skill | Build a distinctive UI from scratch (dashboard, landing, new page). For edits in an existing React codebase prefer `writing-react`. |
| `/hookify:hookify [description]` | Generate a hook from a session pattern or explicit description. `/hookify:list`, `/hookify:configure` manage rules. |

Shell injection inside skills (`` !`cmd` `` and ` ```! ` blocks) is disabled
project-wide via `disableSkillShellExecution: true` in `settings.json`. This
only affects user markdown skills; bundled and plugin skills (including
`frontend-design`, `claude-md-improver`) call tools through normal tool
invocations and are unaffected. To pull live data into context, use a hook
(`UserPromptSubmit` is the typical place) or have the skill invoke the
relevant tool explicitly.

## Design Principles

Design changes go through `skills/_shared/solid-audit.md` — a yes/no rubric
with required YAML evidence per SOLID principle (apply/skip triggers live
there). GRASP, DRY, KISS, YAGNI stay as Architect-Lens heuristics in
`skills/_shared/three-lenses.md`.

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

- Don't edit `node_modules/`, `target/`, build/lint/format manifests, or `.claude/` unless required.
- `git commit` / `git push` blocked at settings deny — don't bypass.
- Lint: `npm run lint:js` for JS/TS-only; `npm run lint` when `.glsl`/`.scss`/`.css` touched (raw `eslint` blocked — accepts `--config` that executes JS).
- Use `git -C <path> <subcmd>`; never `cd <path> && git …` (triggers permission prompts).

## Permission Modes

Default = `default`; `bypassPermissions` hard-disabled via `disableBypassPermissionsMode`.
Cycle via `Shift+Tab`; semantics — https://docs.claude.com/en/docs/claude-code/settings.
Hierarchy: User (`~/.claude/settings.json`) ← Project (`<project>/.claude/settings.json`)
← Local (`settings.local.json`). MCP config — `~/.claude.json` or `.mcp.json`, not `settings.json`.

## Plugin Hooks

- `security-guidance@2.0.2` — PostToolUse pattern warnings on `Edit|Write|MultiEdit|NotebookEdit` (non-blocking; findings attach via `hookSpecificOutput.additional_context`). PostToolUse[Bash] async-rewake on `git commit/push` and `gt create|modify|submit`; Stop async-rewake LLM-driven diff review. Kill: `SECURITY_GUIDANCE_DISABLE=1` / `ENABLE_PATTERN_RULES=0` / `ENABLE_STOP_REVIEW=0` / `ENABLE_COMMIT_REVIEW=0`.
- `edit-guard` PreToolUse hard-blocks edits to `docs/**/*.md` and `README*.md` without an active `writing-docs` skill in the session. `.claude/**`, CLAUDE.md, CLAUDE.local.md, CHANGELOG.md exempt.
- Emergency kill: `"disableAllHooks": true` in `settings.json` silences every hook until restart.

## After Code Edits & Reviews

- After code edit: `final-checking` (typecheck + lint + Three Lenses). Stop hook reminds once; second Stop lets session end.
- After Markdown edit (README, `docs/**/*.md`): `writing-docs`. Same Stop-gate.
- Substantial change (> 3 files / new feature / refactor): `/pr-review-toolkit:review-pr`.
- Post-review on GitHub PR: `/code-review:code-review <PR#>`.
- Silent-failure hunt: `pr-review-toolkit:silent-failure-hunter` agent.

`session-summary` Stop hook prints docs read, doc-update verdict, and skills used — no need to recreate.
