/**
 * @deprecated Prefer importing from @/server/http/response and @/server/auth/guard.
 * Kept for short relative imports from nested route folders.
 */
export { jsonOk, jsonError, notImplemented } from "@/server/http/response";
export { requireAdminSession } from "@/server/auth/guard";
