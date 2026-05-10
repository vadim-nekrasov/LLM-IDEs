---
name: writing-typescript
description: TypeScript patterns — type definitions, generics, utility types, discriminated unions, type guards, satisfies/as const.
when_to_use: Triggers on edits to .ts/.tsx files or when defining interfaces and types.
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# TypeScript Code Style

> **Lint hints (this project).** Patterns below are flagged by ESLint as warnings (never block CI). When editing a file you may see existing warnings from legacy code — **ignore them**, don't refactor them. Be responsible only for your own fresh diff.
>
> **Never run `eslint --fix .` or `eslint --fix src/`** — it would rewrite legacy files. Editor per-file autofix is fine.
>
> Lint-flagged rule IDs (project-relevant subset): `@typescript-eslint/no-explicit-any`, `@typescript-eslint/no-non-null-assertion`, `@typescript-eslint/no-unnecessary-type-assertion`, `@typescript-eslint/no-floating-promises`, `@typescript-eslint/prefer-nullish-coalescing`, `@typescript-eslint/prefer-optional-chain`, `@typescript-eslint/prefer-as-const`, `@typescript-eslint/consistent-type-imports`, plus a project-specific enum ban via `no-restricted-syntax` on `TSEnumDeclaration`.

> For general JS/TS style (functional iterators, Set operations, immutable
> array methods, Promise patterns) see `writing-ecmascript` — it now applies
> to `.ts`/`.tsx` as well.

## Types

- `any` → use concrete types or generics  `[lint: @typescript-eslint/no-explicit-any]`
- `unknown` → use type guards for narrowing
- `enum` → prefer `const` objects or union types  `[lint: no-restricted-syntax (TSEnumDeclaration)]`
- Avoid type assertions — use type guards instead of `as` or non-null assertion (!) operator  `[lint: @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unnecessary-type-assertion]`
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

// ❌ Bad - unnecessary type assertion  [lint: @typescript-eslint/no-unnecessary-type-assertion]
const user = data as User;

// ✅ Good - type guard
if (isUser(data)) {
  // data is User here
}

// ❌ Bad - enum  [lint: no-restricted-syntax (TSEnumDeclaration)]
enum Status { Active, Inactive }

// ✅ Good - const object
const Status = { Active: 'active', Inactive: 'inactive' } as const;
type Status = (typeof Status)[keyof typeof Status];
```
