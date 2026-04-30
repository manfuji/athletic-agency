"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/** Mirrors the fields the app read from NextAuth `session`. */
export type AppClientSession = {
  user: {
    id: string;
    email: string | null;
    first_name: string;
    last_name: string;
    role: string;
  };
  access_token: string;
};

type Status = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  data: AppClientSession | null;
  status: Status;
  update: (partial?: {
    user?: Partial<AppClientSession["user"]>;
  }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function SupabaseAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<AppClientSession | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  const load = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      setData(null);
      setStatus("unauthenticated");
      return;
    }
    const { data: prof } = await supabase
      .from("profiles")
      .select("first_name,last_name,role")
      .eq("id", session.user.id)
      .maybeSingle();
    setData({
      user: {
        id: session.user.id,
        email: session.user.email ?? null,
        first_name: String(prof?.first_name ?? ""),
        last_name: String(prof?.last_name ?? ""),
        role: String(prof?.role ?? "admin"),
      },
      access_token: session.access_token,
    });
    setStatus("authenticated");
  }, []);

  useEffect(() => {
    void load();
    const supabase = createSupabaseBrowserClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void load();
    });
    return () => subscription.unsubscribe();
  }, [load]);

  const update = useCallback(
    async (partial?: { user?: Partial<AppClientSession["user"]> }) => {
      if (partial?.user) {
        setData((prev) =>
          prev
            ? { ...prev, user: { ...prev.user, ...partial.user } }
            : null
        );
      }
      await load();
    },
    [load]
  );

  const value = useMemo(
    () => ({ data, status, update }),
    [data, status, update]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

/** Drop-in replacement for `useSession` from next-auth/react. */
export function useSession() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useSession must be used within SupabaseAuthProvider");
  }
  return {
    data: ctx.data,
    status: ctx.status,
    update: ctx.update,
  };
}

export async function signOut(options?: {
  redirect?: boolean;
  callbackUrl?: string;
}) {
  const supabase = createSupabaseBrowserClient();
  await supabase.auth.signOut();
  if (options?.redirect !== false) {
    if (typeof window !== "undefined") {
      window.location.href = options?.callbackUrl ?? "/auth/login";
    }
  }
}
