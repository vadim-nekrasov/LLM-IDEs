#!/usr/bin/env bun
export {};

const [titleArg, messageArg] = process.argv.slice(2);
const title = titleArg || "Claude Code";
const message = messageArg || "Claude needs your attention";

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
    const safeT = escapeForOsascript(title);
    const safeM = escapeForOsascript(message);
    Bun.spawnSync([
      "osascript",
      "-e",
      `display notification "${safeM}" with title "${safeT}"`,
    ]);
  } else if (process.platform === "linux") {
    Bun.spawnSync(["notify-send", title, message]);
  } else if (process.platform === "win32") {
    const safeT = escapeForPowerShell(title);
    const safeM = escapeForPowerShell(message);
    Bun.spawnSync([
      "powershell",
      "-NoProfile",
      "-Command",
      `[reflection.assembly]::loadwithpartialname('System.Windows.Forms') | Out-Null; ` +
        `[System.Windows.Forms.MessageBox]::Show('${safeM}','${safeT}') | Out-Null`,
    ]);
  }
} catch {
  // best-effort; notification failure is non-critical
}
