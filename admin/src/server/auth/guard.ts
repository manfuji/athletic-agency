import {
  assertRoleForSession,
  getServerAppSession,
  type AppSession,
} from "@/lib/auth/server-session";

export type { AppSession };

export async function requireAdminSession(): Promise<AppSession | null> {
  return getServerAppSession();
}

export function assertRole(session: AppSession, allowed: readonly string[]) {
  return assertRoleForSession(session, allowed);
}
