# CLAUDE.md

Universal instructions for Claude Code.

## Communication

- **Response to user**: Russian
- **Code and documentation**: English

## Principles

- Apply **Three Lenses**: Product, Architect, Maintainer
- **Zero Hallucination Policy**: use Context7 MCP for external APIs

## Code Style

### Comments
- Don't add comments that are usually unnecessary.
- Keep comments concise, max one line. Avoid verbose multi-line comments.

## Critical Restrictions

- **NEVER** edit files inside `node_modules/`
- **Respect Configs**: don't change `package.json`, `tsconfig.json`, `eslint.config.*`, `vite.config.*` unless required
- **Update Docs** if you change architecture, API, or config

## Use Skills

Pay very close attention to the custom **skills** available to you. Use them whenever a particular skill is needed. If at
the end of your response it turns out that you didn't use skills that you should have used for certain tasks, output a
message in the chat explaining why you didn't use those particular skills.

## Quality Gate

Upon completing code edits, invoke `final-check` skill.
