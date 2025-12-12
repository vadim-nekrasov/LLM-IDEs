import { basename } from "node:path";

/** Pattern for React hook file names (useAuth, UseModal, etc.) */
const HOOK_NAME_PATTERN = /^use[A-Z]/i;

/** Pattern for hooks directory in path */
const HOOKS_DIR_PATTERN = /\/hooks\//;

/** Check if file is a React hook based on name or location */
export function isReactHookFile(filePath: string): boolean {
  const name = basename(filePath, filePath.slice(filePath.lastIndexOf(".")));
  return HOOK_NAME_PATTERN.test(name) || HOOKS_DIR_PATTERN.test(filePath);
}

/** Code file extensions requiring skill invocation */
export const CODE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".py",
  ".go",
  ".rs",
  ".lua",
  ".java",
  ".kt",
  ".swift",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
  ".cs",
  ".wgsl",
]);

/** Files that can be auto-formatted (prettier or language-specific tools) */
export const FORMATTABLE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".css",
  ".scss",
  ".rs",
]);

/** Skill name constants */
export const SKILL_NAMES = {
  workflow: "applying-workflow",
  final: "final-checking",
  languages: {
    ecmascript: "writing-ecmascript",
    typescript: "writing-typescript",
    react: "writing-react",
    lua: "writing-lua",
    rust: "writing-rust",
    wgsl: "writing-wgsl",
  },
} as const;

/** Required language skills by file extension */
export const EXTENSION_TO_SKILLS: Record<
  string,
  (keyof typeof SKILL_NAMES.languages)[]
> = {
  ".js": ["ecmascript"],
  ".jsx": ["ecmascript", "react"],
  ".mjs": ["ecmascript"],
  ".cjs": ["ecmascript"],
  ".ts": ["ecmascript", "typescript"],
  ".tsx": ["ecmascript", "typescript", "react"],
  ".lua": ["lua"],
  ".rs": ["rust"],
  ".wgsl": ["wgsl"],
};

/** Patterns that trigger documentation update requirement (from CLAUDE.md) */
export const DOC_TRIGGER_PATTERNS = {
  barrel: /(?:index|mod)\.(ts|js|tsx|jsx)$/,
  api: /(?:api|service|client|endpoint|route)\./i,
  config: /(?:config|\.env|settings)\./i,
  hook: /\/hooks\/.*\.(ts|tsx)$/,
  component: /\/components\/.*\.(tsx|jsx)$/,
  slice: /(?:slice|store|reducer)\.(ts|js)$/,
  context: /(?:context|provider)\.(tsx|jsx)$/,
  rustMod: /(?:mod|lib)\.rs$/,
} as const;

/** Skills requiring docs-first (design/planning skills) */
export const DOCS_REQUIRED_SKILLS = new Set([
  "applying-workflow",
  "searching-solutions",
  "debugging",
]);
