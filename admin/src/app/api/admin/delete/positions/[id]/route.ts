import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return runAdminApi(async () => getAdminServices().positionService.delete(Number(id)), {
    roles: ["admin"],
  });
}

