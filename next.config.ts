import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 92],
  },
  async redirects() {
    return [{ source: "/reserving", destination: "/how-to-buy", permanent: true }];
  },
};

export default nextConfig;
