#!/usr/bin/env bun
import {
  getUsage,
  sumByModel,
  type ByModel,
  type UsageScope,
} from "./usage-parser";
import { computeCost } from "./usage-prices";
import { homedir } from "node:os";

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
};
const SEPARATOR = "━".repeat(64);

const SCOPES: UsageScope[] = [
  "today",
  "7d",
  "session",
  "by-model",
  "by-project",
];

const TITLES: Record<UsageScope, string> = {
  today: "Token usage — today",
  "7d": "Token usage — last 7 days",
  session: "Token usage — recent sessions",
  "by-model": "Token usage — by model",
  "by-project": "Token usage — by project",
};

const raw = (process.argv[2] ?? "--today").replace(/^--/, "");
if (raw === "help" || raw === "h") {
  console.log(`usage.ts — local Claude Code token analytics (estimate)\n`);
  console.log(`  bun usage.ts [${SCOPES.map((s) => `--${s}`).join(" | ")}]`);
  process.exit(0);
}
const scope: UsageScope = (SCOPES as string[]).includes(raw)
  ? (raw as UsageScope)
  : "today";

function homeify(s: string): string {
  return s.split(`${homedir()}/`).join("~/");
}

function human(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
  return String(n);
}

function rowCost(byModel: ByModel): { usd: number; unknown: boolean } {
  let usd = 0;
  let unknown = false;
  for (const [model, t] of Object.entries(byModel)) {
    const c = computeCost(t, model);
    usd += c.usd;
    if (!c.known) unknown = true;
  }
  return { usd, unknown };
}

interface Metrics {
  label: string;
  input: number;
  output: number;
  cacheW: number;
  cacheR: number;
  usd: number;
  unknown: boolean;
}

function metricsOf(label: string, byModel: ByModel): Metrics {
  const t = sumByModel(byModel);
  const { usd, unknown } = rowCost(byModel);
  return {
    label,
    input: t.input,
    output: t.output,
    cacheW: t.cacheWrite5m + t.cacheWrite1h,
    cacheR: t.cacheRead,
    usd,
    unknown,
  };
}

function cells(m: Metrics): string[] {
  return [
    m.label,
    human(m.input),
    human(m.output),
    human(m.cacheW),
    human(m.cacheR),
    `~$${m.usd.toFixed(2)}${m.unknown ? "*" : ""}`,
  ];
}

const view = getUsage(scope);

console.log(`\n${C.dim}${SEPARATOR}${C.reset}`);
console.log(`${C.bold}${C.cyan}📊 ${TITLES[scope]}${C.reset}`);

if (view.rows.length === 0) {
  console.log(`${C.dim}No usage data found.${C.reset}`);
  console.log(`${C.dim}${SEPARATOR}${C.reset}`);
  process.exit(0);
}

const headers = ["", "Input", "Output", "CacheW", "CacheR", "~$ est"];
const rows = view.rows.map((r) => metricsOf(homeify(r.label), r.byModel));
const total = rows.reduce<Metrics>(
  (acc, m) => ({
    label: "TOTAL",
    input: acc.input + m.input,
    output: acc.output + m.output,
    cacheW: acc.cacheW + m.cacheW,
    cacheR: acc.cacheR + m.cacheR,
    usd: acc.usd + m.usd,
    unknown: acc.unknown || m.unknown,
  }),
  {
    label: "TOTAL",
    input: 0,
    output: 0,
    cacheW: 0,
    cacheR: 0,
    usd: 0,
    unknown: false,
  },
);

const body = rows.map(cells);
const totalCells = cells(total);
const widths = headers.map((h, i) =>
  Math.max(h.length, ...body.map((r) => r[i].length), totalCells[i].length),
);

function fmtRow(c: string[]): string {
  return c
    .map((v, i) => (i === 0 ? v.padEnd(widths[i]) : v.padStart(widths[i])))
    .join("  ");
}

console.log(`${C.dim}${fmtRow(headers)}${C.reset}`);
for (const r of body) console.log(fmtRow(r));
console.log(
  `${C.dim}${"─".repeat(widths.reduce((a, w) => a + w + 2, -2))}${C.reset}`,
);
console.log(`${C.bold}${fmtRow(totalCells)}${C.reset}`);

const notes: string[] = [];
if (total.unknown) notes.push("* unpriced model — excluded from $");
notes.push("$ = API-equivalent estimate, not a subscription bill");
console.log(`${C.dim}${notes.join("  ·  ")}${C.reset}`);
console.log(`${C.dim}${SEPARATOR}${C.reset}`);
