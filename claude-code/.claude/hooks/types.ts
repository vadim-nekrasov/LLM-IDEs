import { existsSync } from "node:fs";

/** Input passed to all hooks via stdin as JSON */
export interface HookInput {
  session_id: string;
  transcript_path?: string;
  cwd: string;
  hook_event_name: string;
  tool_name?: string;
  tool_input?: {
    file_path?: string;
    skill?: string;
    command?: string;
    [key: string]: unknown;
  };
}

export interface TranscriptContent {
  type: string;
  name?: string;
  input?: {
    skill?: string;
    file_path?: string;
    [key: string]: unknown;
  };
}

export interface TranscriptEntry {
  message?: {
    content?: TranscriptContent[];
  };
}

export interface RequiredSkillsUsed {
  ecmascript: boolean;
  typescript: boolean;
  react: boolean;
  lua: boolean;
}

export interface TranscriptData {
  editedFiles: string[];
  skills: Map<string, number>;
  hasFinalCheck: boolean;
  hasApplyingWorkflow: boolean;
  docsRead: Set<string>;
  requiredSkillsUsed: RequiredSkillsUsed;
}

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
    docsRead: new Set(),
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

          // Track edited files
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

          // Track docs reads
          if (item.name === "Read") {
            const filePath = item.input?.file_path;
            if (filePath?.endsWith("docs/index.md")) {
              result.docsRead.add(filePath);
            }
          }

          // Track skills
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
