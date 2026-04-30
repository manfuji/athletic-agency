import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { groupSetupBodySchema } from "@/server/schemas/group";


/**
 * @swagger
 * /api/admin/create/group-setup:
 *   post:
 *     summary: POST handler for /api/admin/create/group-setup
 *     description: Auto-generated swagger documentation.
 *     tags:
 *       - admin
  *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               group_name:
 *                 type: string
 *               team_id:
 *                 type: string
 *               competition_id:
 *                 type: string
 *               stage_id:
 *                 type: string
*     responses:
 *       200:
 *         description: Successful response
 */
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = groupSetupBodySchema.parse(body);

  return runAdminApi(async () =>
    getAdminServices().groupService.createGroupSetup(parsed)
  );
}
