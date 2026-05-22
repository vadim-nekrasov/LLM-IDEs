---
name: researching
description: Research hierarchy for external info — Context7 MCP for library APIs, official docs, Perplexity MCP for architecture and best practices, WebSearch as fallback.
when_to_use: Auto-trigger only when the task genuinely needs external information — third-party library APIs, framework docs, or architecture/best-practices comparisons. Also invoke on an explicit request: the user types `/researching` or asks for the hierarchy itself ("иерархия поиска" / "как искать инфу" / "where to look up X"). A bare name-drop inside a conditional clause (e.g. "ресерч если надо, через researching" / "use researching if needed") is NOT an invocation on its own — skip it unless external info is actually required for the task at hand.
---

# Research Hierarchy

When you need external information (library APIs, docs, architecture guidance,
general queries), follow this order of preference. Each level has a
zero-hallucination expectation: never guess signatures or quote settings that
weren't verified against a primary source.

1. **Context7 MCP** — third-party library APIs. Zero-hallucination policy:
   never guess signatures; verify with the installed version
   (`mcp__context7__resolve-library-id` → `mcp__context7__query-docs`).
2. **Official documentation** — first-party / primary source when Context7
   lacks the library, the installed version is newer than the index, or the
   topic is owned by the vendor itself (e.g. `code.claude.com/docs`,
   `react.dev`, vendor SDK reference). Same zero-hallucination rule: read the
   docs page for the version you're targeting.
3. **Perplexity MCP** — architecture, best practices, comparisons, current
   trends. Treat the output critically; don't act on a single citation.
4. **WebSearch** — fallback for general queries.

## Auto-injected reminders

Critical-evaluation caveats for `mcp__perplexity__*` outputs and the
`claude-code-guide` subagent are appended automatically via the
`critical-eval-reminder.ts` PostToolUse hook — no need to repeat them in
prompts. `claude-code-guide` answers from pre-trained data and frequently lags
current Claude Code releases (settings.json, hooks, skills, plugins, MCP,
deprecation), so verify any factual claim against `code.claude.com/docs` or
the plugin source before acting.
