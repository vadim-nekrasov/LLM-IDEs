import { basename, extname } from "node:path";
import { isProjectDocFile } from "./utils";

/** Pattern for React hook file names (useAuth, UseModal, etc.) */
const HOOK_NAME_PATTERN = /^use[A-Z]/i;

/** Pattern for hooks directory in path */
const HOOKS_DIR_PATTERN = /\/hooks\//;

/** Check if file is a React hook based on name or location */
export function isReactHookFile(filePath: string): boolean {
  // extname() returns "" for extension-less files; basename() then keeps the
  // full filename. The previous lastIndexOf-based split silently chopped off
  // the trailing character on names like "Makefile".
  const name = basename(filePath, extname(filePath));
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
  docs: "writing-docs",
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
  barrel: /(?:^|\/)(?:index|mod)\.(?:ts|js|tsx|jsx)$/,
  api: /(?:^|\/)[\w-]*(?:api|service|client|endpoint|route)\.(?:ts|js|tsx|jsx)$/i,
  config:
    /(?:^|\/)(?:[\w.-]*\.)?(?:vite|eslint|prettier|stylelint|tsconfig|vitest|playwright)\.config\.(?:ts|js|mjs|cjs|json)$|(?:^|\/)\.env(?:\.\w+)?$|(?:^|\/)settings\.(?:ts|js|json)$/i,
  hook: /\/hooks\/[\w-]+\.(?:ts|tsx)$/,
  component: /\/components\/.*\.(?:tsx|jsx)$/,
  slice: /(?:^|\/)[\w-]*(?:slice|store|reducer)\.(?:ts|js)$/,
  context: /(?:^|\/)[\w-]*(?:context|provider)\.(?:tsx|jsx)$/,
  rustMod: /(?:^|\/)(?:mod|lib)\.rs$/,
} as const;

/**
 * Auto-injection registry: for each entry, when an Edit/Write touches a path
 * matching `predicate` AND the session has not yet been seeded for `key`,
 * `edit-guard.ts` reads the rubric file body and emits it as additionalContext.
 * Subsequent edits within the same session emit only a short reminder.
 * Adding a new rubric = author the `_shared/*-principles.md` file + add one row.
 */
export interface InjectableEntry {
  /** Stable de-duplication key (per-session). Also surfaces in the reminder text. */
  key: string;
  /** Predicate over filePath — decides whether this entry triggers. */
  predicate: (filePath: string) => boolean;
  /** Rubric body file, resolved against CLAUDE_PROJECT_DIR. */
  rubricRelPath: string;
}

export const INJECTABLES: ReadonlyArray<InjectableEntry> = [
  {
    key: "writing-docs",
    predicate: isProjectDocFile,
    rubricRelPath: ".claude/skills/_shared/markdown-doc-principles.md",
  },
];
