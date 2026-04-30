import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { positionBodySchema } from "@/server/schemas/position";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = positionBodySchema.parse(body);
  return runAdminApi(async () => getAdminServices().positionService.create(parsed), {
    roles: ["admin"],
  });
}

