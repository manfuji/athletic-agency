import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { parsePageFromUrl } from "@/server/schemas/pagination";


/**
 * @swagger
 * /api/admin/players/without-team:
 *   get:
 *     summary: GET handler for /api/admin/players/without-team
 *     description: Auto-generated swagger documentation.
 *     tags:
 *       - admin
 *     responses:
 *       200:
 *         description: Successful response
 */
export async function GET(req: Request) {
  const { page } = parsePageFromUrl(req.url);
  return runAdminApi(async () =>
    getAdminServices().playerService.listWithoutTeam(page)
  );
}
