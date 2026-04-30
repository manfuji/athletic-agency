import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { parsePageFromUrl } from "@/server/schemas/pagination";

export async function GET(req: Request) {
  const { page } = parsePageFromUrl(req.url);
  return runAdminApi(async () =>
    getAdminServices().legacyPlayerService.listUnmappedBioData(page)
  );
}

