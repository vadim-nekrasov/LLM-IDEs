#!/usr/bin/env bun
import { existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import type { HookInput } from "./types";

const CODE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".py",
  ".go",
  ".rs",
  ".java",
  ".kt",
  ".swift",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
  ".cs",
]);

/** Check if file is a code file */
const isCodeFile = (filePath: string): boolean => {
  const ext = filePath.slice(filePath.lastIndexOf("."));
  return CODE_EXTENSIONS.has(ext);
};

/** Find all docs/index.md files from startDir up to projectRoot */
const findDocsUp = (startDir: string, projectRoot: string): string[] => {
  const docs: string[] = [];
  let current = startDir;

  while (current.startsWith(projectRoot) || current === projectRoot) {
    const indexPath = join(current, "docs", "index.md");

    if (existsSync(indexPath) && statSync(indexPath).isFile()) {
      docs.push(indexPath);
    }

    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }

  return docs;
};

const input: HookInput = await Bun.stdin.json();
const filePath = input.tool_input?.file_path;

// Skip if no file path or not a code file
if (!filePath || !isCodeFile(filePath)) {
  process.exit(0);
}

const projectRoot =
  process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const fileDir = dirname(filePath);

const docFiles = findDocsUp(fileDir, projectRoot);

if (docFiles.length > 0) {
  const message = [
    "📚 **Docs-First Reminder**:",
    `Before working with code in this area, ensure you've read:`,
    ...docFiles.map((f) => `  → ${f}`),
  ].join("\n");

  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        additionalContext: message,
      },
    }),
  );
}
