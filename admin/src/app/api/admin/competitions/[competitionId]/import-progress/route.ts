import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";


/**
 * @swagger
 * /api/admin/competitions/{competitionId}/import-progress:
 *   get:
 *     summary: GET handler for /api/admin/competitions/{competitionId}/import-progress
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
  _req: Request,
  { params }: { params: Promise<{ competitionId: string }> }
) {
  const { competitionId } = await params;
  return runAdminApi(async () =>
    getAdminServices().competitionService.getImportProgress(competitionId)
  );
}
