import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { footPreferenceBodySchema } from "@/server/schemas/footPreference";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = footPreferenceBodySchema.partial().parse(body);
  return runAdminApi(
    async () => getAdminServices().footPreferenceService.update(Number(id), parsed),
    { roles: ["admin"] }
  );
}

