---
name: writing-typescript
description: Provides TypeScript code patterns and best practices for type definitions, generics, utility types, discriminated unions, and type guards. Use PROACTIVELY when editing or creating .ts or .tsx files, defining interfaces, working with types, or writing TypeScript code.
---

# TypeScript Code Style

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

// ❌ Bad - enum
enum Status { Active, Inactive }

// ✅ Good - const object
const Status = { Active: 'active', Inactive: 'inactive' } as const;
type Status = (typeof Status)[keyof typeof Status];
```
