import { createBrowserClient } from "@supabase/ssr";
import { resolveSupabasePublishableKey } from "@/lib/supabase/publishableKey";

function requiredPublicUrl(): string {
  const v = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!v) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  return v;
}

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    requiredPublicUrl(),
    resolveSupabasePublishableKey()
  );
}

