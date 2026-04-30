import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminMultipartApi } from "@/server/http/routeHelpers";


/**
 * @swagger
 * /api/admin/create/teams:
 *   post:
 *     summary: POST handler for /api/admin/create/teams
 *     description: Auto-generated swagger documentation.
 *     tags:
 *       - admin
 *     responses:
 *       200:
 *         description: Successful response
 */
export async function POST(req: Request) {
  return runAdminMultipartApi(req, async (_session, formData) =>
    getAdminServices().teamService.createFromForm(formData)
  );
}
