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
  name: "Meridian Apparel Group",
  tagline: "Apparel Manufacturing in Southeast Asia",
  email: "sales@meridianapparel.com",
  phone: "+84 28 3xxx xxxx",
  address: "Ho Chi Minh City, Vietnam · Phnom Penh, Cambodia",
} as const;
