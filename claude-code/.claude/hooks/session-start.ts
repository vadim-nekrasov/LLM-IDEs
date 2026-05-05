#!/usr/bin/env bun
import { existsSync, readdirSync, statSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import type { HookInput } from "./types";
import { cacheDir } from "./utils";

const input: HookInput = await Bun.stdin.json().catch(() => ({}) as HookInput);
const cwd = input.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();

function git(args: string[]): string {
  try {
    const r = Bun.spawnSync(["git", ...args], {
      cwd,
      stdout: "pipe",
      stderr: "pipe",
    });
    if (r.exitCode !== 0) return "";
    return r.stdout?.toString().trim() ?? "";
  } catch {
    return "";
  }
}

// Cache hygiene: drop session-scoped caches older than 7 days.
// `precompact` is intentionally excluded — those snapshots are archival.
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const now = Date.now();
for (const sub of ["transcript", "upcontext"]) {
  const dir = cacheDir(sub);
  if (!existsSync(dir)) continue;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    try {
      const s = statSync(p);
      if (s.isFile() && now - s.mtimeMs > SEVEN_DAYS_MS) unlinkSync(p);
    } catch {
      // best-effort
    }
  }
}

const branch = git(["branch", "--show-current"]) || "(detached)";
const dirty = git(["status", "--porcelain"])
  .split("\n")
  .filter((l) => l.trim().length > 0).length;

const localOverlay = "CLAUDE.local.md";
const overlayHint = existsSync(join(cwd, localOverlay))
  ? ` • Project overlay: \`${localOverlay}\``
  : "";

const message = `Session started • Branch: \`${branch}\` • Dirty files: ${dirty}${overlayHint}`;

console.log(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: message,
    },
  }),
);
