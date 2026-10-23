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
      // 首页拼贴格的款式图素材（Pexels License，免费商用）
      {
        protocol: "https",
        hostname: "images.pexels.com",
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
    /* 优化后的图片缓存一年：图片内容不变时，重复访问不该再回源 */
    minimumCacheTTL: 31536000,
  },

  /**
   * 静态资源缓存策略。
   *
   * Next 默认对 /public 下的文件给 `max-age=0, must-revalidate`，
   * 意味着 55MB 的视频和几十张车间图每次进站都要发条件请求。
   * 这里按"是否内容型资源"分开：
   * - /media/*：30 天强缓存（图片/视频/证书标识，基本不动）。
   * - /_next/static/*：构建产物带 hash，可以一年 immutable。
   *
   * 注意：/media 用了长缓存后，**替换同名文件不会立即生效**，
   * 需要换文件名（photo.jpg → photo-2.jpg）。这与项目里
   * "Next 图片优化按 URL 缓存"的既有约定一致。
   */
  async headers() {
    return [
      {
        source: "/media/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/:file(og.jpg|logo.png|llms.txt)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
