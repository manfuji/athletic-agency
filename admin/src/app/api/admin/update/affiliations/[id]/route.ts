import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { affiliationBodySchema } from "@/server/schemas/affiliation";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = affiliationBodySchema.partial().parse(body);
  return runAdminApi(
    async () => getAdminServices().affiliationService.update(Number(id), parsed),
    { roles: ["admin"] }
  );
}

