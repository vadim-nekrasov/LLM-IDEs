#!/usr/bin/env bun
export {};

// Title text for the terminal tab/window title, passed as the first CLI arg
// (mirrors the notify.ts "<title>" "<message>" wiring convention).
const title = process.argv[2] || "Claude Code";

// Drain stdin so the upstream pipe doesn't break; the hook JSON body is unused.
try {
  await Bun.stdin.text();
} catch {
  // ignore
}

// Strip C0 controls (incl. ESC 0x1b and BEL 0x07) and DEL so the title text can
// never inject further escape sequences, then cap length. We re-add our own
// ESC/BEL framing below.
const safeTitle = title
  .replace(/[\x00-\x1f\x7f]/g, " ")
  .slice(0, 256)
  .trim();

// OSC 0 sets both icon name and window title (superset of OSC 1/2), so it reaches
// the tab title regardless of which target the terminal maps it to. Hooks run
// without a controlling terminal (v2.1.139+); Claude Code emits this sequence on
// our behalf when we return it as `terminalSequence` (v2.1.141+).
const seq = `\x1b]0;${safeTitle}\x07`;

console.log(JSON.stringify({ terminalSequence: seq }));
