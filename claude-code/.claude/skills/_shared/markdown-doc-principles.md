# Lean Markdown Doc Principles

Single source for how to write agent-facing Markdown docs in this codebase.
Other skills (`writing-docs`, `generate-docs`) defer here — do **not** restate
these rules elsewhere; link to this file.

## Doc types (scope)

- **README** — human onboarding: what the project is, quickstart / install /
  run / contribute. Prose-friendly.
- **`docs/index.md`** — agent orientation: repo map + invariants + gotchas +
  source-of-truth pointers. Rulebook style.
- **ADR / runbook / API notes** — also in scope; lean on the principles below,
  not on the optional skeleton.

All doc types share the include/exclude rules and the budget; only emphasis
differs (README leans onboarding; `docs/index.md` leans orientation).

## Audience

In repos where humans don't read `docs/index.md` (the agent is the only
consumer), the budget is a hard reader-cost concern, not a style preference.
Every line burns tokens on every future cold read, so bloat is multiplicative
across sessions.

How readers are expected to treat these docs — with skepticism, verifying
against code before acting — lives in
[`../applying-workflow/patterns/docs-first.md#trust-calibration`](../applying-workflow/patterns/docs-first.md#trust-calibration).
Authoring decisions should anticipate that calibration: write claims that
*will earn* trust (invariants, cross-file intent), not claims that demand it
(restated current behaviour, which rots and gets distrusted).

## Budget

- Target ~1–3k tokens per doc. Headings + bullets; prose only where a sentence
  is the clearest form.
- Bias to delete: if code or config already states it, omit it here.
- Treat the range as a soft target, not a ceiling: overshoot is justified
  when every added line is a non-obvious invariant the code does not
  state, never to restate code. Both undershoot (cut invariants to hit
  the count) and bloat (pad to fill the page) are defects — the budget
  is a lagging indicator of disciplined deletion.
- **Before adding a line to an existing doc**, ask: can a future agent
  recover this fact in < 30 s of grep + a single file read? If yes, omit.
  Restoration via `git` is cheap; accumulated bloat compounds across every
  cold read.

## Include (earns its place)

- Short orientation / elevator + a coarse repo map (one tree fence max).
- Invariants & contracts the code does not state clearly.
- Gotchas / danger zones (footguns, "never do X", surprising coupling).
- High-level, NON-obvious version/constraint notes only — not full version tables.
- ≤1–2 tiny canonical snippets, only when prose can't carry the pattern.
- Quality / testing priorities as actionable rules.
- "Sources of truth & further docs" pointers (where authoritative detail lives).

## Exclude (token burn / rot)

- Full dependency / version tables — duplicates `package.json` / lockfile.
- Large code samples — burn tokens and rot against the source.
- Narrative audit prose — strengths / areas-to-improve / maintainer notes.
- Changelog / roadmap — lives in git history / `CHANGELOG`.
- Anything that just restates clearly-readable code.

## Conflict resolution (authority)

Code/config is authoritative on **behavior**; this doc is authoritative on
**design intent & invariants**. On conflict, trust the code for *what happens*
(and fix the doc), and trust the doc for *why / what must stay true*.

## Optional reference skeleton — `docs/index.md`

Starting scaffold for `docs/index.md` **only** — adapt or drop sections to fit;
never force it onto README / ADR / runbook. Reference target: ~80 lines, 0
version numbers, ≤1 repo-map fence, 0 source-code fences unless a snippet truly
earns one.

1. **Orientation & scope** — one-paragraph elevator + path conventions.
2. **Repo map** — coarse tree, one line of intent per load-bearing dir.
3. **Stack at a glance** — technologies by role only, no version numbers.
4. **Invariants & contracts** — the "don't break these" list.
5. **Gotchas / danger zones** — traps that cause silent breakage or mass rewrites.
6. **Quality & testing priorities** — how to keep changes clean.
7. **Sources of truth & further docs** — pointers + the conflict-resolution note.
