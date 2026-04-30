import { getApiDocs } from '../../../lib/swagger';
import { NextResponse } from 'next/server';


/**
 * @swagger
 * /api/swagger:
 *   get:
 *     summary: GET handler for /api/swagger
 *     description: Auto-generated swagger documentation.
 *     tags:
 *       - swagger
 *     responses:
 *       200:
 *         description: Successful response
 */
export async function GET() {
  const spec = await getApiDocs();
  return NextResponse.json(spec);
}
