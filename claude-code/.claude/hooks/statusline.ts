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
    five_hour?: { used_percentage?: number | null; resets_at?: number | null };
    seven_day?: { used_percentage?: number | null; resets_at?: number | null };
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

// Seconds until reset (epoch seconds), or null when absent/passed.
function until(t: number | null | undefined): number | null {
  if (typeof t !== "number" || !Number.isFinite(t)) return null;
  const s = t - Math.floor(Date.now() / 1000);
  return s > 0 ? s : null;
}

// Compact countdown: coarse → "Xd Yh"/"Xh"; else "Xh Ym"/"Ym".
function dur(s: number, coarse: boolean): string {
  if (coarse) {
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    return d > 0 ? `${d}d ${h}h` : `${h}h`;
  }
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
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
  if (fiveH !== null) {
    const s = until(input.rate_limits?.five_hour?.resets_at);
    limits.push(`5h ${fiveH}%${s !== null ? ` (${dur(s, false)})` : ""}`);
  }
  if (sevenD !== null) {
    const s = until(input.rate_limits?.seven_day?.resets_at);
    limits.push(`7d ${sevenD}%${s !== null ? ` (${dur(s, true)})` : ""}`);
  }
  line2Parts.push(`📊 ${limits.join(" · ")}`);
}

console.log(line1);
if (line2Parts.length > 0) console.log(line2Parts.join("  "));
