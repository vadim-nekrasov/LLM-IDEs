---
name: searching-solutions-multi
description: Main-context orchestrator that decomposes a task into one separable decision per phase, then runs a separate forked /searching-solutions per phase with verbatim forward-propagation and a greedy≠global backward check.
when_to_use: Manual-only: do not auto-trigger on generic prompts. Invoke when the user explicitly types `/searching-solutions-multi` or asks for "multi-phase tree search" / "sequential decision search" / "многофазный поиск решений" / "поиск по фазам". The fan-out into N forked `effort: high` searches is expensive — that cost is why this skill is manual, NOT a licence to skip a search the user explicitly invoked: on explicit invocation the cost is already accepted, so run it (never substitute a snap judgement). For ONE decision point — or a cluster of strongly-coupled decisions that must be optimized jointly (greedy phase-locking would lose the joint optimum) — use `/searching-solutions`; for full feature delivery (code written) use `/feature-dev:feature-dev`.
argument-hint: "<task with global context and hard constraints>"
effort: high
---

# Multi-Phase Solution Search (Orchestrator)

## Invocation Contract

You are reading this because the user explicitly invoked this skill: running it
is the default; skipping is a defect unless Step 2's decomposition proves exactly
one decision survives. A repeated invocation *escalates* the signal — treat
re-invocation as strengthened intent, never a licence to double down on skipping.

Runs in **main context** (deliberately no `context: fork`): it must call
`/researching` once, hold cross-phase state, and feed locked decisions
forward into each forked `/searching-solutions` call. A forked orchestrator
structurally cannot do this.

This skill does NOT re-implement tree search. Each phase delegates to
`../searching-solutions/SKILL.md` (Phases 1–4, SOLID gate, Output Format
are owned there — reference, never restate them here).

## Per-phase seed (proposal model)

Each phase's child `/searching-solutions` call takes a single `seed=N`
(its `max_abstract_variants` — the brainstorm floor; higher ⇒ wider,
costlier). This orchestrator does NOT accept a top-level `seed` argument.
In Step 2 you propose one value per phase, anchored at `12` with a
deviation in `{0, ±2, ±4, ±6}` clamped to `[6, 20]`. Each proposal carries
a ≤12-word rationale phrase naming the reason for the deviation (or
`"default"`).

Typical deviation reasons (non-binding, extend as needed):
- `"high coupling — locks downstream"` (+)
- `"foundational — lots to lock in"` (+)
- `"high stakes — widen"` (+)
- `"narrow constraint space"` (−)
- `"easily reversible — narrow OK"` (−)
- `"few candidate families exist"` (−)

The user may override any subset in their HALT-gate reply via free-form
text (e.g. `"phase 2 → 18, rest ok"`). Parse intent, not strict syntax.

## Procedure (strict order)

1. **Research up front (conditional, bounded).** If the *overall* task hinges
   on external information the decomposition itself depends on — a third-party
   library's API, vendor/framework docs, or a comparison of established
   techniques — run the research gate (the full hierarchy in
   `../researching/SKILL.md`: Context7 for library APIs, official docs, then
   Perplexity for comparisons) and distil a compact summary: what was looked
   up / compared, the conclusion, key constraints, anti-patterns. Stay bounded
   — only the cross-phase questions, the minimum sufficient to decompose, not a
   per-phase deep dive. Otherwise skip and state why. Do NOT restate the
   hierarchy here or in the phases — each forked `/searching-solutions` runs the
   *same* gate (Context7 included) for its own phase-local needs; duplicating
   the hierarchy text is what's harmful, not the per-phase research itself.

2. **Decompose — then HALT.** Split the task into phases where each phase
   is EXACTLY one decision point (several independent decisions in a phase
   ⇒ split further; and the converse — decisions too strongly coupled to lock
   one before the other are NOT separate phases: fold the cluster into ONE
   phase as a single joint search, or, if that collapses the task to a lone
   cluster, take the single-decision exit to `/searching-solutions`). Emit a
   numbered phase list (what each phase chooses)
   and an inter-phase dependency matrix (which phase constrains which).
   Render each phase line in the form
   `Phase N: <decision> — proposed seed=<int>, rationale: "<≤12-word phrase>"`
   per the *Per-phase seed* model above. **Stop and wait for the user to
   confirm the decomposition before any search.** This gate is
   non-negotiable; the user may accept all, or override any subset by
   naming phases (parse intent, not syntax).

   **Single-decision exit (only here, only now).** If — and only if — the
   numbered decomposition and dependency matrix above are already emitted and
   exactly one genuine decision survives, abandon this skill and call
   `/searching-solutions` directly instead of paying fan-out for one point.
   Applying this from a mental estimate before the decomposition exists is
   itself a defect: the count of genuine decisions is an *output* of Step 2,
   not a precondition for running it.

3. **Per-phase search (dependency order).** For each confirmed phase, make
   a SEPARATE `/searching-solutions seed=N` call where `N` is the per-phase
   value locked at the Step-2 HALT gate (anchor 12, see *Per-phase seed*
   above). The forked agent sees nothing but the argument string, so embed
   a self-contained brief:
   - **GLOBAL**: task summary + global context (stack/env/data) + hard
     constraints (violation ⇒ disqualify). Global context may be a
     repo-doc pointer (e.g. `React/src/README.md`, `CLAUDE.local.md`);
     the orchestrator must resolve it by reading that file and inline the
     distilled slice — forked phases cannot follow pointers.
   - **LOCKED**: verbatim decisions of all prior phases + their pivotal
     unknowns.
   - **RESEARCH**: the phase's external grounding — exactly one of: the slice of
     the Step-1 summary relevant to THIS phase; or the marker `self-serve via
     your own research gate`, letting the fork run the gate (multi-step where
     needed) in its Phase 1. Omit only when the phase needs no external info.
   - **DECISION**: what to choose in this phase + the criteria the fork
     applies for its in-phase filtering (default Three Lenses) — the rubric
     the forked `/searching-solutions` uses inside its search, never a
     judgement made here in place of running it.
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
