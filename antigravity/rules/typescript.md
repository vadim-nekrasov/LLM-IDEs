# TypeScript Rules

## Scope
- **Globs**: `*.tsx`, `*.ts`
- **Description**: Guidelines for TypeScript code.

## Rules

### Types

- any → concrete types/generics (if possible)
- unknown → type guards for narrowing (if possible)
- enums → const objects or union types
- Avoid type assertions (as/!) if possible — use type guards.
- infer interfaces from Zod schemas
- Use utility types (Partial, Pick, Omit, etc)
- import type for type-only.

### Functions

- default params
- RORO pattern for ≥3 args (accept/return objects)

### Patterns

- Discriminated unions for state machines
- Template literal types
- Conditional types
- Type guards for runtime checks.

### Modern TS 2025

- Satisfies operator
- Const assertions.

```ts
// satisfies - verifies the shape but preserves exact literal types
const config = {
  apiBaseUrl: '/api',
  retryCount: 3,
} satisfies {
  apiBaseUrl: string;
  retryCount: number;
};

// const assertion - "freezes" literals and makes them suitable for type inference
const ROUTES = {
  HOME: '/',
  ADMIN: '/admin',
} as const;

type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]; // "/" | "/admin"
```

### Anti-patterns
❌ improper generic constraints;

