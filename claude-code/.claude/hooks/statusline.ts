#!/usr/bin/env bun
// Status-line provider: receives session JSON on stdin, prints a single line.
// Wired up via settings.json → statusLine.command.
// See https://code.claude.com/docs/en/settings#status-line.
import { homedir } from "node:os";

interface StatusInput {
  cwd?: string;
  workspace?: { current_dir?: string };
  model?: { display_name?: string };
  output_style?: { name?: string };
  effort?: { level?: string };
  context_window?: { used_percentage?: number | null };
  rate_limits?: {
    five_hour?: { used_percentage?: number | null };
    seven_day?: { used_percentage?: number | null };
  };
}

const input: StatusInput = await Bun.stdin
  .json()
  .catch(() => ({}) as StatusInput);

const cwd = input.cwd || input.workspace?.current_dir || process.cwd();
const model = input.model?.display_name ?? "Claude";

function homeify(p: string): string {
  const home = homedir();
  if (p === home) return "~";
  if (p.startsWith(home + "/")) return "~" + p.slice(home.length);
  return p;
}

function git(args: string[]): string {
  try {
    const r = Bun.spawnSync(["git", "-C", cwd, ...args], {
      stdout: "pipe",
      stderr: "pipe",
    });
    if (r.exitCode !== 0) return "";
    return r.stdout?.toString().trim() ?? "";
  } catch {
    return "";
  }
}

const branch = git(["branch", "--show-current"]);
const dirty = branch
  ? git(["status", "--porcelain"])
      .split("\n")
      .filter((l) => l.trim().length > 0).length
  : 0;

const line1 = [
  `🤖 ${model}`,
  `📁 ${homeify(cwd)}`,
  branch ? `⎇ ${branch}${dirty > 0 ? ` *${dirty}` : ""}` : "",
]
  .filter(Boolean)
  .join("  ");

// Round to integer; null/undefined → null (skip the segment).
function pct(v: number | null | undefined): number | null {
  return typeof v === "number" && Number.isFinite(v) ? Math.round(v) : null;
}

const effort = input.effort?.level;
const ctx = pct(input.context_window?.used_percentage);
const fiveH = pct(input.rate_limits?.five_hour?.used_percentage);
const sevenD = pct(input.rate_limits?.seven_day?.used_percentage);

const line2Parts: string[] = [];
if (effort) line2Parts.push(`🧠 ${effort}`);
if (ctx !== null) line2Parts.push(`⏷ ${ctx}%`);
if (fiveH !== null || sevenD !== null) {
  const limits: string[] = [];
  if (fiveH !== null) limits.push(`5h ${fiveH}%`);
  if (sevenD !== null) limits.push(`7d ${sevenD}%`);
  line2Parts.push(`📊 ${limits.join(" · ")}`);
}

console.log(line1);
if (line2Parts.length > 0) console.log(line2Parts.join("  "));
