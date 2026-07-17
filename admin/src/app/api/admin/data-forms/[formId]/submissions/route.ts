import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { submitFormSchema } from "@/server/schemas/dataForm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));

  return runAdminApi(
    async () => getAdminServices().dataFormService.listSubmissions(formId, page),
    { roles: ["admin"] }
  );
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;
  const body = await req.json();
  const parsed = submitFormSchema.parse(body);

  return runAdminApi(
    async (session) =>
      getAdminServices().dataFormService.submitPrivate(
        session,
        formId,
        parsed.answers
      ),
    { roles: ["admin"] }
  );
}
