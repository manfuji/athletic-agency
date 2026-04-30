import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { eventSeasonBodySchema } from "@/server/schemas/eventSeason";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = eventSeasonBodySchema.partial().parse(body);

  return runAdminApi(
    async () => getAdminServices().eventSeasonService.update(Number(id), parsed),
    { roles: ["admin"] }
  );
}

