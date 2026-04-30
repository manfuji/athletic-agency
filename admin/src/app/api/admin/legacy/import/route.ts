import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";

export async function POST(req: Request) {
  return runAdminApi(async () => {
    const payload = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    return getAdminServices().legacyPlayerService.import({
      bio_data_id: String(payload.bio_data_id ?? ""),
    });
  });
}

