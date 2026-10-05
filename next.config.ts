import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite is only used for local development when no DATABASE_URL is set.
  serverExternalPackages: ["@electric-sql/pglite"],
  outputFileTracingExcludes: {
    "*": ["node_modules/@electric-sql/pglite/**"],
  },
};

export default nextConfig;
