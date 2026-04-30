import { invokeSupabaseEdgeFunction } from "@/lib/supabase/edge";
import { ServiceError } from "@/server/errors/serviceError";
import { runAdminApi } from "@/server/http/routeHelpers";
import { jsonError } from "@/server/http/response";

/**
 * BFF proxy for Supabase Edge Functions. POST JSON body is forwarded as the function body.
 */

/**
 * @swagger
 * /api/admin/edge/{name}:
 *   post:
 *     summary: POST handler for /api/admin/edge/{name}
 *     description: Auto-generated swagger documentation.
 *     tags:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
  *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
*     responses:
 *       200:
 *         description: Successful response
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  if (!name || !/^[a-zA-Z0-9_-]+$/.test(name)) {
    return jsonError("Invalid function name", 400);
  }

  return runAdminApi(async () => {
    const body = await req.json().catch(() => ({}));
    const { data, error } = await invokeSupabaseEdgeFunction(name, {
      body: typeof body === "object" && body !== null ? body : {},
    });
    if (error) throw new ServiceError(error.message, 502);
    return data;
  });
}
