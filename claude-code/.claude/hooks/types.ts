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
  requiredSkillsUsed: RequiredSkillsUsed;
}
