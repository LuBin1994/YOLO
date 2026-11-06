/**
 * 产品分类：树状多级。
 *
 * 【2026-11-06 从静态常量化成数据库表】
 * 之前分类是 `product-categories.ts` 里写死的两级数组，后台表单又另写了一套
 * `["apparel","knit",...]` —— 两套完全对不上（后台选"服装"，前台按
 * kids-jacket 这类 slug 筛），这是客户截图里那个问题的根因。
 * 现在**唯一来源是 `yolo.categories` 表**：后台维护，前台读英文名。
 * 2026-11-06 二次清理：连 `FALLBACK_CATEGORIES` 静态兜底也删了 ——
 * 客户在后台新建的分类（如 KNIT / PANTS 系列）不能被一份写死的数组顶掉，
 * 读库失败就给空数组 + 日志，宁可少显示也不拿旧数据冒充。
 *
 * 【products.category 存什么】
 * 存分类的 **slug**（不是 id）。原因：
 *   1. 产品数据（现已在 yolo.products）一直用 slug，换 id 要全量重写；
 *   2. slug 可读，日志和 SQL 直接看得懂；
 *   3. 靠外键 `products.category → categories.slug` 保证引用完整性，
 *      改 slug 走 `on update cascade` 自动同步。
 *
 * 【商品可以挂在任意一级】
 * 所以过滤不能再用 `category.startsWith("kids-")` 这种前缀猜层级 ——
 * 改成按 parent_id 走祖先链（`isUnder`）。前缀只是 slug 的生成习惯，
 * 不是语义，靠它判断层级在加了第三级之后就会错。
 */

/** 一行分类（与 yolo.categories 对应） */
export interface Category {
  id: string;
  parent_id: string | null;
  /** 唯一；products.category 存的就是它 */
  slug: string;
  /** 后台显示用 */
  name_zh: string;
  /** 前台显示用 */
  name_en: string;
  sort_order: number;
}

export type CategoryLang = "zh" | "en";

/** 树节点：在原行基础上带深度与子节点 */
export interface CategoryNode extends Category {
  depth: number;
  children: CategoryNode[];
}

function bySortOrder(a: Category, b: Category): number {
  return a.sort_order - b.sort_order || a.name_en.localeCompare(b.name_en);
}

/**
 * 平表 → 树。**孤儿节点**（parent_id 指向不存在的行）会被提到根级，
 * 而不是丢掉 —— 数据出错时宁可多显示一个根分类，也别让整棵子树消失。
 */
export function buildCategoryTree(rows: readonly Category[]): CategoryNode[] {
  const nodes = new Map<string, CategoryNode>();
  for (const row of rows) nodes.set(row.id, { ...row, depth: 0, children: [] });

  const roots: CategoryNode[] = [];
  for (const node of nodes.values()) {
    const parent = node.parent_id ? nodes.get(node.parent_id) : undefined;
    if (parent && parent.id !== node.id) parent.children.push(node);
    else roots.push(node);
  }

  const sortDeep = (list: CategoryNode[], depth: number) => {
    list.sort(bySortOrder);
    for (const node of list) {
      node.depth = depth;
      sortDeep(node.children, depth + 1);
    }
  };
  sortDeep(roots, 0);
  return roots;
}

/** 树 → 深度优先平铺（下拉框、表格都用这个顺序） */
export function flattenCategoryTree(tree: readonly CategoryNode[]): CategoryNode[] {
  const out: CategoryNode[] = [];
  const walk = (list: readonly CategoryNode[]) => {
    for (const node of list) {
      out.push(node);
      walk(node.children);
    }
  };
  walk(tree);
  return out;
}

/**
 * 一次索引，反复查询。
 *
 * 产品页要在 89 个产品上反复判断"属不属于某个分类"，每条都去遍历平表
 * 就是 O(n·m)。这里把父子关系预先算成 Map，判断降成几次 map 查找。
 */
export interface CategoryIndex {
  rows: readonly Category[];
  tree: CategoryNode[];
  /** 深度优先平铺，带 depth，用于缩进渲染 */
  flat: CategoryNode[];
  bySlug: Map<string, Category>;
  byId: Map<string, Category>;
  /** 自身 → 根，长度 ≥ 1（找不到时为空数组） */
  ancestorsOf(slug: string): Category[];
  /** slug 是否为 target 的子孙或自身 */
  isUnder(slug: string, target: string): boolean;
  /** target 及其全部子孙的 slug */
  subtreeSlugs(target: string): string[];
  /** 单个节点名 */
  nameOf(slug: string, lang?: CategoryLang): string;
  /** 从根到自身的名字路径，如 "Kids · Jackets" */
  pathOf(slug: string, lang?: CategoryLang, separator?: string): string;
}

export function createCategoryIndex(rows: readonly Category[]): CategoryIndex {
  const bySlug = new Map<string, Category>();
  const byId = new Map<string, Category>();
  for (const row of rows) {
    bySlug.set(row.slug, row);
    byId.set(row.id, row);
  }

  const tree = buildCategoryTree(rows);
  const flat = flattenCategoryTree(tree);

  const ancestorsOf = (slug: string): Category[] => {
    const chain: Category[] = [];
    const seen = new Set<string>();
    let current = bySlug.get(slug);
    while (current && !seen.has(current.id)) {
      seen.add(current.id);
      chain.push(current);
      current = current.parent_id ? byId.get(current.parent_id) : undefined;
    }
    return chain;
  };

  const subtreeSlugs = (target: string): string[] => {
    const out = [target];
    /* 分类树很小（十几个节点），递归遍历比维护子索引更省心 */
    for (const node of flat) {
      if (node.slug === target) continue;
      if (ancestorsOf(node.slug).some((a) => a.slug === target)) out.push(node.slug);
    }
    return out;
  };

  const nameOf = (slug: string, lang: CategoryLang = "en"): string => {
    const row = bySlug.get(slug);
    if (!row) return slug;
    return lang === "zh" ? row.name_zh : row.name_en;
  };

  return {
    rows,
    tree,
    flat,
    bySlug,
    byId,
    ancestorsOf,
    isUnder: (slug, target) => ancestorsOf(slug).some((a) => a.slug === target),
    subtreeSlugs,
    nameOf,
    pathOf: (slug, lang = "en", separator = " · ") => {
      const chain = ancestorsOf(slug);
      if (chain.length === 0) return slug;
      return chain
        .reverse()
        .map((c) => (lang === "zh" ? c.name_zh : c.name_en))
        .join(separator);
    },
  };
}

/**
 * 同一个数组引用只建一次索引。
 *
 * 产品卡片是一个一个渲染的（一页 89 张），每张都从头建树就是 89 次白工。
 * 调用方通常把同一个 categories 数组按引用传下来，WeakMap 正好命中；
 * 数据变了就是新数组，缓存自然失效，不需要手工清。
 */
const indexCache = new WeakMap<readonly Category[], CategoryIndex>();

export function getCategoryIndex(rows: readonly Category[]): CategoryIndex {
  const hit = indexCache.get(rows);
  if (hit) return hit;
  const index = createCategoryIndex(rows);
  indexCache.set(rows, index);
  return index;
}

/**
 * 分类数据缺失（读库失败 / 产品挂在一个已被删除的 slug 上）时，
 * 别把 `kids-jacket` 这种原始 slug 直接露给访客。
 * 只是**显示层兜底**，不参与筛选，也不伪造分类树。
 */
export function humanizeCategorySlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** 取英文名路径；找不到这个分类时退化成可读化的 slug */
export function categoryPathOf(
  index: CategoryIndex,
  slug: string,
  lang: CategoryLang = "en",
  separator = " · "
): string {
  if (!index.bySlug.has(slug)) return humanizeCategorySlug(slug);
  return index.pathOf(slug, lang, separator);
}

/**
 * 由英文名 + 父级生成 slug。
 * 有父级时自动带上前缀（`kids` + `jacket` → `kids-jacket`），
 * 与迁移前客户素材的命名习惯保持一致，也让 SQL 里能一眼看出归属。
 */
export function buildCategorySlug(nameEn: string, parentSlug?: string | null): string {
  const base = nameEn
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (!base) return "";
  if (!parentSlug) return base;
  /* 已经带了父级前缀就不重复加 */
  return base.startsWith(`${parentSlug}-`) ? base : `${parentSlug}-${base}`;
}

/**
 * `rootId` 及其全部子孙的 id 集合。
 *
 * 用于两件事：
 *   1. 编辑分类时禁止把父级设成自己或自己的子孙（跨层的环在数据库里是合法数据，
 *      check 约束只能挡"自己是自己的爹"，树构建一旦成环就会死循环）；
 *   2. 删除前判断"下面还有没有东西"。
 *
 * 纯函数、不依赖 next/server，所以后台接口和客户端组件都能用。
 */
export function collectDescendantIds(
  rows: readonly Category[],
  rootId: string
): Set<string> {
  const byParent = new Map<string, Category[]>();
  for (const row of rows) {
    if (!row.parent_id) continue;
    const list = byParent.get(row.parent_id) ?? [];
    list.push(row);
    byParent.set(row.parent_id, list);
  }

  const out = new Set<string>([rootId]);
  const stack = [rootId];
  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const child of byParent.get(current) ?? []) {
      if (out.has(child.id)) continue;
      out.add(child.id);
      stack.push(child.id);
    }
  }
  return out;
}

/** 后台表单/接口共用的字段校验（纯函数，返回可序列化的结果） */
export interface CategoryInput {
  slug: string;
  name_zh: string;
  name_en: string;
  parent_id: string | null;
  sort_order: number;
}

export function validateCategoryInput(
  body: Record<string, unknown>
): { ok: true; value: CategoryInput } | { ok: false; error: string } {
  const nameZh = String(body.name_zh ?? "").trim();
  const nameEn = String(body.name_en ?? "").trim();
  const parentId = String(body.parent_id ?? "").trim() || null;
  const rawSlug = String(body.slug ?? "").trim();

  if (!nameZh) return { ok: false, error: "中文名不能为空。" };
  if (!nameEn) return { ok: false, error: "英文名不能为空。" };

  const sortOrder = Number(body.sort_order);
  return {
    ok: true,
    value: {
      /* 空字符串表示"让后端按 上级slug + 英文名 生成"，见 buildCategorySlug */
      slug: rawSlug,
      name_zh: nameZh,
      name_en: nameEn,
      parent_id: parentId,
      sort_order: Number.isFinite(sortOrder) ? Math.trunc(sortOrder) : 0,
    },
  };
}

/* =============================================================
   前台多级筛选：纯函数，便于脱离 React 单测
   ============================================================= */

export interface CategoryFilterRow {
  /** 0 = 一级 tab，1 = 二级 chips，2 = 三级… */
  level: number;
  options: CategoryNode[];
}

/**
 * 按当前已选路径生成「应该显示哪几行筛选」。
 *
 * path[0] 是一级选中项，path[1] 是二级……，`"all"` 或 undefined 表示这一行选了 All。
 * 规则：从根开始，选中了某一项且它有子级，就再出一行；没选/选 All 就停。
 * 所以后台加第三级、第四级都不用改组件。
 *
 * 上限 12 层只是防御性护栏（脏数据导致 parent_id 成环时不会死循环）。
 */
export function buildFilterRows(
  index: CategoryIndex,
  path: readonly string[]
): CategoryFilterRow[] {
  const rows: CategoryFilterRow[] = [];

  for (let level = 0; level < 12; level += 1) {
    let options = index.tree;
    for (let i = 0; i < level; i += 1) {
      const parent = options.find((node) => node.slug === path[i]);
      if (!parent) return rows;
      options = parent.children;
    }

    if (options.length === 0) break;
    rows.push({ level, options });
    if (!path[level] || path[level] === "all") break;
  }

  return rows;
}

/**
 * 当前真正生效的筛选 slug = 路径里最深的一个非 All 项。
 * 用 `isUnder` 判包含子孙，所以商品挂在任意一级都能被它的祖先筛出来。
 */
export function activeSlugOf(path: readonly string[]): string {
  let active = "all";
  for (const slug of path) {
    /* 遇到第一处 All 就停，后面的深层选择不算数（正常交互产生不了，
       但 URL/状态被外部改坏时不该筛出一个和界面不一致的结果） */
    if (!slug || slug === "all") break;
    active = slug;
  }
  return active;
}

/** 点第 level 行的某项后，截断更深的选择并写入新值 */
export function selectAtPath(
  path: readonly string[],
  level: number,
  slug: string
): string[] {
  const next = path.slice(0, level);
  next[level] = slug;
  return next;
}
