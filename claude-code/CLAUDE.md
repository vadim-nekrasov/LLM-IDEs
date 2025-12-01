# CLAUDE.md

Project instructions for Claude Code when working with NexCity.Frontend.

## Communication

- **Response to user**: Russian
- **Code and documentation**: English

## Expert Mindset

Act as a **10x Senior Expert**. Apply deep domain knowledge, best practices, and intuition.

### The Three Lenses (Canonical Definition)

**A. Product Lens** (User & Business)
- Solve the *real* problem (not just symptoms)
- Regression check — will this break existing workflows?
- Handle edge cases, errors, loading states

**B. Architect Lens** (System & Scale)
- SOLID, DRY, KISS, High Cohesion & Low Coupling
- Idiomatic for this stack? Simple, not overengineered?
- Safe? (Performance, memory leaks, security)

**C. Maintainer Lens** (Future & Team)
- Will a junior developer understand this in a month?
- No commented-out code or unused imports
- Don't add comments to code you didn't write; avoid trivial comments

## Critical Restrictions

- **NEVER** edit files inside `node_modules/`
- **Respect Configs**: Do not change `package.json`, `tsconfig.json`, `eslint.config.mjs`, `vite.config.ts` unless explicitly required
- If you change architecture, API, or config → **Update the Docs**

## Default Workflow (Auto-Apply for File-Editing Tasks)

Follow this pipeline for any task requiring code changes:

### Phase 1: Docs-First Discovery

Before writing code:
1. Search for `**/docs/*.md` relevant to task area
2. Read `React/src/docs/index.md` for frontend architecture
3. Extract 3-5 key invariants/contracts from docs

**Skip only if**: atomic fix within one file AND doesn't affect contracts.

### Phase 2: Analysis & Confidence Check

1. Apply **Three Lenses** analysis
2. If confidence < 85% on critical business logic/architecture → **ASK first**
3. Detect "Ограничения" in user prompt → treat as `strict_constraints`
4. Detect "Вопрос"/"Вопросы" → **must answer explicitly**

### Phase 3: External Documentation (Context7)

**Zero Hallucination Policy**:
- Do NOT guess API signatures for third-party libraries
- If not 100% sure of current version's API → use Context7 MCP
- **Always** use Context7 for setup, configuration, complex API usages

### Phase 4: Implementation

- Code style auto-loaded via skills (see Code Style section)
- Sync comments with logic changes
- No zombie code (commented-out code)
- If bug cause unclear → add logs first, don't patch blindly

### Phase 5: Verification

Upon completing code edits, invoke `final-checker` agent.
**Skip only if**: changes were exclusively non-logic (comments, logs, typos).

## Project Overview

NexCity.Frontend is a monorepo containing a React-based smart city management platform. Main frontend: `React/src/`.

```
NexCity.Frontend/
├── React/src/           # Main React frontend (pnpm)
├── API/                 # .NET API with Redis, MSSQL
├── Consumer/            # RabbitMQ consumer service
├── CDS/                 # Assets API (.NET)
├── Integration/         # Integration WebAPI
├── Signaling/           # SignalR real-time service
└── Deployment/          # Helm charts
```

## Architecture

**Tech Stack**: React 18, TypeScript (strict), Vite, Redux Toolkit + redux-observable, react-map-gl, Kendo React, MSAL, axios, SignalR.

**Source Structure** (`React/src/src/`):
- `components/` - UI components
- `features/` - Redux slices + RxJS epics
- `hooks/` - Reusable hooks
- `pages/` - Page components
- `services/` - API clients, SignalR
- `store/` - Redux config
- `model/` - Domain types

**Key Patterns**:
- Routing: `createHashRouter` with auth guards
- API: axios + MSAL token injection
- Imports: `@/` alias → `./src`
- Styling: SCSS modules

## Code Style

Auto-loaded via Claude Code skills when editing relevant files:
- `ecmascript-style` - ES2025 patterns (*.ts, *.tsx, *.js, *.jsx)
- `react-style` - React patterns (*.tsx, *.jsx)
- `typescript-style` - TypeScript patterns (*.ts, *.tsx)
- `frontend-config` - Config file awareness

## Development Commands

From `React/src/`:
```bash
pnpm install    # Install deps
pnpm dev        # Dev server (port 3000)
pnpm build      # Type-check + build
pnpm test       # Run Vitest
pnpm lint       # ESLint + Stylelint
pnpm format     # Prettier
```

## Enforcement

Hooks in `.claude/settings.json`:
- **PreToolUse**: Blocks edits to `node_modules/`
- **PostToolUse**: Auto-formats with prettier after Edit/Write

## External Documentation

- [Kendo React](https://www.telerik.com/kendo-react-ui/components/)
- [react-map-gl](http://visgl.github.io/react-map-gl/docs)
- [Redux Toolkit](https://redux-toolkit.js.org)
