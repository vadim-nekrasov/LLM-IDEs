---
name: writing-react
description: React component patterns and best practices. Apply when writing React components including hooks, performance optimization, accessibility, and error handling.
globs: "*.tsx,*.jsx"
---

# React Code Style

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

// ❌ Bad - renders 0 instead of nothing
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
