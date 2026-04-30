import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { competitionTypeCreateSchema } from "@/server/schemas/competitionType";


/**
 * @swagger
 * /api/admin/create/competition-types:
 *   post:
 *     summary: POST handler for /api/admin/create/competition-types
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
 *               name:
 *                 type: string
*     responses:
 *       200:
 *         description: Successful response
 */
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = competitionTypeCreateSchema.parse(body);

  return runAdminApi(
    async () =>
      getAdminServices().competitionTypeService.create(
        parsed.name,
        parsed.description
      ),
    { roles: ["admin"] }
  );
}
