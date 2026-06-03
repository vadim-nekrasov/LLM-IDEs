#!/usr/bin/env bun
import { existsSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import type { HookInput } from "./types";
import { cacheDir, sanitizeSessionId } from "./utils";

interface SessionEndInput extends HookInput {
  reason?: "exit" | "logout" | "prompt_input_exit" | "other";
}

const input: SessionEndInput = await Bun.stdin
  .json()
  .catch(() => ({}) as SessionEndInput);

// Drop session-scoped caches now rather than waiting for the 7-day GC in
// session-start.ts. precompact snapshots are intentionally archival and stay.
// Preserve transcript cache for --resume; only purge on terminal session exit.
const sessionId = input.session_id;
if (sessionId && (input.reason === "exit" || input.reason === "logout")) {
  const safeId = sanitizeSessionId(sessionId);
  for (const sub of ["transcript", "upcontext"]) {
    const file = join(cacheDir(sub), `${safeId}.json`);
    if (existsSync(file)) {
      try {
        unlinkSync(file);
      } catch {
        // best-effort
      }
    }
  }
}

process.exit(0);
