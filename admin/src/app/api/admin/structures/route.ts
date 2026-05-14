import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { createStructureBodySchema } from "@/server/schemas/structure";


/**
 * @swagger
 * /api/admin/structures:
 *   get:
 *     summary: GET handler for /api/admin/structures
 *     description: Auto-generated swagger documentation.
 *     tags:
 *       - admin
 *     responses:
 *       200:
 *         description: Successful response
 */
export async function GET() {
  return runAdminApi(async () =>
    getAdminServices().competitionService.listStructures()
  );
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = createStructureBodySchema.parse(body);

  return runAdminApi(async () =>
    getAdminServices().competitionService.createStructure(parsed)
  );
}
