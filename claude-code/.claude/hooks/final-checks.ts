#!/usr/bin/env bun
import type { HookInput } from "./types";
import { parseTranscript } from "./transcript";

const input: HookInput = await Bun.stdin.json();
const data = await parseTranscript(input.transcript_path);

if (data.hasCodeEdits) {
  if (!data.hasApplyingWorkflow) {
    console.error(
      "WARNING: 'applying-workflow' skill was not used before code edits.\n" +
        "This violates CLAUDE.md → CRITICAL: Skill Invocation.",
    );
  }

  if (!data.hasFinalCheck) {
    console.error(
      "The final-checking skill has not been run after code edits in this session. " +
        "Run final-checking skill before stopping.",
    );
    process.exit(2);
  }
}
