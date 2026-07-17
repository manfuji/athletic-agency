import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { updateFormSchema } from "@/server/schemas/dataForm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;
  return runAdminApi(async () => getAdminServices().dataFormService.getById(formId), {
    roles: ["admin"],
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;
  const body = await req.json();
  const parsed = updateFormSchema.parse(body);

  return runAdminApi(
    async () => getAdminServices().dataFormService.update(formId, parsed),
    { roles: ["admin"] }
  );
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;
  return runAdminApi(async () => getAdminServices().dataFormService.delete(formId), {
    roles: ["admin"],
  });
}
