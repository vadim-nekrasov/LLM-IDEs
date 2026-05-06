import { existsSync, mkdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, extname, join } from "node:path";

export function isNodeModulesPath(filePath: string): boolean {
  return filePath.split(/[/\\]/).includes("node_modules");
}

export function isTargetPath(filePath: string): boolean {
  return filePath.split(/[/\\]/).includes("target");
}

/** Safe extension extraction — handles dotfiles and missing extensions correctly. */
export function getExt(filePath: string): string {
  return extname(filePath).toLowerCase();
}

/**
 * Find all docs/index.md files from startDir up to projectRoot.
 * Returns array of found doc paths, ordered from closest to farthest.
 */
export function findDocsUp(startDir: string, projectRoot: string): string[] {
  const docs: string[] = [];
  let current = startDir;

  while (current.startsWith(projectRoot) || current === projectRoot) {
    const indexPath = join(current, "docs", "index.md");

    if (existsSync(indexPath) && statSync(indexPath).isFile()) {
      docs.push(indexPath);
    }

    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }

  return docs;
}

/** Check if file is documentation (.md or in /docs/) */
export function isDocFile(path: string): boolean {
  return path.endsWith(".md") || path.includes("/docs/");
}

/** Ensure a directory exists (recursive mkdir, no-op if present). */
export function ensureDir(dir: string): void {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

/**
 * Resolve a hook cache directory under the user's home (~/.claude/cache/claude-code-hooks/<sub>/).
 * Kept outside CLAUDE_PROJECT_DIR so cache files never end up in a project repo
 * (the .claude/ directory in this setup is a symlink to a shared, git-tracked config repo).
 */
export function cacheDir(sub: string): string {
  const dir = join(homedir(), ".claude", "cache", "claude-code-hooks", sub);
  ensureDir(dir);
  return dir;
}

/**
 * Sanitize a session-id-like token for use as a filename.
 * Replaces non-[\w.-] runs and any ".." sequence with "_" — the latter
 * blocks path traversal even if Claude Code ever feeds an attacker-controlled
 * id into a hook (today the runtime always supplies a UUID-shaped value).
 */
export function sanitizeSessionId(
  id: string | undefined,
  fallback = "_unknown",
): string {
  return (id || fallback).replace(/[^\w.-]+|\.{2,}/g, "_");
}
