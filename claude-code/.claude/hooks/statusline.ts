#!/usr/bin/env bun
// Status-line provider: receives session JSON on stdin, prints a single line.
// Wired up via settings.json → statusLine.command.
// See https://code.claude.com/docs/en/settings#status-line.
export {};

interface StatusInput {
  cwd?: string;
  workspace?: { current_dir?: string };
  model?: { display_name?: string };
  output_style?: { name?: string };
}

const input: StatusInput = await Bun.stdin
  .json()
  .catch(() => ({}) as StatusInput);

const cwd = input.cwd || input.workspace?.current_dir || process.cwd();
const model = input.model?.display_name ?? "Claude";

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

const parts = [
  `🤖 ${model}`,
  branch ? `⎇ ${branch}${dirty > 0 ? ` *${dirty}` : ""}` : "",
].filter(Boolean);

console.log(parts.join("  "));
