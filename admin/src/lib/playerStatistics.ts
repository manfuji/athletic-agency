export const STAT_COLUMN_KEYS = [
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

export const STAT_LABELS: Record<StatColumnKey, string> = {
  total_shots: "Total Shots",
  shots_on_target: "Shots on Target",
  shots_off_target: "Shots off Target",
  dribbles_successful: "Dribbles Successful",
  dribbles_attempted: "Dribbles Attempted",
  times_fouled: "Times Fouled",
  dispossessed: "Dispossessed",
  offsides: "Offsides",
  tackles: "Tackles",
  interceptions: "Interceptions",
  fouls_committed: "Fouls Committed",
  clearances: "Clearances",
  dribbles_defended: "Dribbles Defended",
  blocks: "Blocks",
  own_goals: "Own Goals",
  minutes_played: "Minutes Played",
};

export type StatDisplayCategory =
  | "Attack"
  | "Defense & Discipline"
  | "General";

export const STAT_CATEGORIES: Record<StatColumnKey, StatDisplayCategory> = {
  total_shots: "Attack",
  shots_on_target: "Attack",
  shots_off_target: "Attack",
  dribbles_successful: "Attack",
  dribbles_attempted: "Attack",
  offsides: "Attack",
  own_goals: "Attack",
  tackles: "Defense & Discipline",
  interceptions: "Defense & Discipline",
  blocks: "Defense & Discipline",
  clearances: "Defense & Discipline",
  fouls_committed: "Defense & Discipline",
  dribbles_defended: "Defense & Discipline",
  minutes_played: "General",
  times_fouled: "General",
  dispossessed: "General",
};

export function statDisplayValue(value: unknown): string | number {
  if (typeof value === "string" || typeof value === "number") return value;
  return 0;
}

export function competitionStatsToStatsArray(
  row: Record<string, unknown>
): { title: string; value: string | number }[] {
  return STAT_COLUMN_KEYS.map((key) => ({
    title: STAT_LABELS[key],
    value: statDisplayValue(row[key]),
  }));
}

export function buildImportableAccordionStats(
  statsMap: Map<string, string | number>
): {
  label: string;
  value: string | number;
  category: StatDisplayCategory;
}[] {
  return STAT_COLUMN_KEYS.map((key) => ({
    label: STAT_LABELS[key],
    value: statsMap.get(STAT_LABELS[key].toLowerCase()) ?? 0,
    category: STAT_CATEGORIES[key],
  }));
}
