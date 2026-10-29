import { SITE_URL } from "./site-url";

/** 面包屑：内页统一在右下角声明层级，Google 与 AI 检索都会用 */
export function breadcrumb(
  items: { name: string; path: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/** 组织信息：全站一份，放在根布局 */
export const ORGANIZATION_JSON_LD: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "YOLO APPAREL PTE. LTD.",
  alternateName: "YOLO APPAREL",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/og.jpg`,
  description:
    "Vertically integrated apparel manufacturer with 16+ own factories in China, Cambodia, Laos, Myanmar and Egypt. Down and padded outerwear, jackets, shirts, PU and knitwear for international brands.",
  slogan: "From your sketch to a shipped container.",
  areaServed: ["China", "Cambodia", "Laos", "Myanmar", "Egypt"],
  knowsAbout: [
    "Down jackets",
    "Padded outerwear",
    "Jackets and parkas",
    "Knitwear and cashmere",
    "Fabric development",
    "Apparel quality assurance",
    "SBTi greenhouse gas targets",
    "ZDHC chemical management",
  ],
  numberOfEmployees: { "@type": "QuantitativeValue", minValue: 1400 },
  /* 没有社交账号与公开电话前，这里不写 sameAs / contactPoint：
     结构化数据里塞占位信息，比空着更糟。 */
};

/** 站点：告诉检索方站名与语言 */
export const WEBSITE_JSON_LD: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "YOLO APPAREL PTE. LTD.",
  inLanguage: "en",
  publisher: { "@id": `${SITE_URL}/#organization` },
};
