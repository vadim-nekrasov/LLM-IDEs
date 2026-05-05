import {
  closeSync,
  existsSync,
  openSync,
  readFileSync,
  readSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import type {
  RequiredSkillsUsed,
  TranscriptData,
  TranscriptEntry,
} from "./types";
import {
  CODE_EXTENSIONS,
  FORMATTABLE_EXTENSIONS,
  SKILL_NAMES,
} from "./constants";
import { cacheDir, getExt } from "./utils";

interface Cached {
  offset: number;
  size: number;
  editedFiles: string[];
  hasCodeEdits: boolean;
  skillsEntries: [string, number][];
  hasFinalCheck: boolean;
  hasApplyingWorkflow: boolean;
  requiredSkillsUsed: RequiredSkillsUsed;
  docsRead: string[];
  seenFiles: string[];
}

function emptyData(): TranscriptData {
  return {
    editedFiles: [],
    hasCodeEdits: false,
    skills: new Map(),
    hasFinalCheck: false,
    hasApplyingWorkflow: false,
    requiredSkillsUsed: {
      ecmascript: false,
      typescript: false,
      react: false,
      lua: false,
      rust: false,
      wgsl: false,
    },
    docsRead: new Set(),
  };
}

function cachePath(transcriptPath: string, sessionId?: string): string {
  // Sanitize session-id-like token for use as a filename.
  const id = (sessionId || transcriptPath).replace(/[^\w.-]+/g, "_");
  return join(cacheDir("transcript"), `${id}.json`);
}

function loadCache(path: string): Cached | null {
  try {
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf8")) as Cached;
  } catch {
    return null;
  }
}

function saveCache(path: string, c: Cached): void {
  try {
    const tmp = `${path}.tmp`;
    writeFileSync(tmp, JSON.stringify(c));
    renameSync(tmp, path);
  } catch {
    // best-effort
  }
}

/** Read bytes [start, end) from file (end exclusive). */
function readSlice(path: string, start: number, end: number): string {
  const fd = openSync(path, "r");
  try {
    const len = end - start;
    if (len <= 0) return "";
    const buf = Buffer.alloc(len);
    readSync(fd, buf, 0, len, start);
    return buf.toString("utf8");
  } finally {
    closeSync(fd);
  }
}

function applyTranscriptLines(
  text: string,
  data: TranscriptData,
  seenFiles: Set<string>,
): void {
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    let entry: TranscriptEntry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    for (const item of entry.message?.content ?? []) {
      if (item.type !== "tool_use") continue;

      if (item.name === "Edit" || item.name === "Write") {
        const filePath = item.input?.file_path;
        if (filePath && !seenFiles.has(filePath)) {
          const ext = getExt(filePath);
          if (CODE_EXTENSIONS.has(ext)) data.hasCodeEdits = true;
          if (FORMATTABLE_EXTENSIONS.has(ext) && existsSync(filePath)) {
            data.editedFiles.push(filePath);
          }
          seenFiles.add(filePath);
        }
      }

      if (item.name === "Read") {
        const filePath = item.input?.file_path;
        if (filePath) data.docsRead.add(filePath);
      }

      if (item.name === "Skill") {
        const skill = item.input?.skill;
        if (skill) {
          data.skills.set(skill, (data.skills.get(skill) ?? 0) + 1);
          if (skill === SKILL_NAMES.final) data.hasFinalCheck = true;
          if (skill === SKILL_NAMES.workflow) data.hasApplyingWorkflow = true;
          for (const [key, name] of Object.entries(SKILL_NAMES.languages)) {
            if (skill === name) {
              data.requiredSkillsUsed[key as keyof RequiredSkillsUsed] = true;
            }
          }
        }
      }
    }
  }
}

/**
 * Parse transcript with incremental cache.
 * Reads only bytes appended since last call (transcripts are append-only JSONL).
 * Cache lives under ~/.claude/cache/claude-code-hooks/transcript/.
 */
export async function parseTranscript(
  path: string | undefined,
  sessionId?: string,
): Promise<TranscriptData> {
  const data = emptyData();
  if (!path || !existsSync(path)) return data;

  const stat = statSync(path);
  const size = stat.size;
  const cPath = cachePath(path, sessionId);
  const cached = loadCache(cPath);

  let offset = 0;
  const seen = new Set<string>();

  if (cached && cached.size <= size) {
    offset = cached.offset;
    data.editedFiles = [...cached.editedFiles];
    data.hasCodeEdits = cached.hasCodeEdits;
    data.skills = new Map(cached.skillsEntries);
    data.hasFinalCheck = cached.hasFinalCheck;
    data.hasApplyingWorkflow = cached.hasApplyingWorkflow;
    data.requiredSkillsUsed = { ...cached.requiredSkillsUsed };
    data.docsRead = new Set(cached.docsRead);
    for (const f of cached.seenFiles) seen.add(f);
  }
  // If file shrank (truncate/rotation) we restart parsing from 0.

  if (offset < size) {
    const tail = readSlice(path, offset, size);
    const lastNl = tail.lastIndexOf("\n");
    const consumable = lastNl >= 0 ? tail.slice(0, lastNl + 1) : "";
    applyTranscriptLines(consumable, data, seen);
    const advanced = lastNl >= 0 ? lastNl + 1 : 0;

    saveCache(cPath, {
      offset: offset + advanced,
      size,
      editedFiles: data.editedFiles,
      hasCodeEdits: data.hasCodeEdits,
      skillsEntries: [...data.skills.entries()],
      hasFinalCheck: data.hasFinalCheck,
      hasApplyingWorkflow: data.hasApplyingWorkflow,
      requiredSkillsUsed: data.requiredSkillsUsed,
      docsRead: [...data.docsRead],
      seenFiles: [...seen],
    });
  }

  return data;
}
