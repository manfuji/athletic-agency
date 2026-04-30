import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { parsePageFromUrl } from "@/server/schemas/pagination";
import {
  legacyTableNameSchema,
  parseLegacyTableFiltersFromUrl,
  legacyTableUpdateBodySchema,
} from "@/server/schemas/legacyTable";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params;
  const parsedTable = legacyTableNameSchema.parse(table);
  const { page } = parsePageFromUrl(req.url);
  const filters = parseLegacyTableFiltersFromUrl(req.url);

  return runAdminApi(
    async () =>
      getAdminServices().legacyTableService.list({
        table: parsedTable,
        page,
        matchId: filters.match_id ?? null,
      }),
    { roles: ["admin"] }
  );
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params;
  const parsedTable = legacyTableNameSchema.parse(table);
  const body = await req.json();
  const parsed = legacyTableUpdateBodySchema.parse(body);

  return runAdminApi(
    async (session) =>
      getAdminServices().legacyTableService.update(
        session,
        parsedTable,
        parsed.id,
        parsed.patch,
        {
          issue_description: parsed.issue_description,
          evidence_reference: parsed.evidence_reference,
        }
      ),
    { roles: ["admin"] }
  );
}

