import { z } from "zod";

export const legacyTableNameSchema = z.enum([
  "matches",
  "match_lineups",
  "passes",
  "shots",
  "defensive",
  "dribbles_and_fouls",
  "goalkeeper_stats",
  "physical_data",
]);

export type LegacyTableName = z.infer<typeof legacyTableNameSchema>;

export const legacyTableListQuerySchema = z.object({
  match_id: z.string().uuid().optional().nullable(),
});

export function parseLegacyTableFiltersFromUrl(url: string) {
  const u = new URL(url);
  return legacyTableListQuerySchema.parse({
    match_id: u.searchParams.get("match_id"),
  });
}

export const legacyTableUpdateBodySchema = z.object({
  id: z.string().uuid(),
  patch: z.record(z.string(), z.unknown()),
  issue_description: z.string().nullable().optional(),
  evidence_reference: z.string().nullable().optional(),
});

