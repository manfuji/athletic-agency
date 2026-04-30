import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { parsePageFromUrl } from "@/server/schemas/pagination";
import { opsTableNameSchema, opsTableUpdateBodySchema } from "@/server/schemas/opsTable";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params;
  const parsedTable = opsTableNameSchema.parse(table);
  const { page } = parsePageFromUrl(req.url);

  return runAdminApi(
    async () => getAdminServices().opsTableService.list({ table: parsedTable, page }),
    { roles: ["admin"] }
  );
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params;
  const parsedTable = opsTableNameSchema.parse(table);
  const body = await req.json();
  const parsed = opsTableUpdateBodySchema.parse(body);

  return runAdminApi(
    async (session) =>
      getAdminServices().opsTableService.update(session, parsedTable, parsed.id, parsed.patch, {
        issue_description: parsed.issue_description,
        evidence_reference: parsed.evidence_reference,
      }),
    { roles: ["admin"] }
  );
}

