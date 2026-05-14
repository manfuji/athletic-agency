export function ensureArray<T>(value: unknown, fallback: T[] = []): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

export function ensureNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/** Safe player count from fetchTeamDetails result (unwrap or { error }). */
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

