---
name: writing-react
description: React patterns — hooks, performance, accessibility, error handling, modern APIs. Auto-trigger on .tsx/.jsx edits.
paths:
  - "**/*.tsx"
  - "**/*.jsx"
---

# React Code Style

> **Working with linters in legacy codebases.** When editing a file you may see existing warnings from older code — ignore them, don't refactor them. Be responsible only for your own fresh diff. Some hooks/a11y warnings are heuristic and have known false positives on stable refs / derived values — read warnings critically, do NOT blindly suppress.
>
> **Never run mass autofix** (`eslint --fix .` or `eslint --fix src/`) — autofixers can have type-mismatch traps (e.g. `null` vs `undefined` in JSX boolean short-circuits) that break `boolean | undefined` props. Editor per-file autofix on the file you are currently editing is fine.

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
