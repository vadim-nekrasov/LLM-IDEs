#!/usr/bin/env bun
import { appendFileSync } from "node:fs";
import { join } from "node:path";
import type { HookInput } from "./types";
import { cacheDir, sanitizeSessionId } from "./utils";

interface PermissionRequestInput extends HookInput {
  permission_decision?: "allow" | "deny" | "ask";
  permission_decision_reason?: string;
}

const input: PermissionRequestInput = await Bun.stdin
  .json()
  .catch(() => ({}) as PermissionRequestInput);

// Strip fields that may contain secrets (file contents in Edit/Write,
// long Bash commands). Paths and shell-command prefixes are preserved
// because they are needed to investigate "why was this denied" later.
function sanitizeToolInput(
  toolName: string | undefined,
  toolInput: HookInput["tool_input"],
): unknown {
  if (!toolInput) return toolInput;
  switch (toolName) {
    case "Edit":
    case "Write":
    case "MultiEdit":
    case "NotebookEdit":
      return { file_path: toolInput.file_path };
    case "Bash": {
      const cmd = String(toolInput.command ?? "");
      return {
        command: cmd.length > 200 ? cmd.slice(0, 200) + "…" : cmd,
        ...(toolInput.description
          ? { description: toolInput.description }
          : {}),
      };
    }
    default:
      return toolInput;
  }
}

const safeId = sanitizeSessionId(input.session_id);
const logFile = join(cacheDir("permission-log"), `${safeId}.jsonl`);

const entry = {
  ts: new Date().toISOString(),
  session_id: input.session_id,
  tool: input.tool_name,
  input: sanitizeToolInput(input.tool_name, input.tool_input),
  decision: input.permission_decision,
  reason: input.permission_decision_reason,
};

try {
  appendFileSync(logFile, JSON.stringify(entry) + "\n");
} catch {
  // best-effort; never block on logging
}

process.exit(0);
