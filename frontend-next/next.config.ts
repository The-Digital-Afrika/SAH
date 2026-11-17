import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/articles", destination: "/education", permanent: true },
      { source: "/category/education", destination: "/education", permanent: true },
      { source: "/category/development", destination: "/development", permanent: true },
      { source: "/category/parenting", destination: "/parenting", permanent: true },
      { source: "/category/partner-2", destination: "/partners", permanent: true },
      { source: "/category/cooking-bonding", destination: "/cooking-bonding", permanent: true },
      { source: "/category/cooking-and-bonding", destination: "/cooking-bonding", permanent: true },
      { source: "/category/ask-dalena", destination: "/ask-dalena", permanent: true },
    ];
  },
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cms.homeandschool.co.za",
      },
      {
        protocol: "https",
        hostname: "sahomeschooling.com",
      },
      {
        protocol: "https",
        hostname: "www.sahomeschooling.com",
      },
      {
        protocol: "https",
        hostname: "secure.gravatar.com",
      },
    ],
  },
};

export default nextConfig;
