#!/usr/bin/env bun
export {};

const message = "Claude needs your attention";

// Drain stdin so upstream pipe doesn't break; the body is unused.
try {
  await Bun.stdin.text();
} catch {
  // ignore
}

// Escape for AppleScript double-quoted string literals.
const escapeForOsascript = (s: string): string =>
  s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

// Escape for PowerShell single-quoted string literals.
const escapeForPowerShell = (s: string): string => s.replace(/'/g, "''");

try {
  if (process.platform === "darwin") {
    Bun.spawnSync(["afplay", "/System/Library/Sounds/Ping.aiff"]);
    const safe = escapeForOsascript(message);
    Bun.spawnSync([
      "osascript",
      "-e",
      `display notification "${safe}" with title "Claude Code"`,
    ]);
  } else if (process.platform === "linux") {
    Bun.spawnSync(["notify-send", "Claude Code", message]);
  } else if (process.platform === "win32") {
    const safe = escapeForPowerShell(message);
    Bun.spawnSync([
      "powershell",
      "-NoProfile",
      "-Command",
      `[reflection.assembly]::loadwithpartialname('System.Windows.Forms') | Out-Null; ` +
        `[System.Windows.Forms.MessageBox]::Show('${safe}','Claude Code') | Out-Null`,
    ]);
  }
} catch {
  // best-effort; notification failure is non-critical
}
