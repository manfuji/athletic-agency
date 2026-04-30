import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { positionBodySchema } from "@/server/schemas/position";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = positionBodySchema.partial().parse(body);
  return runAdminApi(
    async () => getAdminServices().positionService.update(Number(id), parsed),
    { roles: ["admin"] }
  );
}

