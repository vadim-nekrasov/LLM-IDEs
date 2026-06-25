---
name: solving-and-reviewing
description: Heavy end-to-end orchestrator — conditional research, tree-search solution selection, implementation via applying-workflow, then fresh-context multi-agent defect review via pr-review-toolkit agents. Manual-only; expensive.
when_to_use: Manual-only — do not auto-trigger on generic prompts. Invoke when the user explicitly types `/solving-and-reviewing` or asks for the full solve-and-review pipeline / "глубокое решение с ревью" / "найди решение и проверь". A bare name-drop inside a conditional is NOT an invocation. For one decision with no review needed use `/searching-solutions`; for a routine edit use the auto-router `applying-workflow`.
argument-hint: "<task with global context and hard constraints>"
effort: high
---

# Solve & Review (End-to-End Orchestrator)

## Invocation Contract

You are reading this because the user explicitly invoked this skill: running the
full pipeline is the default; skipping a phase is a defect unless that phase's own
gate proves it unnecessary (e.g. research-not-needed). Routine edits belong in
`../applying-workflow/SKILL.md` — by invoking this skill the user is already past
that decision; do not second-guess it.

This is an EXPENSIVE pipeline (tree-search forks at `effort: high` plus a
multi-agent review fan-out). That cost is why the skill is manual; on explicit
invocation the cost is already accepted — run it, never substitute a snap judgement.

Runs in **main context** (deliberately no `context: fork`, no read-only `agent`):
it must drive `Skill`/`Agent` calls, hold state across phases, and write code in
Phase 3. It is **thin glue** — it does NOT re-implement research, tree search, the
dev workflow, or the review agents; each phase delegates to an existing skill/agent
(reference, never restate them here).

## Procedure (strict order; HALT gates non-negotiable)

1. **Phase 1 — Research gate (conditional).** If decomposition or solution choice
   hinges on external info (third-party API, vendor/framework docs, technique
   comparison), run the gate in `../researching/SKILL.md` (Context7 → official docs
   → Perplexity), bounded to the minimum sufficient to decide. Otherwise state
   explicitly that research is not needed.

2. **Phase 2 — Solution search → HALT.** One decision point →
   `../searching-solutions/SKILL.md`; several separable decisions →
   `../searching-solutions-multi/SKILL.md` (it owns its own decomposition HALT and
   per-phase context-forwarding). The single-decision path forks with NO
   conversation history — inline all context (task, stack, hard constraints) into
   the argument string. These are planning skills (read-only): they return a
   selected solution + blueprint, not code. **HALT:** present the selected solution
   + blueprint and wait for the user to confirm before implementing.

3. **Phase 3 — Implementation.** Delegate to `../applying-workflow/SKILL.md` to
   build the confirmed blueprint (docs-first → Three Lenses → implementation →
   `../final-checking/SKILL.md`). Reuse it; do not restate its phases.

4. **Phase 4 — Fresh-context review → HALT → fixes.**
   - The point is eyes that did NOT write the code, so do NOT review inline. Spawn
     the `pr-review-toolkit:*` agents directly via the `Agent` tool on the current
     `git diff`, using `review-pr`'s changed-files→agent scope mapping (it owns that
     selection — do not restate it here; spawning directly is more reliable than
     auto-invoking the slash command).
   - **Rubric anchoring.** Each agent's task prompt MUST name the authoritative
     conventions — this project's `CLAUDE.md`/`CLAUDE.local.md`,
     `../_shared/three-lenses.md`, the comment policy (≤2-line, why-only) — and
     instruct: where its built-in defaults conflict, FLAG the conflict, do not
     enforce the foreign default.
   - Aggregate into **Critical / Important / Suggestions** with `file:line`.
     **HALT:** present the report; the user decides what to fix.
   - Apply confirmed Critical/Important, then re-run `../final-checking/SKILL.md`.
     Leave Suggestions unless asked.
