---
name: usage-analytics
description: Local, dependency-free Claude Code token-usage analytics (a self-hosted ccusage). Use when the user asks about token consumption, burn rate, cost estimate, or usage broken down by day, model, project, or session.
---

# Usage Analytics

Local token-usage analytics for Claude Code. Reads `~/.claude/projects/**/*.jsonl`
directly (read-only, zero external dependencies) and prints a deduplicated breakdown.

## Run

Invoke the CLI via the Bash tool (bun is the runtime):

```
bun "$CLAUDE_PROJECT_DIR"/.claude/hooks/usage.ts [--today | --7d | --session | --by-model | --by-project]
```

- `--today` (default) — today's tokens and cost estimate
- `--7d` — per-day breakdown for the last 7 days
- `--by-model` — totals grouped by model
- `--by-project` — totals grouped by project (cwd)
- `--session` — recent sessions, newest first

## Reading the numbers

- Records are deduplicated by `message.id:requestId` — raw assistant snapshots inflate
  counts ~3x, so never sum the JSONL yourself; always use this tool.
- The `~$` column is an **API-equivalent estimate** from a local price table, not a
  subscription bill. On Max/Pro the real budget signal is the `rate_limits` in the
  statusline, not dollars.
- A `*` marks rows with an unpriced model (e.g. `<synthetic>`), excluded from `$`.

## Maintenance

- Prices live in `.claude/hooks/usage-prices.ts` — add a model as one data row.
