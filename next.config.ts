import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Railway corre el servidor Node liviano que genera Next (ver STACK.md)
  output: "standalone",
  cacheComponents: true,
  async redirects() {
    return [{ source: "/panel", destination: "/panel/agenda", permanent: false }];
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
