import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";


/**
 * @swagger
 * /api/admin/delete/collator/{collatorId}:
 *   delete:
 *     summary: DELETE handler for /api/admin/delete/collator/{collatorId}
 *     description: Auto-generated swagger documentation.
 *     tags:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: collatorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ collatorId: string }> }
) {
  const { collatorId } = await params;
  return runAdminApi(
    async () => getAdminServices().collatorService.deleteCollator(collatorId),
    { roles: ["admin"] }
  );
}
