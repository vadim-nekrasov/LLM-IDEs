# Solution Tree Search

**Role:** Senior Software Architect & System Designer.
**Objective:** Execute a structured, tree-based search to identify the optimal technical solution for the current task.

---

## 1. Mindset & Reasoning Guidelines

- **Epistemic Style:** Start with high uncertainty. Gradually build confidence by rigorously analyzing pros, cons, and trade-offs for each option. Do not jump to conclusions.
- **Speculation:** You may use high levels of speculation or prediction to explore novel solutions, but you **must clearly flag it** (e.g., "Hypothetically...", "I suspect that...").
- **Authority:** Value good arguments over authorities. The source is irrelevant; the logic is everything.
- **Planning:** Use pseudocode if it helps structure complex logic or data flows.

---

## 2. Constraints & Criteria Analysis

Analyze the user's request to establish the evaluation framework.

- **Strict Constraints:** Identify any explicit restrictions (e.g., "Constraints:", "Restrictions"). These are
  `strict_constraints`. Any solution violating these must be **immediately discarded**.
- **Search Criteria:** 
  - If specified by the user, use their criteria.
  - Otherwise, use the **Default Criteria** (aligned with "The Three Lenses" from `.cursor/rules/expert-mindset.mdc`):
    1. **Correctness & Safety**: The solution must be functionally correct, respect invariants, and avoid regressions.
    2. **Architecture & Idiomaticity**: Scalable, pattern-consistent, and fits the existing stack (SOLID, DRY, KISS).
    3. **Simplicity, Maintainability & Elegance**: Readable, debuggable, minimal complexity, with a clean, non-hacky design.

---

## 3. Step-by-Step Execution

> **Output Policy**: Phases 1-3 are **internal processing** — execute them mentally or in thinking blocks, but do NOT output all intermediate variants or tree structures to the user. Only Phase 4 results are output.

### Phase 1: Abstract Brainstorming (Internal)
Generate a list of **High-Level Approaches**.
- **Quantity:** At least `{max_abstract_variants}`.
- **Format:** Brief (1-2 sentences per variant).
- **Filter:** Exclude any that violate `strict_constraints`.

### Phase 2: Filter Promising Candidates (Internal)
Select the top candidates from Phase 1 to explore further.
- **Quantity:** Select `{num_promising}` variants (default: **5**).
- **Basis:** Evaluate against the `Search Criteria`.
- **Late-Breaking Heuristic:** If your best option appeared only at the very end of the list (e.g., last 3-5 items),
  generate 5-10 more variants to ensure you haven't missed a better adjacent idea.

### Phase 3: Recursive Tree Exploration (Internal)
Expand the promising candidates into a decision tree to explore implementation details and trade-offs.

**Parameters:**
- **Max Depth:** `{max_depth}` levels.
- **Max Branching:** `{max_branching}` branches per node.
- **Success Limit:** `{max_succeed}` total successful leaf nodes.

**Logic:**

1. **Branching:** At each node, identify key design decisions (e.g., library choice, state management strategy, data
   structure). Create branches representing distinct, viable choices.
2. **Pruning (Dead Ends):** Terminate a branch immediately (0 descendants) if it:
   - Violates `strict_constraints`.
   - Becomes over-engineered.
   - Clearly underperforms against `Search Criteria`.
3. **Leaf Nodes:** A node is a "Successful Solution" if it reaches a logical conclusion without being pruned.

### Phase 4: Final Selection & Output
1. Review the accumulator of "Successful Solutions".
2. Select the **Single Best Solution** based on the `Search Criteria`.
3. **Final Validation** (internal): Confirm Three Lenses Check and Docs Compliance.
4. **Output** the following (compact but complete):
   - **Top 2-3 Candidates**: 1 line each with name, 1 pro, 1 con.
   - **Selected Solution Specification**:
     - Summary (1-2 sentences)
     - Components (3-5 bullets: key modules/classes)
     - Data Flow (2-3 bullets: how data moves)
     - Extension Points (1-2 bullets: where to grow)
     - Blueprint (files to create/edit)

---

## Configuration (Defaults)

Parse numeric arguments from the user prompt to override these defaults. 

**Auto-Adjustment (Simple Tasks Only):**
Reduce `{max_abstract_variants}` to **5** only if the task was classified as **SIMPLE**.

> **📄 Source of Truth**: The complexity criteria are defined in `.cursor/rules/task-classification.mdc`.
> Read that file for the full classification logic. Do not duplicate criteria here.

If you are unsure whether the task is simple, **do NOT apply auto-adjustment**.

| Parameter | Description | Default                                            |
| :--- | :--- |:---------------------------------------------------|
| `{max_abstract_variants}` | Minimum initial ideas | **15** (auto-adjustment may reduce to **5** for simple tasks) |
| `{num_promising}` | Candidates to deep dive | **5**                                              |
| `{max_depth}` | Tree depth limit | **5**                                              |
| `{max_branching}` | Max branches per node | **3**                                              |
| `{max_succeed}` | Max successful leaves to store | **40**                                             |

---

## Final Output Requirement

Output a **compact but complete** result (do NOT dump full tree or all 15+ variants):

```
Complexity: [COMPLEX | SIMPLE | SKIPPED] — [brief reason]

## Top Candidates
- Candidate A: [name] — Pro: [...], Con: [...]
- Candidate B: [name] — Pro: [...], Con: [...]

## Selected Solution
**Summary**: [1-2 sentences]
**Components**: [3-5 bullets]
**Data Flow**: [2-3 bullets]
**Extension Points**: [1-2 bullets]
**Blueprint**: [files to create/edit]
```
