import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";


/**
 * @swagger
 * /api/admin/delete/competitions/{competitionId}/teams/{teamId}:
 *   delete:
 *     summary: DELETE handler for /api/admin/delete/competitions/{competitionId}/teams/{teamId}
 *     description: Auto-generated swagger documentation.
 *     tags:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
export async function DELETE(
  _req: Request,
  {
    params,
  }: { params: Promise<{ competitionId: string; teamId: string }> }
) {
  const { competitionId, teamId } = await params;
  return runAdminApi(async () =>
    getAdminServices().competitionService.removeTeamFromCompetition(
      competitionId,
      teamId
    )
  );
}
