import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

function redirectWithAuthCookies(
  url: URL,
  supabaseResponse: NextResponse
): NextResponse {
  const redirectResponse = NextResponse.redirect(url);
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });
  return redirectResponse;
}

export async function middleware(request: NextRequest) {
  const { supabaseResponse, supabase, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return supabaseResponse;
  }

  const publicRoutes = [
    "/auth/login",
    "/auth/reset-password",
    "/auth/verify-token",
    "/auth/change-password",
    "/auth/new-password",
    "/auth/callback",
    "/auth/setup-account",
  ];

  /** Logged-in users may still need these (e.g. recovery → set new password). */
  const publicRoutesKeepWhenAuthenticated = new Set([
    "/auth/callback",
    "/auth/change-password",
  ]);

  const collatorAllowedRoutes = [
    "/",
    "/setup-competition/[^/]+/results-and-standings",
    "/setup-competition/[^/]+/report-result/[^/]+",
  ];

  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthenticated = !!user;

  let userRole: string | undefined;
  if (user && supabase) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    userRole = prof?.role ? String(prof.role) : "admin";
  }

  if (!isAuthenticated && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return redirectWithAuthCookies(url, supabaseResponse);
  }

  if (
    isAuthenticated &&
    isPublicRoute &&
    !publicRoutesKeepWhenAuthenticated.has(pathname)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return redirectWithAuthCookies(url, supabaseResponse);
  }

  if (isAuthenticated && userRole === "collator") {
    const allowed = collatorAllowedRoutes.some((route) =>
      new RegExp(`^${route}$`).test(pathname)
    );
    if (!allowed) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return redirectWithAuthCookies(url, supabaseResponse);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
