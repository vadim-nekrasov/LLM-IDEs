---
name: searching-solutions
description: Tree-search methodology for finding optimal technical solutions through structured brainstorming, filtering, and recursive exploration.
when_to_use: Triggers when the user asks for "tree search", "structured brainstorming", "древовидный поиск", "поиск решений". Almost always invoked manually — keep `disable-model-invocation: true` so Claude does not run tree search on its own.
argument-hint: "[max_abstract_variants=N] [num_promising=K] [max_depth=D] [max_branching=B] [max_succeed=M] <task description>"
disable-model-invocation: true
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
| Full feature from requirements to merged code | `/feature-dev:feature-dev` |
| Diagnosing a bug — generate hypotheses, filter by evidence | `debugging` skill |
| Verifying a finished change (lint, types, Three Lenses) | `final-checking` skill |
| Routing a non-trivial edit through docs-discovery → Three Lenses → Context7 | `applying-workflow` skill |

If the task is really "design a new feature end-to-end", let `/feature-dev:feature-dev` orchestrate; this skill can be invoked from inside its architecture phase.

---

## Forked Context — Important

This skill runs with `context: fork` and the read-only `Plan` agent. The forked agent has **no access to the conversation history**. Every constraint, stack detail, or prior discussion the search must honour MUST be in the prompt arguments. If relevant context was discussed earlier in the chat, restate it explicitly when invoking.

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
2. **Architecture & Idiomaticity**: Scalable, pattern-consistent, fits stack. Design Principles respected (per CLAUDE.md). Not overengineered.
3. **Simplicity & Elegance**: Readable, debuggable, minimal complexity, clean design

---

## Execution (Internal Processing)

Use **ultrathink** for the brainstorm and pruning phases — depth of reasoning matters more than breadth here.

Phases 1-3 are internal — do NOT output all variants to user.

### Phase 1: Abstract Brainstorming
- Generate at least `{max_abstract_variants}` high-level approaches
- Brief format (1-2 sentences per variant)
- Filter out strict constraint violations

#### External Inspiration (Optional)
Before brainstorming, consider using **Perplexity MCP** to research existing solutions.
See **Research Hierarchy** in CLAUDE.md.

### Phase 2: Filter Promising Candidates
- Select top `{num_promising}` variants
- Evaluate against Search Criteria
- **Late-Breaking Heuristic**: If ≥ 40 % of the top-`{num_promising}` candidates fall in the last third of the brainstorm list (ranked by Search Criteria), generate 5–10 MORE variants — the early ideas were anchoring you.

### Phase 3: Recursive Tree Exploration
- Expand promising candidates into decision tree
- At each node: identify key design decisions, create branches
- **Prune** if: violates constraints, over-engineered, clearly underperforms
- **Leaf nodes**: logical conclusions that weren't pruned

### Phase 4: Final Selection & Output
- Review successful leaf nodes
- Select **single best solution** based on criteria
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

## Discarded Branches (3-5 nearest contenders)
- [name] — Pruned at depth [X] because: [concrete reason — violated constraint, dominated by another, scaling concern, etc.]

## Search Stats
- Tree Depth Reached: [X]
- Total Successful Candidates Found: [Y]
```
