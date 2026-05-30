#!/usr/bin/env bun
import type { HookInput } from "./types";
import { parseTranscript } from "./transcript";
import { SKILL_NAMES } from "./constants";

const input: HookInput = await Bun.stdin.json();

if (input.stop_hook_active) process.exit(0);

let data = await parseTranscript(input.transcript_path, input.session_id);

// Early-out: nothing to enforce.
if (!data.hasCodeEdits && !data.hasDocEdits) process.exit(0);

if (data.hasCodeEdits && !data.skills.has(SKILL_NAMES.workflow)) {
  console.error(
    "Note: 'applying-workflow' skill was not invoked before code edits in this session.",
  );
}

// JSONL flush race: the Skill call may be the last transcript entry, not yet
// flushed when this hook fires. Two retries (200/500 ms) cover SSDs and slower
// network filesystems without stalling exit perceptibly. Re-evaluate both gates
// after each retry so a late Skill(writing-docs) or Skill(final-checking) lands.
const needsFinal = (): boolean =>
  data.hasCodeEdits && !data.skills.has(SKILL_NAMES.final);
const needsDocs = (): boolean =>
  data.hasDocEdits && !data.skills.has(SKILL_NAMES.docs);

for (const delay of [200, 500]) {
  if (!needsFinal() && !needsDocs()) break;
  await Bun.sleep(delay);
  data = await parseTranscript(input.transcript_path, input.session_id);
}

const reasons: string[] = [];
if (needsFinal()) {
  reasons.push(
    "Code was edited this session but the 'final-checking' skill was not invoked. " +
      "Run `final-checking` (typecheck + lint + Three Lenses) before stopping.",
  );
}
if (needsDocs()) {
  reasons.push(
    "Markdown documentation was edited this session but the 'writing-docs' skill was not invoked. " +
      "Run `writing-docs` (rubric: budget, include/exclude, code-vs-doc authority) before stopping.",
  );
}

if (reasons.length > 0) {
  console.log(
    JSON.stringify({ decision: "block", reason: reasons.join("\n\n") }),
  );
}
process.exit(0);
