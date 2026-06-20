---
name: searching-solutions
description: Tree-search methodology for finding optimal technical solutions through structured brainstorming, filtering, and recursive exploration.
when_to_use: Manual-only. Invoke ONLY when the user explicitly types `/searching-solutions` or asks for "tree search" / "structured brainstorming" / "древовидный поиск" / "поиск решений". Never auto-trigger from generic feature or bug prompts — this skill is expensive and must run on explicit request.
argument-hint: "[max_abstract_variants=N] [num_promising=K] [max_depth=D] [max_branching=B] [max_succeed=M] <task description>"
effort: high
context: fork
agent: Plan
---

# Solution Tree Search

Structured tree-based search methodology for identifying optimal technical solutions through systematic brainstorming, filtering, and recursive exploration.

## Contents

- [Mindset](#mindset)
- [When to Use vs. Neighbouring Workflows](#when-to-use-vs-neighbouring-workflows)
- [Forked Context — Important](#forked-context--important)
- [Configuration (Defaults)](#configuration-defaults)
- [Constraints & Criteria](#constraints--criteria)
- [Execution (Internal Processing)](#execution-internal-processing)
- [Output Format](#output-format)

## Mindset

- **Epistemic Style**: Start with high uncertainty. Build confidence through rigorous analysis.
- **Speculation**: Allowed, but flag it clearly ("Hypothetically...", "I suspect...")
- **Authority**: Value good arguments over authorities. Logic is everything.
- **Justify Selection**: Explain why chosen option wins over alternatives.

---

## When to Use vs. Neighbouring Workflows

Pick this skill only when the task is "find the right approach for one decision point". For other shapes, prefer the matching workflow:

| Task shape | Use this instead |
|---|---|
| Best architectural / algorithmic approach for a single decision | **`/searching-solutions`** (this skill) |
| A sequence of coupled decision points, each needing its own tree search | `/searching-solutions-multi` skill |
| Full feature from requirements to merged code | `/feature-dev:feature-dev` |
| Diagnosing a bug — generate hypotheses, filter by evidence | `debugging` skill |
| Verifying a finished change (lint, types, Three Lenses) | `final-checking` skill |
| Routing a non-trivial edit through docs-discovery → Three Lenses → Context7 | `applying-workflow` skill |

If the task is really "design a new feature end-to-end", let `/feature-dev:feature-dev` orchestrate; this skill can be invoked from inside its architecture phase. For several coupled decision points without code delivery, `/searching-solutions-multi` orchestrates one forked search per decision.

---

## Forked Context — Important

This skill runs with `context: fork` and the read-only `Plan` agent. The forked agent has **no access to the
conversation history**. Every constraint, stack detail, or prior discussion the search must honour MUST be in the prompt
arguments. If relevant context was discussed earlier in the chat, restate it explicitly when invoking. Do not pass a
bare path/pointer to a repo doc (e.g. `README.md`, `CLAUDE.local.md`) expecting the search to chase it — this is a
single-pass search over a curated brief, not a codebase-spelunking task. Inline the distilled,
decision-relevant slice yourself; resolving doc pointers is `searching-solutions-multi`'s job, not this fork's.

---

## Configuration (Defaults)

Parse numeric arguments to override:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `{max_abstract_variants}` | Minimum initial ideas | 10      |
| `{num_promising}` | Candidates to deep dive | 5       |
| `{max_depth}` | Tree depth limit | 5       |
| `{max_branching}` | Max branches per node | 3       |
| `{max_succeed}` | Max successful leaves | 40      |

### Parameter Detection (Semantic)

Extract parameters from user's prompt by **semantic meaning**, not literal string matching.
Understand intent in any language, declension, or phrasing.

| Semantic Concept | Maps to | Example phrasings |
|------------------|---------|-------------------|
| Initial/starting number of ideas, seed, brainstorm size, abstract variants | `{max_abstract_variants}` | "посев 10", "изначально 7 вариантов", "10 абстрктных вариантов", "начни с 20 идей", "seed 10", "strt with 12 options" |
| Promising candidates to deep-dive, shortlist size | `{num_promising}` | "5 лучших кандидатов", "отбери 3 перспективных", "explore top 5", "narrow to 4" |
| Tree depth, exploration levels, recursion limit | `{max_depth}` | "глубина 3", "максимум 4 уровня", "до 5 итераций вглубь", "depth 6", "3 levels deep" |
| Branches per node, branching factor | `{max_branching}` | "по 3 ветви на узел", "branching 4", "split into 2 at each step" |
| Max successful leaves, solution cap | `{max_succeed}` | "максимум 30 решений", "cap at 50 leaves", "не более 20 финальных вариантов" |

**Rules**:
- If user specifies a number near a concept — map it to the corresponding parameter.
- **Fallback**: A bare number without semantic context (e.g., `/searching-solutions 5`) defaults to `{num_promising}`.

---

## Constraints & Criteria

### Strict Constraints
Identify explicit restrictions in prompt ("Constraints:", "Restrictions:").
Solutions violating these are **immediately discarded**.

### Search Criteria (Default - Three Lenses)
1. **Correctness & Safety**: Functionally correct, respects invariants, no regressions
2. **Architecture & Idiomaticity**: Scalable, pattern-consistent, fits stack. Design Principles audited via `../_shared/solid-audit.md` (Phase 2.5 gate, see below). Not overengineered.
3. **Simplicity & Elegance**: Readable, debuggable, minimal complexity, clean design

---

## Execution (Internal Processing)

Use **ultrathink** for the brainstorm and pruning phases — depth of reasoning matters more than breadth here.

Phases 1-3 are internal — do NOT output all variants to user.

### Phase 1: Abstract Brainstorming
- Generate at least `{max_abstract_variants}` high-level approaches
- Brief format (1-2 sentences per variant)
- Spread variants across orthogonal axes (core abstraction, data flow, failure strategy); discard near-duplicates that differ only cosmetically. Distinctness is bounded by viability — never pad to `{max_abstract_variants}` with absurd variants; that count is a floor on breadth, not a quota over quality. If genuinely distinct viable approaches are fewer than `{max_abstract_variants}`, produce only those as serious candidates and say the space is narrower than requested (narrowness is itself a useful signal); axes you explored and rejected belong in Discarded Branches, not padded into the serious set. Proactive complement to Phase 2's Late-Breaking anchoring check.
- Filter out strict constraint violations

#### External Inspiration (research gate)

Before brainstorming, run a single Perplexity call **iff any one trigger fires AND no anti-trigger fires**. Decide from the task description alone — do not explore the codebase to decide.

**Triggers (any one is sufficient):**
- The prompt names ≥ 2 established techniques to compare (e.g. "CRDT vs OT", "token-bucket vs GCRA", "saga vs 2PC") — call `mcp__perplexity__reason` with the comparison.
- The task maps to a textbook category with a known solution space (consensus, rate limiting, collab sync, caching strategy, migration pattern, retry/backoff, queueing, auth flow, schema evolution) and the prompt does NOT already enumerate the candidate set — call `mcp__perplexity__search` for "state-of-the-art approaches to X (2024-2026)".
- Stakes are high (security, data integrity, correctness under concurrency, perf SLO) AND the decision is dominated by external prior art rather than codebase shape — call `mcp__perplexity__reason`.

**Anti-triggers (any one skips Perplexity):**
- Decision is bounded by in-codebase conventions / existing modules — first-principles + repo patterns suffice.
- Question is "how do I call this library API?" — route to Context7 (`mcp__context7__resolve-library-id` → `query-docs`) instead, per `../researching/SKILL.md`.
- Task is trivial wiring, CRUD, UI layout, or a refactor with all needed info already in the prompt.

**Budget:** at most one Perplexity call in Phase 1 — this is the Perplexity rung of the `../researching/SKILL.md` gate. Library-API questions instead take the Context7 rung (`resolve-library-id` → `query-docs`), which may run a few targeted queries — and read installed source — bounded by what is minimum-sufficient to ground the brainstorm, not one fixed call. If Context7 is insufficient (library absent, version newer than its index, or vendor-owned topic), continue down the gate's remaining rungs — official docs, then a WebSearch fallback — per `../researching/SKILL.md`. Treat Perplexity output critically (single citation ≠ truth) and feed findings into the brainstorm as additional candidates, not as the answer.

### Phase 2: Filter Promising Candidates
- Select top `{num_promising}` variants
- Narrow by **pairwise comparison** against the Search Criteria — relative judgment is more reliable for an LLM than absolute scoring — not by an absolute score alone.
- **Late-Breaking Heuristic**: If ≥ 40 % of the top-`{num_promising}` candidates fall in the last third of the brainstorm list (ranked by Search Criteria), generate 5–10 MORE variants — the early ideas were anchoring you.
  - **Always report the verdict explicitly in `Search Stats`** as `Late-Breaking Triggered: yes` (with count of extra variants generated and which positions in the original list triggered it) or `Late-Breaking Triggered: no` (with the actual fraction observed, e.g. "no — top-5 spread across positions 2/3/5/7/9, last-third would be ≥10/12"). This is non-negotiable — the verdict is part of the deliverable.

### Phase 2.5: SOLID Audit Gate

For each shortlist candidate produced in Phase 2, emit the evidence YAML
defined in `../_shared/solid-audit.md` (one block per principle: `srp`,
`ocp`, `lsp`, `isp`, `dip`). The forked agent loads that file alongside
this skill — do not rely on conversation history. Discard candidates with
any `pass: false` or any missing block (missing ≡ fail).

If post-gate shortlist size drops below `{num_promising} / 2`, return to
Phase 1 and add 5 fresh brainstorm variants, then re-run Phase 2 → 2.5.

Record the gate verdict in `Search Stats` (see Output Format) as
`SOLID Gate: passed=<N>, failed=<M>, principles_failed: [srp×K, isp×L, ...]`.

### Phase 3: Recursive Tree Exploration
- Expand promising candidates into decision tree
- At each node: identify key design decisions, create branches
- **Prune** if: violates constraints, over-engineered, clearly underperforms
- **Leaf nodes**: logical conclusions that weren't pruned

### Phase 4: Final Selection & Output
- Review successful leaf nodes
- Select the **single best solution** by pairwise comparison among surviving leaves (not absolute score).
- Justify the winner with the strongest **counter-evidence** against it and a **calibrated confidence** (low/med/high) naming the single fact that would most change it; flag speculative claims per the Mindset rule (by reference, do not restate it).
- Validate: Three Lenses check, docs compliance

---

## Output Format

```
## Top Candidates
- Candidate A: [name] — Pro: [...], Con: [...]
- Candidate B: [name] — Pro: [...], Con: [...]

## Selected Solution
**Summary**: [1-2 sentences]
**Components**: [3-5 bullets]
**Data Flow**: [2-3 bullets]
**Extension Points**: [1-2 bullets]
**Blueprint**: [files to create/edit OR concrete next steps]
**Counter-evidence**: [strongest argument against the choice]
**Confidence**: [low | med | high — the pivotal unknown]

## SOLID Audit Evidence
[Full evidence YAML for the selected candidate — one block per principle
per `../_shared/solid-audit.md`. All five blocks required. All `pass: true`.]

## Critical Files for Implementation
- [absolute/path/to/file.ts] — [role this file plays in the solution / what changes here]
- [absolute/path/to/other.ts] — [...]

## Discarded Branches (3-5 nearest contenders)
- [name] — Pruned at depth [X] because: [concrete reason — violated constraint, dominated by another, scaling concern, etc.]

## Search Stats
- Tree Depth Reached: [X]
- Total Successful Candidates Found: [Y]
- SOLID Gate: passed=[N], failed=[M], principles_failed: [srp×K, ocp×L, lsp×P, isp×Q, dip×R]
- Late-Breaking Triggered: [yes — generated +N extra variants because top-K positions {a, b, c} were in last third / no — top-K spread observed: {fractions}]
```
