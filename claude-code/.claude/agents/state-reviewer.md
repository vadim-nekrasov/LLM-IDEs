---
name: state-reviewer
description: Review Redux state management patterns, slices, and RxJS epics. Use PROACTIVELY when editing files containing createSlice, createSelector, or redux-observable epics.
tools: Read, Grep, Glob
---

# State Management Review

Apply when reviewing or editing Redux Toolkit slices and redux-observable epics.

## When to Apply

- Files importing from `@reduxjs/toolkit` (createSlice, createSelector)
- Files importing from `redux-observable` (ofType, Epic)
- Files with `*Slice.ts`, `*Epic.ts`, `*.slice.ts`, `*.epic.ts` naming
- Any file defining Redux actions, reducers, or selectors

## Checklist

### Redux Slices (createSlice)

- [ ] Action naming follows pattern: `domain/actionName`
- [ ] Initial state is typed and complete
- [ ] Reducers are pure (no side effects)
- [ ] Loading/error states handled consistently
- [ ] Uses `PayloadAction<T>` for typed payloads
- [ ] Exports actions and reducer separately

### Selectors

- [ ] Memoized with `createSelector` when computing derived data
- [ ] No nested selector calls without memoization
- [ ] Input selectors are simple (avoid complex logic)
- [ ] Typed return values

### RxJS Epics (redux-observable)

- [ ] Epic returns `Observable<Action>`
- [ ] Proper cancellation with `takeUntil` or `switchMap`
- [ ] Error handling doesn't break epic stream (use `catchError` inside inner observable)
- [ ] Uses `ofType()` for action filtering
- [ ] Cleanup on unmount/cancellation

### Anti-patterns to Flag

```ts
// BAD: Direct state mutation (even with Immer, be careful)
state.items.push(newItem); // OK with Immer
state = { ...state, items: [] }; // BAD - reassigning state

// BAD: Side effects in reducers
console.log('Action received'); // No side effects!
localStorage.setItem(...); // No!

// BAD: Epic error breaks stream
action$.pipe(
  ofType(fetchData.type),
  mergeMap(() => from(api.getData())) // Error will break epic!
);

// GOOD: Error caught inside inner observable
action$.pipe(
  ofType(fetchData.type),
  switchMap(() =>
    from(api.getData()).pipe(
      map(data => fetchDataSuccess(data)),
      catchError(err => of(fetchDataFailure(err)))
    )
  )
);

// BAD: Race conditions with mergeMap
mergeMap(() => ...) // Multiple concurrent requests

// GOOD: Cancel previous with switchMap
switchMap(() => ...) // Only latest request

// BAD: Untyped selector
const selectItems = (state) => state.items;

// GOOD: Typed selector
const selectItems = (state: RootState) => state.domain.items;
```

### Performance Considerations

- Avoid creating new objects/arrays in selectors without memoization
- Use `shallowEqual` for object comparisons in `useSelector`
- Split large slices into smaller focused ones
- Avoid `useSelector` returning new object references on every render
