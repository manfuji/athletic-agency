import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { pointsConfigUpdateSchema } from "@/server/schemas/points";

export async function PATCH(
  req: Request,
  {
    params,
  }: { params: Promise<{ competitionId: string; configId: string }> }
) {
  const body = await req.json();
  const parsed = pointsConfigUpdateSchema.parse(body);
  const { configId } = await params;

  return runAdminApi(async () =>
    getAdminServices().pointsService.update(configId, parsed)
  );
}

export async function DELETE(
  _req: Request,
  {
    params,
  }: { params: Promise<{ competitionId: string; configId: string }> }
) {
  const { configId } = await params;
  return runAdminApi(async () => getAdminServices().pointsService.delete(configId));
}
