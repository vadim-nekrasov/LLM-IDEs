#!/usr/bin/env bun
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import type { HookInput } from "./types";
import { parseTranscript } from "./transcript";
import { cacheDir, sanitizeSessionId } from "./utils";

const input: HookInput = await Bun.stdin.json();
const data = await parseTranscript(input.transcript_path, input.session_id);

const safeId = sanitizeSessionId(input.session_id, "session");
const path = join(cacheDir("precompact"), `${safeId}.md`);

const lines = [
  "# Pre-compact snapshot",
  `Session: ${input.session_id ?? "unknown"}`,
  `Timestamp: ${new Date().toISOString()}`,
  "",
  `## Edited files (${data.editedFiles.length})`,
  ...data.editedFiles.map((f) => `- ${f}`),
  "",
  "## Skills invoked",
  ...[...data.skills.entries()].map(([s, n]) => `- ${s} (${n}×)`),
  "",
];

try {
  writeFileSync(path, lines.join("\n"));
} catch {
  // best-effort; failure to snapshot must not block compaction
}
// PreCompact does not accept hookSpecificOutput per Anthropic hook docs.
// The snapshot is for post-mortem audit; no model-facing output needed here.
