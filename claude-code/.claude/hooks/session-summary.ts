#!/usr/bin/env bun
import type { HookInput } from "./types";
import { parseTranscript } from "./transcript";
import { analyzeDocUpdateNeed } from "./doc-analyzer";
import { isDocFile } from "./utils";

const input: HookInput = await Bun.stdin.json();
const data = await parseTranscript(input.transcript_path);

// Filter docs at output time, NOT store separately (DRY!)
const docsFiltered = [...data.docsRead].filter(isDocFile);

const SEPARATOR = "━".repeat(42);
const hasOutput =
  docsFiltered.length > 0 ||
  data.editedFiles.length > 0 ||
  data.skills.size > 0;

if (!hasOutput) process.exit(0);

console.log("\n" + SEPARATOR);

// Section 1: Docs Read
if (docsFiltered.length > 0) {
  console.log("📚 Docs read:");
  for (const doc of docsFiltered) {
    console.log(`   • ${doc}`);
  }
  console.log();
}

// Section 2: Docs Update Analysis
if (data.editedFiles.length > 0) {
  const analysis = analyzeDocUpdateNeed(data.editedFiles);
  console.log(`📝 Docs update: ${analysis.needed ? "Yes" : "No"}`);
  if (analysis.needed) {
    for (const reason of analysis.reasons) {
      console.log(`   → ${reason}`);
    }
  }
  console.log();
}

// Section 3: Skills
if (data.skills.size > 0) {
  const sorted = [...data.skills.entries()].sort((a, b) => b[1] - a[1]);
  console.log("📊 Skills used:");
  for (const [skill, count] of sorted) {
    console.log(`   • ${skill} (${count})`);
  }
} else {
  console.log("📊 No skills used");
}

console.log(SEPARATOR);
