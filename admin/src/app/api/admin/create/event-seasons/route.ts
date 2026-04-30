import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { eventSeasonBodySchema } from "@/server/schemas/eventSeason";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = eventSeasonBodySchema.parse(body);
  return runAdminApi(async () => getAdminServices().eventSeasonService.create(parsed), {
    roles: ["admin"],
  });
}

