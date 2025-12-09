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
]);

/** Files that can be formatted by prettier */
export const FORMATTABLE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".css",
  ".scss",
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
};
