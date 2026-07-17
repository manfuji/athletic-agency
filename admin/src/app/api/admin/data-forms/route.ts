import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { createFormSchema } from "@/server/schemas/dataForm";

export async function GET() {
  return runAdminApi(async () => getAdminServices().dataFormService.list(), {
    roles: ["admin"],
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = createFormSchema.parse(body);

  return runAdminApi(
    async (session) =>
      getAdminServices().dataFormService.create(session, {
        title: parsed.title,
        description: parsed.description ?? null,
        access_type: parsed.access_type,
        is_active: parsed.is_active,
        fields: parsed.fields,
      }),
    { roles: ["admin"] }
  );
}
