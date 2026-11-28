import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // los paquetes de nexora se publican como TypeScript: Next los compila
  transpilePackages: ["@nexora/admin-sync", "@nexora/api", "@nexora/auth", "@nexora/commerce", "@nexora/media", "@nexora/state"],
  images: {
    localPatterns: [
      // fotos del catálogo inicial, en /public/products
      { pathname: "/products/**", search: "" },
      // fotos subidas desde el panel: /api/img?p=<entorno>/img/<archivo>
      { pathname: "/api/img" },
    ],
  },
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
