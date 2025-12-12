# CLAUDE.md

Universal instructions for Claude Code.

## Communication

- **Response to user**: Russian
- **Code and documentation**: English

## Principles

- Apply **domain expertise** relevant to the task
- Apply **Three Lenses**: Product, Architect, Maintainer
- **Zero Hallucination Policy**: use Context7 MCP for external APIs
  - **Always** use Context7 automatically when generating code with third-party libraries
  - Do NOT guess API signatures — verify via Context7

## CRITICAL: Skill Invocation

**STOP** before editing any code file. Invoke skills in order:

| Order | Skill | When                                                |
|-------|-------|-----------------------------------------------------|
| 1 | `applying-workflow` | Always for code changes (loads docs-first workflow) |
| 2 | `writing-ecmascript` | .js, .jsx, .ts, .tsx files                          |
| 3 | `writing-typescript` | .ts, .tsx files                                     |
| 4 | `writing-react` | .jsx, .tsx files                                    |
| 5 | `writing-lua` | .lua files                                          |
| 6 | `writing-rust` | .rs files                                           |
| 7 | `writing-wgsl` | .wgsl files                                         |

This is NOT optional. Failure to invoke skills before editing is a violation.

Upon completing code edits, invoke `final-checking` skill.

## Code Style

### Comments
- Avoid unnecessary comments
- Keep comments concise (max one line)

### Package Awareness

#### Frontend
- Pay attention to package versions in package.json
- Respect settings in tsconfig.json, eslint.config.*, vite.config.*

#### Rust & GPU
- Check `Cargo.toml` for dependencies and features
- Respect `clippy.toml`, `.cargo/config.toml` for linting settings
- Check `rust-toolchain.toml` for required Rust version

## Docs-First Discovery (MANDATORY)

**Before ANY code edit**, locate and read:
1. `docs/index.md` — from edited file path up to project root
2. `README.md` — project overview
3. Related component docs (if editing components)

**NO EXCEPTIONS** — even for "simple" fixes. Understanding context prevents bugs.

## Critical Restrictions

- **NEVER** edit files inside `node_modules/` or `target/` (Rust build directory)
- **NEVER** run `git commit` or `git push` — user handles version control
- **Respect Configs**: don't change `package.json`, `tsconfig.json`, `eslint.config.*`, `vite.config.*`, `Cargo.toml` unless required

## Documentation Sync (MANDATORY)

Keep documentation accurate. Update `docs/index.md` when:

1. **After code changes** affecting public API, behavior, or architecture
2. **If you discover inaccurate docs** during exploration → fix immediately
3. **If you discover important undocumented aspects** → add them (within limits)

**Triggers for mandatory doc update**:
- Architecture or directory structure changes
- Public exports (barrel files, entry points)
- API contracts, URLs, CLI interfaces
- Configuration or environment variables
- Public names (hooks, components, slices, contexts)

## Session Summary (MANDATORY)

**CRITICAL**: Before stopping, you MUST provide a session summary:

### Docs read
List documentation files read during the session (`.md` files and `/docs/` paths).

### Docs update
State whether documentation update was required and why:
- **Triggers**: barrel files, API contracts, configs, hooks, components, slices, contexts
- Format: "Yes/No" with brief reason if Yes

### Skills used
List ALL skills invoked during the session:
- Format: `skill-name` (count) — e.g., `final-checking` (1), `writing-typescript` (2)
- If no skills were used, state: "No skills used in this session"

This is NOT optional. Failing to include this summary is a violation of instructions.
