import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";


/**
 * @swagger
 * /api/admin/create/teams/{teamId}/players/{playerId}:
 *   patch:
 *     summary: PATCH handler for /api/admin/create/teams/{teamId}/players/{playerId}
 *     description: Auto-generated swagger documentation.
 *     tags:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
export async function PATCH(
  _req: Request,
  {
    params,
  }: { params: Promise<{ teamId: string; playerId: string }> }
) {
  const { teamId, playerId } = await params;
  return runAdminApi(async () =>
    getAdminServices().playerService.assignToTeam(teamId, playerId)
  );
}
