import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { createStageBodySchema } from "@/server/schemas/stage";


/**
 * @swagger
 * /api/admin/stage:
 *   get:
 *     summary: GET handler for /api/admin/stage
 *     description: Auto-generated swagger documentation.
 *     tags:
 *       - admin
 *     responses:
 *       200:
 *         description: Successful response
 */
export async function GET() {
  return runAdminApi(async () => getAdminServices().stageService.list());
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = createStageBodySchema.parse(body);

  return runAdminApi(async () =>
    getAdminServices().stageService.create(parsed)
  );
}
