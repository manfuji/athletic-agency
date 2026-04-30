import { ServiceError } from "@/server/errors/serviceError";
import { getAdminServices } from "@/server/composition/adminServices";
import { runAdminApi } from "@/server/http/routeHelpers";


/**
 * @swagger
 * /api/admin/storage/upload:
 *   post:
 *     summary: POST handler for /api/admin/storage/upload
 *     description: Auto-generated swagger documentation.
 *     tags:
 *       - admin
  *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
*     responses:
 *       200:
 *         description: Successful response
 */
export async function POST(req: Request) {
  return runAdminApi(async () => {
    const formData = await req.formData().catch(() => null);
    if (!formData) throw new ServiceError("Invalid form data", 400);
    return getAdminServices().storageService.uploadFromForm(formData);
  });
}
