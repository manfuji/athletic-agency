import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { formFieldInputSchema } from "@/server/schemas/dataForm";
import { z } from "zod";

const fieldsSchema = z.object({
  fields: z.array(formFieldInputSchema),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;
  const body = await req.json();
  const parsed = fieldsSchema.parse(body);

  return runAdminApi(
    async () => getAdminServices().dataFormService.replaceFields(formId, parsed.fields),
    { roles: ["admin"] }
  );
}
