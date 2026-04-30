import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminMultipartApi } from "@/server/http/routeHelpers";


/**
 * @swagger
 * /api/admin/update/teams/{teamId}:
 *   post:
 *     summary: POST handler for /api/admin/update/teams/{teamId}
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
    getAdminServices().teamService.updateFromForm(teamId, formData)
  );
}
