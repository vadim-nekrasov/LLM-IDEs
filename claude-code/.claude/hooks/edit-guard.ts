#!/usr/bin/env bun
import type { HookInput } from "./types";
import { parseTranscript } from "./transcript";

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
  ".lua",
]);

const TS_EXTENSIONS = new Set([".ts", ".tsx"]);
const REACT_EXTENSIONS = new Set([".tsx", ".jsx"]);
const JS_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]);
const LUA_EXTENSIONS = new Set([".lua"]);

const isCodeFile = (filePath: string): boolean => {
  const ext = filePath.slice(filePath.lastIndexOf("."));
  return CODE_EXTENSIONS.has(ext);
};

const input: HookInput = await Bun.stdin.json();
const filePath = input.tool_input?.file_path ?? "";

// Check 1: Block node_modules
if (filePath.includes("node_modules")) {
  console.error(
    "BLOCKED: Cannot edit files in node_modules/\n" +
      "This is a protected directory.",
  );
  process.exit(2);
}

// Skip .claude/ directory (hooks config files)
if (filePath.includes("/.claude/")) {
  process.exit(0);
}

// Skip non-code files (allow editing configs, docs, etc.)
if (!isCodeFile(filePath)) {
  process.exit(0);
}

const ext = filePath.slice(filePath.lastIndexOf("."));
const data = await parseTranscript(input.transcript_path);

// Check 2: applying-workflow skill must be invoked before editing code
if (!data.hasApplyingWorkflow) {
  console.error(
    "BLOCKED: You must invoke 'applying-workflow' skill before editing code files.\n\n" +
      "Required by CLAUDE.md → CRITICAL: Skill Invocation.\n\n" +
      "Action: Use Skill tool with skill='applying-workflow'",
  );
  process.exit(2);
}

// Check 3: Required skills by file extension
const missingSkills: string[] = [];

if (JS_EXTENSIONS.has(ext) && !data.requiredSkillsUsed.ecmascript) {
  missingSkills.push("writing-ecmascript");
}
if (TS_EXTENSIONS.has(ext) && !data.requiredSkillsUsed.typescript) {
  missingSkills.push("writing-typescript");
}
if (REACT_EXTENSIONS.has(ext) && !data.requiredSkillsUsed.react) {
  missingSkills.push("writing-react");
}
if (LUA_EXTENSIONS.has(ext) && !data.requiredSkillsUsed.lua) {
  missingSkills.push("writing-lua");
}

if (missingSkills.length > 0) {
  console.error(
    "BLOCKED: Missing required skills for this file type.\n\n" +
      "Required skills: " +
      missingSkills.join(", ") +
      "\n\n" +
      "Required by CLAUDE.md → CRITICAL: Skill Invocation.\n\n" +
      "Action: Invoke these skills before editing",
  );
  process.exit(2);
}

// All checks passed
process.exit(0);
