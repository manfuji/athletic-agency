import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";


/**
 * @swagger
 * /api/admin/competitions:
 *   get:
 *     summary: GET handler for /api/admin/competitions
 *     description: Auto-generated swagger documentation.
 *     tags:
 *       - admin
 *     responses:
 *       200:
 *         description: Successful response
 */
export async function GET() {
  return runAdminApi(async (session) => {
    const service = getAdminServices().competitionService;
    if (session.user.role === "collator") {
      return service.listForCollatorUser(session.user.id);
    }
    return service.list();
  });
}
