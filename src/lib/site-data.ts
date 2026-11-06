import type { MarqueeRow, MarqueeTile } from "@/components/site/ImageMarquee";
import type { Product } from "./supabase/types";

/**
 * 前台数据访问层。
 *
 * 2026-11-06：产品目录已全部入 yolo.products、图片进了 yolo 存储桶，
 * **本地的 FALLBACK_PRODUCTS 与 public/media/products 已删除**。
 * 数据库连不上时返回空数组 / null，不再拿一份静态副本冒充在线数据 ——
 * 那份副本迟早和后台改过的内容对不上，让客户以为"改了没生效"。
 *
 * 代价要说清楚：Supabase 不可用时产品页会空、详情页会 404、分类筛选不出现。
 * 这是刻意的，所以 catch 里必须留下日志，别让故障静默。
 * **分类同样只从 `yolo.categories` 读**（2026-11-06 二次清理，静态兜底也删了）——
 * 后台新建的 KNIT / PANTS 系列必须立刻在前台出现，不能被写死的数组顶掉。
 */

import type { Category } from "./categories";

export type { Category };

/* =============================================================
   数据获取
   ============================================================= */

async function supabaseReady(): Promise<boolean> {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * 只在每个进程里报一次，避免数据库挂掉时每个请求都刷一行日志。
 * 不打印 error 对象里的凭据，只取 message。
 */
let dataFailureLogged = false;
function logDataFailure(where: string, error: unknown) {
  if (dataFailureLogged) return;
  dataFailureLogged = true;
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[site-data] ${where} 读取失败，页面将显示空数据：${message}`);
}

/**
 * 产品分类（树状多级），**唯一来源 `yolo.categories`**。
 *
 * 【为什么连静态兜底都不要】
 * 客户在后台新建分类后必须立刻在前台看见。一份写死的 `FALLBACK_CATEGORIES`
 * 会让"后台加了、前台没变"变成最难排查的那类问题 —— 页面还正常，只是少两个 tab。
 * 读库失败就返回空数组 + 日志，和产品数据的失败行为保持一致。
 *
 * 【排序】按 sort_order，同值再按英文名。树形结构由 `createCategoryIndex()`
 * 在用到的地方现建 —— 分类只有十几个节点，没必要为它单独开一次递归查询。
 */
export async function getCategories(): Promise<Category[]> {
  if (!(await supabaseReady())) {
    logDataFailure("getCategories", "缺少 Supabase 环境变量");
    return [];
  }

  try {
    const { createClient } = await import("./supabase/server");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, parent_id, slug, name_zh, name_en, sort_order")
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    logDataFailure("getCategories", error);
    return [];
  }
}

export async function getProducts(): Promise<Product[]> {
  if (!(await supabaseReady())) {
    logDataFailure("getProducts", "缺少 Supabase 环境变量");
    return [];
  }

  try {
    const { createClient } = await import("./supabase/server");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    logDataFailure("getProducts", error);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!(await supabaseReady())) {
    logDataFailure("getProductBySlug", "缺少 Supabase 环境变量");
    return null;
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
    /* 查不到就是 404，不再回退静态目录 —— 库里已经是唯一数据源 */
    return data ?? null;
  } catch (error) {
    logDataFailure("getProductBySlug", error);
    return null;
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
 * 首页视频墙（九宫格）。
 *
 * 【素材】2026-11-05 起换成**客户自有实拍**（桌面「首页视频」9 段），
 * 全部本地托管在 `/media/home/reel/`，不再依赖 Mixkit 远程 CDN：
 * - 视频 `<id>.mp4`：1280×720 / 30fps / 无音轨 / CRF 24 / faststart
 * - 封面 `<id>.jpg`：从压缩后的视频里抽帧，保证「封面 = 视频第一眼」
 *
 * 【压缩口径】（脚本 .workbuddy/artifacts/encode-reel.js）
 * 源素材 190MB（1080p/4K、9–33Mbps、带音轨）压到 **18.3MB**，缩 10.4 倍：
 * - 720p：播放面板最大 1180×664，1280×720 与显示尺寸 1:1，再高纯属浪费
 * - CRF 24：实测同段 CRF27→1.2MB / 25→1.6MB / 23→2.3MB；
 *   内容是深色织物纹理，27 在暗部有块效应，24 是画质与体积的平衡点
 * - fps 封顶 30：两段源是 60fps（分格压线 / 裁剪），都是慢速机器特写，
 *   30fps 看不出差别，体积却近乎减半
 * - 去音轨：整墙 muted，音轨纯属体积
 *
 * 【首屏代价】视频 `preload="none"`，进站只拉九张封面（合计 872KB），
 * 视频首次悬停才加载。
 *
 * 【id 不能改】VideoMosaic 的 LAYOUT 用它当网格坐标键（12 列 × 10 行里写死
 * col-start / row-start）。改 id 会让整面墙塌成自动流。
 *
 * 【格子比例差很大】（0.88–2.24），素材统一 16:9，靠 object-cover 裁。
 * 所以竖格分给「主体居中」的画面（裁剪 / 分格压线），横格分给全景
 * （厂房航拍 2.24 那格最宽、展厅全景 1.67 次之）。
 */
export const HOME_REEL: readonly ReelClip[] = [
  /* 顺序即数据顺序，但**落位由 LAYOUT 决定**，与这里的先后无关。 */
  {
    id: "development",
    label: "Showroom",
    theme: "Collection",
    src: "/media/home/reel/development.mp4",
    poster: "/media/home/reel/development.jpg",
    alt: "Wide view of the showroom floor lined with garment rails",
  },
  {
    id: "measuring",
    label: "Design studio",
    theme: "Design",
    src: "/media/home/reel/measuring.mp4",
    poster: "/media/home/reel/measuring.jpg",
    alt: "Designers reviewing samples on a tablet in the studio",
  },
  {
    id: "collection",
    label: "Kidswear range",
    theme: "Collection",
    src: "/media/home/reel/collection.mp4",
    poster: "/media/home/reel/collection.jpg",
    alt: "Colourful childrenswear jackets hanging on a rail",
  },
  {
    id: "sketch",
    label: "Fabric selection",
    theme: "Design",
    src: "/media/home/reel/sketch.mp4",
    poster: "/media/home/reel/sketch.jpg",
    alt: "Two people comparing fabric swatches against a wall of sketches",
  },
  {
    id: "stitching",
    label: "Our campus",
    theme: "People",
    src: "/media/home/reel/stitching.mp4",
    poster: "/media/home/reel/stitching.jpg",
    alt: "Aerial view of the factory campus and its rooftops",
  },
  {
    id: "corridor",
    label: "Quilting",
    theme: "Production floor",
    src: "/media/home/reel/corridor.mp4",
    poster: "/media/home/reel/corridor.jpg",
    alt: "Close-up of a quilting machine stitching padded fabric",
  },
  {
    id: "team",
    label: "Automated stitching",
    theme: "Production floor",
    src: "/media/home/reel/team.mp4",
    poster: "/media/home/reel/team.jpg",
    alt: "Automated template sewing machine stitching a panel",
  },
  {
    id: "cutting",
    label: "Cutting",
    theme: "Pattern room",
    src: "/media/home/reel/cutting.mp4",
    poster: "/media/home/reel/cutting.jpg",
    alt: "Hands cutting fabric with shears on a cutting table",
  },
  {
    id: "sewing",
    label: "On the floor",
    theme: "People",
    src: "/media/home/reel/sewing.mp4",
    poster: "/media/home/reel/sewing.jpg",
    alt: "Operator at a sewing machine smiling towards the camera",
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
  /* 2026-11-04 换成客户「首页展示图」文件夹的 11 张。
     源图 7 张 4:3 横（EXIF orientation=6，靠 `.rotate()` 转正成竖版）、
     4 张原生 4:3 横。压缩脚本 .workbuddy/artifacts/showcase-import/process.js。
     **ratio 是图片的真实比例**，三列流式靠它做高低错落，改图必须同步改这里。

     排列按**横竖交错**而不是按拍摄主题分组：全竖的排前面会让第三列只有三张、
     列高差一整张图，图墙底部空出一块。交错之后三列高度接近（列1/2 各 2竖2横、
     列3 三竖），底部基本齐平。 */
  { src: "/media/home/showcase/01.jpg", alt: "SYS Group showroom with fabric swatches and a presentation screen", ratio: "3 / 4" },
  { src: "/media/home/showcase/08.jpg", alt: "Sample room with development boards and garment rails", ratio: "4 / 3" },
  { src: "/media/home/showcase/02.jpg", alt: "Menswear rail and a full-length mirror in a boutique", ratio: "3 / 4" },
  { src: "/media/home/showcase/09.jpg", alt: "YOLO machinery display with a wall of colour swatches", ratio: "4 / 3" },
  { src: "/media/home/showcase/03.jpg", alt: "Model wearing a pink striped polo in a stockroom", ratio: "3 / 4" },
  { src: "/media/home/showcase/10.jpg", alt: "Close-up of a sewing machine stitching quilted fabric", ratio: "4 / 3" },
  { src: "/media/home/showcase/04.jpg", alt: "Model in a cream dress in front of an arched mirror", ratio: "3 / 4" },
  { src: "/media/home/showcase/11.jpg", alt: "Operator sewing a down jacket beside a rail of finished pieces", ratio: "4 / 3" },
  { src: "/media/home/showcase/05.jpg", alt: "Camel trench coat on a wooden hanger", ratio: "3 / 4" },
  { src: "/media/home/showcase/06.jpg", alt: "Down jackets in red, blue, black and cream on a rail", ratio: "3 / 4" },
  { src: "/media/home/showcase/07.jpg", alt: "MAX&Co. label inside a camel coat collar", ratio: "3 / 4" },
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
 * 合作品牌清单（2026-11-05 第二次全量替换）。
 *
 * 【素材】客户把桌面「品牌」文件夹重组成 1/2/3/4 四个子目录，共 28 个标识
 * （上一版 15 个已全部下掉，Mango 不在新素材里）。顺序按客户要求 =
 * **子目录名顺序 1 → 2 → 3 → 4**，目录内按 Windows 资源管理器的文件名序。
 *
 * 【加工】见 .workbuddy/artifacts/brand-import2/process.js。只动背景与四周空白，
 * 图形、比例、配色一律未改。抠底按"边缘中位色"自适应（不再是写死抠白），
 * 因为这一批里有黑底反白（Pennyblack）和黄底（Stanley）两种非白底。
 *
 * ⚠ 两处例外必须知道：
 *   - **Pennyblack** 客户给的是反白版（黑底白字）。22 个白底标识里放一块纯黑方砖
 *     无法和解，所以把明暗翻正（白字→近黑字），字形未动。
 *   - **Stanley** 客户给的是黄底黑字版，抠掉黄底只留黑字。
 * 两张都能一条命令改回原色。
 *
 * 【底色为什么必须是浅色】28 个里绝大多数是黑墨（Nike / Jordan / Converse /
 * Under Armour / Wrangler / Puma 系那一挂），黑标放黑底等于消失。
 *
 * ⚠ 品牌标识是商标，展示需在合作合同里有授权约定。
 */
export const PARTNER_BRANDS: readonly PartnerBrand[] = [
  /* 顺序 = 目录 1（Max Mara 系 + 意大利成衣） → 2（美国/运动/牛仔） →
     3（大卖场） → 4（快时尚）。**不要按视觉节奏重排**，客户明确要求按目录名走。 */
  { name: "Max&Co.", logo: "/media/brands/partners/maxco.png" },
  { name: "Weekend MaxMara", logo: "/media/brands/partners/weekend-maxmara.png" },
  { name: "U.S. Polo Assn.", logo: "/media/brands/partners/us-polo.png" },
  { name: "EMME", logo: "/media/brands/partners/emme.png" },
  { name: "Gaudì", logo: "/media/brands/partners/gaudi.png" },
  { name: "iBlues", logo: "/media/brands/partners/iblues.png" },
  { name: "Intrend", logo: "/media/brands/partners/intrend.png" },
  { name: "Marella", logo: "/media/brands/partners/marella.png" },
  { name: "Pennyblack", logo: "/media/brands/partners/pennyblack.png" },
  { name: "Armata di Mare", logo: "/media/brands/partners/armata-di-mare.png" },
  { name: "Conte of Florence", logo: "/media/brands/partners/conte-of-florence.png" },
  { name: "Refrigue", logo: "/media/brands/partners/refrigue.png" },
  { name: "Levi's", logo: "/media/brands/partners/levis.png" },
  { name: "Nike", logo: "/media/brands/partners/nike.png" },
  { name: "Lacoste", logo: "/media/brands/partners/lacoste.png" },
  { name: "Jordan", logo: "/media/brands/partners/jordan.png" },
  { name: "Abercrombie & Fitch", logo: "/media/brands/partners/abercrombie.png" },
  { name: "Bench.", logo: "/media/brands/partners/bench.png" },
  { name: "Buffalo", logo: "/media/brands/partners/buffalo.png" },
  { name: "Converse", logo: "/media/brands/partners/converse.png" },
  { name: "Under Armour", logo: "/media/brands/partners/underarmour.png" },
  { name: "Hurley", logo: "/media/brands/partners/hurley.png" },
  { name: "Stanley", logo: "/media/brands/partners/stanley.png" },
  { name: "Wrangler", logo: "/media/brands/partners/wrangler.png" },
  { name: "Walmart", logo: "/media/brands/partners/walmart.png" },
  { name: "Costco", logo: "/media/brands/partners/costco.png" },
  { name: "Scotch & Soda", logo: "/media/brands/partners/scotch-soda.png" },
  { name: "Zara", logo: "/media/brands/partners/zara.png" },
];

export const PARTNERS_INTRO = {
  eyebrow: "Clients & partners",
  title: "Brands we sew for.",
  /**
   * 合作品牌区块的两段说明。
   * 内容只写已经在前台别处出现过的口径，不新增承诺。
   */
  /* 不写死数量：标识增减时文案会立刻变错。牌子数量在上方信任带的
     "Brands served" 里已经有统计，这里不必重复。
     **换标识时必须回头核这段点名的牌子还在不在。**
     2026-11-04 那次去掉过 GAUDI；2026-11-05 客户的新素材里 Gaudì 又回来了。
     现存 28 个里，这里点到的六个（Weekend MaxMara / Max&Co. / U.S. Polo Assn.
     / Lacoste / Levi's / Nike）都在，所以这句仍然成立。 */
  lead: "Italian, French and American labels — Weekend MaxMara, Max&Co., U.S. Polo Assn., Lacoste, Levi's, Nike — from high-street volume programmes to technically difficult small runs.",
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

/* =============================================================
   首页氛围图（滚动图组专用）
   ============================================================= */

/** 只取三列，别把 89 条完整产品记录打进首页 */
export interface MoodProduct {
  slug: string;
  title: string;
  mood_image: string;
}

/** 取所有「发布了 + 有氛围图」的商品，供首页滚动图组使用 */
export async function getMoodProducts(): Promise<MoodProduct[]> {
  if (!(await supabaseReady())) {
    logDataFailure("getMoodProducts", "缺少 Supabase 环境变量");
    return [];
  }

  try {
    const { createClient } = await import("./supabase/server");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("slug, title, mood_image")
      .eq("published", true)
      .not("mood_image", "is", null)
      .neq("mood_image", "")
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return (data ?? []).filter(
      (row): row is MoodProduct =>
        typeof row.mood_image === "string" && row.mood_image.length > 0
    );
  } catch (error) {
    logDataFailure("getMoodProducts", error);
    return [];
  }
}

/**
 * 每个商品出**一张**氛围图格子，整格链到详情页。
 *
 * 【为什么有数量门槛】
 * ImageMarquee 的 fillLoop 会把不足 6 张的一行重复铺满视口。
 * 只有 1~2 个商品配了氛围图时，整条图墙会变成同一张图刷屏，比静态图组还差。
 * 所以：≥12 张出两行（每行各 6+ 张，零重复），6~11 张只出一行，
 * <6 张返回空数组由调用方回退到 HOME_MARQUEE 静态素材。
 * 行数随后台上传量自动增长，不用改代码。
 */
export const MOOD_TILES_PER_ROW = 6;

export function buildMoodMarquee(products: MoodProduct[]): MarqueeRow[] {
  if (products.length < MOOD_TILES_PER_ROW) return [];

  const tiles: MarqueeTile[] = products.map((p) => ({
    src: p.mood_image,
    href: `/products/${p.slug}`,
    alt: p.title,
  }));

  const rowCount = products.length >= MOOD_TILES_PER_ROW * 2 ? 2 : 1;
  const durations = [72, 88];

  return durations.slice(0, rowCount).map((duration, rowIndex) => ({
    duration,
    /* 奇偶交错：同系列/同款的氛围图不要挤在同一行相邻位置 */
    images: tiles.filter((_, i) => i % rowCount === rowIndex),
  }));
}


/**
 * 面料 / 工艺特写（2026-11-06 客户追加的 8 张）。
 *
 * 这批图**不是商品图**，是面料研发的实拍（皮革、格纹羊毛、涂层防泼水、针织）。
 * 因此不接商品详情，整格链到 R&D 页的「Fabric development」锚点（`/rnd#fabric`）。
 *
 * 【为什么单独一个常量、不塞进 HOME_MARQUEE】
 * 首页图带有两个数据源：有氛围图的商品（优先）或 HOME_MARQUEE（兜底）。
 * 只往 HOME_MARQUEE 里塞的话，客户一上传够 6 张氛围图，这 8 张就整批消失了。
 * 所以拆出来，由 `withFabricTiles()` 在选完数据源之后统一插进去 —— 两种模式下都在。
 *
 * 素材规格对齐 01–34.jpg：短边 760 / jpeg q82 / 白底拍平，合计 791KB。
 * 压缩脚本 `.workbuddy/artifacts/fabric-tiles/compress.mjs`。
 */
export const FABRIC_TILES: readonly MarqueeTile[] = [
  {
    src: "/media/home/marquee/fabric-01.jpg",
    href: "/rnd#fabric",
    alt: "Cracked and glazed leather surface, raking light",
  },
  {
    src: "/media/home/marquee/fabric-02.jpg",
    href: "/rnd#fabric",
    alt: "Caramel suede and vintage crackle leather swatches",
  },
  {
    src: "/media/home/marquee/fabric-03.jpg",
    href: "/rnd#fabric",
    alt: "Navy and brown check wool swatches",
  },
  {
    src: "/media/home/marquee/fabric-04.jpg",
    href: "/rnd#fabric",
    alt: "Leather colour card set in eight finishes",
  },
  {
    src: "/media/home/marquee/fabric-05.jpg",
    href: "/rnd#fabric",
    alt: "Wool check swatch strips fanned out by colourway",
  },
  {
    src: "/media/home/marquee/fabric-06.jpg",
    href: "/rnd#fabric",
    alt: "Water beading on a finished water-repellent shell",
  },
  {
    src: "/media/home/marquee/fabric-07.jpg",
    href: "/rnd#fabric",
    alt: "White cotton poplin with a mesh yoke under natural light",
  },
  {
    src: "/media/home/marquee/fabric-08.jpg",
    href: "/rnd#fabric",
    alt: "Pink rib knit jersey, folded",
  },
];

/**
 * 把面料特写均匀插进已有图带。
 *
 * 不追加到末尾：客户要的是「跟产品图混杂」。做法是按最终长度算出每张图的目标位，
 * 落位后剩下的槽位再按原顺序填空 —— 两层循环都只跑一遍，也不需要随机数
 * （随机会让 SSR 与客户端算出不同的顺序，直接 hydration 报错）。
 *
 * 多行时按 `index % rows.length` 分到各行，两行各自都散得开。
 */
export function withFabricTiles(
  rows: readonly MarqueeRow[]
): MarqueeRow[] {
  if (rows.length === 0) return [];

  return rows.map((row, rowIndex) => {
    const extra = FABRIC_TILES.filter((_, i) => i % rows.length === rowIndex);
    if (extra.length === 0) return row;

    const base = row.images.map((item) =>
      typeof item === "string" ? { src: item } : item
    );
    const total = base.length + extra.length;

    /* 目标落位：extra[k] 落在 (k+0.5)/extra.length 处，两端各留半格 */
    const slots = new Map<number, MarqueeTile>();
    extra.forEach((tile, k) => {
      let pos = Math.round(((k + 0.5) * total) / extra.length) - 1;
      /* 四舍五入撞位时顺延到下一个空槽，不能覆盖已有的图 */
      while (slots.has(pos)) pos = (pos + 1) % total;
      slots.set(Math.max(0, Math.min(total - 1, pos)), tile);
    });

    const merged: MarqueeTile[] = [];
    let cursor = 0;
    for (let slot = 0; slot < total; slot += 1) {
      const pinned = slots.get(slot);
      if (pinned) merged.push(pinned);
      else if (cursor < base.length) merged.push(base[cursor++]);
    }
    /* 极端情况下（槽位被挤到末尾）兜底补齐，宁可多一张也别丢图 */
    while (cursor < base.length) merged.push(base[cursor++]);

    /* 轨道变长后若沿用原时长，视觉速度会明显变快（位移相同、时间不变）。
       按格子数等比拉长，保证 px/s 不变 —— 加图不该让图带"跑起来"。 */
    const duration = row.duration
      ? Math.round((row.duration * merged.length) / base.length)
      : undefined;

    return { ...row, duration, images: merged };
  });
}

/**
 * 首页滚动图（2026-11-04 客户提供的静态素材）。
 *
 * 【现在是**兜底**，不是默认图源】
 * 2026-11-06 起首页优先取「有氛围图的商品」（见上方 buildMoodMarquee），
 * 每格链到商品详情；只有氛围图数量不足 / 读库失败时，才退回这套静态图，
 * 保证首页永远不是一条空白图带。
 *
 * 【素材】源图在桌面「首页滚动图」文件夹，34 张 1–4MB，
 * 用 sharp 压到短边 760px / q82，合计 3.6MB（脚本 .workbuddy/artifacts/marquee-import/process.js）。
 * 命名按源文件名排序编号 01–34，不带原始 UUID/WPS 前缀。
 *
 * 【为什么两行交错分配】
 * 源文件里有同款多角度（安德玛 1/2/3、耐克 1/2、乔丹 1）。按原顺序切两半会让
 * 同款挤在一起；改成奇偶交错，两组各自都散得开。
 */
export const HOME_MARQUEE: readonly MarqueeRow[] = [
  {
    /* 两行给不同时长，避免滚动节奏整齐划一 */
    duration: 72,
    images: [
      "/media/home/marquee/01.jpg",
      "/media/home/marquee/03.jpg",
      "/media/home/marquee/05.jpg",
      "/media/home/marquee/07.jpg",
      "/media/home/marquee/09.jpg",
      "/media/home/marquee/11.jpg",
      "/media/home/marquee/13.jpg",
      "/media/home/marquee/15.jpg",
      "/media/home/marquee/17.jpg",
      "/media/home/marquee/19.jpg",
      "/media/home/marquee/21.jpg",
      "/media/home/marquee/23.jpg",
      "/media/home/marquee/25.jpg",
      "/media/home/marquee/27.jpg",
      "/media/home/marquee/29.jpg",
      "/media/home/marquee/31.jpg",
    ],
  },
  {
    duration: 88,
    images: [
      "/media/home/marquee/02.jpg",
      "/media/home/marquee/04.jpg",
      "/media/home/marquee/06.jpg",
      "/media/home/marquee/08.jpg",
      "/media/home/marquee/10.jpg",
      "/media/home/marquee/12.jpg",
      "/media/home/marquee/14.jpg",
      "/media/home/marquee/16.jpg",
      "/media/home/marquee/18.jpg",
      "/media/home/marquee/20.jpg",
      "/media/home/marquee/22.jpg",
      "/media/home/marquee/24.jpg",
      "/media/home/marquee/26.jpg",
      "/media/home/marquee/28.jpg",
      "/media/home/marquee/30.jpg",
      "/media/home/marquee/32.jpg",
    ],
  },
];

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
  /** 标签相对**钉尖**的像素偏移（不是地图单位，见 GLOBAL_OFFICES 顶部注释） */
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
  /* 【labelDx / labelDy 是像素，不是地图单位】（2026-11-05 改）
     图钉 20×28px、标签 11px 都是固定像素，而地图随容器缩放；
     三者若用同一单位就必然对不上。改成 px 之后"文字离钉多远"是常数。
     钉尖落在坐标上、钉身向上长 28px，所以 labelDy 取正数就落到钉下方、
     负数要小于 -28 才在钉头上方。
     改图钉尺寸必须重核这组值（会撞字）。 */
  { id: "hangzhou", label: "Hangzhou", name: "Hangzhou", roles: ["hq", "design"],
    lon: 120.2, lat: 30.3, labelDx: 13, labelDy: -4, labelAnchor: "start",
    region: "East Asia" },
  { id: "spain", label: "Spain", name: "Spain", roles: ["design"],
    lon: -3.7, lat: 40.4, labelDx: -13, labelDy: 10, labelAnchor: "end",
    region: "Western Europe" },
  { id: "paris", label: "Paris", name: "Paris", roles: ["design", "sales"],
    lon: 2.35, lat: 48.86, labelDx: -8, labelDy: -34, labelAnchor: "end",
    region: "Western Europe" },
  { id: "new-york", label: "New York", name: "New York", roles: ["design", "sales"],
    lon: -74.0, lat: 40.7, labelDx: -13, labelDy: 10, labelAnchor: "end",
    region: "North America" },
  { id: "china-production", label: "China · 4 provinces", name: "China", roles: ["production"],
    lon: 117, lat: 33, clusterRadius: 30, labelDx: 0, labelDy: -50, labelAnchor: "middle",
    note: "Zhejiang · Jiangsu · Anhui · Jiangxi", region: "East Asia" },
  { id: "cambodia", label: "Cambodia", name: "Cambodia", roles: ["production"],
    lon: 104.9, lat: 12.6, labelDx: 11, labelDy: 12, labelAnchor: "start",
    region: "Southeast Asia" },
  /* Laos 的标签放**正上方居中**（0, -56, middle）。
     【为什么不放下方】老挝与柬埔寨只差 7.3 个纬度、2.4 个经度 —— 两枚钉在
     1312px 的地图上垂直只隔 27px、水平 8px，标签一搁到钉下方就落到缅甸那枚钉
     的脚下，读者会认成"缅甸"。
     【为什么不用 -34、-46】中国四省的虚线圈（半径 30 单位）左缘正好扫过老挝
     钉顶正上方；-46 时标签右端离圈左缘只剩 2px。抬到 -56 才有余量。 */
  { id: "laos", label: "Laos", name: "Laos", roles: ["production"],
    lon: 102.5, lat: 19.9, labelDx: 0, labelDy: -56, labelAnchor: "middle",
    region: "Southeast Asia" },
  { id: "myanmar", label: "Myanmar", name: "Myanmar", roles: ["production"],
    lon: 96, lat: 19.8, labelDx: -11, labelDy: -2, labelAnchor: "end",
    region: "Southeast Asia" },
  { id: "egypt", label: "Egypt", name: "Egypt", roles: ["production"],
    lon: 30.8, lat: 26.8, labelDx: 12, labelDy: 8, labelAnchor: "start",
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
