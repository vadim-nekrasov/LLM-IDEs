---
globs: "*.ts,*.tsx,*.js,*.jsx"
---

# ECMAScript Code Style (ES2025)

Use modern language features where it improves readability and reduces boilerplate.

## Target Environment
- **Latest Chrome** only (ES2025 specification)
- Use all modern Iterator APIs and language features

## General Style
- **Functional style** preferred over imperative (when no performance penalty)
- **Use `const`** instead of `let` wherever possible
- Replace imperative loops with: Array methods, Iterator Helpers, Set operations

## Modern Features

### Optional Chaining & Nullish Coalescing
```js
// ✅ Good
const city = user?.profile?.address?.city ?? 'Unknown';
maybeFn?.();
const limit = opts.limit ?? 20;
cfg.retries ??= 3;
```

### Iterator Helpers
Use when:
- Source is not an array (generators, lazy collections)
- Early termination needed (`find`, `take`, `drop`)
- One-pass processing without intermediate arrays

```js
// ✅ Good - lazy, readable
const out = naturals()
  .filter(n => n % 2 === 0)
  .map(n => n * n)
  .take(5)
  .toArray();

// ✅ Good - pagination without full materialization
const pageItems = Iterator.from(iterable)
  .drop(page * size)
  .take(size)
  .toArray();

// ✅ Good - built-in iterators inherit Iterator Helpers
Array(n).keys().map(i => i + 1).toArray();
```

### Set Operations
```js
// ✅ Good
const common = new Set(arrA).intersection(new Set(arrB));
const diff = new Set(a).difference(new Set(b));
const sym = new Set(arrA).symmetricDifference(new Set(arrB));
const isSub = new Set(arrA).isSubsetOf(new Set(arrB));
const isSuper = new Set(arrA).isSupersetOf(new Set(arrB));
const disjoint = new Set(arrA).isDisjointFrom(new Set(arrB));
```

### Immutable Array Methods
```js
// ✅ Good - does not mutate
const sorted = nums.toSorted((a, b) => a - b);
const reversed = arr.toReversed();
const spliced = arr.toSpliced(1, 2, 'new');
```

### Object.groupBy
```js
// ✅ Good
const byRole = Object.groupBy(users, u => u.role);
```

### Promise Patterns
```js
// ✅ Good - Promise.withResolvers
const { promise, resolve, reject } = Promise.withResolvers<string>();

// ✅ Good - Promise.try (sync errors become rejections)
Promise.try(callback).then(handle).catch(report);

// ✅ Good - batch processing
const results = await Promise.all(tasks.map(task => Promise.try(task)));
```

### Deep Clone
```js
// ✅ Good - handles Date/Map/cycles
const copy = structuredClone(obj);
```

### Intl API
```js
// ✅ Good
const fmt = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' });
const price = fmt.format(value);
```

## Code Style Guidelines

- **Early returns** to avoid nesting
- **`handle` prefix** for event handlers: `handleClick`, `handleSubmit`
- **Meaningful names**: `isLoading`, `hasPermission`, `itemsById`
- **Ternary** over `if/else` when readable (no nesting)
- **Arrow functions** without parentheses for single argument
- Remember: arrow functions are **not hoisted**

## Anti-patterns to Avoid

```js
// ❌ Bad - manual loops when functional works
for (const n of it) { if (n > 10) break; out.push(n * n); }

// ❌ Bad - full materialization for early termination
const arr = Array.from(iterable);
const pageItems = arr.slice(page * size, page * size + size);

// ❌ Bad - O(n²) instead of Set
const common = arrA.filter(x => arrB.includes(x));

// ❌ Bad - mutates original
nums.sort((a, b) => a - b);

// ❌ Bad - breaks Date/Map/cycles
const copy = JSON.parse(JSON.stringify(obj));

// ❌ Bad - 0 and '' treated as empty
const limit = opts.limit || 20;
```

## Performance & Security

- Avoid full materialization of large collections when lazy iterators suffice
- Cache heavy calculations and network requests
- Run independent async tasks in parallel (`Promise.all`)
- Do not trust input data
- Consider XSS and injections when working with strings

## Debugging
When in doubt about bug cause, add working `console.log`:
```js
console.log('payload:', JSON.stringify(payload, null, 2));
```
