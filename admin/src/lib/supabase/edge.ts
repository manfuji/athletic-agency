import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Invoke a Supabase Edge Function from the server (service role).
 * Deploy functions in the Supabase project; name matches the function slug.
 */
export async function invokeSupabaseEdgeFunction<T = unknown>(
  functionName: string,
  options?: { body?: Record<string, unknown>; headers?: Record<string, string> }
) {
  const supabase = createSupabaseAdminClient();
  return supabase.functions.invoke<T>(functionName, {
    body: options?.body,
    headers: options?.headers,
  });
}
