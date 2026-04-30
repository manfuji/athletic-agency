import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminMultipartApi } from "@/server/http/routeHelpers";


/**
 * @swagger
 * /api/admin/create/competitions/{competitionId}/teams:
 *   post:
 *     summary: POST handler for /api/admin/create/competitions/{competitionId}/teams
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
    getAdminServices().competitionService.createTeamInCompetition(
      competitionId,
      formData
    )
  );
}
