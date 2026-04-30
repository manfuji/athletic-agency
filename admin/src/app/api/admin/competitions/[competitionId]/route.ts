import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import {
  competitionStatusBodySchema,
  competitionStructurePatchSchema,
} from "@/server/schemas/competition";


/**
 * @swagger
 * /api/admin/competitions/{competitionId}:
 *   get:
 *     summary: GET handler for /api/admin/competitions/{competitionId}
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
  return runAdminApi(async () =>
    getAdminServices().competitionService.getById(competitionId)
  );
}


/**
 * @swagger
 * /api/admin/competitions/{competitionId}:
 *   put:
 *     summary: PUT handler for /api/admin/competitions/{competitionId}
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
 *               status:
 *                 type: string
*     responses:
 *       200:
 *         description: Successful response
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ competitionId: string }> }
) {
  const { competitionId } = await params;
  const body = await req.json();
  const parsed = competitionStatusBodySchema.parse(body);

  return runAdminApi(async () =>
    getAdminServices().competitionService.updateStatus(
      competitionId,
      parsed.status
    )
  );
}


/**
 * @swagger
 * /api/admin/competitions/{competitionId}:
 *   patch:
 *     summary: PATCH handler for /api/admin/competitions/{competitionId}
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
 *               status:
 *                 type: string
*     responses:
 *       200:
 *         description: Successful response
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ competitionId: string }> }
) {
  const { competitionId } = await params;
  const body = await req.json();
  const parsed = competitionStructurePatchSchema.parse(body);

  return runAdminApi(async () =>
    getAdminServices().competitionService.patchStructure(
      competitionId,
      parsed.structure_id
    )
  );
}
