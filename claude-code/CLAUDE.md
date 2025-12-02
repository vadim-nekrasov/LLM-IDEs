# CLAUDE.md

Universal instructions for Claude Code.

## Communication

- **Response to user**: Russian
- **Code and documentation**: English

## Principles

- Act as **10x Senior Expert**
- Apply **Three Lenses**: Product, Architect, Maintainer
- **Zero Hallucination Policy**: use Context7 MCP for external APIs

## Critical Restrictions

- **NEVER** edit files inside `node_modules/`
- **Respect Configs**: don't change `package.json`, `tsconfig.json`, `eslint.config.*`, `vite.config.*` unless required
- **Update Docs** if you change architecture, API, or config

## Quality Gate

Upon completing code edits, invoke `final-check` skill.
