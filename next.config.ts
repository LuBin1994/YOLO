import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage（公开读的 media 存储桶）
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      // 开发阶段占位图（Unsplash），上线前移除
      {
        protocol: "https",
        hostname: "**.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
