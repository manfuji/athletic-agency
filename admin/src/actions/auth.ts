"use server";

import { getPublicSiteUrl } from "@/lib/siteUrl";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ForgotPasswordResult = { ok: true } | { error: string };

export async function forgotPassword(
  email: string
): Promise<ForgotPasswordResult> {
  const trimmed = email.trim();
  if (!trimmed) {
    return { error: "Email is required" as const };
  }

  const base = getPublicSiteUrl();
  const redirectTo = `${base}/auth/callback?next=${encodeURIComponent("/auth/change-password")}`;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
    redirectTo,
  });

  if (error) {
    return { error: error.message };
  }

  return { ok: true as const };
}
