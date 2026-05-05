#!/usr/bin/env bun
export {};

const message = "Claude needs your attention";

// Drain stdin so upstream pipe doesn't break; the body is unused.
try {
  await Bun.stdin.text();
} catch {
  // ignore
}

try {
  if (process.platform === "darwin") {
    Bun.spawnSync(["afplay", "/System/Library/Sounds/Ping.aiff"]);
    Bun.spawnSync([
      "osascript",
      "-e",
      `display notification "${message}" with title "Claude Code"`,
    ]);
  } else if (process.platform === "linux") {
    Bun.spawnSync(["notify-send", "Claude Code", message]);
  } else if (process.platform === "win32") {
    Bun.spawnSync([
      "powershell",
      "-NoProfile",
      "-Command",
      `[reflection.assembly]::loadwithpartialname('System.Windows.Forms') | Out-Null; ` +
        `[System.Windows.Forms.MessageBox]::Show('${message}','Claude Code') | Out-Null`,
    ]);
  }
} catch {
  // best-effort; notification failure is non-critical
}
