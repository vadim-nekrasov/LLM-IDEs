#!/usr/bin/env bun
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { HookInput } from "./types";
import { cacheDir, sanitizeSessionId } from "./utils";

const input: HookInput = await Bun.stdin.json().catch(() => ({}) as HookInput);
const cwd = input.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();

// Single subprocess: branch header + ahead/behind + per-file change records.
// Format reference: https://git-scm.com/docs/git-status#_porcelain_format_version_2
let stdout = "";
try {
  const r = Bun.spawnSync(["git", "status", "-sb", "--porcelain=2"], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  });
  if (r.exitCode !== 0) process.exit(0);
  stdout = r.stdout?.toString() ?? "";
} catch {
  process.exit(0);
}

let branch = "";
let aheadBehind = "";
let dirty = 0;

for (const line of stdout.split("\n")) {
  if (!line.length) continue;
  if (line.startsWith("# branch.head ")) {
    branch = line.slice("# branch.head ".length).trim();
  } else if (line.startsWith("# branch.ab ")) {
    const m = line.match(/\+(\d+) -(\d+)/);
    if (m && (m[1] !== "0" || m[2] !== "0")) {
      aheadBehind = ` • ↑${m[1]} ↓${m[2]}`;
    }
  } else if (!line.startsWith("#")) {
    dirty++;
  }
}

if (!branch) process.exit(0);

const message = `Git: \`${branch}\`${aheadBehind} • Dirty files: ${dirty}`;

// Dedup: skip if the previous UserPromptSubmit in this session emitted the
// same line. Without this, slash commands (e.g. /effort) and the following
// real prompt fire the hook twice with identical git state, and the model's
// context shows two duplicate `Git: ...` advisories.
const safeId = sanitizeSessionId(input.session_id, "session");
const cacheFile = join(cacheDir("upcontext"), `${safeId}.txt`);
let last = "";
try {
  if (existsSync(cacheFile)) last = readFileSync(cacheFile, "utf8");
} catch {
  // best-effort
}
if (last === message) process.exit(0);
try {
  writeFileSync(cacheFile, message);
} catch {
  // best-effort
}

console.log(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext: message,
    },
  }),
);
