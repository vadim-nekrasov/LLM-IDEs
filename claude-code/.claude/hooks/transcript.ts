import { existsSync } from "node:fs";
import type {
  TranscriptEntry,
  TranscriptData,
  RequiredSkillsUsed,
} from "./types";
import { FORMATTABLE_EXTENSIONS, SKILL_NAMES } from "./constants";

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
    docsRead: new Set(),
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
              if (FORMATTABLE_EXTENSIONS.has(ext) && existsSync(filePath)) {
                result.editedFiles.push(filePath);
                seenFiles.add(filePath);
              }
            }
          }

          if (item.name === "Read") {
            const filePath = item.input?.file_path;
            if (filePath) {
              result.docsRead.add(filePath);
            }
          }

          if (item.name === "Skill") {
            const skill = item.input?.skill;
            if (skill) {
              result.skills.set(skill, (result.skills.get(skill) ?? 0) + 1);

              if (skill === SKILL_NAMES.final) {
                result.hasFinalCheck = true;
              }
              if (skill === SKILL_NAMES.workflow) {
                result.hasApplyingWorkflow = true;
              }

              for (const [key, name] of Object.entries(SKILL_NAMES.languages)) {
                if (skill === name) {
                  result.requiredSkillsUsed[key as keyof RequiredSkillsUsed] =
                    true;
                }
              }
            }
          }
        }
      } catch {
        continue;
      }
    }
  } catch {
    // ignore file read errors
  }

  return result;
}
