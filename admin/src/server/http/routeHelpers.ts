import { ZodError } from "zod";
import { assertRole, requireAdminSession } from "@/server/auth/guard";
import { toHttpResponse } from "@/server/errors/serviceError";
import { jsonError, jsonOk } from "@/server/http/response";

type Session = NonNullable<Awaited<ReturnType<typeof requireAdminSession>>>;

export type RunAdminApiOptions = {
  /** If set, session user role must be one of these (e.g. ["admin"]). */
  roles?: readonly string[];
};

/**
 * Authenticated BFF handler: returns a JSON Response (success or error).
 */
export async function runAdminApi<T>(
  handler: (session: Session) => Promise<T>,
  options?: RunAdminApiOptions
): Promise<Response> {
  const session = await requireAdminSession();
  if (!session) return jsonError("Unauthorized", 401);

  if (options?.roles?.length && !assertRole(session, options.roles)) {
    return jsonError("Forbidden", 403);
  }

  try {
    const data = await handler(session);
    return jsonOk(data);
  } catch (e) {
    if (e instanceof ZodError) {
      const msg = e.errors.map((x) => x.message).join("; ") || "Invalid input";
      return jsonError(msg, 400);
    }
    return toHttpResponse(e, jsonError);
  }
}

/**
 * Same as runAdminApi but parses multipart FormData from the request body.
 */
export async function runAdminMultipartApi(
  req: Request,
  handler: (session: Session, formData: FormData) => Promise<unknown>,
  options?: RunAdminApiOptions
): Promise<Response> {
  const session = await requireAdminSession();
  if (!session) return jsonError("Unauthorized", 401);

  if (options?.roles?.length && !assertRole(session, options.roles)) {
    return jsonError("Forbidden", 403);
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return jsonError("Invalid multipart body", 400);
  }

  try {
    const data = await handler(session, formData);
    return jsonOk(data);
  } catch (e) {
    if (e instanceof ZodError) {
      const msg = e.errors.map((x) => x.message).join("; ") || "Invalid input";
      return jsonError(msg, 400);
    }
    return toHttpResponse(e, jsonError);
  }
}
