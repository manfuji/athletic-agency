import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";


/**
 * @swagger
 * /api/admin/delete/match_log/{logId}:
 *   delete:
 *     summary: DELETE handler for /api/admin/delete/match_log/{logId}
 *     description: Auto-generated swagger documentation.
 *     tags:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: logId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ logId: string }> }
) {
  const { logId } = await params;
  return runAdminApi(async () =>
    getAdminServices().matchService.deleteMatchLog(logId)
  );
}
