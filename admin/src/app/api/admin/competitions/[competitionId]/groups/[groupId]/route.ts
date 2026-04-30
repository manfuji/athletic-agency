import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { groupUpdateBodySchema } from "@/server/schemas/group";

export async function PATCH(
  req: Request,
  {
    params,
  }: { params: Promise<{ competitionId: string; groupId: string }> }
) {
  const body = await req.json();
  const parsed = groupUpdateBodySchema.parse(body);
  const { groupId } = await params;

  return runAdminApi(async () =>
    getAdminServices().groupService.updateGroupSetup(groupId, parsed)
  );
}

export async function DELETE(
  _req: Request,
  {
    params,
  }: { params: Promise<{ competitionId: string; groupId: string }> }
) {
  const { groupId } = await params;
  return runAdminApi(async () => getAdminServices().groupService.deleteGroup(groupId));
}
