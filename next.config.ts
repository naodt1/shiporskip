import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // OG images read these at runtime; make sure they ship with the server bundle.
  outputFileTracingIncludes: { "/**": ["./assets/fonts/*.ttf"] },
};

export default nextConfig;
