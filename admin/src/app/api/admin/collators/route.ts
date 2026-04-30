import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";


/**
 * @swagger
 * /api/admin/collators:
 *   get:
 *     summary: GET handler for /api/admin/collators
 *     description: Auto-generated swagger documentation.
 *     tags:
 *       - admin
 *     responses:
 *       200:
 *         description: Successful response
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  return runAdminApi(
    async () => getAdminServices().collatorService.list(status),
    { roles: ["admin"] }
  );
}
