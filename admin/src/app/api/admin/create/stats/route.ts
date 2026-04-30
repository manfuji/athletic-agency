import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";


/**
 * @swagger
 * /api/admin/create/stats:
 *   post:
 *     summary: POST handler for /api/admin/create/stats
 *     description: Auto-generated swagger documentation.
 *     tags:
 *       - admin
  *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
*     responses:
 *       200:
 *         description: Successful response
 */
export async function POST(req: Request) {
  const body = (await req.json()) as Record<string, unknown>;
  return runAdminApi(async () =>
    getAdminServices().matchService.createStats(body)
  );
}
