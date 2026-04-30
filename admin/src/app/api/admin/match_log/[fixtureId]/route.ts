import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { parsePageFromUrl } from "@/server/schemas/pagination";


/**
 * @swagger
 * /api/admin/match_log/{fixtureId}:
 *   get:
 *     summary: GET handler for /api/admin/match_log/{fixtureId}
 *     description: Auto-generated swagger documentation.
 *     tags:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: fixtureId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ fixtureId: string }> }
) {
  const { fixtureId } = await params;
  const { page } = parsePageFromUrl(req.url);
  return runAdminApi(async () =>
    getAdminServices().matchService.listMatchLogs(fixtureId, page)
  );
}
