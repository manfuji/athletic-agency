import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";
import { registerCollatorBodySchema } from "@/server/schemas/collator";


/**
 * @swagger
 * /api/admin/register/collator:
 *   post:
 *     summary: POST handler for /api/admin/register/collator
 *     description: Auto-generated swagger documentation.
 *     tags:
 *       - admin
  *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               contact:
 *                 type: string
*     responses:
 *       200:
 *         description: Successful response
 */
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = registerCollatorBodySchema.parse(body);

  return runAdminApi(
    async () =>
      getAdminServices().collatorService.register({
        first_name: parsed.first_name,
        last_name: parsed.last_name,
        email: parsed.email,
        contact: parsed.contact ?? null,
      }),
    { roles: ["admin"] }
  );
}
