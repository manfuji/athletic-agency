import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { nationalityBodySchema } from "@/server/schemas/nationality";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = nationalityBodySchema.partial().parse(body);
  return runAdminApi(
    async () => getAdminServices().nationalityService.update(Number(id), parsed),
    { roles: ["admin"] }
  );
}

