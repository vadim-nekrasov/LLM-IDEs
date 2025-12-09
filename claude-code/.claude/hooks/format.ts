#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { dirname, join, parse } from "node:path";
import type { HookInput } from "./types";
import { parseTranscript } from "./transcript";

function findProjectRoot(filePath: string): string | null {
  let dir = dirname(filePath);
  const { root } = parse(filePath);

  while (dir !== root) {
    if (existsSync(join(dir, "package.json"))) return dir;
    dir = dirname(dir);
  }
  return null;
}

const input: HookInput = await Bun.stdin.json();
const data = await parseTranscript(input.transcript_path);

if (data.editedFiles.length > 0) {
  const byRoot = new Map<string, string[]>();

  for (const file of data.editedFiles) {
    const root = findProjectRoot(file);
    if (root) {
      const list = byRoot.get(root) ?? [];
      list.push(file);
      byRoot.set(root, list);
    }
  }

  for (const [root, files] of byRoot) {
    try {
      Bun.spawnSync(["npx", "prettier", "--write", ...files], {
        cwd: root,
        stdout: "ignore",
        stderr: "ignore",
      });
    } catch {
      // prettier not available or failed - not critical
    }
  }
}
