# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Expert Mindset

Act as a **10x Senior Expert** in the specific domain of the task. Apply deep domain knowledge, best practices, and intuition.

### The Three Lenses (Apply during Planning & Verification)

**A. Product Lens** (User & Business)
- Does this solve the user's *real* problem (not just symptoms)?
- Will this break existing workflows? (Regression check)
- Handles edge cases, errors, loading states?

**B. Architect Lens** (System & Scale)
- SOLID, DRY, KISS, High Cohesion & Low Coupling
- Idiomatic for this stack? Simple, not overengineered?
- Safe? (Performance, memory leaks, security)

**C. Maintainer Lens** (Future & Team)
- Will a junior developer understand this in a month?
- No commented-out code or unused imports

## Communication & Tools

- **Language**: Code and documentation in **English**. Respond to user in **Russian**.
- **Context7**: Always use Context7 MCP to verify library/API documentation before using unfamiliar APIs. Zero Hallucination policy.
- **Docs-First**: Read relevant `docs/` folders before planning (see `React/src/docs/index.md` for frontend architecture).

## Critical Restrictions

- **NEVER** edit files inside `node_modules/`
- **Respect Configs**: Do not change `package.json`, `tsconfig.json`, `eslint.config.mjs`, `vite.config.ts` unless explicitly required
- If you change architecture, API, or config → **Update the Docs**

## Project Overview

NexCity.Frontend is a monorepo containing a React-based smart city management platform with supporting backend services. The main frontend application is in `React/src/`.

## Repository Structure

```
NexCity.Frontend/
├── React/src/           # Main React frontend application (pnpm)
├── API/                 # .NET API with Redis, MSSQL
├── Consumer/            # RabbitMQ consumer service
├── CDS/                 # Assets API (.NET)
├── Integration/         # Integration WebAPI
├── Signaling/           # SignalR real-time service
└── Deployment/          # Helm charts and deployment configs
```

## Development Commands (React Frontend)

All commands run from `React/src/`:

```bash
pnpm install              # Install dependencies
pnpm start / pnpm dev     # Start Vite dev server (port 3000)
pnpm build                # Type-check + Vite build
pnpm test                 # Run Vitest
pnpm lint                 # Run all linters (ESLint + Stylelint)
pnpm lint:js              # ESLint only
pnpm lint:css             # Stylelint only
pnpm format               # Format with Prettier
```

## Architecture

### Tech Stack
- **React 18** with TypeScript (strict mode, ESNext target)
- **Vite** for build/dev server
- **Redux Toolkit** + **redux-observable** (RxJS epics) for state management
- **react-map-gl** + **Mapbox GL** for map rendering
- **Kendo React** (Fluent theme) for UI components
- **MSAL** (@azure/msal-browser) for Azure AD authentication
- **axios** with interceptors for API calls
- **SignalR** for real-time updates

### Source Structure (`React/src/src/`)
- `components/` - UI components (layout, common, map, auth, assets, reports)
- `features/` - Redux slices + RxJS epics (domain-driven)
- `hooks/` - Reusable React hooks
- `pages/` - Page components (map, reports, assets, exports, settings, login)
- `services/` - API clients, SignalR, analytics
- `store/` - Redux store config, root-epic, root-reducer
- `model/` - Domain and API types
- `styles/` - Global SCSS, Kendo theme overrides
- `utils/` - Utility functions

### Key Patterns
- **Routing**: `createHashRouter` with `AuthenticatedRoute`/`AuthorizedRoute` guards
- **API layer**: axios instances inject MSAL Bearer token; baseURL switches by city tenant
- **Imports**: Use `@/` alias (maps to `./src`)
- **Styling**: SCSS modules (`*.module.scss`), variables auto-imported via Vite

## Code Style

Code style guidelines are provided via Claude Code skills that are auto-invoked when relevant:
- `ecmascript-style` - ES2025 patterns
- `react-style` - React patterns
- `typescript-style` - TypeScript patterns
- `frontend-config` - Config file awareness

## Backend Services Setup

### API Service (Redis + MSSQL)
```bash
# Redis with RediSearch, RedisJSON modules
docker run -d -p 6379:6379 -p 8001:8001 --name redis-stack redis/redis-stack
# Enable keyspace notifications: redis-cli config set notify-keyspace-events KEA
```

### Consumer Service (RabbitMQ)
```bash
docker run -d -p 5672:5672 -p 15672:15672 --name rabbitmq \
  -e RABBITMQ_DEFAULT_USER=frontend_api \
  -e RABBITMQ_DEFAULT_PASS=frontend_api \
  rabbitmq:3-management
```

## Configuration

- Runtime settings: `public/settings.json` (generated from `settings.template.json`)
- Vite aliases: `@` → `./src`, `~` → `node_modules`
- SCSS variables auto-imported: `@use "@/styles/variables" as *`

## External Documentation

- Kendo React: https://www.telerik.com/kendo-react-ui/components/
- react-map-gl: http://visgl.github.io/react-map-gl/docs
- Redux Toolkit: https://redux-toolkit.js.org
