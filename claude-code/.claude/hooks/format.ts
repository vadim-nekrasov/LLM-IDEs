#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { dirname, join, parse } from "node:path";
import type { HookInput } from "./types";
import { FORMATTABLE_EXTENSIONS } from "./constants";
import { getExt } from "./utils";

function findRoot(filePath: string, marker: string): string | null {
  let dir = dirname(filePath);
  const { root } = parse(filePath);
  while (dir !== root) {
    if (existsSync(join(dir, marker))) return dir;
    dir = dirname(dir);
  }
  return null;
}

const input: HookInput = await Bun.stdin.json();
const filePath = input.tool_input?.file_path;
if (!filePath || !existsSync(filePath)) process.exit(0);

const ext = getExt(filePath);

// Defence-in-depth: even though settings.json caps this hook at 30 s, we add
// our own per-process timeout so a wedged formatter cannot consume the whole
// budget and starve siblings.
const FORMAT_TIMEOUT_MS = 20_000;

// Bun.spawnSync does not throw on non-zero exit codes (including SIGKILL from
// `timeout`), so a silent failure looks identical to success unless we inspect
// exitCode. Surface failures behind CLAUDE_HOOKS_DEBUG so the channel is
// available without polluting normal sessions.
const debug = !!process.env.CLAUDE_HOOKS_DEBUG;
function reportFailure(label: string, exitCode: number | null): void {
  if (debug && exitCode !== 0) {
    console.error(`[format] ${label} exited with code ${exitCode}`);
  }
}

if (FORMATTABLE_EXTENSIONS.has(ext) && ext !== ".rs") {
  const npmRoot = findRoot(filePath, "package.json");
  if (npmRoot) {
    const prettierBin = join(npmRoot, "node_modules", ".bin", "prettier");
    // Direct binary skips the bunx resolution overhead (~200-500 ms on cold start).
    const cmd = existsSync(prettierBin)
      ? [prettierBin, "--write", filePath]
      : ["bunx", "prettier", "--write", filePath];
    try {
      const r = Bun.spawnSync(cmd, {
        cwd: npmRoot,
        stdout: "ignore",
        stderr: "ignore",
        timeout: FORMAT_TIMEOUT_MS,
      });
      reportFailure("prettier", r.exitCode);
    } catch {
      // best-effort
    }
  }
}

if (ext === ".rs") {
  const cargoRoot = findRoot(filePath, "Cargo.toml");
  if (cargoRoot) {
    try {
      // cargo fmt formats the whole package using the edition declared in Cargo.toml.
      const r = Bun.spawnSync(["cargo", "fmt"], {
        cwd: cargoRoot,
        stdout: "ignore",
        stderr: "ignore",
        timeout: FORMAT_TIMEOUT_MS,
      });
      reportFailure("cargo fmt", r.exitCode);
    } catch {
      // best-effort
    }
  }
}
