import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Server-side session + profile (matches prior NextAuth shape for BFF/UI). */
export type AppSession = {
  user: {
    id: string;
    email: string | null;
    first_name: string;
    last_name: string;
    role: string;
  };
  access_token: string;
};

export async function getServerAppSession(): Promise<AppSession | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name,last_name,role")
    .eq("id", user.id)
    .maybeSingle();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
      first_name: String(profile?.first_name ?? ""),
      last_name: String(profile?.last_name ?? ""),
      role: String(profile?.role ?? "admin"),
    },
    access_token: session?.access_token ?? "",
  };
}

export function assertRoleForSession(
  session: AppSession,
  allowed: readonly string[]
) {
  const role = session.user?.role;
  if (!role || !allowed.includes(role)) {
    return false;
  }
  return true;
}
