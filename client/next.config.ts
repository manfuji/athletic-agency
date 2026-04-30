import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 100],
    remotePatterns: [
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
