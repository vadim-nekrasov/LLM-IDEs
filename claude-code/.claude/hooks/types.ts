/**
 * Input passed to hooks via stdin as JSON.
 *
 * Most fields are populated by Claude Code on every event, but session-start.ts
 * uses a `{} as HookInput` fallback when stdin parsing fails — so cwd, session_id,
 * and hook_event_name are typed optional to keep the contract honest.
 */
export interface HookInput {
  session_id?: string;
  transcript_path?: string;
  cwd?: string;
  hook_event_name?: string;
  tool_name?: string;
  tool_input?: {
    file_path?: string;
    skill?: string;
    command?: string;
    [key: string]: unknown;
  };
  /** UserPromptSubmit only — the user's prompt text. */
  prompt?: string;
  stop_hook_active?: boolean;
  permission_mode?:
    | "default"
    | "plan"
    | "acceptEdits"
    | "auto"
    | "dontAsk"
    | "bypassPermissions";
  notification_type?: string;
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
  rust: boolean;
  wgsl: boolean;
}

export interface TranscriptData {
  editedFiles: string[];
  hasCodeEdits: boolean;
  hasDocEdits: boolean;
  skills: Map<string, number>;
  requiredSkillsUsed: RequiredSkillsUsed;
  docsRead: Set<string>;
}
