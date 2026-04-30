import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { assignOneCollatorBodySchema } from "@/server/schemas/collator";


/**
 * @swagger
 * /api/admin/competitions/{competitionId}/collators:
 *   get:
 *     summary: GET handler for /api/admin/competitions/{competitionId}/collators
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
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ competitionId: string }> }
) {
  const { competitionId } = await params;
  return runAdminApi(
    async () =>
      getAdminServices().collatorService.listForCompetition(competitionId),
    { roles: ["admin"] }
  );
}


/**
 * @swagger
 * /api/admin/competitions/{competitionId}/collators:
 *   post:
 *     summary: POST handler for /api/admin/competitions/{competitionId}/collators
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
 *               collator_id:
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
  const parsed = assignOneCollatorBodySchema.parse(body);

  return runAdminApi(
    async () =>
      getAdminServices().collatorService.assignOne(
        competitionId,
        parsed.collator_id
      ),
    { roles: ["admin"] }
  );
}
