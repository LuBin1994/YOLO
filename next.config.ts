import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 不暴露 X-Powered-By: Next.js
  poweredByHeader: false,

  /*
   * 局域网调试白名单（仅 dev 生效，生产构建不受影响）。
   *
   * 手机用本机 IP 访问 dev server 时，页面里带 Origin 头的 /_next/static/chunks/* 请求
   * 会被 Next.js 的跨源保护（block-cross-site-dev）判定为跨源并返回 403，
   * 结果是 React 无法 hydration —— 表现就是「手机上按钮点了完全没反应」。
   * 放行本机所在局域网段即可；换网络环境后按需调整这里。
   */
  allowedDevOrigins: ["192.168.31.223", "192.168.*.*", "10.*.*.*"],

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
