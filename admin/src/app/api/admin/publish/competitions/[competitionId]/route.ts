import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { competitionPublishBodySchema } from "@/server/schemas/competition";


/**
 * @swagger
 * /api/admin/publish/competitions/{competitionId}:
 *   post:
 *     summary: POST handler for /api/admin/publish/competitions/{competitionId}
 *     description: Auto-generated swagger documentation.
 *     tags:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: competitionId
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
 *               isPublished:
 *                 type: string
*     responses:
 *       200:
 *         description: Successful response
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ competitionId: string }> }
) {
  const { competitionId } = await params;
  const body = await req.json();
  const parsed = competitionPublishBodySchema.parse(body);

  return runAdminApi(async () =>
    getAdminServices().competitionService.publish(
      competitionId,
      parsed.isPublished
    )
  );
}
