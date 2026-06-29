---
name: usage-analytics
description: Local, dependency-free Claude Code token-usage analytics. Use when the user asks about token consumption or usage broken down by day, model, project, or session.
---

# Usage Analytics

Local token-usage analytics for Claude Code. Reads `~/.claude/projects/**/*.jsonl`
directly (read-only, zero external dependencies) and prints a deduplicated breakdown.

## Run

Invoke the CLI via the Bash tool (bun is the runtime):

```
bun "$CLAUDE_PROJECT_DIR"/.claude/hooks/usage.ts [--today | --7d | --session | --by-model | --by-project]
```

- `--today` (default) — today's tokens
- `--7d` — per-day breakdown for the last 7 days
- `--by-model` — totals grouped by model
- `--by-project` — totals grouped by project (cwd)
- `--session` — recent sessions, newest first

## Reading the numbers

- Columns are Input / Output / CacheW (cache writes) / CacheR (cache reads).
- Records are deduplicated by `message.id:requestId` — raw assistant snapshots inflate counts
  ~3x, so never sum the JSONL yourself; always use this tool.
- On a subscription the real budget signal is the native `rate_limits` (5h/7d) in the statusline
  and `/usage`, not raw token totals.
