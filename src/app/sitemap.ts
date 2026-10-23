import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/site-data";
import { SITE_URL } from "@/lib/site-url";

/**
 * sitemap.xml
 *
 * 只收公开页面：后台、登录、API 都不进。
 * 产品详情页从数据库取（Supabase 不可用时 getProducts 会退到内置样例，
 * 所以这里不需要自己写 try/catch）。
 *
 * 优先级/更新频率按"改动频率"给，不按"重要性"堆 1.0：
 * 首页 1.0、产品列表 0.9、内容页 0.7、详情页 0.6。
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/factory`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/rnd`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/sustainability`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/responsibility`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.8 },
  ];

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await getProducts();
    productRoutes = products.map((p) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    /* 取不到产品就只交静态页，不要让整个 sitemap 挂掉 */
    productRoutes = [];
  }

  return [...staticRoutes, ...productRoutes];
}
