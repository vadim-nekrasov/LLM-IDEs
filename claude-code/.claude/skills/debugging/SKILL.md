---
name: debugging
description: Systematic debugging routine with hypothesis generation (≥20 by default), evidence-based filtering, and targeted logging.
when_to_use: Triggers when investigating bugs, error messages, stack traces, or unexpected behaviour, or when the user says "bug", "error", "broken", "не работает", "doesn't work".
effort: xhigh
---

# Debugging Router

## Configuration
- **Default N**: 20 hypotheses minimum.
- User can override with an explicit number in the prompt.
- Always allowed to generate more than N if it improves coverage.

## Procedure (strict order)
1. **Generate ≥ N hypotheses.** See `patterns/hypotheses.md`.
2. **Filter & prioritize.** Discard impossible ones based on evidence; align with user's questions; pick the most probable AND testable.
3. **Design logging.** See `patterns/logging.md`. Goal: isolate single root cause OR shrink candidate set significantly.
4. **Run, observe, narrow.** Iterate until resolved.

## When to bring external research
If local analysis is insufficient, use Perplexity MCP — see `../researching/SKILL.md`. Verify Perplexity output critically.
