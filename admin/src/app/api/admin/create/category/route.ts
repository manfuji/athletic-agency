import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { categoryBodySchema } from "@/server/schemas/category";


/**
 * @swagger
 * /api/admin/create/category:
 *   post:
 *     summary: POST handler for /api/admin/create/category
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
 *               slug:
 *                 type: string
*     responses:
 *       200:
 *         description: Successful response
 */
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = categoryBodySchema.parse(body);

  return runAdminApi(async () =>
    getAdminServices().categoryService.create(parsed)
  );
}
