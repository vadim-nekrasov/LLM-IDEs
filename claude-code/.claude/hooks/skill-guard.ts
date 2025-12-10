#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { HookInput } from "./types";
import { parseTranscript } from "./transcript";
import { DOCS_REQUIRED_SKILLS } from "./constants";

const input: HookInput = await Bun.stdin.json();
const skillName = input.tool_input?.skill ?? "";

// Skip skills that don't require docs-first
if (!DOCS_REQUIRED_SKILLS.has(skillName)) {
  process.exit(0);
}

const projectRoot =
  process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const data = await parseTranscript(input.transcript_path);

// Check project-level docs
const requiredDocs: string[] = [];
const readmePath = join(projectRoot, "README.md");
const rootDocsPath = join(projectRoot, "docs", "index.md");

if (existsSync(readmePath)) requiredDocs.push(readmePath);
if (existsSync(rootDocsPath)) requiredDocs.push(rootDocsPath);

// If no project docs exist, allow skill to proceed
if (requiredDocs.length === 0) {
  process.exit(0);
}

const missingDocs = requiredDocs.filter((doc) => !data.docsRead.has(doc));

if (missingDocs.length > 0) {
  console.error(
    `BLOCKED: Docs-First Discovery required before '${skillName}' skill.\n\n` +
      `Read project documentation first:\n` +
      missingDocs.map((d) => `  → ${d}`).join("\n") +
      `\n\nRequired by CLAUDE.md → Docs-First Discovery (MANDATORY).\n\n` +
      `Action: Use Read tool on the listed files, then retry the skill.`,
  );
  process.exit(2);
}

process.exit(0);
