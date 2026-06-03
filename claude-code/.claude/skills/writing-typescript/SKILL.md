---
name: writing-typescript
description: TypeScript patterns — type definitions, generics, utility types, discriminated unions, type guards, satisfies/as const. Auto-trigger on .ts/.tsx edits.
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# TypeScript Code Style

> **Working with linters in legacy codebases.** When editing a file you may see existing warnings from older code — **ignore them**, don't refactor them. Be responsible only for your own fresh diff.
>
> **Never run mass autofix** (`eslint --fix .` or `eslint --fix src/`) — it can rewrite many files at once and introduce regressions. Editor per-file autofix on the file you are currently editing is fine.

> For general JS/TS style (functional iterators, Set operations, immutable
> array methods, Promise patterns) see `writing-ecmascript` — it now applies
> to `.ts`/`.tsx` as well.

## Types

- `any` → use concrete types or generics
- `unknown` → use type guards for narrowing
- `enum` → prefer `const` objects or union types
- Avoid type assertions — use type guards instead of `as` or non-null assertion (!) operator
- Use `import type` for type-only imports
- Use utility types: `Partial`, `Pick`, `Omit`, `Record`, `Readonly`
- Infer interfaces from Zod schemas when possible

## Functions

- Use default parameters
- RORO pattern for ≥3 args (Receive Object, Return Object)

## Modern TypeScript

### `satisfies` Operator
Verifies shape but preserves exact literal types:
```ts
const config = {
  apiBaseUrl: '/api',
  retryCount: 3,
} satisfies {
  apiBaseUrl: string;
  retryCount: number;
};
// config.apiBaseUrl is type '/api', not string
```

### `as const` Assertion
Freezes literals for type inference:
```ts
const ROUTES = {
  HOME: '/',
  ADMIN: '/admin',
} as const;

type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]; // "/" | "/admin"
```

## Patterns

### Discriminated Unions
```ts
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: Error };
```

### Template Literal Types
```ts
type EventName = `on${Capitalize<string>}`;
```

### Type Guards
```ts
function isUser(value: unknown): value is User {
  return typeof value === 'object' && value !== null && 'id' in value;
}
```

## Anti-patterns

```ts
// ❌ Bad - improper generic constraints
function process<T>(data: T) { ... } // T is too broad

// ✅ Good
function process<T extends BaseData>(data: T) { ... }

// ❌ Bad - unnecessary type assertion
const user = data as User;

// ✅ Good - type guard
if (isUser(data)) {
  // data is User here
}
```
