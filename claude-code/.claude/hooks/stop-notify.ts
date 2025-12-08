#!/usr/bin/env bun
if (process.platform === 'darwin') {
  Bun.spawnSync([
    'osascript',
    '-e',
    'display notification "Claude finished" with title "Claude Code"',
  ]);
} else if (process.platform === 'linux') {
  Bun.spawnSync(['notify-send', 'Claude Code', 'Claude finished']);
}
