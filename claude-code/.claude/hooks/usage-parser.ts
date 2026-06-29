import { readFileSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";

export interface Tokens {
  input: number;
  output: number;
  cacheWrite5m: number;
  cacheWrite1h: number;
  cacheRead: number;
}

export type ByModel = Record<string, Tokens>;

export type UsageScope = "today" | "7d" | "session" | "by-model" | "by-project";

interface UsageRow {
  label: string;
  byModel: ByModel;
  sortKey: string;
}

export interface UsageView {
  scope: UsageScope;
  rows: UsageRow[];
}

interface FileAgg {
  project: string;
  session: string;
  lastTs: string;
  days: Record<string, ByModel>;
  total: ByModel;
}

interface RawUsage {
  input_tokens?: number;
  output_tokens?: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
  cache_creation?: {
    ephemeral_5m_input_tokens?: number;
    ephemeral_1h_input_tokens?: number;
  };
}

interface RawRecord {
  type?: string;
  requestId?: string;
  timestamp?: string;
  cwd?: string;
  uuid?: string;
  message?: { id?: string; model?: string; usage?: RawUsage };
}

function num(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

function emptyTokens(): Tokens {
  return {
    input: 0,
    output: 0,
    cacheWrite5m: 0,
    cacheWrite1h: 0,
    cacheRead: 0,
  };
}

function addTokens(a: Tokens, b: Tokens): void {
  a.input += b.input;
  a.output += b.output;
  a.cacheWrite5m += b.cacheWrite5m;
  a.cacheWrite1h += b.cacheWrite1h;
  a.cacheRead += b.cacheRead;
}

function tokenTotal(t: Tokens): number {
  return t.input + t.output + t.cacheWrite5m + t.cacheWrite1h + t.cacheRead;
}

export function sumByModel(bm: ByModel): Tokens {
  const out = emptyTokens();
  for (const t of Object.values(bm)) addTokens(out, t);
  return out;
}

function foldInto(map: ByModel, model: string, t: Tokens): void {
  const cur = map[model] ?? emptyTokens();
  addTokens(cur, t);
  map[model] = cur;
}

function mergeByModel(into: ByModel, from: ByModel): void {
  for (const [model, t] of Object.entries(from)) foldInto(into, model, t);
}

function fmtLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function localDate(ts: string): string {
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? "unknown" : fmtLocal(d);
}

function lastNDays(n: number): string[] {
  const out: string[] = [];
  const base = new Date();
  for (let i = 0; i < n; i++) {
    out.push(
      fmtLocal(
        new Date(base.getFullYear(), base.getMonth(), base.getDate() - i),
      ),
    );
  }
  return out;
}

function extractTokens(u: RawUsage): Tokens {
  const cc = u.cache_creation;
  const w5 = cc?.ephemeral_5m_input_tokens;
  const w1 = cc?.ephemeral_1h_input_tokens;
  const hasSplit = typeof w5 === "number" || typeof w1 === "number";
  return {
    input: num(u.input_tokens),
    output: num(u.output_tokens),
    cacheWrite5m: hasSplit ? num(w5) : num(u.cache_creation_input_tokens),
    cacheWrite1h: hasSplit ? num(w1) : 0,
    cacheRead: num(u.cache_read_input_tokens),
  };
}

function parseFile(path: string): FileAgg {
  const agg: FileAgg = {
    project: "",
    session: basename(path).replace(/\.jsonl$/, ""),
    lastTs: "",
    days: {},
    total: {},
  };
  let text = "";
  try {
    text = readFileSync(path, "utf8");
  } catch {
    return agg;
  }
  const seen = new Set<string>();
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    let rec: RawRecord;
    try {
      rec = JSON.parse(line) as RawRecord;
    } catch {
      continue;
    }
    if (rec.type !== "assistant" || !rec.message?.usage) continue;
    const key = `${rec.message.id ?? rec.uuid ?? ""}:${rec.requestId ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const model = rec.message.model ?? "unknown";
    const t = extractTokens(rec.message.usage);
    foldInto(agg.total, model, t);
    const day = rec.timestamp ? localDate(rec.timestamp) : "unknown";
    agg.days[day] = agg.days[day] ?? {};
    foldInto(agg.days[day], model, t);
    if (rec.cwd) agg.project = rec.cwd;
    if (rec.timestamp && rec.timestamp > agg.lastTs) agg.lastTs = rec.timestamp;
  }
  if (!agg.project) agg.project = basename(path);
  return agg;
}

function listJsonl(root: string): string[] {
  const out: string[] = [];
  let dirs: string[] = [];
  try {
    dirs = readdirSync(root, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => join(root, e.name));
  } catch {
    return out;
  }
  for (const dir of dirs) {
    try {
      for (const name of readdirSync(dir)) {
        if (name.endsWith(".jsonl")) out.push(join(dir, name));
      }
    } catch {
      // skip unreadable project dir
    }
  }
  return out;
}

function scanProjects(): FileAgg[] {
  const root = join(homedir(), ".claude", "projects");
  return listJsonl(root).map((f) => parseFile(f));
}

function sortByTokensDesc(rows: UsageRow[]): UsageRow[] {
  return rows.sort(
    (a, b) =>
      tokenTotal(sumByModel(b.byModel)) - tokenTotal(sumByModel(a.byModel)),
  );
}

export function getUsage(scope: UsageScope): UsageView {
  const files = scanProjects();

  if (scope === "by-model") {
    const acc: ByModel = {};
    for (const f of files) mergeByModel(acc, f.total);
    const rows = Object.entries(acc)
      .filter(([, t]) => tokenTotal(t) > 0)
      .map(([model, t]) => ({
        label: model,
        byModel: { [model]: t },
        sortKey: model,
      }));
    return { scope, rows: sortByTokensDesc(rows) };
  }

  if (scope === "by-project") {
    const byProject: Record<string, ByModel> = {};
    for (const f of files) {
      byProject[f.project] = byProject[f.project] ?? {};
      mergeByModel(byProject[f.project], f.total);
    }
    const rows = Object.entries(byProject)
      .filter(([, byModel]) => tokenTotal(sumByModel(byModel)) > 0)
      .map(([label, byModel]) => ({
        label,
        byModel,
        sortKey: label,
      }));
    return { scope, rows: sortByTokensDesc(rows) };
  }

  if (scope === "session") {
    const rows = files
      .filter((f) => tokenTotal(sumByModel(f.total)) > 0)
      .sort((a, b) => (a.lastTs < b.lastTs ? 1 : -1))
      .slice(0, 20)
      .map((f) => ({
        label: `${f.session.slice(0, 8)}  ${f.project}`,
        byModel: f.total,
        sortKey: f.lastTs,
      }));
    return { scope, rows };
  }

  const days = scope === "today" ? lastNDays(1) : lastNDays(7);
  const wanted = new Set(days);
  const perDay: Record<string, ByModel> = {};
  for (const f of files) {
    for (const [day, bm] of Object.entries(f.days)) {
      if (!wanted.has(day)) continue;
      perDay[day] = perDay[day] ?? {};
      mergeByModel(perDay[day], bm);
    }
  }
  const rows = days
    .filter((d) => perDay[d])
    .map((d) => ({ label: d, byModel: perDay[d], sortKey: d }));
  return { scope, rows };
}
