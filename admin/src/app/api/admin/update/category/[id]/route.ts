import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { categoryBodySchema } from "@/server/schemas/category";


/**
 * @swagger
 * /api/admin/update/category/{id}:
 *   put:
 *     summary: PUT handler for /api/admin/update/category/{id}
 *     description: Auto-generated swagger documentation.
 *     tags:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = categoryBodySchema.parse(body);

  return runAdminApi(async () =>
    getAdminServices().categoryService.update(id, parsed)
  );
}
