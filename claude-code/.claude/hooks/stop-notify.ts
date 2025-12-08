#!/usr/bin/env bun
if (process.platform === 'darwin') {
  Bun.spawnSync([
    'osascript',
    '-e',
    'display the notification "Claude finished" with the title "Claude Code"',
  ]);
} else if (process.platform === 'linux') {
  Bun.spawnSync(['notify-send', 'Claude Code', 'Claude finished']);
}
