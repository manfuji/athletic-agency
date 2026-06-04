export function ensureArray<T>(value: unknown, fallback: T[] = []): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

export function ensureNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/** Normalize team row from API (snake_case short_code, players embed). */
export function normalizeTeamRow<T extends Record<string, unknown>>(
  team: T
): T & { shortCode: string } {
  const shortCode =
    (typeof team.shortCode === "string" ? team.shortCode : undefined) ??
    (typeof team.short_code === "string" ? team.short_code : "");
  return {
    ...team,
    shortCode,
  };
}

/** Map DB `is_published` to UI `isPublished` (0 | 1). */
export function normalizeCompetition<
  T extends { isPublished?: number; is_published?: boolean | number }
>(row: T): T & { isPublished: number } {
  const published = row.isPublished ?? row.is_published;
  return {
    ...row,
    isPublished: published === true || published === 1 ? 1 : 0,
  };
}

/** Player count from team row with Supabase `players(count)` embed. */
export function teamPlayersCountFromRow(team: unknown): number {
  if (!team || typeof team !== "object") return 0;
  const row = team as Record<string, unknown>;
  if (typeof row.players_count === "number") return row.players_count;
  const players = row.players;
  if (Array.isArray(players) && players.length > 0) {
    const first = players[0] as { count?: number };
    if (typeof first?.count === "number") return first.count;
  }
  return 0;
}

export function teamDetailsPlayerCount(teamDetails: unknown): number {
  if (
    !teamDetails ||
    typeof teamDetails !== "object" ||
    "error" in teamDetails
  ) {
    return 0;
  }
  return ensureArray((teamDetails as { players?: unknown }).players).length;
}

