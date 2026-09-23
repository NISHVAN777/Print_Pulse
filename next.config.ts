import type { NextConfig } from "next";

const publish = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(publish
    ? {
        output: "export",
        basePath: "/Print_Pulse",
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
