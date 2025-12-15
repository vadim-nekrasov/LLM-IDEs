#!/usr/bin/env bun
try {
  if (process.platform === "darwin") {
    // Play Glass sound
    Bun.spawnSync(["afplay", "/System/Library/Sounds/Ping.aiff"]);
    // Show notification
    Bun.spawnSync([
      "osascript",
      "-e",
      'display notification "Claude finished" with title "Claude Code"',
    ]);
  } else if (process.platform === "linux") {
    Bun.spawnSync(["notify-send", "Claude Code", "Claude finished"]);
  }
} catch {
  // notification failed - not critical
}
