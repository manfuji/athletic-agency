import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";

export async function GET() {
  return runAdminApi(async () => getAdminServices().eventSeasonService.list(), {
    roles: ["admin"],
  });
}

