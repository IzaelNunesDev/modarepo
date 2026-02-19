import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/u/**",
      },
      {
        protocol: "https",
        hostname: "grbbr6rcv2qm.compat.objectstorage.sa-saopaulo-1.oraclecloud.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "objectstorage.sa-saopaulo-1.oraclecloud.com",
        pathname: "/**",
      },
    ],
  },
  // For Render deployment
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
