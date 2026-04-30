/**
 * Absolute site origin for Supabase email redirects (reset, confirm, OAuth).
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://admin.example.com).
 */
export function getPublicSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}

/** Path-only redirect target; avoids open redirects from query params. */
export function safeAuthNextPath(next: string | null): string {
  const n = (next ?? "/").trim();
  if (!n.startsWith("/") || n.startsWith("//")) return "/";
  return n;
}
