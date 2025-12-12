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

function findCargoRoot(filePath: string): string | null {
  let dir = dirname(filePath);
  const { root } = parse(filePath);

  while (dir !== root) {
    if (existsSync(join(dir, "Cargo.toml"))) return dir;
    dir = dirname(dir);
  }
  return null;
}

const input: HookInput = await Bun.stdin.json();
const data = await parseTranscript(input.transcript_path);

if (data.editedFiles.length > 0) {
  // Separate files by type
  const jsFiles = data.editedFiles.filter((f) => !f.endsWith(".rs"));
  const rustFiles = data.editedFiles.filter((f) => f.endsWith(".rs"));

  // Format JS/TS files with prettier
  if (jsFiles.length > 0) {
    const byRoot = new Map<string, string[]>();

    for (const file of jsFiles) {
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

  // Format Rust files with cargo fmt
  if (rustFiles.length > 0) {
    const byCargoRoot = new Map<string, string[]>();

    for (const file of rustFiles) {
      const root = findCargoRoot(file);
      if (root) {
        const list = byCargoRoot.get(root) ?? [];
        list.push(file);
        byCargoRoot.set(root, list);
      }
    }

    for (const [root] of byCargoRoot) {
      try {
        Bun.spawnSync(["cargo", "fmt"], {
          cwd: root,
          stdout: "ignore",
          stderr: "ignore",
        });
      } catch {
        // cargo fmt not available or failed - not critical
      }
    }
  }
}
