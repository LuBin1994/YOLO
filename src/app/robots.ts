import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

/**
 * robots.txt
 *
 * 两条策略：
 * 1. 后台与接口一律禁抓（/admin 需要登录，抓了只会浪费爬虫预算；
 *    /api 返回 JSON，不是页面）。
 * 2. **显式放行主流 AI 爬虫**。这是 GEO（生成式引擎优化）的前提：
 *    不少站点会在 robots 里一把禁掉 GPTBot / CCBot，结果是模型世界里
 *    根本不存在这个站。我们做的是 B2B 展示站，被 AI 引用是加分项。
 */
export default function robots(): MetadataRoute.Robots {
  const disallow = ["/admin", "/admin/", "/api/", "/login"];

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      // 检索型与训练型 AI 爬虫分开列，方便以后单独关掉某一类
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-Web",
          "PerplexityBot",
          "Google-Extended",
          "Applebot-Extended",
          "CCBot",
          "Bytespider",
          "Amazonbot",
        ],
        allow: "/",
        disallow,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
