# SOLID Audit Rubric

Each SOLID principle below is a yes/no predicate with a **required evidence
artifact**. Mentioning a principle is not the same as auditing it; an answer
without its evidence block is treated as `pass: false` (no pattern-match
fallback). Language-agnostic — applies equally to TypeScript, .NET, Rust,
WGSL, Python.

## When to Apply

| Trigger | Action |
|---|---|
| `/searching-solutions` shortlist; multi-file (≥ 2 files) touched; introduces or changes a public boundary; prompt contains "refactor" / "architecture" / "design" / "interface" / "abstraction" / "decouple" / "split" / "extract" | **apply** — emit full YAML evidence block per principle |
| Typo / `console.log` removal / comment edit / cosmetic CSS tweak / single-line bug fix with no contract change / pure data-only edit | **skip** — Three Lenses still applies via `three-lenses.md` |

## Principles

### `#srp` — Single Responsibility

**Predicate**: A module/class has at most one *axis of change* (one
stakeholder whose evolving needs drive edits). FAIL if ≥ 2 unrelated axes
co-exist. Axes considered unrelated by default: UI rendering, persistence,
business rules, external-API integration, transport/serialization,
authentication, telemetry, formatting/i18n.

**Evidence**:
```yaml
srp:
  module: "<file or class>"
  axes: ["<axis 1>", "<axis 2>", ...]
  pass: true|false
  reason: "<why pass — single axis | why fail — name the unrelated axes>"
```

### `#ocp` — Open/Closed

**Predicate**: Adding a *foreseeable* extension already named in the
requirements does not require editing existing business logic in this
module; new behavior plugs in via a new module, strategy, or registered
implementation. FAIL if a named extension requires editing existing core
logic.

**Evidence**:
```yaml
ocp:
  module: "<file or class>"
  foreseeable_extension: "<extension named in requirements, or 'none planned'>"
  modifies_existing: true|false
  pass: true|false
  reason: "<extension plugs in via X | extension requires editing function Y>"
```

### `#lsp` — Liskov Substitution

**Predicate**: For every subtype / implementation introduced or modified,
substitution for the supertype preserves the supertype's contract:
postconditions are not weakened, preconditions are not strengthened,
invariants hold, no exception is thrown where none was declared. FAIL if
any divergence weakens guarantees callers rely on. Empty `subtypes: []`
means no subtypes were introduced and the predicate trivially passes.

**Evidence**:
```yaml
lsp:
  base: "<interface or base type, or 'n/a'>"
  subtypes:
    - name: "<subtype>"
      divergence: "<input → behavior, or 'none'>"
  pass: true|false
  reason: "<no contract change | subtype X violates postcondition Y>"
```

### `#isp` — Interface Segregation

**Predicate**: For every interface / abstract class / shared type contract
the change introduces or expands, *every* consumer uses *every* member of
the contract it depends on. FAIL if any consumer has ≥ 1 unused method on
the interface it imports — the consumer is forced to depend on what it
does not use. Empty `interfaces: []` means no shared contract was
introduced and the predicate trivially passes.

**Evidence**:
```yaml
isp:
  interfaces:
    - name: "<IName>"
      members: ["<m1>", "<m2>", ...]
      consumers:
        - name: "<consumer module/class>"
          unused_members: ["<m_k>", ...]  # empty array means OK
  pass: true|false
  reason: "<every consumer uses every member | consumer X ignores members [...]>"
```

### `#dip` — Dependency Inversion

**Predicate**: High-level modules (use-case / domain / orchestration layer)
depend on abstractions *they own*, not on concrete low-level modules
(IO, framework, network, database, file system, third-party SDK, UI
toolkit primitives). FAIL if any high-level module directly imports a
concrete low-level class instead of an abstraction the high-level layer
defines. Empty `concrete_imports: []` means the predicate trivially passes.

**Evidence**:
```yaml
dip:
  high_level_modules: ["<path>", ...]
  concrete_imports:
    - module: "<high-level module>"
      imports_concrete: "<concrete low-level type/class>"
  pass: true|false
  reason: "<all dependencies go via owned abstractions | module X imports concrete Y>"
```

## Aggregation

Aggregate `pass: true` across all five principles; any single `pass: false`
⇒ overall audit FAIL. From `/searching-solutions` Phase 2.5 a FAIL prunes
the candidate before tree exploration; from `applying-workflow` or
`final-checking` a FAIL means stop, refactor the design, re-audit — do not
proceed with the violation in place.
