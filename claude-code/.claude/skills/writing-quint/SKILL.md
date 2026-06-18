---
name: writing-quint
description: Quint specification patterns — definition purity (var/val/def/pure), init/step state machines, nondeterminism (any/nondet/oneOf), invariants vs temporal properties, sets/maps/records builtins, the quint CLI workflow (typecheck/run/test/verify). Auto-trigger on .qnt edits.
paths:
  - "**/*.qnt"
---

# Quint Specification Style

Quint is an executable specification language based on the Temporal Logic of
Actions (TLA). A spec is a state machine: `init` fixes the first state and
`step` relates each state to the next through primed (`'`) variables. Keep the
state space small enough that the simulator and model checker stay tractable.

## Contents

- [Definitions & Purity](#definitions--purity)
- [State Machines (init / step)](#state-machines-init--step)
- [Nondeterminism](#nondeterminism)
- [Properties: Invariants & Temporal](#properties-invariants--temporal)
- [Sets, Maps, Records & Lists](#sets-maps-records--lists)
- [Recursion via fold](#recursion-via-fold)
- [Modules, Imports & Instances](#modules-imports--instances)
- [Testing with run](#testing-with-run)
- [Tooling / CLI Workflow](#tooling--cli-workflow)
- [Anti-patterns](#anti-patterns)

## Definitions & Purity

Pick the definition kind by two axes: does it read state, and does it take
parameters?

| Kind | Reads state? | Params? | Use for |
|---|---|---|---|
| `const` | no (fixed at instantiation) | – | model parameters set per instance |
| `pure val` | no | no | constants derived from other pure defs |
| `pure def` | no | yes | helpers over inputs only |
| `val` | yes | no | values derived from the current state |
| `def` | yes | yes | state-reading helpers |
| `var` | – | – | a mutable state variable |

```quint
const N: int                          // set per instance
pure val Nodes = 1.to(4)              // fixed, state-independent
pure def double(x: int): int = x * 2  // depends only on its args
var balance: int                      // mutable state
val isEmpty = balance == 0           // reads state, no args
```

A `pure def`/`pure val` that touches a `var` is a QNT200 error — switch to
`def`/`val`.

## State Machines (init / step)

```quint
var x: int

action init = { x' = 0 }              // the first state

action step = all {                   // the next-state relation
  x < 5,                              // guard: must hold for the action to fire
  x' = x + 1,                         // assignment to the next state
}
```

- `x` is the current value; `x'` is the next value. An action describes one
  atomic transition, not a sequence of statements.
- Every `var` must be assigned in every branch — there is no implicit
  "unchanged". Hold a value with `y' = y`.
- `all { ... }` is conjunction (conditions and assignments hold together).

## Nondeterminism

```quint
action step = {
  nondet amount = 1.to(100).oneOf()   // pick data — inside an action only
  any {                               // pick one ENABLED action
    deposit(amount),
    withdraw(amount),
  }
}
```

- `nondet name = S.oneOf()` chooses a value from set `S`. `oneOf` outside a
  `nondet` binding is a QNT203 error.
- `any { a, b }` runs one enabled action. An action is enabled only when its
  guards hold — guard every action, or `any` may pick a disabled branch and the
  run reports a spurious deadlock.

## Properties: Invariants & Temporal

```quint
val NonNegative = balance >= 0                      // safety — a state predicate
temporal EventuallyPositive = eventually(balance > 0)  // liveness
```

- Invariants are predicates over a *single* state: no primes, no `nondet`. Check
  with `quint run --invariant=NonNegative` or `quint verify --invariant=...`.
- Use `temporal` with `always` / `eventually` only for liveness/eventuality;
  check with `quint verify --temporal=...` (usually needs fairness + Apalache).
- `always(p)` where `p` is already a state invariant is redundant — just check `p`.

## Sets, Maps, Records & Lists

```quint
// sets
Set(1, 2, 3).union(Set(4))     Set(1, 2).exclude(Set(2))
s.map(i => i * 2)              s.filter(i => i > 0)
s.forall(i => i > 0)   s.exists(i => i > 3)   s.fold(0, (acc, i) => acc + i)
s.size()      s.contains(2)    2.in(s)      s.subseteq(t)

// maps
val m = Map(1 -> "a", 2 -> "b")
m.get(1)      m.keys()         m.set(1, "z")     m.put(3, "c")

// records & lists
val r = { name: "x", age: 3 }  r.name           r.with("age", 4)
val xs = [10, 20, 30]          xs[0]            xs.length()
```

`head`, `tail`, `map`, `fold`, ... are built-in names — do not shadow them with
your own definitions (QNT101).

## Recursion via fold

Quint has no recursion (a spec must stay verifiable). Express it as a `fold`
over a finite range or set.

```quint
// ❌ Bad - recursion is unsupported
pure def factorial(n: int): int = n * factorial(n - 1)

// ✅ Good - fold over a range
pure def factorial(n: int): int = 1.to(n).fold(1, (acc, i) => acc * i)
```

## Modules, Imports & Instances

```quint
import basics.*                        // bring names into scope, unqualified

// instance: copy a parameterized module with its consts fixed
import Voting(Value = Set(0, 1)) as V
val binaryValues = V::Value            // access instance members via "::"
```

Forgetting the `::` qualifier on an instance member is a common name-resolution
error.

## Testing with run

```quint
run depositWithdrawTest = {
  init.then(deposit(10))
      .then(withdraw(4))
      .expect(balance == 6)            // predicate must hold afterwards
}

run cannotOverdrawTest = {
  init.then(withdraw(1)).fail()        // .fail() asserts the step is disabled
}
```

- Run with `quint test spec.qnt`. By convention test runs end in `Test`; the
  default selection picks those up. Use `--match=<regex>` to select others —
  but do not match plain actions or `temporal` defs, they are not runnable tests.
- Chain steps with `.then(...)`; repeat with `n.reps(i => action)`; `assert(p)`
  is an action enabled only when `p` holds.

## Tooling / CLI Workflow

Install: `npm i @informalsystems/quint -g` (or run via `npx @informalsystems/quint`).
Verification needs JDK 17+ (Apalache/TLC); `typecheck`/`run`/`test` do not.

```bash
quint typecheck spec.qnt                              # always first
quint run spec.qnt --invariant=Inv --max-steps=20    # random simulation
quint test spec.qnt                                  # run the `...Test` defs
quint verify spec.qnt --invariant=Inv                # model check (Apalache)
quint verify spec.qnt --backend=tlc --temporal=Live  # liveness via TLC
quint repl                                           # interactive REPL
```

Subcommands: `parse`, `typecheck`, `compile`, `repl`, `run`, `test`, `verify`,
`docs`. There is no `format` / `lint` / `check` subcommand. The official VS Code
extension is `informal.quint-vscode`.

## Anti-patterns

```quint
// ❌ Sequential-assignment thinking — QNT202 "Multiple updates of variable x"
action step = all { x' = x + 1, x' = x + 2 }
// ✅ One assignment expressing the net effect
action step = { x' = x + 2 }
```

- `pure def`/`pure val` reading a `var` → QNT200; use `def`/`val`.
- `oneOf()` outside a `nondet` binding → QNT203.
- Primes (`x'`) or `nondet` inside an invariant — invariants are single-state.
- `any { a, b }` over guard-less actions → spurious deadlocks; add guards.
- Running `verify` before `typecheck` passes — typecheck first, every time.
