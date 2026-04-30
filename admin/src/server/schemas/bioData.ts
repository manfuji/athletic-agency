import { z } from "zod";

export const bioDataListQuerySchema = z.object({
  q: z.string().optional().nullable(),
  season_id: z.coerce.number().int().optional().nullable(),
  team_id: z.string().uuid().optional().nullable(),
});

export function parseBioDataFiltersFromUrl(url: string) {
  const u = new URL(url);
  return bioDataListQuerySchema.parse({
    q: u.searchParams.get("q"),
    season_id: u.searchParams.get("season_id"),
    team_id: u.searchParams.get("team_id"),
  });
}

export const bioDataUpdateBodySchema = z.object({
  player_name: z.string().min(1).optional(),
  aa_stats_email: z.string().email().nullable().optional(),
  dob: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  nationality: z.string().nullable().optional(),
  season_id: z.coerce.number().int().nullable().optional(),
  team_id: z.string().uuid().nullable().optional(),
  jersey_number: z.coerce.number().int().nullable().optional(),
  photo_url: z.string().nullable().optional(),
  issue_description: z.string().nullable().optional(),
  evidence_reference: z.string().nullable().optional(),
});

