import type { NextConfig } from "next";

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
  images: {
    remotePatterns: [
      ...(supabasePattern ? [supabasePattern] : []),
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "api.staging.theathleticagency.net",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "api.theathleticagency.net",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
        pathname: "/24x18/**",
      },
      {
        protocol: "https",
        hostname: "aa-website-assets-prod.s3.eu-west-2.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "aa-website-assets-staging.s3.eu-west-2.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
