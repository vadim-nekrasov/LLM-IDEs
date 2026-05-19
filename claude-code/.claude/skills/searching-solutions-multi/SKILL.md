---
name: searching-solutions-multi
description: Main-context orchestrator that decomposes a task into one-decision-per-phase, then runs a separate forked /searching-solutions per phase with verbatim forward-propagation and a greedy≠global backward check.
when_to_use: Manual-only. Invoke ONLY when the user explicitly types `/searching-solutions-multi` or asks for "multi-phase tree search" / "sequential decision search" / "многофазный поиск решений" / "поиск по фазам". Never auto-trigger — this fans out into N expensive forked `effort: high` searches. For ONE decision point use `/searching-solutions`; for full feature delivery (code written) use `/feature-dev:feature-dev`.
argument-hint: "[seed=N] <task with global context and hard constraints>"
effort: high
---

# Multi-Phase Solution Search (Orchestrator)

Runs in **main context** (deliberately no `context: fork`): it must call
`/researching` once, hold cross-phase state, and feed locked decisions
forward into each forked `/searching-solutions` call. A forked orchestrator
structurally cannot do this.

This skill does NOT re-implement tree search. Each phase delegates to
`../searching-solutions/SKILL.md` (Phases 1–4, SOLID gate, Output Format
are owned there — reference, never restate them here).

If only one genuine decision survives Step 2, abandon this skill and call
`/searching-solutions` directly — do not pay the fan-out cost for one point.

## Procedure (strict order)

1. **Research once (conditional).** If the overall task is dominated by
   external prior art / a comparison of established techniques, invoke
   `/researching` (see `../researching/SKILL.md`) exactly once and distil a
   compact summary: what was compared, the conclusion, key constraints,
   anti-patterns. Otherwise skip and state why. Do NOT re-instruct research
   per phase — the forked `/searching-solutions` owns its own one-call
   Perplexity gate; duplicating the instruction is harmful.

2. **Decompose — then HALT.** Split the task into phases where each phase
   is EXACTLY one decision point (several independent decisions in a phase
   ⇒ split further). Emit a numbered phase list (what each phase chooses)
   and an inter-phase dependency matrix (which phase constrains which).
   **Stop and wait for the user to confirm the decomposition before any
   search.** This gate is non-negotiable.

3. **Per-phase search (dependency order).** For each confirmed phase, make
   a SEPARATE `/searching-solutions seed=N` call (default `N=12`). The
   forked agent sees nothing but the argument string, so embed a
   self-contained brief:
   - **GLOBAL**: task summary + global context (stack/env/data) + hard
     constraints (violation ⇒ disqualify). Global context may be a
     repo-doc pointer (e.g. `React/src/README.md`, `CLAUDE.local.md`);
     the orchestrator must resolve it by reading that file and inline the
     distilled slice — forked phases cannot follow pointers.
   - **LOCKED**: verbatim decisions of all prior phases + their pivotal
     unknowns.
   - **RESEARCH**: only the slice of the Step-1 summary relevant to THIS
     phase (omit if Step 1 was skipped).
   - **DECISION**: what to choose in this phase + criteria (or "default
     Three Lenses").
   Ask it to decide by pairwise comparison, emit the full Output Format,
   and name in Confidence the single fact that would most change the
   choice (the handoff signal).

4. **Lock & feed forward.** After each call, fix the chosen solution in
   one paragraph and embed it verbatim into the next phase's LOCKED block.
   Independent phases may run in parallel; dependent phases strictly in
   order.

5. **Greedy ≠ global.** Every non-first phase's brief must ask an explicit
   backward check: does this choice make an already-locked phase globally
   suboptimal? If yes and the coupling is strong, return and re-optimise
   the coupled group together. Distinguish a true defect (return) from an
   optional improvement (note it, do not return).

6. **Consolidate.** Merge all locked decisions into one coherent result;
   list the remaining pivotal unknowns explicitly.
