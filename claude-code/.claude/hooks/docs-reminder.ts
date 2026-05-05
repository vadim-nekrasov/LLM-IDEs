#!/usr/bin/env bun
import { dirname } from "node:path";
import type { HookInput } from "./types";
import { CODE_EXTENSIONS } from "./constants";
import { parseTranscript } from "./transcript";
import { findDocsUp, getExt } from "./utils";

const input: HookInput = await Bun.stdin.json();
const filePath = input.tool_input?.file_path;
if (!filePath || !CODE_EXTENSIONS.has(getExt(filePath))) process.exit(0);

const projectRoot =
  process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const docFiles = findDocsUp(dirname(filePath), projectRoot);
if (docFiles.length === 0) process.exit(0);

// Filter to docs the model has not Read yet — avoids re-emitting the same
// reminder on every Read in this directory chain.
const data = await parseTranscript(input.transcript_path, input.session_id);
const missing = docFiles.filter((d) => !data.docsRead.has(d));
if (missing.length === 0) process.exit(0);

const message = [
  "📚 Docs-First reminder — read before editing this area:",
  ...missing.map((f) => `  → ${f}`),
].join("\n");
console.log(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      additionalContext: message,
    },
  }),
);
