import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";


/**
 * @swagger
 * /api/admin/competition-types:
 *   get:
 *     summary: GET handler for /api/admin/competition-types
 *     description: Auto-generated swagger documentation.
 *     tags:
 *       - admin
 *     responses:
 *       200:
 *         description: Successful response
 */
export async function GET() {
  return runAdminApi(async () =>
    getAdminServices().competitionTypeService.list()
  );
}
