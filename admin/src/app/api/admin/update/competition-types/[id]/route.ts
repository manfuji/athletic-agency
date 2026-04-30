import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { competitionTypeUpdateSchema } from "@/server/schemas/competitionType";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await req.json();
  const parsed = competitionTypeUpdateSchema.parse(body);
  const { id } = await params;

  return runAdminApi(
    async () => getAdminServices().competitionTypeService.updateType(id, parsed),
    { roles: ["admin"] }
  );
}
