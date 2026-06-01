#!/usr/bin/env bun
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  unlinkSync,
} from "node:fs";
import { join } from "node:path";
import type { HookInput } from "./types";
import { cacheDir } from "./utils";

interface SessionStartInput extends HookInput {
  source?: "startup" | "resume" | "clear" | "compact";
}

const input: SessionStartInput = await Bun.stdin
  .json()
  .catch(() => ({}) as SessionStartInput);
const cwd = input.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();

// Cache cleanup is meaningful only on a fresh session boot. On `compact` we
// just wrote a pre-compact snapshot and the transcript cache must stay; on
// `clear` and `resume` the cleanup is unnecessary churn. The matcher in
// settings.json restricts the hook to startup, but we keep this guard so the
// script remains safe if invoked manually or with the matcher relaxed.
const shouldCleanCache = !input.source || input.source === "startup";

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
if (shouldCleanCache) {
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  for (const sub of ["transcript", "upcontext", "permission-log"]) {
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
}

const branch = git(["branch", "--show-current"]) || "(detached)";
const dirty = git(["status", "--porcelain"])
  .split("\n")
  .filter((l) => l.trim().length > 0).length;

const localOverlay = "CLAUDE.local.md";
const overlayHint = existsSync(join(cwd, localOverlay))
  ? ` • Project overlay: \`${localOverlay}\``
  : "";

// Diagnostic: warn if tools required by other hooks are missing in PATH.
// `bun` is the runner for every hook in settings.json; if it's not on PATH
// the rest of the hooks will fail silently. `git` is used by several hooks
// for repo context and will degrade gracefully but it's worth surfacing.
const missingTools: string[] = [];
if (!Bun.which("bun")) missingTools.push("bun");
if (!Bun.which("git")) missingTools.push("git");
const toolsHint =
  missingTools.length > 0
    ? ` • ⚠️ Missing in PATH: ${missingTools.join(", ")}`
    : "";

const message = `Session started • Branch: \`${branch}\` • Dirty files: ${dirty}${overlayHint}${toolsHint}`;

// Seed the recurrent-rules cluster from turn 1 so first-draft edits comply
// before the auto-loaded skill body lands (race-condition safety net).
let rulesBlock = "";
try {
  const skillPath = join(
    cwd,
    ".claude",
    "skills",
    "applying-rules-cluster",
    "SKILL.md",
  );
  const raw = readFileSync(skillPath, "utf8");
  const stripped = raw.replace(/^---[\s\S]*?\n---\s*\n/, "");
  rulesBlock = `\n\n${stripped.trim()}`;
} catch {
  // best-effort — missing skill file degrades to status-only context
}

console.log(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: message + rulesBlock,
    },
  }),
);
