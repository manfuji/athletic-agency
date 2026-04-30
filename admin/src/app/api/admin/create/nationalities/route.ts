import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { nationalityBodySchema } from "@/server/schemas/nationality";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = nationalityBodySchema.parse(body);
  return runAdminApi(async () => getAdminServices().nationalityService.create(parsed), {
    roles: ["admin"],
  });
}

