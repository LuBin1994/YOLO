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

/* =============================================================
   静态展示内容（不进数据库）
   与 Primesource 式版式配套：Welcome 带、能力清单、品类卡片、
   工厂工艺步骤、资质条。后台不可编辑，改文案直接改本文件。
   ============================================================= */

/** 首页双拼 Banner 两栏 */
export const HOME_BANNERS = [
  {
    eyebrow: "Officially Licensed Manufacturing",
    title: "PRIVATE LABEL",
    cta: { label: "Explore", href: "/products" },
    image:
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1600&auto=format",
    strip: "Full Package Service",
  },
  {
    eyebrow: "AW26 Program Open",
    title: "SEASONAL",
    cta: { label: "Explore", href: "/contact" },
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format",
    strip: "AW26 Launching Soon",
  },
] as const;

/** 首页 Welcome 深色带 */
export const HOME_WELCOME = {
  heading: "Welcome",
  body: "YOLO APPAREL PTE. LTD. is a Southeast Asia based apparel group offering complete manufacturing solutions — from concept, design and fabric sourcing through production, quality assurance and final shipment. We operate our own factories, which means no trading middlemen between your brand and the sewing floor.",
  /** 右侧大号排印：直接把能力清单当图形 */
  lead: [
    "Sourcing and Manufacturing /",
    "Design Support /",
    "Performance Sportswear /",
    "Outerwear / Denim & Twill /",
    "Knitwear and Intimates",
  ],
} as const;

/** 首页品类卡片（等宽三列，两行共六项） */
export const HOME_CATEGORIES = [
  {
    name: "Activewear & Sportswear",
    body: "As a leading manufacturing partner, we build performance programs with top-tier fabric mills and in-house bonding lines.",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format",
  },
  {
    name: "Streetwear & Casualwear",
    body: "Unlock the potential of urban fashion with heavyweight jersey, garment dyeing and drop-shoulder constructions.",
    image:
      "https://images.unsplash.com/photo-1523398002811-999ca8dec234?q=80&w=1200&auto=format",
  },
  {
    name: "Outerwear",
    body: "Versatile outerwear designed to withstand all weather conditions — bonded shells, taped seams and insulated liners.",
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1200&auto=format",
  },
  {
    name: "Denim & Twill",
    body: "Innovative techniques and high-quality materials, ensuring each piece combines style and comfort for the modern consumer.",
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1200&auto=format",
  },
  {
    name: "Loungewear & Intimates",
    body: "Elevate your offerings with soft-touch knits, seamless constructions and considered finishing.",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format",
  },
  {
    name: "Babies & Childrenswear",
    body: "Products designed with comfort and practicality in mind, meeting the compliance standards of every target market.",
    image:
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=1200&auto=format",
  },
] as const;

/** 工厂页：四步工艺流程 */
export const FACTORY_PROCESS = [
  {
    step: "01",
    title: "Fabric Sourcing & Dyeing",
    body: "Direct relationships with mills across Vietnam, China and Taiwan. In-house dye houses running closed-loop water recycling.",
  },
  {
    step: "02",
    title: "Cutting & Spreading",
    body: "Automated cutting lines with CAD nesting, marker efficiency tracking and full fabric consumption reporting per order.",
  },
  {
    step: "03",
    title: "Sewing & Assembly",
    body: "Six production lines, 1,200 operators, modular workstations for knit, woven and bonded constructions.",
  },
  {
    step: "04",
    title: "QC, Finishing & Logistics",
    body: "AQL 2.5 inspection, in-line and final audits, third-party lab testing, pressing, packing and export documentation.",
  },
] as const;

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

/** 产品页：图片跑马灯两行（上行向左、下行向右，悬停暂停） */
export const PRODUCT_MARQUEE = [
  {
    duration: 40,
    images: [
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=900&auto=format",
      "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?q=80&w=900&auto=format",
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=900&auto=format",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=900&auto=format",
      "https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=900&auto=format",
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=900&auto=format",
    ],
  },
  {
    duration: 54,
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=900&auto=format",
      "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?q=80&w=900&auto=format",
      "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=900&auto=format",
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=900&auto=format",
      "https://images.unsplash.com/photo-1523398002811-999ca8dec234?q=80&w=900&auto=format",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=900&auto=format",
    ],
  },
] as const;

/** 工厂页：产能与资质数据 */
export const FACTORY_STATS = [
  { label: "Monthly Capacity", value: "1.2M+ pcs" },
  { label: "Production Lines", value: "6 lines" },
  { label: "Workforce", value: "3,800+ staff" },
  { label: "Facility Area", value: "42,000 m²" },
] as const;

/** 资质条（首页与工厂页共用） */
export const CERTIFICATIONS = [
  "GOTS",
  "Oeko-Tex Standard 100",
  "BSCI Audited",
  "WRAP Certified",
  "GRS Recycled",
] as const;
