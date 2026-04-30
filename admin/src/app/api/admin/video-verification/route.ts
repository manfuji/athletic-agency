import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { parsePageFromUrl } from "@/server/schemas/pagination";
import { z } from "zod";

const querySchema = z.object({
  match_id: z.string().uuid().optional().nullable(),
  player_id: z.string().uuid().optional().nullable(),
  stat_table: z.string().optional().nullable(),
});

function parseFilters(url: string) {
  const u = new URL(url);
  return querySchema.parse({
    match_id: u.searchParams.get("match_id"),
    player_id: u.searchParams.get("player_id"),
    stat_table: u.searchParams.get("stat_table"),
  });
}

export async function GET(req: Request) {
  const { page } = parsePageFromUrl(req.url);
  const f = parseFilters(req.url);

  return runAdminApi(
    async () =>
      getAdminServices().videoVerificationService.list({
        page,
        matchId: f.match_id ?? null,
        playerId: f.player_id ?? null,
        statTable: f.stat_table ?? null,
      }),
    { roles: ["admin"] }
  );
}

