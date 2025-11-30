# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This repository contains Cursor IDE rules and commands — a collection of coding standards, quality guidelines, and AI assistant prompts for consistent software development practices.

## Repository Structure

```
cursor/
├── rules/           # MDC rule files (applied based on globs or explicitly)
│   ├── main.mdc                    # Core config, always applied
│   ├── ecmascript-code-style.mdc   # JS/TS 2025 modern patterns (*.ts,*.tsx,*.js,*.jsx)
│   ├── typescript.mdc              # TS-specific patterns (*.ts,*.tsx)
│   ├── react.mdc                   # React patterns (*.tsx,*.jsx)
│   ├── any-frontend-file.mdc       # Frontend files (includes CSS/SASS)
│   ├── expert-mindset.mdc          # Three Lenses analysis framework
│   ├── submit.mdc                  # Task analysis pipeline
│   ├── final-checks.mdc            # Pre-completion verification checklist
│   └── console-logs.mdc            # Debugging methodology (20+ hypotheses)
└── commands/        # Slash commands for Cursor
    ├── check-all-fixes.md          # Critical audit + solution tree search
    ├── solution-tree-search.md     # Tree-based solution exploration algorithm
    └── generate-folder-documentation.md
```

## Key Concepts

### Three Lenses Framework (expert-mindset.mdc)

Analysis methodology applied during planning and verification:
1. **Product Lens**: User value, UX, backward compatibility, regression prevention
2. **Architect Lens**: SOLID, DRY, KISS, scalability, idiomatic patterns
3. **Maintainer Lens**: Readability, debuggability, code consistency

### Task Pipeline (submit.mdc)

1. **Analysis**: 85% confidence threshold — ask questions if below
2. **Docs-First**: Check internal docs before coding; update if architecture changes
3. **Implementation**: Follow ecmascript-code-style.mdc
4. **Verification**: Run final-checks.mdc after code edits

### Debugging Protocol (console-logs.mdc)

Generate at least 20 hypotheses before adding logs. Use serialization for object logging:
```js
console.log('User:', JSON.stringify(user, null, 2));
```

## Code Style Highlights (ecmascript-code-style.mdc)

- **Target**: Latest Chrome / ES2025
- **Prefer**: `const` over `let`, functional style, Iterator Helpers, Set operations
- **Modern APIs**: `Object.groupBy`, `Promise.withResolvers`, `Promise.try`, `structuredClone`
- **Immutable arrays**: `toSorted`, `toReversed`, `toSpliced`
- **Arrow functions**: Single param without parens
- **Event handlers**: `handleClick`, `handleSubmit` naming

## Critical Restrictions

- Never edit `node_modules/`
- Do not freely change `package.json`, `tsconfig.json` without explicit need
- All comments and documentation must be in English
- No commented-out code ("zombies")

## Language Policy

- Code comments and documentation: **English only**
- Chat responses to user: **Russian**
