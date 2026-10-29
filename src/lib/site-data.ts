import type { MarqueeRow, MarqueeTile } from "@/components/site/ImageMarquee";
import type { Page, Product } from "./supabase/types";

/**
 * 前台数据访问层
 * 统一封装前台页面的数据获取，Supabase 不可用（未配置环境变量/网络异常）
 * 时自动降级到内置占位数据，保证开发阶段页面可预览。
 * 上线后移除 fallback 不会影响任何功能。
 */

/* =============================================================
   Fallback 数据（与 supabase/seed.sql 保持一致）
   ============================================================= */

export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "fb-01",
    title: "Organic Cotton Jersey Tee",
    slug: "organic-cotton-jersey-tee",
    description:
      "Heavyweight 220gsm organic cotton jersey. Garment-dyed, pre-shrunk, with a relaxed fit. Ideal for private label basics programs.",
    category: "apparel",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1600&q=80",
    ],
    cover_image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1600&q=80",
    materials: ["100% GOTS Organic Cotton"],
    moq: 500,
    price_range: "$3.8 - $5.2 / pc",
    featured: true,
    published: true,
    sort_order: 1,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "fb-02",
    title: "Eco-Certified Knit Polo",
    slug: "eco-certified-knit-polo",
    description:
      "Pique knit polo in recycled polyester blend. Oeko-Tex certified, quick-dry finish, custom embroidery ready.",
    category: "knit",
    images: [
      "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=1600&q=80",
    ],
    cover_image:
      "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=1600&q=80",
    materials: ["65% Recycled Polyester", "35% Cotton"],
    moq: 800,
    price_range: "$6.5 - $8.9 / pc",
    featured: true,
    published: true,
    sort_order: 2,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "fb-03",
    title: "Selvedge Denim Jacket",
    slug: "selvedge-denim-jacket",
    description:
      "Classic trucker jacket in 14oz selvedge denim. Sanforized, contrast stitching, branded hardware.",
    category: "denim",
    images: [
      "https://images.unsplash.com/photo-1521093470119-a3ac39643369?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=1600&q=80",
    ],
    cover_image:
      "https://images.unsplash.com/photo-1521093470119-a3ac39643369?auto=format&fit=crop&w=1600&q=80",
    materials: ["14oz Selvedge Denim"],
    moq: 300,
    price_range: "$18.0 - $24.0 / pc",
    featured: false,
    published: true,
    sort_order: 3,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "fb-04",
    title: "Relaxed Woven Shirt",
    slug: "relaxed-woven-shirt",
    description:
      "Relaxed-fit woven shirt in Tencel and organic linen blend. Breathable, wrinkle-resistant, perfect for warm climates.",
    category: "woven",
    images: [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1600&q=80",
    ],
    cover_image:
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1600&q=80",
    materials: ["60% Tencel", "40% Organic Linen"],
    moq: 400,
    price_range: "$9.5 - $12.8 / pc",
    featured: false,
    published: true,
    sort_order: 4,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "fb-05",
    title: "Performance Track Jacket",
    slug: "performance-track-jacket",
    description:
      "Lightweight 3-layer bonded shell for performance outerwear lines. Water-resistant, breathable membrane, taped seams.",
    category: "outerwear",
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1600&q=80",
    ],
    cover_image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1600&q=80",
    materials: ["100% Recycled Nylon"],
    moq: 600,
    price_range: "$14.0 - $19.5 / pc",
    featured: true,
    published: true,
    sort_order: 5,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "fb-06",
    title: "Brushed Fleece Hoodie",
    slug: "brushed-fleece-hoodie",
    description:
      "330gsm brushed-back fleece hoodie. Drop shoulder, double-layer hood, kangaroo pocket. Heavyweight streetwear staple.",
    category: "apparel",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1600&q=80",
    ],
    cover_image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1600&q=80",
    materials: ["80% Cotton", "20% Recycled Polyester"],
    moq: 500,
    price_range: "$11.0 - $15.0 / pc",
    featured: false,
    published: true,
    sort_order: 6,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

export const FALLBACK_PAGES: Record<string, Page> = {
  factory: {
    id: "fb-factory",
    slug: "factory",
    title: "Our Factory",
    hero_image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=2400&q=80",
    sections: [
      { type: "heading", content: "Vertically Integrated Production" },
      {
        type: "paragraph",
        content:
          "Our factories across Southeast Asia manage the full supply chain — from fabric sourcing and dyeing to cutting, sewing, finishing and quality control. This vertical integration gives us unmatched control over quality, lead time and cost.",
      },
      {
        type: "image",
        content:
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=2400&q=80",
        caption: "Sewing floor, 1,200 operators",
      },
      { type: "heading", content: "Capacity & Capability" },
      {
        type: "paragraph",
        content:
          "Monthly output exceeds 1.2 million pieces across six production lines. We specialize in medium to large-volume programs with full QC, packaging and logistics support.",
      },
    ],
    published: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  sustainability: {
    id: "fb-sustainability",
    slug: "sustainability",
    title: "Sustainability",
    hero_image:
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=2400&q=80",
    sections: [
      { type: "heading", content: "Sustainable Materials" },
      {
        type: "paragraph",
        content:
          "We source GOTS organic cotton, recycled polyester, Tencel and hemp. All fabrics are Oeko-Tex certified and traceable from fiber to finished garment.",
      },
      { type: "heading", content: "Clean Production" },
      {
        type: "paragraph",
        content:
          "Our dye houses use closed-loop water recycling systems, recovering 85% of wastewater. Solar panels cover 40% of factory rooftops, cutting grid dependency.",
      },
    ],
    published: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  "social-responsibility": {
    id: "fb-responsibility",
    slug: "social-responsibility",
    title: "Social Responsibility",
    hero_image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=2400&q=80",
    sections: [
      { type: "heading", content: "People First" },
      {
        type: "paragraph",
        content:
          "We employ over 3,800 workers across our facilities, with fair wages, dormitory housing, on-site clinics and free vocational training programs.",
      },
      { type: "heading", content: "Community Impact" },
      {
        type: "paragraph",
        content:
          "Annual community programs support local schools, clean water projects and women-led cooperatives in the regions where we operate.",
      },
    ],
    published: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
};

/* =============================================================
   数据获取（Supabase SSR，失败自动降级 fallback）
   ============================================================= */

async function supabaseReady(): Promise<boolean> {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function getProducts(): Promise<Product[]> {
  if (!(await supabaseReady())) return FALLBACK_PRODUCTS;

  try {
    const { createClient } = await import("./supabase/server");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return (data ?? []).length > 0 ? data : FALLBACK_PRODUCTS;
  } catch {
    return FALLBACK_PRODUCTS;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!(await supabaseReady())) {
    return FALLBACK_PRODUCTS.find((p) => p.slug === slug) ?? null;
  }

  try {
    const { createClient } = await import("./supabase/server");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch {
    return FALLBACK_PRODUCTS.find((p) => p.slug === slug) ?? null;
  }
}

export async function getPage(slug: string): Promise<Page | null> {
  if (!(await supabaseReady())) {
    return FALLBACK_PAGES[slug] ?? null;
  }

  try {
    const { createClient } = await import("./supabase/server");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;
    return data ?? FALLBACK_PAGES[slug] ?? null;
  } catch {
    return FALLBACK_PAGES[slug] ?? null;
  }
}

/** 站点品牌信息 */
export const SITE = {
  name: "YOLO APPAREL PTE. LTD.",
  tagline: "Apparel Manufacturing in Southeast Asia",
  email: "sales@meridianapparel.com",
  phone: "+84 28 3xxx xxxx",
  address: "Ho Chi Minh City, Vietnam · Phnom Penh, Cambodia",
} as const;

/* -------------------------------------------------------------
   首页视频墙：九段视频铺满整屏（2026-10-22 客户要求）
   ------------------------------------------------------------- */

/** 视频墙的一段素材 */
export interface ReelClip {
  id: string;
  /** 悬停时左下角的标注 */
  label: string;
  /** 主题，悬停时显示在右侧。四类：设计 / 版房 / 车间 / 成衣 / 人文 */
  theme: "Design" | "Pattern room" | "Production floor" | "Collection" | "People";
  src: string;
  /** 封面静帧。必须与视频内容同一画面（Mixkit 官方缩略图），不能用同主题杂图 */
  poster: string;
  alt: string;
}

/**
 * 首页视频墙（九宫格改版）。
 *
 * 【素材】Mixkit 免费商用（Free License，无需署名）。2026-10-23 起改为
 * **远程直链**（客户要求），不再放 public 里占仓库体积：
 * - 视频：https://assets.mixkit.co/videos/<id>/<id>-720.mp4
 * - 封面：https://assets.mixkit.co/videos/<id>/<id>-thumb-720-2.jpg（官方同帧缩略图）
 * ⚠️ 依赖第三方 CDN：Mixkit 改版或国内访问受阻时首屏只剩压暗的空格。
 *   2026-10-29 已按"未被引用的素材"清理删除本地旧 mp4/webp（合计 47MB）。
 *   若要回滚到本地播放，素材仍在 git 提交 30f2113 里，`git checkout 30f2113 -- public/media/home/mosaic`
 *   取回后把 src/poster 换成本地路径即可。
 *
 * 主题覆盖客户要求的四类：
 * - 成衣设计：development（设计工作室里打样）、sketch（纸样与面料）
 * - 版房：    measuring（软尺与布卷）、cutting（裁剪刀）
 * - 成衣工厂：stitching（机针细节）、sewing（缝制）、corridor（车间走廊）
 * - 人文关怀：team（团队的手）、corridor（一线工人）
 *
 * 【体积】远程模式下体积压力转移到 CDN 侧；页面 preload="none"，
 * 进站只拉九张封面 jpg（合计约 700KB），视频首次悬停才加载。
 */
export const HOME_REEL: readonly ReelClip[] = [
  {
    id: "development",
    label: "Sampling studio",
    theme: "Design",
    src: "https://assets.mixkit.co/videos/45750/45750-720.mp4",
    poster: "https://assets.mixkit.co/videos/45750/45750-thumb-720-2.jpg",
    alt: "Designer working at a sewing machine in a bright sampling studio",
  },
  {
    id: "measuring",
    label: "Measuring",
    theme: "Pattern room",
    src: "https://assets.mixkit.co/videos/35388/35388-720.mp4",
    poster: "https://assets.mixkit.co/videos/35388/35388-thumb-720-2.jpg",
    alt: "Measuring tape resting on rolls of fabric in a pattern room",
  },
  {
    id: "collection",
    label: "Finished goods",
    theme: "Collection",
    src: "https://assets.mixkit.co/videos/33167/33167-720.mp4",
    poster: "https://assets.mixkit.co/videos/33167/33167-thumb-720-2.jpg",
    alt: "Knitwear hanging in a row on a garment rail",
  },
  {
    id: "sketch",
    label: "Fabric selection",
    theme: "Design",
    src: "https://assets.mixkit.co/videos/21538/21538-720.mp4",
    poster: "https://assets.mixkit.co/videos/21538/21538-thumb-720-2.jpg",
    alt: "Hands comparing fabric swatches over a technical sketch",
  },
  {
    id: "stitching",
    label: "Stitching",
    theme: "Production floor",
    src: "https://assets.mixkit.co/videos/45527/45527-720.mp4",
    poster: "https://assets.mixkit.co/videos/45527/45527-thumb-720-2.jpg",
    alt: "Close-up of an industrial sewing machine needle stitching fabric",
  },
  {
    id: "corridor",
    label: "On the floor",
    theme: "People",
    src: "https://assets.mixkit.co/videos/23378/23378-720.mp4",
    poster: "https://assets.mixkit.co/videos/23378/23378-thumb-720-2.jpg",
    alt: "Worker in overalls walking down a factory corridor",
  },
  {
    id: "team",
    label: "Our team",
    theme: "People",
    src: "https://assets.mixkit.co/videos/35959/35959-720.mp4",
    poster: "https://assets.mixkit.co/videos/35959/35959-thumb-720-2.jpg",
    alt: "Team members joining hands in a circle",
  },
  {
    id: "cutting",
    label: "Cutting",
    theme: "Pattern room",
    src: "https://assets.mixkit.co/videos/14776/14776-720.mp4",
    poster: "https://assets.mixkit.co/videos/14776/14776-thumb-720-2.jpg",
    alt: "Scissors cutting through blue fabric on a cutting table",
  },
  {
    id: "sewing",
    label: "Sewing line",
    theme: "Production floor",
    src: "https://assets.mixkit.co/videos/12525/12525-720.mp4",
    poster: "https://assets.mixkit.co/videos/12525/12525-thumb-720-2.jpg",
    alt: "Hands guiding a shirt under a sewing machine needle",
  },
];

/**
 * 视频墙正中那格的白底主介绍（2026-10-23）。
 *
 * 客户要求：把最中间那格视频换成"主要介绍"，白底黑字。
 * 这里放的是**全页唯一的 h1**——所以文案要能独立回答问题"你是谁、做什么"，
 * 不要写成口号。lead 那句（A Southeast Asia based apparel group…）
 * 仍然留在下面的公司介绍里做详述，这里只给最短的一版。
 */
/** 视频墙正中主介绍的结构 */
export interface ReelIntro {
  eyebrow: string;
  headline: string;
  body: string;
  links: readonly { readonly href: string; readonly label: string }[];
}

export const HOME_REEL_INTRO: ReelIntro = {
  eyebrow: "Vertically integrated",
  headline: "From your sketch to a shipped container.",
  body: "Own factories across China, Cambodia, Laos, Myanmar and Egypt — design, fabric, fit and logistics in one team.",
  links: [
    { href: "/products", label: "See what we make" },
    { href: "/factory", label: "Inside our factories" },
  ],
};

/* -------------------------------------------------------------
   案例图墙：三列流式图片 + 钉在中屏的大字（2026-10-23）
   ------------------------------------------------------------- */

export interface ShowcaseShot {
  src: string;
  alt: string;
  /** CSS aspect-ratio，如 "4 / 5"。三列流式靠它拉开高低错落 */
  ratio: string;
}

/**
 * 案例图墙的图。
 *
 * 【素材来源】全部复用已经本地化的现有图片（拼贴静帧 / 视频海报 / 首屏帧），
 * 不额外下载——它们本来就是同一批占位素材。客户拿到真实素材后，
 * 换掉 src 即可，组件不用动。
 *
 * 【为什么每张都写 ratio】三列流式（CSS columns）里，图片必须有确定高度，
 * 否则图片未加载完时列高会跳，正在滚动的文字会跟着抖。
 */
export const HOME_SHOWCASE: readonly ShowcaseShot[] = [
  { src: "/media/home/mosaic/45750.jpg", alt: "Designer working at a sewing machine in the sampling studio", ratio: "4 / 5" },
  { src: "/media/home/tile-production.jpg", alt: "Operators sewing garments on the production floor", ratio: "3 / 4" },
  { src: "/media/home/mosaic/33167.jpg", alt: "Knitwear hanging in a row on a garment rail", ratio: "3 / 4" },
  { src: "/media/home/mosaic/35388.jpg", alt: "Measuring tape resting on rolls of fabric", ratio: "1 / 1" },
  { src: "/media/home/tile-campaign.jpg", alt: "Finished shirts hanging against a plain wall", ratio: "4 / 5" },
  { src: "/media/home/mosaic/45527.jpg", alt: "Close-up of an industrial sewing machine needle", ratio: "16 / 11" },
  { src: "/media/home/mosaic/21538.jpg", alt: "Hands comparing fabric swatches over a technical sketch", ratio: "4 / 5" },
  { src: "/media/home/tile-materials.jpg", alt: "Rolls of fabric stacked on mill shelves", ratio: "4 / 3" },
  { src: "/media/home/mosaic/23378.jpg", alt: "Worker in overalls walking down a factory corridor", ratio: "4 / 5" },
  { src: "/media/home/tile-quality.jpg", alt: "Workers inspecting garments across an inspection table", ratio: "4 / 3" },
  { src: "/media/home/mosaic/35959.jpg", alt: "Team members joining hands in a circle", ratio: "1 / 1" },
  { src: "/media/home/tile-finishing.jpg", alt: "Pressed shirts hanging in a row before packing", ratio: "3 / 4" },
  { src: "/media/home/mosaic/14776.jpg", alt: "Scissors cutting through blue fabric", ratio: "4 / 3" },
  { src: "/media/home/tile-pattern.jpg", alt: "Paper pattern pieces laid out on a cutting table", ratio: "4 / 5" },
  { src: "/media/home/mosaic/12525.jpg", alt: "Hands guiding a shirt under a sewing machine needle", ratio: "3 / 4" },
  { src: "/media/home/mosaic/45750.jpg", alt: "Sampling studio seen from the cutting table", ratio: "3 / 2" },
  { src: "/media/home/hero-campaign.jpg", alt: "Campaign image shot for an international brand", ratio: "16 / 9" },
];

/**
 * 图墙中间那句话。
 *
 * **按行写死**，不交给自动换行：白色副本被裁在图墙的框里，黑色副本铺满整幅，
 * 只有当某一行比图墙更宽时，行尾行首才会露到图墙外面变成黑色。
 * 自动换行会随视口宽度变来变去，黑白分界就时有时无；写死行宽才能稳定出现。
 */
export const HOME_SHOWCASE_HEADLINE: readonly string[] = [
  "Every piece here was patterned,",
  "cut and sewn in our own",
  "factories.",
];

/** 首页 Welcome 深色带 */
export const HOME_WELCOME = {
  eyebrow: "Welcome",
  /** 一句话主张：先说"我们是谁"，不要一上来就报业务范围 */
  lead: "A vertically integrated apparel group — 16+ own factories, four design centres, one chain from yarn to shipment.",
  /** 正文拆成两段，比原来一整段更易读 */
  body: [
    "We develop and manufacture apparel for international brands: fabric development, design and sampling, bulk production, quality assurance and shipment — all inside the group.",
    "Own factories across China, Cambodia, Laos, Myanmar and Egypt mean no trading middlemen between your brand and the sewing floor: one team owns the fabric, the fit, the audit and the lead time.",
  ],
  /** 能力清单：右侧排成编号索引，口径取自公司介绍册的产品分类 */
  capabilities: [
    "Down & padded outerwear",
    "Trench & bomber",
    "Shirts & jackets",
    "PU & faux leather",
    "Knitwear & cashmere",
    "Yarn & fabric R&D",
  ],
  /** 关键数字：册子里有明确事实的三个（不编产能） */
  stats: [
    { label: "Own factories", value: "16+" },
    { label: "Production countries", value: "5" },
    { label: "Design centres", value: "4" },
  ],
} as const;

/** 清单分组顺序：总部 → 设计 → 销售 → 生产 */
export const OFFICE_GROUPS: readonly { role: OfficeRole; label: string }[] = [
  { role: "hq", label: "Headquarters" },
  { role: "design", label: "Design studio" },
  { role: "sales", label: "Sales centres" },
  { role: "production", label: "Production" },
];

/** 地图区块的标题与汇总口径 */
export const GLOBAL_FOOTPRINT = {
  eyebrow: "Global footprint",
  title: "Where we work.",
  summary: "2 continents · 5 countries · 16+ factories",
} as const;

/* =============================================================
   合作品牌
   ============================================================= */

export interface PartnerBrand {
  name: string;
  /** 品牌标识文件，放 public/media/brands/ */
  logo: string;
}

/**
 * 合作品牌清单。
 *
 * 素材来源：
 * - 矢量（nike / zara / underarmour / jordan）：Simple Icons，CC0，单色
 * - converse / lacoste / abercrombie：Wikimedia Commons / Wikipedia 的官方 SVG
 * - 其余 13 个：从客户 PPT 截图裁切、去红框、透明底处理
 *
 * ⚠ 品牌标识是商标，展示需在合作合同里有授权约定。
 */
export const PARTNER_BRANDS: readonly PartnerBrand[] = [
  { name: "Nike", logo: "/media/brands/nike.svg" },
  { name: "Zara", logo: "/media/brands/zara.svg" },
  { name: "Costco", logo: "/media/brands/costco.png" },
  { name: "Levi's", logo: "/media/brands/levis.png" },
  { name: "Under Armour", logo: "/media/brands/underarmour.svg" },
  { name: "Mango", logo: "/media/brands/mango.png" },
  { name: "Lacoste", logo: "/media/brands/lacoste.svg" },
  { name: "Abercrombie & Fitch", logo: "/media/brands/abercrombie.svg" },
  { name: "Jordan", logo: "/media/brands/jordan.svg" },
  { name: "Converse", logo: "/media/brands/converse.svg" },
  { name: "Max&Co.", logo: "/media/brands/maxco.png" },
  { name: "Weekend MaxMara", logo: "/media/brands/weekend-maxmara.png" },
  { name: "Marella", logo: "/media/brands/marella.png" },
  { name: "Pennyblack", logo: "/media/brands/pennyblack.png" },
  { name: "iBlues", logo: "/media/brands/iblues.png" },
  { name: "Gaudì", logo: "/media/brands/gaudi.png" },
  { name: "Ellesse", logo: "/media/brands/ellesse.png" },
  { name: "U.S. Polo Assn.", logo: "/media/brands/us-polo.png" },
  { name: "Springfield", logo: "/media/brands/springfield.png" },
  { name: "Stanley", logo: "/media/brands/stanley.png" },
];

export const PARTNERS_INTRO = {
  eyebrow: "Clients & partners",
  title: "Brands we sew for.",
  /**
   * 合作品牌区块的两段说明（2026-10-22 参考 Primesource 的 Global Brands 改版）。
   * 左侧文案栏 + 右侧标识墙的版式需要两段正文，比原来一句 note 更像"能力介绍"。
   * 内容只写已经在前台别处出现过的口径，不新增承诺。
   */
  /* 不写死数量：标识增减时文案会立刻变错。牌子数量在上方信任带的
     "Brands served" 里已经有统计，这里不必重复。 */
  lead: "Italian, French and American labels — Weekend Max Mara, Max&Co., GAUDI, U.S. Polo Assn., Lacoste, Nike — from high-street volume programmes to technically difficult small runs.",
  body: "Four design centres in Hangzhou, Spain, Paris and New York keep the range close to the market; 16+ own factories keep lead time in our hands.",
  cta: { label: "Inside our factories", href: "/factory" },
} as const;

/* =============================================================
   产品页：品类说明 / 跑马灯 / 产能
   ============================================================= */

/** 产品页：生产品类说明（等宽三列，作为目录的延伸） */
export const PRODUCT_CAPABILITIES = [
  {
    index: "01",
    name: "Knit & Jersey",
    body: "Single and double jersey, pique, fleece and french terry. Circular knitting partners with in-house garment dyeing and wash development.",
  },
  {
    index: "02",
    name: "Woven & Twill",
    body: "Poplin, twill, canvas and linen blends. Automated cutting, matching and full-piece pressing for a clean finish.",
  },
  {
    index: "03",
    name: "Denim & Washes",
    body: "Selvedge and stretch denim with laser whiskering, ozone and e-flow finishing for low-water wash programmes.",
  },
  {
    index: "04",
    name: "Bonded & Technical",
    body: "Seam-sealed shells, taped seams, 3-layer lamination and stretch membranes for performance outerwear lines.",
  },
  {
    index: "05",
    name: "Intimates & Seamless",
    body: "Santoni seamless machines, bonded edges and soft-touch knits for loungewear and intimates collections.",
  },
  {
    index: "06",
    name: "Trims & Packaging",
    body: "Custom labels, hangtags, woven patches, polybags and retail-ready folding — all coordinated under one order.",
  },
] as const;

/**
 * 产品页：图片跑马灯两行。
 * 图源直接取自产品数据（cover_image + images 去重），不维护独立的静态图集。
 */
export function buildProductMarquee(products: Product[]): MarqueeRow[] {
  const tiles: MarqueeTile[] = [];

  for (const product of products) {
    // cover_image 常常等于 images[0]，去重后按原顺序保留
    const sources = [product.cover_image, ...product.images].filter(
      (src, index, all): src is string =>
        Boolean(src) && all.indexOf(src) === index
    );

    for (const src of sources) {
      tiles.push({
        src,
        href: `/products/${product.slug}`,
        alt: product.title,
      });
    }
  }

  if (tiles.length === 0) return [];

  /* 分两行、时长不同以免节奏整齐划一；行数由 durations.length 决定，图按奇偶交替分配 */
  const durations = [40, 54];
  return durations
    .map((duration, rowIndex) => ({
      duration,
      images: tiles.filter((_, i) => i % durations.length === rowIndex),
    }))
    /* 图片极少时可能分不出两行，空行直接丢掉 */
    .filter((row) => row.images.length > 0);
}

/**
 * 产能数据（产品页顶部数据条仍在使用）。
 *
 * 口径来自两家柬埔寨工厂的资料：S-YOLO 7 万件/月 + SHCA 100 万件/年（≈8.3 万/月），
 * 合计约 15 万件/月，取整写 150k。工厂页有自己的 FACTS 常量，两处口径保持一致。
 */
export const FACTORY_STATS = [
  { label: "Monthly capacity", value: "150k pcs" },
  { label: "Production lines", value: "21" },
  { label: "Workforce", value: "1,400+" },
  { label: "Factory floor", value: "25,044 m²" },
] as const;

/* =============================================================
   全球布局（首页地图区块）
   ============================================================= */

export type OfficeRole = "hq" | "design" | "sales" | "production";

export interface OfficeNode {
  id: string;
  label: string;
  name: string;
  roles: readonly OfficeRole[];
  lon: number;
  lat: number;
  labelDx?: number;
  labelDy?: number;
  labelAnchor?: "start" | "middle" | "end";
  clusterRadius?: number;
  note?: string;
  /** 地理分区，给地图读数条用（不写国家名——name 已经是城市/国家了） */
  region?: string;
}

/** 全球站点（口径来自 2026-02 公司介绍册） */
export const GLOBAL_OFFICES: readonly OfficeNode[] = [
  /* 标签偏移是量出来的：准星臂长约 13 单位，标签必须让开准星本体，
     同时避开相邻站点。改准星尺寸要重新核对这组值（会撞字）。 */
  { id: "hangzhou", label: "Hangzhou", name: "Hangzhou", roles: ["hq", "design"],
    lon: 120.2, lat: 30.3, labelDx: 13, labelDy: 15, labelAnchor: "start",
    region: "East Asia" },
  { id: "spain", label: "Spain", name: "Spain", roles: ["design"],
    lon: -3.7, lat: 40.4, labelDx: -11, labelDy: 13, labelAnchor: "end",
    region: "Western Europe" },
  { id: "paris", label: "Paris", name: "Paris", roles: ["design", "sales"],
    lon: 2.35, lat: 48.86, labelDx: -9, labelDy: -11, labelAnchor: "end",
    region: "Western Europe" },
  { id: "new-york", label: "New York", name: "New York", roles: ["design", "sales"],
    lon: -74.0, lat: 40.7, labelDx: -11, labelDy: 13, labelAnchor: "end",
    region: "North America" },
  { id: "china-production", label: "China · 4 provinces", name: "China", roles: ["production"],
    lon: 117, lat: 33, clusterRadius: 30, labelDx: 0, labelDy: -42, labelAnchor: "middle",
    note: "Zhejiang · Jiangsu · Anhui · Jiangxi", region: "East Asia" },
  { id: "cambodia", label: "Cambodia", name: "Cambodia", roles: ["production"],
    lon: 104.9, lat: 12.6, labelDx: 11, labelDy: 15, labelAnchor: "start",
    region: "Southeast Asia" },
  { id: "laos", label: "Laos", name: "Laos", roles: ["production"],
    lon: 102.5, lat: 19.9, labelDx: 11, labelDy: -9, labelAnchor: "start",
    region: "Southeast Asia" },
  { id: "myanmar", label: "Myanmar", name: "Myanmar", roles: ["production"],
    lon: 96, lat: 19.8, labelDx: -11, labelDy: -9, labelAnchor: "end",
    region: "Southeast Asia" },
  { id: "egypt", label: "Egypt", name: "Egypt", roles: ["production"],
    lon: 30.8, lat: 26.8, labelDx: 11, labelDy: 13, labelAnchor: "start",
    region: "North Africa" },
];

/* =============================================================
   认证墙
   ============================================================= */

export interface CertificationItem {
  /** 简称，列表主行 */
  name: string;
  /** 全称或说明，主行下方的小字 */
  note?: string;
  /**
   * 官方标识文件路径，例如 "/media/certifications/gots.png"。
   *
   * 留空时渲染为文字条目。填充后自动改为「标识 + 名称」的排布，
   * 无需改组件。**标识是商标**，务必使用各认证机构品牌包里的原始文件，
   * 不要用网络上的截图或二次处理的版本。
   */
  logo?: string;
}

export interface CertificationGroup {
  label: string;
  items: readonly CertificationItem[];
}

/**
 * 首页认证墙。
 *
 * 标识文件来自客户 PPT 截图（902×513）的裁切：按连通域定位、逐个裁切，
 * 并把接近背景色的外围像素做透明处理，输出到 public/media/certifications/。
 *
 * ⚠ 这批 PNG 受原图分辨率限制（每个约 70–120px）。用于 56px 高的展示够用，
 * 但客户从 PPT 或认证机构品牌包导出原始文件后替换同名文件即可变清晰，
 * 不需要改代码。
 *
 * ⚠ 只放真实持有的认证。
 */
export const CERTIFICATION_WALL: {
  eyebrow: string;
  title: string;
  note: string;
  groups: readonly CertificationGroup[];
} = {
  eyebrow: "Certifications",
  title: "Audited, tested, traceable.",
  note: "Material and product certifications — factory audits are on the Factory page.",
  groups: [
    {
      label: "Plant fibre",
      items: [
        { name: "GOTS", note: "Global Organic Textile Standard", logo: "/media/certifications/gots.png" },
        { name: "OEKO-TEX®", note: "Standard 100 by OEKO-TEX", logo: "/media/certifications/oeko-tex.png" },
        { name: "BCI", note: "Better Cotton Initiative", logo: "/media/certifications/bci.png" },
        { name: "OCS 100", note: "Organic Content Standard", logo: "/media/certifications/organic-100.png" },
        { name: "OCS Blended", note: "Organic Content Standard", logo: "/media/certifications/organic-blended.png" },
      ],
    },
    {
      label: "Animal fibre",
      items: [
        { name: "RWS", note: "Responsible Wool Standard", logo: "/media/certifications/rws.png" },
        { name: "RMS", note: "Responsible Mohair Standard", logo: "/media/certifications/rms.png" },
        { name: "RAS", note: "Responsible Alpaca Standard", logo: "/media/certifications/ras.png" },
        { name: "Good Cashmere", note: "The Good Cashmere Standard", logo: "/media/certifications/good-cashmere.png" },
        { name: "ICCAW", note: "Animal welfare standard", logo: "/media/certifications/iccaw.png" },
      ],
    },
    {
      label: "Recycled & chemical",
      items: [
        { name: "GRS", note: "Global Recycled Standard", logo: "/media/certifications/grs.png" },
        { name: "RCS 100", note: "Recycled Claim Standard", logo: "/media/certifications/recycled-100.png" },
        { name: "RCS Blended", note: "Recycled Claim Standard", logo: "/media/certifications/recycled-blended.png" },
        { name: "Higg Index", note: "Cascale (formerly SAC)", logo: "/media/certifications/higg-index.png" },
        { name: "ICS", note: "Initiative for Compliance & Sustainability", logo: "/media/certifications/ics.png" },
      ],
    },
    {
      label: "Social responsibility",
      items: [
        { name: "amfori BSCI", note: "Business Social Compliance Initiative", logo: "/media/certifications/amfori-bsci.png" },
        { name: "SMETA", note: "Sedex Members Ethical Trade Audit", logo: "/media/certifications/smeta.png" },
        { name: "WRAP", note: "Worldwide Responsible Accredited Production", logo: "/media/certifications/wrap.png" },
        { name: "TÜV SÜD", note: "Independent inspection body", logo: "/media/certifications/tuv-sud.png" },
        { name: "ISO 14001", note: "Environmental management", logo: "/media/certifications/iso-14001.png" },
      ],
    },
  ],
};

/* =============================================================
   资质条（产品页与页脚共用）
   ============================================================= */

/**
 * **名字从认证墙里取，不另写一套。**
 *
 * 这三处原先各写各的：产品页 "BSCI Audited"、页脚 "BSCI Certified Partners"、
 * 认证墙 "amfori BSCI"——同一个认证三种叫法，买家会当成三件不同的事。
 * 现在只在这里点名，名字一律回 CERTIFICATION_WALL 查；写错名字直接抛错，
 * 不会静默降级成第三种说法。
 *
 * 必须定义在 CERTIFICATION_WALL 之后：模块顶层是顺序求值的，
 * 提前引用会撞上暂时性死区（TDZ）。
 */
const HIGHLIGHT_CERT_NAMES = [
  "GOTS",
  "OEKO-TEX®",
  "amfori BSCI",
  "WRAP",
  "GRS",
] as const;

const ALL_CERT_NAMES = CERTIFICATION_WALL.groups.flatMap((group) =>
  group.items.map((item) => item.name)
);

export const CERT_HIGHLIGHTS: readonly string[] = HIGHLIGHT_CERT_NAMES.map(
  (name) => {
    if (!ALL_CERT_NAMES.includes(name)) {
      throw new Error(
        `CERT_HIGHLIGHTS: "${name}" 不在 CERTIFICATION_WALL 里——资质条与认证墙的名字必须一致。`
      );
    }
    return name;
  }
);
