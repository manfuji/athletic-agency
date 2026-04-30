import { getAdminServices } from "@/server/composition/adminServices";
import { requireAdminSession } from "@/server/auth/guard";
import { toHttpResponse } from "@/server/errors/serviceError";
import { jsonError } from "@/server/http/response";


/**
 * @swagger
 * /api/admin/competitions/{competitionId}/players/export:
 *   post:
 *     summary: POST handler for /api/admin/competitions/{competitionId}/players/export
 *     description: Auto-generated swagger documentation.
 *     tags:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ competitionId: string }> }
) {
  const session = await requireAdminSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { competitionId } = await params;
  try {
    const csv = await getAdminServices().competitionService.exportPlayersCsv(
      competitionId
    );
    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="players-${competitionId}.csv"`,
      },
    });
  } catch (e) {
    return toHttpResponse(e, jsonError);
  }
}
