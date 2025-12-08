#!/usr/bin/env bun
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { HookInput } from './types';
import { parseTranscript } from './types';

const input: HookInput = await Bun.stdin.json();
const data = await parseTranscript(input.transcript_path);

// Format all edited files with prettier
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

// Show skills statistics
if (data.skills.size > 0) {
  const sorted = [...data.skills.entries()].sort((a, b) => b[1] - a[1]);
  console.log('\n' + '\u2501'.repeat(42));
  console.log('\uD83D\uDCCA Skills used in this session:');
  for (const [skill, count] of sorted) console.log(`   \u2022 ${skill} (${count})`);
  console.log('\u2501'.repeat(42));
}

function findProjectRoot(path: string): string | null {
  let dir = dirname(path);
  while (dir !== '/') {
    if (existsSync(join(dir, 'package.json'))) return dir;
    dir = dirname(dir);
  }
  return null;
}
