#!/usr/bin/env bun
import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { HookInput } from "./types";
import { cacheDir, sanitizeSessionId } from "./utils";

const input: HookInput = await Bun.stdin.json().catch(() => ({}) as HookInput);
const cwd = input.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();

// Slash-invocation advisory: detect `/<skill-name>` at prompt start and confirm
// the SKILL.md exists on disk. Without this, a session-start available-skills
// listing that drops (or never shows) the skill can cause Claude to misread its
// own "invoke if in list OR user typed /<name>" rule and refuse the skill. The
// advisory leaves no ambiguity: it quotes the resolved path and the exact Skill
// tool call signature. Plugin-namespaced slashes (`/plugin:cmd`) are skipped —
// those resolve via plugin manifests, not the shared skills directory.
function slashAdvisory(): string | null {
  const prompt = input.prompt;
  if (!prompt) return null;
  const m = prompt.match(/^\s*\/([a-z][a-z0-9-]*)(?!:)/);
  if (!m) return null;
  const name = m[1];
  let skillsDir: string;
  try {
    skillsDir = realpathSync(join(cwd, ".claude", "skills"));
  } catch {
    return null;
  }
  const skillPath = join(skillsDir, name, "SKILL.md");
  if (!existsSync(skillPath)) return null;
  return `Slash-invocation detected: '/${name}' → ${skillPath} exists. Action: invoke the Skill tool with skill="${name}" immediately; this resolves from the filesystem regardless of the session-start available-skills listing.`;
}

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

const slash = slashAdvisory();
const message = `Git: \`${branch}\`${aheadBehind} • Dirty files: ${dirty}${slash ? "\n" + slash : ""}`;

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
