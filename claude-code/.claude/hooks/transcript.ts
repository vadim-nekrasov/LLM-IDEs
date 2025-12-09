import { existsSync } from "node:fs";
import type { TranscriptEntry, TranscriptData } from "./types";

const FORMATTABLE = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".css",
  ".scss",
]);

/** Parse transcript and extract all relevant data in one pass */
export async function parseTranscript(
  path: string | undefined,
): Promise<TranscriptData> {
  const result: TranscriptData = {
    editedFiles: [],
    skills: new Map(),
    hasFinalCheck: false,
    hasApplyingWorkflow: false,
    requiredSkillsUsed: {
      ecmascript: false,
      typescript: false,
      react: false,
      lua: false,
    },
  };

  if (!path || !existsSync(path)) return result;

  try {
    const content = await Bun.file(path).text();
    const seenFiles = new Set<string>();

    for (const line of content.split("\n")) {
      if (!line.trim()) continue;
      try {
        const entry: TranscriptEntry = JSON.parse(line);
        for (const item of entry.message?.content ?? []) {
          if (item.type !== "tool_use") continue;

          if (item.name === "Edit" || item.name === "Write") {
            const filePath = item.input?.file_path;
            if (filePath && !seenFiles.has(filePath)) {
              const ext = filePath.slice(filePath.lastIndexOf("."));
              if (FORMATTABLE.has(ext) && existsSync(filePath)) {
                result.editedFiles.push(filePath);
                seenFiles.add(filePath);
              }
            }
          }

          if (item.name === "Skill") {
            const skill = item.input?.skill;
            if (skill) {
              result.skills.set(skill, (result.skills.get(skill) ?? 0) + 1);
              if (skill.includes("final-checking")) {
                result.hasFinalCheck = true;
              }
              if (skill.includes("applying-workflow")) {
                result.hasApplyingWorkflow = true;
              }
              if (skill.includes("writing-ecmascript")) {
                result.requiredSkillsUsed.ecmascript = true;
              }
              if (skill.includes("writing-typescript")) {
                result.requiredSkillsUsed.typescript = true;
              }
              if (skill.includes("writing-react")) {
                result.requiredSkillsUsed.react = true;
              }
              if (skill.includes("writing-lua")) {
                result.requiredSkillsUsed.lua = true;
              }
            }
          }
        }
      } catch {
        continue;
      }
    }
  } catch {
    // ignore parse errors
  }

  return result;
}
