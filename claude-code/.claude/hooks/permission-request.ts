#!/usr/bin/env bun
import { appendFileSync } from "node:fs";
import { join } from "node:path";
import type { HookInput } from "./types";
import { cacheDir } from "./utils";

interface PermissionRequestInput extends HookInput {
  permission_decision?: "allow" | "deny" | "ask";
  permission_decision_reason?: string;
}

const input: PermissionRequestInput = await Bun.stdin
  .json()
  .catch(() => ({}) as PermissionRequestInput);

const safeId = (input.session_id || "_unknown").replace(/[^\w.-]+/g, "_");
const logFile = join(cacheDir("permission-log"), `${safeId}.jsonl`);

const entry = {
  ts: new Date().toISOString(),
  session_id: input.session_id,
  tool: input.tool_name,
  input: input.tool_input,
  decision: input.permission_decision,
  reason: input.permission_decision_reason,
};

try {
  appendFileSync(logFile, JSON.stringify(entry) + "\n");
} catch {
  // best-effort; never block on logging
}

process.exit(0);
