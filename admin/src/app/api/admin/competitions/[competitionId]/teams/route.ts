import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { parsePageFromUrl } from "@/server/schemas/pagination";


/**
 * @swagger
 * /api/admin/competitions/{competitionId}/teams:
 *   get:
 *     summary: GET handler for /api/admin/competitions/{competitionId}/teams
 *     description: Auto-generated swagger documentation.
 *     tags:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ competitionId: string }> }
) {
  const { competitionId } = await params;
  const { page } = parsePageFromUrl(req.url);

  return runAdminApi(async () =>
    getAdminServices().competitionService.listTeams(competitionId, page)
  );
}
