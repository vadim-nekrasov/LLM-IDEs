---
name: state-review
description: Provides state management patterns checklist for Redux, Zustand, MobX, Jotai, Recoil, Pinia. Use PROACTIVELY when editing files with stores, slices, atoms, reducers, selectors, or state management logic.
---

# State Management Review

## Contents

- [When to Apply](#when-to-apply)
- [Universal Principles](#universal-principles)
- [Redux Toolkit](#redux-toolkit)
- [Zustand](#zustand)
- [MobX](#mobx)
- [Jotai / Recoil (Atomic)](#jotai--recoil-atomic)
- [Vue (Pinia / Vuex)](#vue-pinia--vuex)
- [General Anti-patterns](#general-anti-patterns)

## When to Apply

- Files with state management imports (Redux, Zustand, MobX, Jotai, Recoil, Pinia, Vuex)
- Files with `*Store.ts`, `*Slice.ts`, `*Atom.ts`, `*.store.ts`, `*.slice.ts` naming
- Files defining actions, reducers, selectors, or computed values
- Files with global or shared state logic

## Universal Principles

### State Design

- [ ] State is normalized (no deeply nested structures)
- [ ] Single source of truth for each piece of data
- [ ] Derived state computed from base state, not stored separately
- [ ] Clear separation: UI state vs Server state vs Form state

### Immutability

- [ ] State updates are immutable (or use library that handles it)
- [ ] No direct mutations outside of designated update functions
- [ ] Arrays/objects replaced, not mutated

### Performance

- [ ] Selectors/computed values are memoized when needed
- [ ] State slices are granular (avoid re-renders on unrelated changes)
- [ ] Subscriptions are scoped to needed data only

---

## Redux Toolkit

```ts
// GOOD: Typed slice with PayloadAction
const userSlice = createSlice({
  name: 'user',
  initialState: { data: null, loading: false } as UserState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.data = action.payload;
    },
  },
});

// GOOD: Memoized selector
const selectUserName = createSelector(
  [(state: RootState) => state.user.data],
  user => user?.name ?? 'Guest'
);
```

**Anti-patterns:**
- Side effects in reducers (use middleware/thunks)
- Untyped actions or state
- Non-memoized selectors returning new objects

---

## Zustand

```ts
// GOOD: Typed store with actions
interface BearStore {
  bears: number;
  increase: () => void;
}

const useBearStore = create<BearStore>()(set => ({
  bears: 0,
  increase: () => set(state => ({ bears: state.bears + 1 })),
}));

// GOOD: Selector for specific value
const bears = useBearStore(state => state.bears);
```

**Anti-patterns:**
- Selecting entire store instead of specific values
- Missing TypeScript types
- Complex logic in store (move to separate functions)

---

## MobX

```ts
// GOOD: Observable class with computed
class TodoStore {
  todos: Todo[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  get completedCount() {
    return this.todos.filter(t => t.done).length;
  }

  addTodo(text: string) {
    this.todos.push({ text, done: false });
  }
}
```

**Anti-patterns:**
- Missing `makeAutoObservable` or decorators
- Accessing observables outside of observer components
- Not using computed for derived values

---

## Jotai / Recoil (Atomic)

```ts
// GOOD: Base atom + derived atom
const countAtom = atom(0);
const doubledAtom = atom(get => get(countAtom) * 2);

// GOOD: Atom with write logic
const countAtom = atom(
  get => get(baseCountAtom),
  (get, set, newValue: number) => {
    set(baseCountAtom, Math.max(0, newValue));
  }
);
```

**Anti-patterns:**
- Too many atoms (consider grouping related state)
- Circular dependencies between atoms
- Heavy computations without memoization

---

## Vue (Pinia / Vuex)

```ts
// GOOD: Pinia store with getters
export const useUserStore = defineStore('user', {
  state: () => ({ user: null as User | null }),
  getters: {
    isLoggedIn: state => state.user !== null,
  },
  actions: {
    async login(credentials: Credentials) {
      this.user = await api.login(credentials);
    },
  },
});
```

**Anti-patterns:**
- Mutating state outside of actions
- Not using getters for derived state
- Mixing Vuex and Pinia in same project

---

## General Anti-patterns

- Storing server data in global state (use React Query/SWR instead)
- Prop drilling when global state would be cleaner
- Global state for purely local UI state
- Missing loading/error states for async operations
- Race conditions in async state updates
- Memory leaks from uncleared subscriptions
