---
name: writing-react
description: React patterns — hooks, performance, accessibility, error handling, modern APIs. Auto-trigger on .tsx/.jsx edits.
paths:
  - "**/*.tsx"
  - "**/*.jsx"
---

# React Code Style

> **Linters:** see [`../_shared/linter-policy.md`](../_shared/linter-policy.md). React-specific: hooks/a11y warnings are heuristic with known false positives on stable refs / derived values — read critically, don't blindly suppress; autofix has `null` vs `undefined` traps in JSX short-circuits that break `boolean | undefined` props.

## Component Patterns
```tsx
const Comp: FC<Props> = ({ prop1, prop2 }) => …
```
- Destructure props in function params
- Use `FC<Props>` type annotation

## Performance Optimization

- Heavy calculations → `useMemo`
- Stable callbacks → `useCallback`
- Wrap rarely changing components in `React.memo`
- Use `Suspense` for loading states
- Batch `setState` updates in async code
- Implement proper cleanup in `useEffect` hooks
- Avoid inline functions in JSX to reduce re-renders

## Modern React APIs

Use when they improve performance or clarity:
- `useTransition` - for non-urgent updates
- `useDeferredValue` - defer expensive recalculations
- `useOptimistic` - optimistic UI updates
- `lazy` + `Suspense` - code splitting
- `useId` - unique IDs for accessibility

## Code Style

- Use the project's `cn` helper from `@/utils` (built on `tailwind-merge` + `clsx`)
  for all `className` composition:
  ```tsx
  import { cn } from '@/utils';
  <div className={cn('my-class', isActive && 'my-class--active', className)} />
  ```
  See the `writing-tailwind` skill for Tailwind v4 token rules and v4 syntax specifics.
- Avoid inline event handlers - extract to `handleX` functions
- Minimize `useEffect` calls by combining logic
- Layout spacing belongs to the parent: `gap`/`space-*` on the flex/grid parent, not `mt-*`/`mb-*` on each child — keeps
  children self-contained and reusable

## Error Handling

- Error Boundaries for unexpected errors
- Handle expected errors via return values
- Validate props/forms (Zod, React Hook Form, controlled inputs)

## Accessibility (a11y)

- Use semantic HTML and `aria-*` attributes
- Touch support is critical

## Anti-patterns

```tsx
// ❌ Bad - inline objects without memo
<Child style={{ color: 'red' }} />

// ✅ Good
const style = useMemo(() => ({ color: 'red' }), []);
<Child style={style} />
```
