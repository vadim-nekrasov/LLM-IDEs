---
name: researching
description: Research hierarchy for external info — Context7 MCP for library APIs, official docs, Perplexity MCP for architecture and best practices, WebSearch as fallback.
when_to_use: Manual-only. Invoke when looking up third-party library APIs, framework docs, or architecture/best-practices comparisons, or when the user types `/researching` or asks for "research hierarchy" / "иерархия поиска" / "как искать инфу" / "where to look up X".
---

# Researching External Information

Use this skill to decide *where* to look up something outside the project
codebase. The hierarchy enforces a zero-hallucination policy: prefer primary
sources (Context7, official docs) over synthesised summaries (Perplexity,
WebSearch).

## Quick reference

1. **Context7 MCP** — library APIs, SDK reference (against installed version).
2. **Official documentation** — vendor pages (e.g. `code.claude.com/docs`,
   `react.dev`) when Context7 doesn't cover the topic.
3. **Perplexity MCP** — architecture, best practices, comparisons. Treat
   single citations critically.
4. **WebSearch** — fallback for general queries.

See `../_shared/research-hierarchy.md` for the full rules, including the
auto-injected critical-evaluation reminders for `mcp__perplexity__*` and the
`claude-code-guide` subagent.
