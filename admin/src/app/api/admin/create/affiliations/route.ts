import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { affiliationBodySchema } from "@/server/schemas/affiliation";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = affiliationBodySchema.parse(body);
  return runAdminApi(async () => getAdminServices().affiliationService.create(parsed), {
    roles: ["admin"],
  });
}

