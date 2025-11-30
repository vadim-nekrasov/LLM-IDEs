Task: If I provided a patch of changes in the current message, perform a critical audit of the changes in that patch. If I did not provide such a patch, simply perform a critical audit of all changes related to the task discussed in the current dialogue.
 
1) **Critical Audit & Quality Check**:
    - **Explicit Checklist**:
        - [ ] Are all changes necessary?
        - [ ] Is there any overengineering or avoidable complexity?
        - [ ] Could this task be solved more simply or more elegantly while staying correct?
        - [ ] For ECMAScript files: does the code comply with `.cursor/rules/ecmascript-code-style.mdc`?
    - Apply the **Three Lenses** (especially Architect and Maintainer) from `.cursor/rules/expert-mindset.mdc`.
    - Execute the checklist from `.cursor/rules/final-checks.mdc` (Functional, Code Quality, Docs).
    - **Additional Focus Points**:
        - **Priority**: Readability & Maintainability > Micro-optimizations (prefer clear code over premature optimization).
        - **Local Consistency**: If adding functionality similar to existing code (e.g., a reducer, component or hook), strictly follow the style and structure of the *current* module/file.
        - **Critical Restrictions**: Ensure that changes respect the `Critical Restrictions` block from `.cursor/rules/expert-mindset.mdc`.
 
2) **Solution Search (Alternatives)**:
    - **Execute Tree Search**: Run the process defined in `.cursor/commands/solution-tree-search.md`.
    - **Parameters**:
        - Set `{max_abstract_variants}` to **{N}** (default: **15**).
        - Follow the "Late-Breaking Heuristic" from `.cursor/commands/solution-tree-search.md` (adding more variants if the best one is at the end).
    - **Result**: If the search identifies a solution better than the current implementation, apply it.
 
3) **Cleanup**:
    - Remove all console logs added during this task.
 
**Input Interpretation**:
- `{N}` — the first number after the command name (default: **15**).
- Text after the number — additional constraints/requests.
