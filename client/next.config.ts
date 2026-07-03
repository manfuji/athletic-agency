import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.dirname(fileURLToPath(import.meta.url));

function supabaseStorageRemotePattern(): {
  protocol: "https";
  hostname: string;
  pathname: string;
} | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return null;
  try {
    const { hostname } = new URL(raw);
    if (!hostname) return null;
    return {
      protocol: "https",
      hostname,
      pathname: "/storage/v1/object/public/**",
    };
  } catch {
    return null;
  }
}

const supabasePattern = supabaseStorageRemotePattern();

const nextConfig: NextConfig = {
  turbopack: {
    root: appRoot,
  },
  images: {
    qualities: [75, 100],
    remotePatterns: [
      ...(supabasePattern ? [supabasePattern] : []),
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "api.staging.theathleticagency.net",
      },
      {
        protocol: "https",
        hostname: "api.theathleticagency.net",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
      {
        protocol: "https",
        hostname: "theaa.lon1.cdn.digitaloceanspaces.com",
      },
      {
        protocol: "https",
        hostname: "aa-website-assets-prod.s3.eu-west-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "aa-website-assets-local.s3.eu-west-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
    ],
  },
};

export default nextConfig;
