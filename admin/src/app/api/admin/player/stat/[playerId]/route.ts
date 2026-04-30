import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";


/**
 * @swagger
 * /api/admin/player/stat/{playerId}:
 *   get:
 *     summary: GET handler for /api/admin/player/stat/{playerId}
 *     description: Auto-generated swagger documentation.
 *     tags:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ playerId: string }> }
) {
  const { playerId } = await params;
  const fixtureId = new URL(req.url).searchParams.get("fixture_id");
  return runAdminApi(async () =>
    getAdminServices().matchService.getPlayerStat(playerId, fixtureId)
  );
}
