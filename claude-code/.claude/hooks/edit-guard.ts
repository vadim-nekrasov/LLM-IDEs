#!/usr/bin/env bun
import { dirname } from "node:path";
import type { HookInput } from "./types";
import { parseTranscript } from "./transcript";
import {
  CODE_EXTENSIONS,
  EXTENSION_TO_SKILLS,
  SKILL_NAMES,
  isReactHookFile,
} from "./constants";
import {
  findDocsUp,
  getExt,
  isNodeModulesPath,
  isProjectDocFile,
  isTargetPath,
} from "./utils";

const input: HookInput = await Bun.stdin.json();
const filePath = input.tool_input?.file_path ?? "";

function deny(reason: string): never {
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    }),
  );
  process.exit(0);
}

if (isNodeModulesPath(filePath)) {
  deny("Cannot edit files in node_modules/.");
}
if (isTargetPath(filePath)) {
  deny("Cannot edit files in target/ (Rust build dir).");
}

if (input.permission_mode === "plan") process.exit(0);
if (filePath.includes("/.claude/")) process.exit(0);

const ext = getExt(filePath);
const isCode = CODE_EXTENSIONS.has(ext);
const isDoc = isProjectDocFile(filePath);
if (!isCode && !isDoc) process.exit(0);

const projectRoot =
  process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const data = await parseTranscript(input.transcript_path, input.session_id);

const advisories: string[] = [];

if (isCode && !data.skills.has(SKILL_NAMES.workflow)) {
  advisories.push(
    `Consider invoking the \`applying-workflow\` skill — it loads docs-first discovery, Three Lenses, and Context7 verification patterns relevant to this edit.`,
  );
}

if (isCode) {
  const requiredSkillKeys = [...(EXTENSION_TO_SKILLS[ext] ?? [])];
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
    advisories.push(
      `Recommended language skills for \`${ext}\` files (load patterns into context): ${missingSkills.join(", ")}.`,
    );
  }
}

// Raw-object 2nd-arg-of-console anti-pattern (see .claude/skills/debugging/patterns/logging.md).
// Skips JSON.stringify(...)/String/Number/Boolean wrappers, string/template/numeric/boolean/null literals.
const CONSOLE_RAW_OBJ_RE =
  /console\.(?:log|warn|error)\s*\(\s*[^,)\n]*,\s*(?!(?:JSON\.stringify|String|Number|Boolean)\b|['"`]|-?\d|(?:true|false|null|undefined)\b)[A-Za-z_$][\w$]*(?:\s*\.\s*[A-Za-z_$][\w$]*)*/;

if (isCode && EXTENSION_TO_SKILLS[ext]?.includes("ecmascript")) {
  const inp = input.tool_input ?? {};
  const sources: unknown[] = [inp.new_string, inp.content];
  if (Array.isArray(inp.edits)) {
    for (const e of inp.edits as Array<{ new_string?: unknown }>)
      sources.push(e?.new_string);
  }
  if (
    sources.some((s) => typeof s === "string" && CONSOLE_RAW_OBJ_RE.test(s))
  ) {
    advisories.push(
      `Edit adds \`console.log/warn/error\` with a raw object as 2nd arg. ` +
        `Wrap with \`JSON.stringify(obj, null, 2)\` — see \`.claude/skills/debugging/patterns/logging.md\`.`,
    );
  }
}

if (isDoc && !data.skills.has(SKILL_NAMES.docs)) {
  advisories.push(
    `Call the \`writing-docs\` skill before continuing — it loads the markdown-doc principles rubric and is required by the Stop-gate.`,
  );
}

const fileDir = dirname(filePath);
const requiredDocs = findDocsUp(fileDir, projectRoot);
const missingDocs = requiredDocs.filter((doc) => !data.docsRead.has(doc));
if (missingDocs.length > 0) {
  advisories.push(
    `Read these doc indexes before editing (Docs-First):\n  ${missingDocs.join("\n  ")}`,
  );
}

if (advisories.length > 0) {
  const message = `📚 Edit advisories for \`${filePath}\`:\n\n${advisories.join("\n\n")}`;
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        additionalContext: message,
      },
    }),
  );
}

process.exit(0);
