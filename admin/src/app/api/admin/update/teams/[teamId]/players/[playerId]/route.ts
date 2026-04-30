import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminMultipartApi } from "@/server/http/routeHelpers";


/**
 * @swagger
 * /api/admin/update/teams/{teamId}/players/{playerId}:
 *   post:
 *     summary: POST handler for /api/admin/update/teams/{teamId}/players/{playerId}
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
export async function POST(
  req: Request,
  {
    params,
  }: { params: Promise<{ teamId: string; playerId: string }> }
) {
  const { teamId, playerId } = await params;
  return runAdminMultipartApi(req, async (_session, formData) =>
    getAdminServices().playerService.updateTeamPlayer(
      teamId,
      playerId,
      formData
    )
  );
}
