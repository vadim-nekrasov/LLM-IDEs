#!/usr/bin/env bun
import type { HookInput } from './types';
import { parseTranscript } from './types';

const input: HookInput = await Bun.stdin.json();
const data = await parseTranscript(input.transcript_path);

if (data.skills.size > 0) {
  const sorted = [...data.skills.entries()].sort((a, b) => b[1] - a[1]);
  console.log('\n' + '━'.repeat(42));
  console.log('📊 Skills used in this session:');
  for (const [skill, count] of sorted) console.log(`   • ${skill} (${count})`);
  console.log('━'.repeat(42));
}
