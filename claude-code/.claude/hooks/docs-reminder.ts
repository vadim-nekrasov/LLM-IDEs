#!/usr/bin/env bun
import { dirname } from "node:path";
import type { HookInput } from "./types";
import { CODE_EXTENSIONS } from "./constants";
import { findDocsUp } from "./utils";

/** Check if file is a code file */
const isCodeFile = (filePath: string): boolean => {
  const ext = filePath.slice(filePath.lastIndexOf("."));
  return CODE_EXTENSIONS.has(ext);
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
