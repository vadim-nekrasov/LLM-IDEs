# Solution Tree Search

**Role:** Senior Software Architect & System Designer.
**Objective:** Execute a structured, tree-based search to identify the optimal technical solution for the current task.

---

## 1. Constraints & Criteria Analysis

Analyze the user's request to establish the evaluation framework.

- **Strict Constraints:** Identify any explicit restrictions (e.g., "Constraints:", "Restrictions"). These are `strict_constraints`. Any solution violating these must be **immediately discarded**.
- **Search Criteria:** 
  - If specified by the user, use their criteria.
  - Otherwise, use the **Default Criteria**:
    1. **Correctness**: Solves the problem accurately.
    2. **Simplicity**: Minimal complexity (Occam's razor).
    3. **Elegance**: Clean, maintainable design.
    4. **Idiomatic**: Fits the project's existing stack, patterns, and libraries.

---

## 2. Step-by-Step Execution

### Phase 1: Abstract Brainstorming
Generate a list of **High-Level Approaches**.
- **Quantity:** At least `{max_abstract_variants}`.
- **Format:** Brief (1-2 sentences per variant).
- **Filter:** Exclude any that violate `strict_constraints`.

### Phase 2: Filter Promising Candidates
Select the top candidates from Phase 1 to explore further.
- **Quantity:** Select `{num_promising}` variants.
- **Basis:** Evaluate against the `Search Criteria`.

### Phase 3: Recursive Tree Exploration
Expand the promising candidates into a decision tree to explore implementation details and trade-offs.

**Parameters:**
- **Max Depth:** `{max_depth}` levels.
- **Max Branching:** `{max_branching}` branches per node.
- **Success Limit:** `{max_succeed}` total successful leaf nodes.

**Logic:**
1. **Branching:** At each node, identify key design decisions (e.g., library choice, state management strategy, data structure). Create branches representing distinct, viable choices.
2. **Pruning (Dead Ends):** Terminate a branch immediately (0 descendants) if it:
   - Violates `strict_constraints`.
   - Becomes over-engineered.
   - Clearly underperforms against `Search Criteria`.
3. **Leaf Nodes:** A node is a "Successful Solution" if it reaches a logical conclusion without being pruned.

### Phase 4: Final Selection & Specification
1. Review the accumulator of "Successful Solutions".
2. Select the **Single Best Solution** based on the `Search Criteria`.
3. Provide a **Detailed Architectural Specification** for this solution (NO CODE yet):
   - **Summary:** High-level overview.
   - **Components:** Key modules, classes, or functions.
   - **Data Flow:** How data moves through the system.
   - **Trade-offs:** Why this was chosen over alternatives.
   - **Extension Points:** How it handles future growth.

---

## Configuration (Defaults)

Parse numeric arguments from the user prompt to override these defaults. If a number is missing, use the default.

| Parameter | Description | Default |
| :--- | :--- | :--- |
| `{max_abstract_variants}` | Minimum initial ideas | **20** |
| `{num_promising}` | Candidates to deep dive | **5** |
| `{max_depth}` | Tree depth limit | **5** |
| `{max_branching}` | Max branches per node | **3** |
| `{max_succeed}` | Max successful leaves to store | **40** |

---

## Final Output Requirement

After presenting the **Detailed Architectural Specification**, append a brief stats summary:
> **Search Stats:**
> - Tree Depth Reached: [X]
> - Total Successful Candidates Found: [Y]
