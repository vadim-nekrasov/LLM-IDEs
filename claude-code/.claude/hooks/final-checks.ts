#!/usr/bin/env bun
import type { HookInput } from "./types";
import { parseTranscript } from "./transcript";

const input: HookInput = await Bun.stdin.json();

if (input.stop_hook_active) process.exit(0);

const data = await parseTranscript(input.transcript_path, input.session_id);

if (!data.hasCodeEdits) process.exit(0);

if (data.hasCodeEdits && !data.hasApplyingWorkflow) {
  console.error(
    "Note: 'applying-workflow' skill was not invoked before code edits in this session.",
  );
}

if (!data.hasFinalCheck) {
  console.log(
    JSON.stringify({
      decision: "block",
      reason:
        "Code was edited this session but the 'final-checking' skill was not invoked. " +
        "Run `final-checking` (typecheck + lint + Three Lenses) before stopping.",
    }),
  );
  process.exit(0);
}

process.exit(0);
