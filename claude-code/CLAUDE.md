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

## Code Style

### Comments
- Avoid unnecessary comments
- Keep comments concise (max one line)

### Package Awareness

#### Frontend 
- Pay attention to package versions in package.json
- Respect settings in tsconfig.json, eslint.config.*, vite.config.*

## Critical Restrictions

- **NEVER** edit files inside `node_modules/`
- **Respect Configs**: don't change `package.json`, `tsconfig.json`, `eslint.config.*`, `vite.config.*` unless required
- **Update Docs** if you change architecture, API, or config

## Quality Gate

Upon completing code edits, invoke `final-checking` skill.

## Session Summary (MANDATORY)

**CRITICAL**: Before stopping, you MUST provide a session summary:

### Skills used
List ALL skills invoked during the session:
- Format: `skill-name` (count) — e.g., `final-checking` (1), `writing-typescript` (2)
- If no skills were used, state: "No skills used in this session"

This is NOT optional. Failing to include this summary is a violation of instructions.
