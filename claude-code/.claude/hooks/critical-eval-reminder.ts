#!/usr/bin/env bun
/**
 * PostToolUse hook: appends a critical-evaluation reminder when the model
 * just consumed output from a source whose results are routinely stale or
 * low-quality:
 *   - any `mcp__perplexity__*` MCP tool (web-search synthesis),
 *   - the `claude-code-guide` subagent (answers from pre-trained data that
 *     lags current Claude Code releases).
 *
 * Other Agent invocations and other MCP tools fall through silently.
 */
import type { HookInput } from "./types";

const PERPLEXITY_PREFIX = "mcp__perplexity__";

const PERPLEXITY_REMINDER =
  "Reminder: Perplexity output is web-search synthesis — sources may be outdated, " +
  "low-quality, or partially wrong. Do not act on a single citation. Cross-check " +
  "version- or API-specific claims against Context7 (for libraries) or primary docs.";

const GUIDE_REMINDER =
  "Reminder: claude-code-guide answers from pre-trained data that lags current " +
  "Claude Code releases. Treat its claims about settings.json, hooks, skills, " +
  "plugins, MCP, or feature availability as a hypothesis — verify against " +
  "code.claude.com/docs (or the relevant plugin source) before acting.";

function emit(additionalContext: string): never {
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext,
      },
    }),
  );
  process.exit(0);
}

const input: HookInput = await Bun.stdin.json();
const toolName = input.tool_name ?? "";

if (toolName.startsWith(PERPLEXITY_PREFIX)) emit(PERPLEXITY_REMINDER);

const subagent = input.tool_input?.subagent_type as string | undefined;
if (toolName === "Agent" && subagent === "claude-code-guide")
  emit(GUIDE_REMINDER);

process.exit(0);
