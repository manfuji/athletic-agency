import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { footPreferenceBodySchema } from "@/server/schemas/footPreference";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = footPreferenceBodySchema.parse(body);
  return runAdminApi(async () => getAdminServices().footPreferenceService.create(parsed), {
    roles: ["admin"],
  });
}

