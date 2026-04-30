import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { assignCollatorsBodySchema } from "@/server/schemas/collator";


/**
 * @swagger
 * /api/admin/assign-collator/{competitionId}:
 *   post:
 *     summary: POST handler for /api/admin/assign-collator/{competitionId}
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
 *               collators:
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
  const parsed = assignCollatorsBodySchema.parse(body);

  return runAdminApi(
    async () =>
      getAdminServices().collatorService.assignMany(
        competitionId,
        parsed.collators
      ),
    { roles: ["admin"] }
  );
}
