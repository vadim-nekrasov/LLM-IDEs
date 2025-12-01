---
globs: "*.ts,*.tsx,*.js,*.jsx,*.css,*.scss,*.sass"
---

# Frontend Configuration Awareness

## Critical Restriction

**NEVER** edit files inside `node_modules/`! Do not delete anything in it!

## Configuration Files to Check

When editing frontend code, pay attention to versions and settings in:

- **package.json** - package versions, scripts, dependencies
- **tsconfig.json** - TypeScript compiler options, paths, target
- **eslint.config.mjs** - linting rules and plugins
- **vite.config.ts** - build config, aliases, plugins

## Before Making Changes

1. Check the **version** of libraries in `package.json`
2. Verify **TypeScript target** and **module** settings in `tsconfig.json`
3. Check **path aliases** (`@/` → `./src`) in both tsconfig and vite config
4. Review **ESLint rules** that may affect your code style

## Common Checks

```bash
# Verify installed versions
pnpm list <package-name>

# Check if feature is supported by target
# Look at tsconfig.json "target" and "lib" fields
```

## When to Update Configs

Only update configuration files when:
- Task explicitly requires it
- Adding a new dependency that needs config changes
- Fixing a build/lint error that requires config adjustment

**Do NOT** casually modify configs for convenience or "best practices" unless asked.
