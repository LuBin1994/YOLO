/**
 * 站点根地址。
 *
 * 部署到正式域名后设 `NEXT_PUBLIC_SITE_URL`（Vercel → Environment Variables），
 * 否则 canonical / og:url / sitemap 里会写成兜底域名。
 * 注意改完环境变量要重新部署，已有部署用的是旧快照。
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.yolo.rubindev.xyz"
).replace(/\/$/, "");

/** 把站内路径拼成绝对地址 */
export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
