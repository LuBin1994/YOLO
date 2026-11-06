/**
 * 把前台静态商品目录导进 Supabase：图片进 Storage，记录进 yolo.products。
 *
 * 源数据：.workbuddy/artifacts/product-import/products.json（89 条 / 130 张图的路径）
 *         （原始图片已在 2026-11-06 清理时删除，现只存在 yolo 存储桶里）
 *
 * 用法：
 *   1. 先在 SQL Editor 跑过 supabase/storage-yolo.sql（建 yolo 桶）
 *   2a. 全自动：把 service_role key 加进 .env.local 后
 *       node scripts/import-catalog.mjs
 *   2b. 不给密钥：只生成 SQL，自己在 Dashboard 里传图、再粘贴 SQL
 *       node scripts/import-catalog.mjs --sql
 *
 * ⚠️ 2026-11-06 导入完成后，仓库里的 public/media/products/** 已删除、静态
 *    FALLBACK_PRODUCTS 也已删除（数据以数据库为准）。所以**默认模式现在跑不了**：
 *    想要重跑，先从 yolo 桶把 130 张图下载回 public/media/products/<slug>/NN.jpg。
 *    `--sql` 模式不读图片文件，仍然可用。
 *
 * 【为什么需要 service_role】
 * products 的写策略是 yolo.is_admin()，Storage 的上传策略也是；anon key 只能读。
 * service_role 绕过 RLS，但**只能放在 .env.local（已被 .gitignore 排除）**，
 * 绝不能下发给浏览器或写进代码。
 *
 * 【幂等】图片用 x-upsert，产品用 on conflict (slug) upsert，重复跑不会翻倍。
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..");
const BUCKET = "yolo";
const SCHEMA = "yolo";
const BATCH = 25;
const UPLOAD_CONCURRENCY = 6;
const SQL_MODE = process.argv.includes("--sql");

/* ---------- 环境变量 ---------- */
const env = {};
for (const file of [".env.local", ".env"]) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) continue;
  for (const line of fs.readFileSync(full, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (m && !(m[1] in env)) {
      env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

const URL_BASE = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!URL_BASE) {
  console.error("缺少 NEXT_PUBLIC_SUPABASE_URL");
  process.exit(1);
}

/* ---------- 数据 ---------- */
const DATA = path.join(
  ROOT,
  ".workbuddy",
  "artifacts",
  "product-import",
  "products.json"
);
if (!fs.existsSync(DATA)) {
  console.error("找不到 products.json（先跑 .workbuddy/artifacts/product-import/import.js）");
  process.exit(1);
}
const products = JSON.parse(fs.readFileSync(DATA, "utf8"));

/** 本地 /media/products/<slug>/01.jpg → 桶内 products/<slug>/01.jpg */
function storageKey(localSrc) {
  const rel = localSrc.replace(/^\/?media\/products\//, "");
  return `products/${rel}`;
}
function localFile(localSrc) {
  return path.join(ROOT, "public", localSrc.replace(/^\//, ""));
}
function publicUrl(key) {
  return `${URL_BASE}/storage/v1/object/public/${BUCKET}/${key}`;
}

const uniqueImages = [...new Set(products.flatMap((p) => p.images ?? []))];

/** 组装 products 表的行；图片路径全部换成 Storage 公开 URL */
function buildRows() {
  return products.map((p) => {
    const images = (p.images ?? []).map((src) => publicUrl(storageKey(src)));
    return {
      title: p.title,
      slug: p.slug,
      description: p.description ?? null,
      category: p.category,
      images,
      cover_image: images[0] ?? null,
      materials: p.materials ?? [],
      moq: p.moq ?? null,
      price_range: p.price_range ?? null,
      featured: Boolean(p.featured),
      published: p.published ?? true,
      sort_order: p.sort_order ?? 0,
    };
  });
}

const rows = buildRows();
console.log(
  `准备导入：${rows.length} 个产品 / ${uniqueImages.length} 张图片 → ${BUCKET} 桶 + ${SCHEMA}.products`
);

/* =============================================================
   模式 B：只生成 SQL（不需要 service_role）
   ============================================================= */
if (SQL_MODE) {
  const q = (v) =>
    v === null || v === undefined
      ? "null"
      : `'${String(v).replace(/'/g, "''")}'`;
  const arr = (list) =>
    list.length === 0
      ? "array[]::text[]"
      : `array[${list.map(q).join(", ")}]::text[]`;

  const lines = [
    "-- 自动生成：node scripts/import-catalog.mjs --sql",
    "-- 前置：先跑 supabase/storage-yolo.sql，并把 public/media/products/ 整个目录",
    "--       上传到 yolo 桶（保留 products/<slug>/NN.jpg 的层级）。",
    "-- 幂等：以 slug 为冲突键 upsert，可重复执行。",
    "",
    "begin;",
    "",
  ];

  for (const r of rows) {
    const cols = [
      "title", "slug", "description", "category", "images", "cover_image",
      "materials", "moq", "price_range", "featured", "published", "sort_order",
    ];
    const vals = [
      q(r.title), q(r.slug), q(r.description), q(r.category),
      arr(r.images), q(r.cover_image), arr(r.materials),
      r.moq === null ? "null" : String(r.moq),
      q(r.price_range), r.featured ? "true" : "false",
      r.published ? "true" : "false", String(r.sort_order),
    ];
    lines.push(`insert into ${SCHEMA}.products (${cols.join(", ")}) values`);
    lines.push(`  (${vals.join(", ")})`);
    lines.push(`on conflict (slug) do update set`);
    lines.push(
      `  title = excluded.title, description = excluded.description,`,
      `  category = excluded.category, images = excluded.images,`,
      `  cover_image = excluded.cover_image, materials = excluded.materials,`,
      `  moq = excluded.moq, price_range = excluded.price_range,`,
      `  featured = excluded.featured, published = excluded.published,`,
      `  sort_order = excluded.sort_order, updated_at = now();`,
      ""
    );
  }
  lines.push("commit;", "");

  const outDir = path.join(ROOT, ".workbuddy", "artifacts", "catalog-import");
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, "catalog-import.sql");
  fs.writeFileSync(out, lines.join("\n"), "utf8");
  console.log(`已生成 ${path.relative(ROOT, out)}（${lines.length} 行）`);
  process.exit(0);
}

/* =============================================================
   模式 A：全自动（需要 service_role）
   ============================================================= */
if (!SERVICE_KEY) {
  console.error(
    [
      "缺少 SUPABASE_SERVICE_ROLE_KEY。",
      "",
      "anon / publishable key 受 RLS 限制：products 不能写、Storage 不能传。两条路：",
      "  A. Dashboard → Settings → API Keys → Secret keys → default 的 sb_secret_...，",
      "     或点右上 Reveal 后的 legacy service_role（eyJ...），",
      "     加进 .env.local：SUPABASE_SERVICE_ROLE_KEY=...，再跑本脚本。",
      "  B. 不想给密钥就跑 `node scripts/import-catalog.mjs --sql`，",
      "     自己把图片拖进 Dashboard，再粘贴生成的 SQL。",
    ].join("\n")
  );
  process.exit(1);
}
if (SERVICE_KEY === ANON_KEY || SERVICE_KEY.startsWith("sb_publishable_")) {
  console.error(
    "填成 publishable / anon key 了。这把是公开只读的，写入会被 RLS 拒绝。\n" +
      "要的是 Settings → API Keys → Secret keys 里的 sb_secret_...（或 legacy service_role 的 eyJ...）。"
  );
  process.exit(1);
}

/**
 * 新旧两种密钥的请求头不一样，这里先探测再定：
 *   - legacy service_role 是 JWT（eyJ...），apikey + Authorization: Bearer 都发
 *   - 新版 Secret key 是短字符串 sb_secret_...，官方文档明确要求**只放 apikey 头**
 *     （它不是 JWT，塞进 Bearer 会被当成无效 JWT；个别网关版本仍要 Bearer，所以留一次回退）
 * 探测用一次只读请求，成功后整轮导入复用这套头。
 */
const isLegacyJwt = SERVICE_KEY.startsWith("eyJ");
const baseHeaders = { apikey: SERVICE_KEY };
let H;

for (const candidate of isLegacyJwt
  ? [{ ...baseHeaders, Authorization: `Bearer ${SERVICE_KEY}` }, baseHeaders]
  : [baseHeaders, { ...baseHeaders, Authorization: `Bearer ${SERVICE_KEY}` }]) {
  const probe = await fetch(
    `${URL_BASE}/rest/v1/products?select=id&limit=1`,
    { headers: { ...candidate, "Accept-Profile": SCHEMA } }
  );
  if (probe.ok) {
    H = candidate;
    break;
  }
}
if (!H) {
  console.error(
    "密钥验证失败（读 yolo.products 都没过）。\n" +
      "确认复制的是 Secret keys 里的 sb_secret_...，或点 Reveal 后的 legacy service_role。\n" +
      "另外 Secret key 不允许浏览器 User-Agent，别用浏览器里复制后经网页请求。"
  );
  process.exit(1);
}
console.log(
  `密钥类型：${isLegacyJwt ? "legacy service_role (JWT)" : "新版 Secret key"}` +
    `${H.Authorization ? "，带 Bearer" : "，仅 apikey 头"}`
);

/* 桶存在吗？不存在就停下来，别把 130 个请求打空 */
const bucketRes = await fetch(`${URL_BASE}/storage/v1/bucket/${BUCKET}`, {
  headers: H,
});
if (!bucketRes.ok) {
  console.error(
    `${BUCKET} 桶不存在或不可访问（${bucketRes.status}）。先在 SQL Editor 跑 supabase/storage-yolo.sql。`
  );
  process.exit(1);
}

/* ---------- 1 · 传图（限并发，x-upsert 保证可重跑） ---------- */
const missing = uniqueImages.filter((src) => !fs.existsSync(localFile(src)));
if (missing.length > 0) {
  console.error(
    [
      `缺 ${missing.length} 张本地图（首个：${missing[0]}）。`,
      "2026-11-06 清理仓库时已删除 public/media/products/**。",
      "重跑前先从 yolo 桶下载回本地，或改用 `node scripts/import-catalog.mjs --sql`（不读图）。",
    ].join("\n")
  );
  process.exit(1);
}
console.log(`\n[1/3] 上传 ${uniqueImages.length} 张图片…`);
let uploaded = 0;
let cursor = 0;
let firstError = null;

async function worker() {
  while (cursor < uniqueImages.length) {
    const i = cursor++;
    const src = uniqueImages[i];
    if (firstError) return;
    const key = storageKey(src);
    const res = await fetch(
      `${URL_BASE}/storage/v1/object/${BUCKET}/${key}`,
      {
        method: "POST",
        headers: {
          ...H,
          "Content-Type": "image/jpeg",
          "x-upsert": "true",
          "cache-control": "31536000",
        },
        body: fs.readFileSync(localFile(src)),
      }
    );
    if (!res.ok) {
      firstError = `${key} → ${res.status} ${(await res.text()).slice(0, 160)}`;
      return;
    }
    uploaded += 1;
    if (uploaded % 20 === 0) process.stdout.write(`\r  已传 ${uploaded}/${uniqueImages.length}`);
  }
}
await Promise.all(
  Array.from({ length: Math.min(UPLOAD_CONCURRENCY, uniqueImages.length) }, worker)
);
if (firstError) {
  console.error(`\n上传失败：${firstError}`);
  process.exit(1);
}
console.log(`\r  已传 ${uploaded}/${uniqueImages.length}        `);

/* ---------- 2 · 写产品 ---------- */
console.log(`\n[2/3] upsert ${rows.length} 条产品…`);
for (let i = 0; i < rows.length; i += BATCH) {
  const chunk = rows.slice(i, i + BATCH);
  const res = await fetch(
    `${URL_BASE}/rest/v1/products?on_conflict=slug`,
    {
      method: "POST",
      headers: {
        ...H,
        "Content-Type": "application/json",
        "Content-Profile": SCHEMA,
        "Accept-Profile": SCHEMA,
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(chunk),
    }
  );
  if (!res.ok) {
    console.error(`\n批次 ${i / BATCH + 1} 失败 (${res.status}): ${(await res.text()).slice(0, 300)}`);
    process.exit(1);
  }
  process.stdout.write(`\r  已写 ${Math.min(i + BATCH, rows.length)}/${rows.length}`);
}
console.log("");

/* ---------- 3 · 回读核对 ---------- */
console.log("\n[3/3] 回读核对…");
const check = await fetch(
  `${URL_BASE}/rest/v1/products?select=slug,category,cover_image&published=eq.true`,
  { headers: { ...H, "Accept-Profile": SCHEMA, Prefer: "count=exact" } }
);
const all = await check.json();
if (!Array.isArray(all)) {
  console.error("回读失败：", JSON.stringify(all).slice(0, 200));
  process.exit(1);
}
const noCover = all.filter((r) => !r.cover_image);
console.log(`  库内 published 产品：${all.length} 个`);
console.log(`  缺封面的：${noCover.length} 个`);
const byCat = {};
for (const r of all) byCat[r.category] = (byCat[r.category] ?? 0) + 1;
for (const [k, v] of Object.entries(byCat).sort()) {
  console.log(`  ${k.padEnd(20)} ${v}`);
}
console.log("\n完成。前台 getProducts() 会自动切换到数据库数据，页面代码不用动。");
