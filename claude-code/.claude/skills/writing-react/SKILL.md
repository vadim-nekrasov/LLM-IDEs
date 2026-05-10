---
name: writing-react
description: React patterns — hooks, performance, accessibility, error handling, modern APIs.
when_to_use: Triggers on edits to .tsx/.jsx files, components, or hook usage. Covers useState/useEffect/useMemo/useCallback, Suspense, useTransition, useDeferredValue, useOptimistic.
paths:
  - "**/*.tsx"
  - "**/*.jsx"
---

# React Code Style

> **Lint hints (this project).** Hooks rules and a11y basics are flagged by ESLint via `eslint-plugin-react-hooks` and `eslint-plugin-jsx-a11y`. `react-hooks/exhaustive-deps` is heuristic — has known false positives on stable refs/derived values; read warnings critically, do NOT blindly suppress. When editing a file you may see existing warnings from legacy code — ignore them, don't refactor them. Be responsible only for your own fresh diff.
>
> **Never run `eslint --fix .` or `eslint --fix src/`** — `react/jsx-no-leaked-render` autofix has a known type-mismatch trap (`null` vs `undefined`) that breaks `boolean | undefined` props. Editor per-file autofix is fine.

## Component Patterns
```tsx
const Comp: FC<Props> = ({ prop1, prop2 }) => …
```
- Destructure props in function params
- Use `FC<Props>` type annotation

## Performance Optimization

- Heavy calculations → `useMemo`
- Stable callbacks → `useCallback`
- List keys → stable IDs (not array index)
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

- Use `classnames` library for conditional classes:
  ```tsx
  <div className={cx('my-class', { 'my-class--active': isActive })} />
  ```
- Avoid inline event handlers - extract to `handleX` functions
- Minimize `useEffect` calls by combining logic

## Error Handling

- Error Boundaries for unexpected errors
- Handle expected errors via return values
- Validate props/forms (Zod, React Hook Form, controlled inputs)

## Accessibility (a11y)

- Use semantic HTML and `aria-*` attributes
- `role="button"`, `tabIndex={0}`, `onKeyDown` for interactive elements
- Support Enter and Space keys for buttons
- Touch support is critical

## Anti-patterns

```tsx
// ❌ Bad - useEffect for derived state
useEffect(() => {
  setFilteredItems(items.filter(x => x.active));
}, [items]);

// ✅ Good - simple variable or useMemo
const filteredItems = items.filter(x => x.active);
// or
const filteredItems = useMemo(() => items.filter(x => x.active), [items]);

// ❌ Bad - renders 0 instead of nothing  [lint: react/jsx-no-leaked-render — fix manually, NOT via --fix]
{some.length && <JSX />}

// ✅ Good
{some.length > 0 && <JSX />}

// ❌ Bad - using index as key
{items.map((item, i) => <Item key={i} />)}

// ✅ Good - stable ID
{items.map(item => <Item key={item.id} />)}

// ❌ Bad - inline objects without memo
<Child style={{ color: 'red' }} />

// ✅ Good
const style = useMemo(() => ({ color: 'red' }), []);
<Child style={style} />
```
