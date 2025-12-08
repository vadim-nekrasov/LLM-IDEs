#!/usr/bin/env bun
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { HookInput } from './types';
import { parseTranscript } from './types';

const input: HookInput = await Bun.stdin.json();
const data = await parseTranscript(input.transcript_path);

if (data.editedFiles.length > 0) {
  const byRoot = new Map<string, string[]>();

  for (const file of data.editedFiles) {
    const root = findProjectRoot(file);
    if (root) {
      const list = byRoot.get(root) ?? [];
      list.push(file);
      byRoot.set(root, list);
    }
  }

  for (const [root, files] of byRoot) {
    Bun.spawnSync(['npx', 'prettier', '--write', ...files], {
      cwd: root,
      stdout: 'ignore',
      stderr: 'ignore',
    });
  }
}

function findProjectRoot(path: string): string | null {
  let dir = dirname(path);
  while (dir !== '/') {
    if (existsSync(join(dir, 'package.json'))) return dir;
    dir = dirname(dir);
  }
  return null;
}
