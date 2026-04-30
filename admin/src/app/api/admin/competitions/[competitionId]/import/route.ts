import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminMultipartApi } from "@/server/http/routeHelpers";


/**
 * @swagger
 * /api/admin/competitions/{competitionId}/import:
 *   post:
 *     summary: POST handler for /api/admin/competitions/{competitionId}/import
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
export async function POST(
  req: Request,
  { params }: { params: Promise<{ competitionId: string }> }
) {
  const { competitionId } = await params;
  return runAdminMultipartApi(req, async (_session, formData) =>
    getAdminServices().competitionService.importStats(
      competitionId,
      formData
    )
  );
}
