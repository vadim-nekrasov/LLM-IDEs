# Critical Audit Command

Perform a critical audit of changes. If a patch was provided, audit that patch. Otherwise, audit all changes related to the current task.

## 1. Critical Audit & Quality Check

### Explicit Checklist
- [ ] Are all changes necessary?
- [ ] Is there any overengineering or avoidable complexity?
- [ ] Could this task be solved more simply or elegantly while staying correct?
- [ ] Does code comply with project code style?

### Apply Three Lenses
Focus on **Architect** and **Maintainer** lenses:
- Architecture: Is it scalable? Idiomatic? Simple? Safe?
- Maintainability: Readable? Debuggable? Consistent?

### Execute Final Checks
Run the verification checklist:
- Functionality & Stability
- Code Quality & Style
- Documentation & Context

### Additional Focus Points
- **Priority**: Readability & Maintainability > Micro-optimizations
- **Local Consistency**: If adding functionality similar to existing code, follow the style of the current module/file
- **Critical Restrictions**: Ensure changes respect restrictions (no node_modules edits, etc.)

---

## 2. Solution Search (Alternatives)

Execute `/tree-search` command to find alternative solutions:

**Parameters**:
- `{max_abstract_variants}` = **{N}** (default: 15, or first number after command)
- Apply "Late-Breaking Heuristic": if best variant is at the end, generate more

**Result**: If search identifies a better solution than current implementation, apply it.

---

## 3. Cleanup

Remove all console logs added during this task.

---

## Input Interpretation

- `{N}` — first number after command name (default: 15)
- Text after number — additional constraints/requests

**Example**: `/check-all-fixes 20 focus on performance` → N=20, constraint="focus on performance"
