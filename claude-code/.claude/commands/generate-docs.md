# Generate Technical Documentation for Folder

Analyze code in specified folder and generate/update technical documentation.

## Usage

```
/generate-docs src/features/auth
/generate-docs packages/shared/ui
```

**Argument**: Path to target folder (TARGET_DIR), relative to project root.

---

## What to Analyze

**Include**:
- Code files: `*.ts`, `*.tsx`, `*.js`, `*.jsx`, etc.
- Logic files: hooks, services, utils, models, reducers
- Tests: use for understanding behavior, not detailed documentation
- README.md: for context, but trust code over docs if conflicts

**Ignore**:
- `node_modules`, `dist`, `build`, `.next`, `.cache`, `coverage`
- Generated files: `*.generated.*`, `*.g.ts`, `/* AUTO-GENERATED */`
- Binary files: images, fonts, archives
- Config files: use only for stack understanding, don't document separately

---

## Output

Create/update: `TARGET_DIR/docs/index.md`

**Max size**: ~1000 lines

---

## Document Structure

```markdown
# [Module Name] – Technical Overview

## 1. Scope and Purpose
Role in project, what it does and doesn't do.

## 2. Directory Structure
Brief tree (2-3 levels), short descriptions.

## 3. Technologies and Dependencies
Languages, frameworks, key libraries.

## 4. Architecture and Data Flow
Layers, responsibilities, how data moves.

## 5. Key Modules and Responsibilities
Key components/services with short descriptions.
Include code examples (5-15 lines) where helpful.

## 6. Extension and Modification Guidelines
How to add features, extension points, invariants to preserve.

## 7. Testing and Quality
How tested, what's covered, key invariants.

## 8. Known Trade-offs and Limitations
Conscious compromises, important limitations.

## 9. Summary
Complexity, typical changes, risk areas.
```

---

## Update Rules

If `docs/index.md` exists:
1. Don't rewrite from scratch unnecessarily
2. Update only what needs updating
3. Preserve user's custom sections if they're useful
4. Gently align structure to template without destroying content

---

## Code Examples

- Short (5-15 lines)
- Show pattern essence, not entire files
- All comments in English
