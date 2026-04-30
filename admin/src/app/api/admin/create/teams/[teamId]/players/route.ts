import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminMultipartApi } from "@/server/http/routeHelpers";


/**
 * @swagger
 * /api/admin/create/teams/{teamId}/players:
 *   post:
 *     summary: POST handler for /api/admin/create/teams/{teamId}/players
 *     description: Auto-generated swagger documentation.
 *     tags:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  return runAdminMultipartApi(req, async (_session, formData) =>
    getAdminServices().playerService.createForTeam(teamId, formData)
  );
}
