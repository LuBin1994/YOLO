/**
 * 桌面「产品」文件夹 → Supabase 商品目录（一图一款）。
 *
 * 用法：
 *   node scripts/import-desktop-products.mjs --dry-run   # 只扫描+压缩+生成数据，不写库
 *   node scripts/import-desktop-products.mjs             # 完整导入
 *
 * 规则（客户 2026-11-06）：
 *   - 一张图片 = 一款产品：images 数组里只有这一张，cover_image 同它
 *   - 分类按图片所在的**最深层目录名**：有子目录用二级，没有子目录用一级
 *   - 氛围图留空（客户自己上传）
 *   - 除产品图与分类外的数据（标题/描述/材质/MOQ/价格）按品类规则编造，
 *     **不写客户品牌名** —— 源文件名里那些是代工客户标识
 *   - 图片先压缩：flatten 白底 → contain 到 800×1000 白底画布 → jpeg q82
 *
 * 安全：
 *   - 先写新数据、再按备份 id 删除旧数据；中途失败不会把库清空
 *   - 全程幂等（x-upsert + on conflict slug），可重复跑
 *   - 旧数据完整备份在 .workbuddy/backups/products-before-desktop-import-20261106.json
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(import.meta.dirname, "..");
const SOURCE = "C:/Users/26014/Desktop/产品";
const OUT_DIR = path.join(ROOT, ".workbuddy", "artifacts", "desktop-import", "out");
const REPORT = path.join(ROOT, ".workbuddy", "artifacts", "desktop-import", "products.json");
const BACKUP = path.join(
  ROOT,
  ".workbuddy",
  "backups",
  "products-before-desktop-import-20261106.json"
);
const BUCKET = "yolo";
const SCHEMA = "yolo";
const DRY_RUN = process.argv.includes("--dry-run");
const BATCH = 25;
const UPLOAD_CONCURRENCY = 6;

/* ------------------------------------------------------------------
   1 · 配置
   ------------------------------------------------------------------ */

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

if (!URL_BASE) throw new Error("缺少 NEXT_PUBLIC_SUPABASE_URL");
if (!DRY_RUN && !SERVICE_KEY) throw new Error("缺少 SUPABASE_SERVICE_ROLE_KEY");

/** 新版 sb_secret_ 只放 apikey 头；legacy eyJ... 两个头都发 */
async function resolveHeaders() {
  const isLegacy = SERVICE_KEY.startsWith("eyJ");
  const base = { apikey: SERVICE_KEY };
  const candidates = isLegacy
    ? [{ ...base, Authorization: `Bearer ${SERVICE_KEY}` }, base]
    : [base, { ...base, Authorization: `Bearer ${SERVICE_KEY}` }];
  for (const candidate of candidates) {
    const res = await fetch(`${URL_BASE}/rest/v1/products?select=id&limit=1`, {
      headers: { ...candidate, "Accept-Profile": SCHEMA },
    });
    if (res.ok) return candidate;
  }
  throw new Error("service_role 密钥验证失败");
}

/* ------------------------------------------------------------------
   2 · 目录 → 分类映射
   ------------------------------------------------------------------ */

/**
 * 目录名（最深层）→ yolo.categories.slug。
 * 后台已有这 12 个分类，一一对应；映射不到就停，绝不静默塞进错的分类。
 */
const CATEGORY_MAP = {
  "童装/夹克": "kids-jacket",
  "童装/棉衣": "kids-padded",
  "童装/皮毛一体": "kids-shearling",
  "男装/大衣": "mens-coat",
  "男装/夹克": "mens-jacket",
  "男装/棉衣": "mens-padded",
  "女装/夹克": "womens-jacket",
  "女装/棉衣": "womens-padded",
  "女装/皮毛一体": "womens-shearling",
  "女装/风衣": "womens-trench",
  "KNIT 系列": "knit-series",
  "PANTS 系列": "pant-series",
};

/** 按品类编造英文文案。styles/colors 轮转，保证 141 个标题各不相同。 */
const KIND = {
  jacket: {
    group: "Jackets",
    styles: ["Hooded Shell Jacket", "Lightweight Zip Jacket", "Softshell Windbreaker", "Quilted Track Jacket", "Technical Blouson"],
    materials: ["Recycled polyester shell", "Mesh lining"],
    price: "$14 - $28 / pc",
    desc: "A clean technical jacket cut on our own block, with a set-in sleeve and a two-piece collar. Shown in the colourway photographed; shell, lining and trims can all be re-specified for your program.",
  },
  padded: {
    group: "Padded",
    styles: ["Quilted Puffer Jacket", "Down-Fill Puffer", "Lightweight Padded Jacket", "Reversible Puffer", "Hooded Padded Parka"],
    materials: ["Nylon shell", "Recycled polyester fill"],
    price: "$22 - $42 / pc",
    desc: "A padded style built for cold-weather programs, with even baffle spacing and a soft hand feel. Fill weight, shell fabric and hardware are all configurable; sample lead time 7–10 days.",
  },
  shearling: {
    group: "Shearling",
    styles: ["Faux Shearling Coat", "Shearling-Trim Jacket", "Reversible Shearling", "Suede-Touch Shearling"],
    materials: ["Faux shearling", "Suede-touch backing"],
    price: "$28 - $52 / pc",
    desc: "A plush shearling style with a clean bonded edge and a relaxed shoulder. Available in real or faux shearling, with custom pile height, backing and trims.",
  },
  coat: {
    group: "Coats",
    styles: ["Wool-Blend Overcoat", "Single-Breasted Coat", "Relaxed Tailored Coat"],
    materials: ["Wool-blend melton", "Recycled polyester lining"],
    price: "$32 - $58 / pc",
    desc: "A structured overcoat with a soft shoulder and a notch lapel. Cloth weight, lining and button package can be specified per program.",
  },
  trench: {
    group: "Trench",
    styles: ["Classic Belted Trench", "Lightweight Trench Coat", "Double-Breasted Trench"],
    materials: ["Cotton-blend gabardine", "Recycled polyester lining"],
    price: "$30 - $54 / pc",
    desc: "A belted trench with a storm flap and adjustable cuffs. Length, cloth weight and hardware are configurable for private label programs.",
  },
  knit: {
    group: "Knit Series",
    styles: ["Cable-Knit Vest", "Layered Knit Shirt", "V-Neck Knit Layer", "Textured Knit Combo"],
    materials: ["Cotton-blend knit", "Cotton poplin shirting"],
    price: "$12 - $24 / pc",
    desc: "A knit-and-woven layered style built for contemporary lines. Yarn count, stitch structure and shirting fabric can all be re-specified.",
  },
  pants: {
    group: "PANTS Series",
    styles: ["Elastic-Waist Shorts", "Colour-Block Track Pants", "Pleated-Waist Shorts", "Tapered Jogger"],
    materials: ["Stretch nylon", "Elastic waistband"],
    price: "$9 - $18 / pc",
    desc: "An easy-wear bottom with a clean waistband finish and practical pocketing. Fabric weight, rise and trims are configurable per colourway.",
  },
};

const GROUP_LABEL = { 童装: "Kids", 男装: "Mens", 女装: "Womens", "KNIT 系列": "Knit", "PANTS 系列": "Pants" };
const COLORS = ["Ivory", "Navy", "Charcoal", "Olive", "Sand", "Slate", "Ecru", "Camel", "Black", "Rust"];
const MOQ_CYCLE = [300, 500, 800];

function slugify(input) {
  return input.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function kindOf(categorySlug) {
  if (categorySlug === "knit-series") return KIND.knit;
  if (categorySlug === "pant-series") return KIND.pants;
  if (categorySlug.includes("shearling")) return KIND.shearling;
  if (categorySlug.includes("trench")) return KIND.trench;
  if (categorySlug.includes("coat")) return KIND.coat;
  if (categorySlug.includes("padded")) return KIND.padded;
  return KIND.jacket;
}

/* ------------------------------------------------------------------
   3 · 扫描素材（只读桌面，绝不改动原文件）
   ------------------------------------------------------------------ */

const IMAGE_RE = /\.(png|jpe?g|webp|avif)$/i;

function scanSource() {
  const groups = [];
  const topDirs = fs.readdirSync(SOURCE)
    .filter((name) => fs.statSync(path.join(SOURCE, name)).isDirectory())
    .sort();

  for (const top of topDirs) {
    const topPath = path.join(SOURCE, top);
    const subDirs = fs.readdirSync(topPath)
      .filter((name) => fs.statSync(path.join(topPath, name)).isDirectory())
      .sort();

    if (subDirs.length > 0) {
      for (const sub of subDirs) {
        const dir = path.join(topPath, sub);
        const files = fs.readdirSync(dir)
          .filter((f) => IMAGE_RE.test(f) && fs.statSync(path.join(dir, f)).isFile())
          .sort()
          .map((f) => path.join(dir, f));
        groups.push({ key: `${top}/${sub}`, top, files });
      }
    } else {
      const files = fs.readdirSync(topPath)
        .filter((f) => IMAGE_RE.test(f) && fs.statSync(path.join(topPath, f)).isFile())
        .sort()
        .map((f) => path.join(topPath, f));
      groups.push({ key: top, top, files });
    }
  }

  for (const g of groups) {
    if (!CATEGORY_MAP[g.key]) {
      throw new Error(`目录「${g.key}」没有分类映射，先补 CATEGORY_MAP 再跑（不静默跳过）`);
    }
    g.category = CATEGORY_MAP[g.key];
  }
  return groups;
}

/* ------------------------------------------------------------------
   4 · 压缩 + 组装产品数据
   ------------------------------------------------------------------ */

async function compress(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await sharp(src)
    /* 3 张源图带透明通道，先合成到白底；纯白底源图是 no-op */
    .flatten({ background: "#ffffff" })
    /* contain + 画布：保持整件衣服完整，cover 会切掉袖口衣摆 */
    .resize(800, 1000, { fit: "contain", background: "#ffffff" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(dest);
  return fs.statSync(dest).size;
}

function publicUrl(key) {
  return `${URL_BASE}/storage/v1/object/public/${BUCKET}/${key}`;
}

async function buildCatalog(groups) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const rows = [];
  const uploadJobs = [];
  let seq = 0;
  let beforeBytes = 0;
  let afterBytes = 0;

  for (const group of groups) {
    const profile = kindOf(group.category);
    let indexInGroup = 0;

    for (const src of group.files) {
      seq += 1;
      const style = profile.styles[indexInGroup % profile.styles.length];
      const color = COLORS[indexInGroup % COLORS.length];
      const suffix = String(seq).padStart(3, "0");
      const title = `${GROUP_LABEL[group.top]} ${style} — ${color} ${suffix}`;
      const slug = slugify(title);
      const storageKey = `products/${slug}/01.jpg`;
      const localOut = path.join(OUT_DIR, `${slug}.jpg`);

      beforeBytes += fs.statSync(src).size;
      afterBytes += await compress(src, localOut);
      uploadJobs.push({ key: storageKey, file: localOut });

      const moq = MOQ_CYCLE[indexInGroup % MOQ_CYCLE.length];
      rows.push({
        title,
        slug,
        description: profile.desc,
        category: group.category,
        images: [publicUrl(storageKey)],
        cover_image: publicUrl(storageKey),
        mood_image: null,
        materials: profile.materials,
        moq,
        price_range: profile.price,
        featured: indexInGroup === 0,
        published: true,
        sort_order: seq,
        /* 只用于本地核对，不写库 */
        _source: path.relative(SOURCE, src),
      });
      indexInGroup += 1;
    }
  }

  console.log(
    `  压缩：${beforeBytes / 1024 / 1024 | 0}MB → ${(afterBytes / 1024 / 1024).toFixed(1)}MB` +
      `（${(100 - (afterBytes / beforeBytes) * 100).toFixed(1)}% 减小），共 ${rows.length} 张`
  );
  return { rows, uploadJobs };
}

/* ------------------------------------------------------------------
   5 · 上传 / 写库 / 清理旧数据
   ------------------------------------------------------------------ */

async function uploadAll(jobs, H) {
  let cursor = 0;
  let done = 0;
  let firstError = null;
  async function worker() {
    while (cursor < jobs.length) {
      const job = jobs[cursor++];
      if (firstError) return;
      const res = await fetch(`${URL_BASE}/storage/v1/object/${BUCKET}/${job.key}`, {
        method: "POST",
        headers: {
          ...H,
          "Content-Type": "image/jpeg",
          "x-upsert": "true",
          "cache-control": "31536000",
        },
        body: fs.readFileSync(job.file),
      });
      if (!res.ok) {
        firstError = `${job.key} → ${res.status} ${(await res.text()).slice(0, 140)}`;
        return;
      }
      done += 1;
      if (done % 25 === 0) process.stdout.write(`\r  已传 ${done}/${jobs.length}`);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(UPLOAD_CONCURRENCY, jobs.length) }, worker)
  );
  if (firstError) throw new Error(`上传失败：${firstError}`);
  console.log(`\r  已传 ${done}/${jobs.length}        `);
}

async function upsertProducts(rows, H) {
  /* _source 只是本地核对用，不写库 */
  const payload = rows.map((row) => {
    const dbRow = { ...row };
    delete dbRow._source;
    return dbRow;
  });
  for (let i = 0; i < payload.length; i += BATCH) {
    const chunk = payload.slice(i, i + BATCH);
    const res = await fetch(`${URL_BASE}/rest/v1/products?on_conflict=slug`, {
      method: "POST",
      headers: {
        ...H,
        "Content-Type": "application/json",
        "Content-Profile": SCHEMA,
        "Accept-Profile": SCHEMA,
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(chunk),
    });
    if (!res.ok) {
      throw new Error(`批次 ${i / BATCH + 1} 失败 (${res.status}): ${(await res.text()).slice(0, 260)}`);
    }
    process.stdout.write(`\r  已写 ${Math.min(i + BATCH, payload.length)}/${payload.length}`);
  }
  console.log("");
}

/** 新数据落地后才删旧数据；按 id 分批，避免 URL 过长 */
async function removeOldProducts(H) {
  const old = JSON.parse(fs.readFileSync(BACKUP, "utf8"));
  const ids = old.map((r) => r.id);
  let removed = 0;
  for (let i = 0; i < ids.length; i += 20) {
    const chunk = ids.slice(i, i + 20);
    const res = await fetch(
      `${URL_BASE}/rest/v1/products?id=in.(${chunk.join(",")})`,
      {
        method: "DELETE",
        headers: { ...H, "Content-Profile": SCHEMA, "Accept-Profile": SCHEMA, Prefer: "return=minimal" },
      }
    );
    if (!res.ok) {
      throw new Error(`删除旧数据失败 (${res.status}): ${(await res.text()).slice(0, 200)}`);
    }
    removed += chunk.length;
  }
  console.log(`  已移除旧产品 ${removed} 条（备份仍在 ${path.relative(ROOT, BACKUP)}）`);
}

async function verify(H, expected) {
  const res = await fetch(
    `${URL_BASE}/rest/v1/products?select=slug,category,cover_image,mood_image&published=eq.true`,
    { headers: { ...H, "Accept-Profile": SCHEMA } }
  );
  const rows = await res.json();
  if (!Array.isArray(rows)) throw new Error(`回读失败：${JSON.stringify(rows).slice(0, 160)}`);
  console.log(`  库内 published 产品：${rows.length} 个（预期 ${expected}）`);
  const byCat = {};
  for (const r of rows) byCat[r.category] = (byCat[r.category] ?? 0) + 1;
  for (const [k, v] of Object.entries(byCat).sort()) console.log(`    ${k.padEnd(20)} ${v}`);
  console.log(`  缺封面：${rows.filter((r) => !r.cover_image).length} 个`);
  console.log(`  带氛围图：${rows.filter((r) => r.mood_image).length} 个（应全部为空，留给你上传）`);
  if (rows.length !== expected) throw new Error(`数量不符：${rows.length} != ${expected}`);
}

/* ------------------------------------------------------------------
   6 · 主流程
   ------------------------------------------------------------------ */

const groups = scanSource();
console.log(`扫描 ${SOURCE}`);
for (const g of groups) {
  console.log(`  ${g.key.padEnd(18)} → ${g.category.padEnd(18)} ${g.files.length} 张`);
}
console.log(`合计 ${groups.reduce((n, g) => n + g.files.length, 0)} 张 → ${groups.reduce((n, g) => n + g.files.length, 0)} 款产品`);

const { rows, uploadJobs } = await buildCatalog(groups);

fs.mkdirSync(path.dirname(REPORT), { recursive: true });
fs.writeFileSync(REPORT, JSON.stringify(rows, null, 2), "utf8");
console.log(`数据清单：${path.relative(ROOT, REPORT)}`);
console.log(`示例：${rows[0].title}  [${rows[0].category}]`);

if (DRY_RUN) {
  console.log("\n--dry-run：仅压缩与生成清单，未上传、未写库。");
  process.exit(0);
}

const H = await resolveHeaders();
console.log("\n[1/4] 上传产品图…");
await uploadAll(uploadJobs, H);
console.log("[2/4] 写入新产品…");
await upsertProducts(rows, H);
console.log("[3/4] 移除旧产品…");
await removeOldProducts(H);
console.log("[4/4] 回读核对…");
await verify(H, rows.length);
console.log("\n完成。");
