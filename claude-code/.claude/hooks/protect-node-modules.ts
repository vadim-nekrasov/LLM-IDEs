#!/usr/bin/env bun
import type { HookInput } from './types';

const input: HookInput = await Bun.stdin.json();
const filePath = input.tool_input?.file_path ?? '';

if (filePath.includes('node_modules')) {
  console.error('ERROR: Cannot edit files in node_modules');
  process.exit(2);
}
