import primaryLogo from "@/../public/images/LOGO_PRIMARY.png";
import whiteLogo from "@/../public/images/LOGO_WHITE.png";

export const LOGO = {
  PRIMARY: primaryLogo,
  WHITE: whiteLogo,
};

function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

function ensureAbsoluteHttpOrigin(value: string, envName: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(
      `${envName} must be an absolute URL (e.g. https://api.example.com). Received: "${value}"`
    );
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(
      `${envName} must use http or https. Received protocol: "${parsed.protocol}"`
    );
  }

  return normalizeOrigin(value);
}

function resolveSportsApiOrigin(): string {
  const configured =
    process.env.NEXT_PUBLIC_SPORTS_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL;

  if (configured && configured.trim()) {
    return ensureAbsoluteHttpOrigin(configured, "NEXT_PUBLIC_SPORTS_API_URL");
  }

  throw new Error(
    "Missing sports API origin. Set NEXT_PUBLIC_SPORTS_API_URL (or NEXT_PUBLIC_API_URL) in client/.env.local."
  );
}

function resolveCmsApiOrigin(): string {
  const configured =
    process.env.NEXT_PUBLIC_CMS_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_CMS_NEWS_ENDPOINT;

  if (configured && configured.trim()) {
    return ensureAbsoluteHttpOrigin(configured, "NEXT_PUBLIC_CMS_API_URL");
  }

  // Fallback to sports origin when CMS is hosted behind the same gateway.
  return resolveSportsApiOrigin();
}

export const endpoint = resolveSportsApiOrigin();
export const cmsEndpoint = resolveCmsApiOrigin();

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${endpoint}${normalizedPath}`;
}

export function cmsUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${cmsEndpoint}${normalizedPath}`;
}
