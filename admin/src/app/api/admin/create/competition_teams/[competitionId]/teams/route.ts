import { getAdminServices } from "@/server/composition/adminServices";
import { ServiceError } from "@/server/errors/serviceError";
import { runAdminApi } from "@/server/http/routeHelpers";


/**
 * @swagger
 * /api/admin/create/competition_teams/{competitionId}/teams:
 *   post:
 *     summary: POST handler for /api/admin/create/competition_teams/{competitionId}/teams
 *     description: Auto-generated swagger documentation.
 *     tags:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
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
export async function POST(
  req: Request,
  { params }: { params: Promise<{ competitionId: string }> }
) {
  const { competitionId } = await params;
  const body = (await req.json().catch(() => null)) as {
    team_id?: string;
  } | null;

  return runAdminApi(async () => {
    const teamId = body?.team_id;
    if (!teamId) throw new ServiceError("team_id is required", 400);
    return getAdminServices().competitionService.addExistingTeam(
      competitionId,
      teamId
    );
  });
}
