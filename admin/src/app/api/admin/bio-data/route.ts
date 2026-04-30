import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { parsePageFromUrl } from "@/server/schemas/pagination";
import { parseBioDataFiltersFromUrl } from "@/server/schemas/bioData";

export async function GET(req: Request) {
  const { page } = parsePageFromUrl(req.url);
  const filters = parseBioDataFiltersFromUrl(req.url);

  return runAdminApi(
    async () =>
      getAdminServices().bioDataService.list({
        page,
        q: filters.q ?? null,
        seasonId: filters.season_id ?? null,
        teamId: filters.team_id ?? null,
      }),
    { roles: ["admin"] }
  );
}

