import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";


/**
 * @swagger
 * /api/admin/delete/fixture/{fixtureId}:
 *   delete:
 *     summary: DELETE handler for /api/admin/delete/fixture/{fixtureId}
 *     description: Auto-generated swagger documentation.
 *     tags:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: fixtureId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ fixtureId: string }> }
) {
  const { fixtureId } = await params;
  return runAdminApi(async () =>
    getAdminServices().matchService.deleteFixture(fixtureId)
  );
}
