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

- Don't edit `node_modules/`, `target/`, or anything inside `.claude/` unless
  the task explicitly requires it (this directory is the shared config repo).
- Version control is the user's job — `git commit` / `git push` are blocked
  by deny rules in `~/.claude/settings.json`, so don't try to bypass.
- Don't modify build/lint/format manifests (`package.json`, `tsconfig.json`,
  `eslint.config.*`, `Cargo.toml`, etc.) unless required by the task.
- For linting, default to `npm run lint:js` for JS/TS-only changes. When the
  change touches non-JS lintable files (`.glsl`, `.scss`, `.css`, etc.), run
  `npm run lint` so every `lint:*` subscript executes — `lint:js` alone misses
  shader/style validators. Raw `npx`/`bunx`/`pnpm dlx`/`yarn dlx eslint` is
  blocked at the harness level via deny rules in `settings.json` (the
  `package.json` script is the audited entry point; raw `eslint` accepts
  arbitrary `--rulesdir`/`--config` paths that execute JS).
- Don't prepend `cd <path> && ` to a `git` command, even when `<path>` is a
  subdirectory of the current project — `git log`, `status`, `diff`, `show`,
  `blame`, etc. already see the whole working tree regardless of cwd. When
  a specific subdirectory really is required, use `git -C <path> <subcmd> …`
  (one invocation, no `cd`, no permission prompt).

## Permission Modes

Default mode is `default`: Read / Grep / Glob and read-only Bash
(`ls`, `find`, `git status`, etc.) are auto-approved; Edit / Write and
non-read-only Bash require an explicit prompt. The user toggles modes via
`Shift+Tab` in the CLI:

- `acceptEdits` — auto-approve file edits + safe filesystem commands
  (`mkdir`, `mv`, `cp`, `sed`) inside the working directory; other Bash
  still prompts. Use this for active development.
- `plan` — read-only exploration; writes are blocked. Equivalent to the
  `/plan` prefix or starting with `--permission-mode plan`.
- `auto` — no prompts, with a background classifier as a safety net (Max /
  Team / Enterprise plans only).
- `bypassPermissions` — explicitly disabled by `disableBypassPermissionsMode:
  "disable"`.

Settings live in `~/.claude/settings.json` (user) and `<project>/.claude/
settings.json` (project, plus `settings.local.json` for personal overrides).
MCP server configuration lives in `~/.claude.json` (global) or `.mcp.json`
(project), not in `settings.json`.

## Plugin Hooks & Behaviors

- **`security-guidance`** registers a `PreToolUse` hook on
  `Edit|Write|MultiEdit` and **blocks** the edit (exit 2) the first time a
  file matches one of its dangerous-pattern substrings. Categories: dynamic
  JS code execution, child-process / system invocations, unsafe DOM
  operations (innerHTML setter, React dangerously-set-html, document write),
  Python serialization, and any change to `.github/workflows/*.yml`. Full
  substring list lives in
  `~/.claude/plugins/cache/claude-plugins-official/security-guidance/unknown/hooks/security_reminder_hook.py`
  (`SECURITY_PATTERNS`). When the match is legitimate (a test for unsafe
  behavior, security documentation, this very file), set
  `ENABLE_SECURITY_REMINDER=0` in the env. Per-session warning state lives
  in `~/.claude/security_warnings_state_<session>.json` — shown once per
  `(file, rule)` pair, then suppressed.
- **`hookify`** registers hooks on `PreToolUse / PostToolUse / Stop /
  UserPromptSubmit` and reads rules from `.claude/hookify.*.local.md`. With
  no rules configured the hooks no-op (small but non-zero latency). Manage
  rules through `/hookify:hookify`, `/hookify:list`, `/hookify:configure`.
- **`code-modernization` is disabled globally** — it targets COBOL / Java /
  .NET legacy and isn't relevant to typical work here. Re-enable in
  `~/.claude/settings.json → enabledPlugins` if a legacy project shows up.
- **`edit-guard` writing-docs gate**: PreToolUse hook on
  `Edit|Write|MultiEdit` **hard-blocks** edits to `docs/**/*.md` and
  `README*.md` when the `writing-docs` skill has not been invoked in the
  current session. Invoke it via the Skill tool before drafting doc edits
  so the markdown-doc rubric is applied before, not after, the edit.
  CLAUDE.md / CLAUDE.local.md / CHANGELOG.md and anything under `.claude/`
  (plan, memory, hookify rules, skills) are excluded.
- **Emergency hook kill-switch**: if `security-guidance` or any other hook
  blocks a legitimate edit chain, set `"disableAllHooks": true` in
  `settings.json` to silence every hook until restart. Re-enable when done.

## Review Hierarchy

| Scenario | Tool |
|---|---|
| After any code edit (typecheck + lint + Three Lenses) | `final-checking` skill (Stop hook reminds) |
| After any project Markdown edit (README, docs/**/*.md) | `writing-docs` skill (Stop hook reminds — same gate as `final-checking`) |
| Before committing a substantial change | `/pr-review-toolkit:review-pr` (6 agents) |
| Post a review comment on an existing GitHub PR | `/code-review:code-review <PR#>` |
| Hunt silent failures / wrong catch blocks specifically | `pr-review-toolkit:silent-failure-hunter` agent |

## After Code Edits

Invoke the `final-checking` skill before stopping — it covers typecheck, lint,
the Three Lenses pass, and a structured checklist. The Stop hook reminds you
once if it's missing; on a second Stop it lets the session end (anti-loop).

For substantial changes (a new feature, a refactor, > 3 files touched) also
run `/pr-review-toolkit:review-pr` — it covers comments / tests / errors /
types / code / simplify through specialised agents, complementing the
lighter `final-checking` pass.

The `session-summary` hook prints docs read, doc-update verdict, and skills
used automatically — no need to recreate that block in chat.
