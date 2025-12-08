#!/usr/bin/env bun
import type { HookInput } from './types';
import { parseTranscript } from './types';

const input: HookInput = await Bun.stdin.json();
const data = await parseTranscript(input.transcript_path);

if (data.editedFiles.length > 0 && !data.hasFinalCheck) {
  console.error(
    'The final-check skill has not been run after code edits in this session. ' +
      'Run final-check skill before stopping.'
  );
  process.exit(2);
}
