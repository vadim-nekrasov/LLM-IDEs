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

function collectEditTexts(input: HookInput): string[] {
  const inp = input.tool_input ?? {};
  const out: string[] = [];
  if (typeof inp.new_string === "string") out.push(inp.new_string);
  if (typeof inp.content === "string") out.push(inp.content);
  if (Array.isArray(inp.edits)) {
    for (const e of inp.edits as Array<{ new_string?: unknown }>) {
      if (typeof e?.new_string === "string") out.push(e.new_string);
    }
  }
  return out;
}

function detectLineRun(
  lines: string[],
  start: number,
  lineRe: RegExp,
  skipFirst?: (i: number, line: string) => boolean,
): number {
  let j = start;
  while (
    j < lines.length &&
    lineRe.test(lines[j] ?? "") &&
    !(skipFirst?.(j, lines[j] ?? "") ?? false)
  )
    j++;
  return j;
}

function detectLongCommentBlock(
  text: string,
  ext: string,
): { hit: false } | { hit: true; reason: string } {
  const lines = text.split("\n");
  const isPython = ext === ".py";
  const shebangSkip = (i: number, line: string) =>
    i === 0 && line.startsWith("#!");

  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";

    if (/^\s*\/\//.test(line)) {
      const j = detectLineRun(lines, i, /^\s*\/\//);
      const run = j - i;
      if (run > 2) return { hit: true, reason: `// run of ${run} lines` };
      i = j;
      continue;
    }

    if (/^\s*\/\*/.test(line)) {
      let k = i;
      while (k < lines.length && !(lines[k] ?? "").includes("*/")) k++;
      const span = k < lines.length ? k - i + 1 : lines.length - i;
      if (span > 2)
        return { hit: true, reason: `/* */ block spanning ${span} lines` };
      i = k + 1;
      continue;
    }

    if (isPython && /^\s*#/.test(line) && !shebangSkip(i, line)) {
      const j = detectLineRun(lines, i, /^\s*#/, shebangSkip);
      const run = j - i;
      if (run > 2) return { hit: true, reason: `# run of ${run} lines` };
      i = j;
      continue;
    }

    i++;
  }
  return { hit: false };
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

// Object-literal 2nd-arg-of-console — HARD BLOCK (see .claude/skills/debugging/patterns/logging.md).
// `[^)]*?` stays inside a single call while tolerating newlines/whitespace in the arg list.
const CONSOLE_OBJ_LITERAL_RE =
  /console\.(?:log|warn|error)\s*\(\s*[^)]*?,\s*\{/;

// Raw-object 2nd-arg-of-console anti-pattern (see .claude/skills/debugging/patterns/logging.md).
// Skips JSON.stringify(...)/String/Number/Boolean wrappers, string/template/numeric/boolean/null literals.
const CONSOLE_RAW_OBJ_RE =
  /console\.(?:log|warn|error)\s*\(\s*[^,)\n]*,\s*(?!(?:JSON\.stringify|String|Number|Boolean)\b|['"`]|-?\d|(?:true|false|null|undefined)\b)[A-Za-z_$][\w$]*(?:\s*\.\s*[A-Za-z_$][\w$]*)*/;

if (isCode && EXTENSION_TO_SKILLS[ext]?.includes("ecmascript")) {
  if (collectEditTexts(input).some((s) => CONSOLE_OBJ_LITERAL_RE.test(s))) {
    deny(
      `\`console.(log|warn|error)\` with an object literal as 2nd arg truncates in DevTools when copied. ` +
        `Wrap with \`JSON.stringify(obj, null, 2)\` — see \`.claude/skills/debugging/patterns/logging.md\`.`,
    );
  }
  if (collectEditTexts(input).some((s) => CONSOLE_RAW_OBJ_RE.test(s))) {
    advisories.push(
      `Edit adds \`console.log/warn/error\` with a raw object as 2nd arg. ` +
        `Wrap with \`JSON.stringify(obj, null, 2)\` — see \`.claude/skills/debugging/patterns/logging.md\`.`,
    );
  }
}

if (isCode) {
  for (const text of collectEditTexts(input)) {
    const result = detectLongCommentBlock(text, ext);
    if (result.hit) {
      deny(
        `Comment block ≤ 2 lines — see applying-rules-cluster skill. Detected ${result.reason}. Split into code-level clarity (named identifiers / extracted helpers / single-line trailing note).`,
      );
    }
  }
}

if (isDoc && !data.skills.has(SKILL_NAMES.docs)) {
  deny(
    "📚 Doc edit blocked: invoke the `writing-docs` skill via the Skill tool first. Applies to docs/**/*.md and README*.md.",
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
