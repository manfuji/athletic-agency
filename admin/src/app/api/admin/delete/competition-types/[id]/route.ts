import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";


/**
 * @swagger
 * /api/admin/delete/competition-types/{id}:
 *   delete:
 *     summary: DELETE handler for /api/admin/delete/competition-types/{id}
 *     description: Auto-generated swagger documentation.
 *     tags:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return runAdminApi(
    async () => getAdminServices().competitionTypeService.deleteType(id),
    { roles: ["admin"] }
  );
}
