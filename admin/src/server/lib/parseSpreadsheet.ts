const STAT_COLUMN_KEYS = [
  "total_shots",
  "shots_on_target",
  "shots_off_target",
  "dribbles_successful",
  "dribbles_attempted",
  "times_fouled",
  "dispossessed",
  "offsides",
  "tackles",
  "interceptions",
  "fouls_committed",
  "clearances",
  "dribbles_defended",
  "blocks",
  "own_goals",
  "minutes_played",
] as const;

export type StatColumnKey = (typeof STAT_COLUMN_KEYS)[number];

export const PLAYER_STATS_EXPORT_COLUMNS = [
  "id",
  "name",
  "team_id",
  "position",
  ...STAT_COLUMN_KEYS,
] as const;

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      cells.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

function normalizeHeader(h: string): string {
  return h
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

export function parseCsvText(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    if (cells.every((c) => c === "")) continue;
    const row: Record<string, string> = {};
    headers.forEach((key, idx) => {
      row[key] = cells[idx] ?? "";
    });
    rows.push(row);
  }

  return rows;
}

export async function parseUploadFile(
  file: File
): Promise<Record<string, string>[]> {
  const name = file.name.toLowerCase();
  const buffer = await file.arrayBuffer();

  if (name.endsWith(".csv")) {
    const text = new TextDecoder("utf-8").decode(buffer);
    return parseCsvText(text);
  }

  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return [];
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
    });
    return json.map((row) => {
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(row)) {
        out[normalizeHeader(k)] = v == null ? "" : String(v).trim();
      }
      return out;
    });
  }

  throw new Error("Unsupported file type. Use CSV, XLS, or XLSX.");
}

export function statPatchFromRow(
  row: Record<string, string>
): Partial<Record<StatColumnKey, number | null>> {
  const patch: Partial<Record<StatColumnKey, number | null>> = {};
  for (const key of STAT_COLUMN_KEYS) {
    const raw = row[key];
    if (raw === undefined || raw === "") continue;
    const n = Number(raw);
    patch[key] = Number.isFinite(n) ? Math.trunc(n) : null;
  }
  return patch;
}

export function statColumnsForExport(): readonly string[] {
  return PLAYER_STATS_EXPORT_COLUMNS;
}
