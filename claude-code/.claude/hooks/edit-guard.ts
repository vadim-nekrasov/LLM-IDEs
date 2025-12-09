#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import type { HookInput } from "./types";
import { parseTranscript } from "./transcript";
import {
  CODE_EXTENSIONS,
  EXTENSION_TO_SKILLS,
  SKILL_NAMES,
  isReactHookFile,
} from "./constants";

const isCodeFile = (filePath: string): boolean => {
  const ext = filePath.slice(filePath.lastIndexOf("."));
  return CODE_EXTENSIONS.has(ext);
};

const findExistingDocs = (startDir: string, projectRoot: string): string[] => {
  const docs: string[] = [];
  let current = startDir;

  while (current.startsWith(projectRoot) || current === projectRoot) {
    const indexPath = join(current, "docs", "index.md");
    if (existsSync(indexPath)) {
      docs.push(indexPath);
    }
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }

  return docs;
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
const projectRoot =
  process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
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
const requiredSkillKeys = [...(EXTENSION_TO_SKILLS[ext] ?? [])];

// Add react skill for hook files (.ts/.js with use* name or in hooks/)
if (!requiredSkillKeys.includes("react") && isReactHookFile(filePath)) {
  requiredSkillKeys.push("react");
}

const missingSkills: string[] = [];

for (const key of requiredSkillKeys) {
  if (!data.requiredSkillsUsed[key]) {
    missingSkills.push(SKILL_NAMES.languages[key]);
  }
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

// Check 4: docs/index.md must be read if it exists
const fileDir = dirname(filePath);
const requiredDocs = findExistingDocs(fileDir, projectRoot);
const missingDocs = requiredDocs.filter((doc) => !data.docsRead.has(doc));

if (missingDocs.length > 0) {
  console.error(
    "BLOCKED: Docs-First Discovery not completed.\n\n" +
      "You must read these docs before editing code:\n" +
      missingDocs.map((d) => `  → ${d}`).join("\n") +
      "\n\n" +
      "Required by CLAUDE.md → Docs-First Discovery (MANDATORY).\n\n" +
      "Action: Use Read tool on the listed docs/index.md files.",
  );
  process.exit(2);
}

// All checks passed
process.exit(0);
