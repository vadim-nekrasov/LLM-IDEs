#!/usr/bin/env bun
import type { HookInput } from "./types";
import { parseTranscript } from "./transcript";
import { analyzeDocUpdateNeed } from "./doc-analyzer";
import { isDocFile } from "./utils";

const input: HookInput = await Bun.stdin.json();
const data = await parseTranscript(input.transcript_path, input.session_id);

const docsFiltered = [...data.docsRead].filter(isDocFile);

const SEPARATOR = "━".repeat(42);
const hasOutput =
  docsFiltered.length > 0 ||
  data.editedFiles.length > 0 ||
  data.skills.size > 0;

if (!hasOutput) process.exit(0);

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
};

console.log("\n" + C.dim + SEPARATOR + C.reset);

if (docsFiltered.length > 0) {
  console.log(`${C.bold}📚 Docs read:${C.reset}`);
  for (const doc of docsFiltered) console.log(`   • ${doc}`);
  console.log();
}

if (data.editedFiles.length > 0) {
  const analysis = analyzeDocUpdateNeed(data.editedFiles);
  console.log(
    `${C.bold}📝 Docs update:${C.reset} ` +
      (analysis.needed ? `${C.yellow}Yes${C.reset}` : `${C.green}No${C.reset}`),
  );
  if (analysis.needed) {
    for (const reason of analysis.reasons) console.log(`   → ${reason}`);
  }
  console.log();
}

if (data.skills.size > 0) {
  const sorted = [...data.skills.entries()].sort((a, b) => b[1] - a[1]);
  console.log(`${C.bold}${C.cyan}🛠  Custom skills invoked:${C.reset}`);
  for (const [skill, count] of sorted) {
    console.log(
      `   ${C.cyan}• ${skill}${C.reset} ${C.dim}(${count}×)${C.reset}`,
    );
  }
} else if (data.editedFiles.length > 0) {
  console.log(
    `${C.bold}${C.yellow}🛠  No custom skills invoked this session.${C.reset}`,
  );
}

console.log(C.dim + SEPARATOR + C.reset);
