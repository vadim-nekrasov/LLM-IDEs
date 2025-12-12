import { existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * Check if path contains node_modules directory segment.
 * Works on both Unix and Windows paths.
 */
export function isNodeModulesPath(filePath: string): boolean {
  return filePath.split(/[/\\]/).includes("node_modules");
}

/**
 * Check if path contains target directory segment (Rust build directory).
 * Works on both Unix and Windows paths.
 */
export function isTargetPath(filePath: string): boolean {
  return filePath.split(/[/\\]/).includes("target");
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
