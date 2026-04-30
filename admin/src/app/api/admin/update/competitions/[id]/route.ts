import { getAdminServices } from "@/server/composition/adminServices";
import { requireAdminSession } from "@/server/auth/guard";
import { toHttpResponse } from "@/server/errors/serviceError";
import { jsonError, jsonOk } from "@/server/http/response";


/**
 * @swagger
 * /api/admin/update/competitions/{id}:
 *   post:
 *     summary: POST handler for /api/admin/update/competitions/{id}
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
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await params;
  try {
    const data = await getAdminServices().competitionService.updateFromRequest(
      id,
      req
    );
    return jsonOk(data);
  } catch (e) {
    return toHttpResponse(e, jsonError);
  }
}
