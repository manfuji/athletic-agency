"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const getToken = async () => {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? "";
  } catch (error) {
    console.error("[getToken] Error reading session:", error);
    return "";
  }
};

export default getToken;
