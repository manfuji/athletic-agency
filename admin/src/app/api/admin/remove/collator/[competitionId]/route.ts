import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { removeCollatorBodySchema } from "@/server/schemas/collator";


/**
 * @swagger
 * /api/admin/remove/collator/{competitionId}:
 *   delete:
 *     summary: DELETE handler for /api/admin/remove/collator/{competitionId}
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
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ competitionId: string }> }
) {
  const { competitionId } = await params;
  const body = await req.json();
  const parsed = removeCollatorBodySchema.parse(body);

  return runAdminApi(
    async () =>
      getAdminServices().collatorService.removeFromCompetition(
        competitionId,
        parsed.collator_id
      ),
    { roles: ["admin"] }
  );
}
