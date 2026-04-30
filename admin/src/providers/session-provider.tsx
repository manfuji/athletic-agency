"use client";

import { SupabaseAuthProvider } from "@/providers/supabase-auth";
import React from "react";

const SessionWrapper = ({ children }: { children: React.ReactNode }) => {
  return <SupabaseAuthProvider>{children}</SupabaseAuthProvider>;
};

export default SessionWrapper;
