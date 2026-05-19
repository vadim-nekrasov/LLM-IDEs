#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { dirname, join, parse } from "node:path";
import type { HookInput } from "./types";
import { getExt } from "./utils";
import { parseTranscript } from "./transcript";

// Stop-time judge for the Linter Warnings Policy (final-checking SKILL.md):
// every file edited this session must end with 0 linter warnings attributable
// to it. This hook ONLY judges — it never mutates files (no autofix) — keeping
// a single responsibility; remediation is the assistant's job, in code.

const input: HookInput = await Bun.stdin.json().catch(() => ({}) as HookInput);

// Anti-loop: a blocking Stop hook must let the *next* Stop through (like
// final-checks.ts) so the session can always terminate.
if (input.stop_hook_active) process.exit(0);

const LINT_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);
// Defence-in-depth strictly below the settings.json cap. Type-aware eslint
// builds the TS program once per process — budget generously, fail safe.
const LINT_TIMEOUT_MS = 25_000;

// House observability pattern (mirrors format.ts): silent in normal sessions,
// diagnosable on demand. stderr ⇒ never a Stop `decision` ⇒ cannot false-block.
const debug = !!process.env.CLAUDE_HOOKS_DEBUG;
function reportUnverified(root: string, exitCode: number | null): void {
  if (debug) {
    console.error(
      `[lint-touched] could not verify ${root} (eslint exit ${exitCode})`,
    );
  }
}

function findRoot(filePath: string, marker: string): string | null {
  let dir = dirname(filePath);
  const { root } = parse(filePath);
  while (dir !== root) {
    if (existsSync(join(dir, marker))) return dir;
    dir = dirname(dir);
  }
  return null;
}

interface EslintMessage {
  ruleId: string | null;
  severity: number;
  fatal?: boolean;
  line?: number;
  column?: number;
  fix?: unknown;
}
interface EslintResult {
  filePath: string;
  messages: EslintMessage[];
}

// Touched set = exactly what final-checks.ts already computes this same Stop
// (parseTranscript is incrementally cached → reused, not recomputed). The
// session .jsonl is append-only; if a compaction ever truncates it, edits
// before the truncation may be missed — an accepted thin edge.
const { editedFiles } = await parseTranscript(
  input.transcript_path,
  input.session_id,
);
const touched = editedFiles.filter(
  (f) => LINT_EXTENSIONS.has(getExt(f)) && existsSync(f),
);

// Nothing JS/TS touched (docs/config/other stacks): clean no-op (C1 — the
// shared hook never blocks a Rust/Lua/Python/docs-only session).
if (touched.length === 0) process.exit(0);

// Group by nearest package.json (monorepos: e.g. NexCity's inner React/src).
const byRoot = new Map<string, string[]>();
for (const f of touched) {
  const root = findRoot(f, "package.json");
  if (!root) continue;
  const arr = byRoot.get(root);
  if (arr) arr.push(f);
  else byRoot.set(root, [f]);
}

const failing: { file: string; messages: EslintMessage[] }[] = [];

for (const [root, files] of byRoot) {
  // The project's own pinned eslint binary on exactly the touched files —
  // same direct node_modules/.bin precedent as format.ts (no npx/bunx, no
  // whole-repo glob). Honors the project's eslint.config as-is (C3). Absent
  // binary ⇒ this project doesn't lint ⇒ clean no-op (C1).
  const eslintBin = join(root, "node_modules", ".bin", "eslint");
  if (!existsSync(eslintBin)) continue;

  let stdout: string;
  let exitCode: number | null;
  try {
    const r = Bun.spawnSync([eslintBin, ...files, "--format", "json"], {
      cwd: root,
      stdout: "pipe",
      stderr: "ignore",
      timeout: LINT_TIMEOUT_MS,
    });
    stdout = r.stdout?.toString() ?? "";
    exitCode = r.exitCode;
  } catch {
    reportUnverified(root, null);
    continue; // spawn failed → could-not-verify; never false-block
  }

  let results: EslintResult[];
  try {
    const parsed: unknown = JSON.parse(stdout);
    if (!Array.isArray(parsed)) throw new Error("not an array");
    results = parsed as EslintResult[];
  } catch {
    // No parseable JSON ⇒ eslint could not lint (broken config, crash,
    // timeout-SIGKILL). This previously passed SILENTLY — the real defect.
    // Stay non-blocking (fail-safe, never false-block) but make it visible.
    reportUnverified(root, exitCode);
    continue;
  }

  for (const res of results) {
    // Fail on any real rule firing OR a fatal/parse error: a touched file
    // that does not even parse MUST fail (fatal messages carry ruleId null
    // and were previously dropped). Exclude only eslint's benign ruleId-null
    // "File ignored …" notice (severity 1, not fatal).
    const real = res.messages.filter(
      (m) => m.ruleId !== null || m.fatal === true || m.severity === 2,
    );
    if (real.length > 0) failing.push({ file: res.filePath, messages: real });
  }
}

if (failing.length === 0) process.exit(0);

const lines: string[] = [
  `Linter Warnings Policy — ${failing.length} file(s) you modified this session still carry linter warnings.`,
  `Fix every one IN CODE (never by editing lint config); re-stop and this gate re-checks.`,
  ``,
];
for (const { file, messages } of failing) {
  lines.push(file);
  for (const m of messages.slice(0, 20)) {
    const loc = `${m.line ?? "?"}:${m.column ?? "?"}`;
    const fixable = m.fix ? "  [auto-fixable]" : "";
    lines.push(`  ${loc}  ${m.ruleId ?? "parse-error"}${fixable}`);
  }
  if (messages.length > 20) lines.push(`  …and ${messages.length - 20} more`);
}
lines.push(``);
lines.push(
  `If a warning is a genuine false positive, would require a lint-config change, or is pre-existing in a file you were explicitly told not to modify: state that explicitly in your reply, then stop — the next stop is allowed through.`,
);

console.log(JSON.stringify({ decision: "block", reason: lines.join("\n") }));
process.exit(0);
