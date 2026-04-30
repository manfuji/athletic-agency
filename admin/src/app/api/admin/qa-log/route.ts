import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { parsePageFromUrl } from "@/server/schemas/pagination";
import { z } from "zod";

const querySchema = z.object({
  table_name: z.string().optional().nullable(),
  record_id: z.string().uuid().optional().nullable(),
});

function parseFilters(url: string) {
  const u = new URL(url);
  return querySchema.parse({
    table_name: u.searchParams.get("table_name"),
    record_id: u.searchParams.get("record_id"),
  });
}

export async function GET(req: Request) {
  const { page } = parsePageFromUrl(req.url);
  const filters = parseFilters(req.url);

  return runAdminApi(
    async () =>
      getAdminServices().qaLogService.list({
        page,
        tableName: filters.table_name ?? null,
        recordId: filters.record_id ?? null,
      }),
    { roles: ["admin"] }
  );
}

