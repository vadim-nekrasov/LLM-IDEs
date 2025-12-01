---
name: writing-ecmascript
description: Modern ECMAScript (ES2025) patterns including Iterator Helpers, Set operations, Promise patterns, and immutable array methods. Use PROACTIVELY when writing JavaScript code in .js, .mjs, or .cjs files, using modern JS features, or implementing async logic.
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

// ❌ Bad - mixing logic and side effects
connected &&= ping();

// ✅ Good
connected = connected ? ping() : false;
```

## Advanced Iterator Patterns

### Window: skip N, take M from large source
```js
// ❌ Bad - full materialization
const win = Array.from(events).slice(offset, offset + limit);

// ✅ Good - lazy window
const win = Iterator.from(events)
  .drop(offset)
  .take(limit)
  .toArray();
```

### Top-N pattern
```js
// ✅ Good - lazy until sort
const top10 = Iterator.from(items)
  .map(x => ({ x, score: scoreOf(x) }))
  .toArray()
  .sort((a, b) => b.score - a.score)
  .slice(0, 10)
  .map(v => v.x);
```

### Early termination / infinite sources
```js
// ❌ Bad - hang / OOM
Array.from(naturals()).find(...);

// ✅ Good
const found = naturals().find(n => n % 12345 === 0);
```

## Advanced Promise Patterns

### Promise.withResolvers with timeout
```ts
const { promise, resolve, reject } = Promise.withResolvers<string>();
const timeout = setTimeout(() => reject(new Error('timeout')), 5000);
doAsync().then(v => {
  clearTimeout(timeout);
  resolve(v);
});
```

### Batch processing with Promise.try
```js
// ✅ Good - unified interface for dubious callbacks
const results = await Promise.all(
  tasks.map(task => Promise.try(task)),
);
```

### Universal wrapper for external callbacks
```js
export const compute = (input, { onCompute } = {}) =>
  Promise.try(() => onCompute?.(input))
    .then(res => merge(input, res))
    .catch(fallback);
```

## Performance

- Avoid full materialization of large collections when lazy iterators suffice
- Use Iterator Helpers and Set operations if they improve readability without performance penalty
- Watch for memory leaks: don't hold unnecessary references to large structures
- Cache heavy calculations and network requests if reused multiple times
- Efficient async handling:
  - Don't create unnecessary `await` in chains
  - Run independent tasks in parallel (`Promise.all`)

## Security

- Do not trust input data
- Avoid direct use of unverified HTML
- Consider XSS and injections when working with strings and external sources
- Ensure code has no obvious spots for SQL/NoSQL injections and insecure serialization

## Avoiding Problems

- Don't mix logical operations and side effects (especially with `&&=` and `||=`)
- Treat all iterating methods except `forEach` as "pure": inside `map`/`filter`/`reduce`/`flatMap`/`some`/`every` — **no side effects** (except local accumulator mutation)
- Don't mutate function arguments without extreme necessity
- Don't wrap already ready iterators in `Iterator.from`
- Ensure consistency in sync/async path handling (prefer `Promise.try`)
- Avoid redundant intermediate arrays if lazy iterators suffice

## Debugging

When in doubt about bug cause, add working `console.log`:
```js
console.log('payload:', JSON.stringify(payload, null, 2));
```

Log key input data and intermediate states. Logs can be removed later, but at diagnostic moment they must be **working**, not commented out.
