/**
 * 生成首页点阵地图用的陆地轮廓 path。
 *
 * 用法：node scripts/build-world-land.mjs
 *
 * 数据来源：Natural Earth 1:110m land（public domain，无需署名）
 *   https://github.com/nvkelso/natural-earth-vector
 *
 * 为什么单独写脚本：产物（src/lib/world-land.ts）要提交进仓库，
 * 让构建过程不依赖网络和第三方数据源；需要更新底图时重跑本脚本即可。
 *
 * 处理流程：
 *   1. 拉取 GeoJSON（Polygon / MultiPolygon）
 *   2. 等距圆柱投影：lon -180..180 → x 0..1000，lat 90..-90 → y 0..500
 *   3. 去掉过小的岛屿（包围盒 < MIN_RING_PX）
 *   4. 闭合环用 Douglas–Peucker 简化（容差 TOLERANCE_PX）
 *   5. 输出单条 path 字符串
 */
import { writeFileSync } from "node:fs";

/**
 * 2026-11-20 起数据源从 ne_110m_land 换成 ne_110m_admin_0_countries：
 * 需要按国家拆分以高亮站点所在国。land 是合并陆地块，分不出国家。
 * countries 每个 feature 带 ISO_A3，可精确挑出目标国家。
 */
const SOURCE =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";

/**
 * 站点所在国（ADM0_A3），与 src/lib/site-data.ts GLOBAL_OFFICES 一一对应：
 * 纽约/巴黎/西班牙/米兰/埃及/杭州/缅甸/老挝/柬埔寨。
 * 中国四省集群（河南/山东/等）也落在中国，故 CHN 只出现一次。
 * TWN 必须一并高亮：台湾是中国领土不可分割的一部分，Natural Earth
 * 将其标为独立 feature（ADM0_A3=TWN），高亮中国时必须显式包含。
 */
const HIGHLIGHT_ISO3 = new Set([
  "USA",
  "FRA",
  "ESP",
  "ITA",
  "EGY",
  "CHN",
  "TWN",
  "MMR",
  "LAO",
  "KHM",
]);

const W = 1000;
const H = 500;
/** 视窗裁切：顶部留一点，底部裁掉南极（否则下方会出现一整条无意义的点带） */
const VIEWBOX = "0 16 1000 410";

const TOLERANCE_PX = 1;
const MIN_RING_PX = 8;

function project([lon, lat]) {
  return [((lon + 180) / 360) * W, ((90 - lat) / 180) * H];
}

function perpDistance(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  if (dx === 0 && dy === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy);
  const tc = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - (a[0] + tc * dx), p[1] - (a[1] + tc * dy));
}

function simplifyOpen(points, tol) {
  if (points.length < 3) return points;
  let maxD = 0;
  let idx = 0;
  const first = points[0];
  const last = points[points.length - 1];
  for (let i = 1; i < points.length - 1; i += 1) {
    const d = perpDistance(points[i], first, last);
    if (d > maxD) {
      maxD = d;
      idx = i;
    }
  }
  if (maxD <= tol) return [first, last];
  const left = simplifyOpen(points.slice(0, idx + 1), tol);
  const right = simplifyOpen(points.slice(idx), tol);
  return left.slice(0, -1).concat(right);
}

/** 闭合环：以距起点最远的点为界拆成两段分别简化，避免首尾重合导致退化 */
function simplifyRing(ring, tol) {
  const pts = ring.slice(0, -1);
  if (pts.length < 8) return ring;

  let far = 0;
  let farD = 0;
  for (let i = 1; i < pts.length; i += 1) {
    const d = (pts[i][0] - pts[0][0]) ** 2 + (pts[i][1] - pts[0][1]) ** 2;
    if (d > farD) {
      farD = d;
      far = i;
    }
  }

  const a = simplifyOpen(pts.slice(0, far + 1), tol);
  const b = simplifyOpen(pts.slice(far).concat([pts[0]]), tol);
  return a.slice(0, -1).concat(b);
}

function bboxSize(ring) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of ring) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return Math.max(maxX - minX, maxY - minY);
}

function ringsOf(geometry) {
  if (geometry.type === "Polygon") return [geometry.coordinates[0]];
  if (geometry.type === "MultiPolygon") return geometry.coordinates.map((p) => p[0]);
  return [];
}

const res = await fetch(SOURCE);
if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
const geo = await res.json();

let ringCount = 0;
let rawPoints = 0;
let keptPoints = 0;
const baseParts = [];
const highlightParts = [];
const seenIso = new Set();

for (const feature of geo.features) {
  /* 用 ADM0_A3 不用 ISO_A3：Natural Earth 把法国的 ISO_A3 标为 -99
     （ISO 标准里 FR 归在 ISO_A2，ISO_A3 需查 ADM0_A3），ADM0_A3 是
     统一的三字母行政码，9 个目标国家全部命中。 */
  const iso3 = feature.properties?.ADM0_A3;
  const isHighlight = HIGHLIGHT_ISO3.has(iso3);
  if (isHighlight) seenIso.add(iso3);

  for (const rawRing of ringsOf(feature.geometry)) {
    rawPoints += rawRing.length;
    const ring = rawRing.map(project);
    if (bboxSize(ring) < MIN_RING_PX) continue;

    const simplified = simplifyRing(ring, TOLERANCE_PX);
    if (simplified.length < 4) continue;

    keptPoints += simplified.length;
    ringCount += 1;
    const d =
      "M" +
      simplified
        .map(([x, y]) => `${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`)
        .join("L") +
      "Z";
    (isHighlight ? highlightParts : baseParts).push(d);
  }
}

/* 每个目标国家都必须真的匹配到了几何，否则是 ISO 码写错（静默不高亮最难查） */
for (const iso of HIGHLIGHT_ISO3) {
  if (!seenIso.has(iso)) {
    throw new Error(`highlight ISO_A3 not found in source: ${iso}`);
  }
}

const path = baseParts.join("");
const highlightPath = highlightParts.join("");

const output = `/**
 * 世界陆地轮廓（简化后），用于首页世界地图。
 *
 * 来源：Natural Earth 1:110m admin_0 countries（public domain）
 *   https://github.com/nvkelso/natural-earth-vector
 * 生成：node scripts/build-world-land.mjs
 *   —— 产物已提交，构建时不依赖网络；需要更新底图时重跑脚本。
 * 投影：等距圆柱。lon -180..180 → x 0..${W}，lat 90..-90 → y 0..${H}
 * 视窗：viewBox="${VIEWBOX}"，裁掉南极与最北的空白。
 *
 * WORLD_LAND_PATH：全部国家（底图）。
 * WORLD_HIGHLIGHT_PATH：站点所在国（美国/法国/西班牙/意大利/埃及/中国/缅甸/老挝/柬埔寨），
 *   用于与底色区分的高亮填充。
 *
 * 统计：${ringCount} 个闭合环，${rawPoints} → ${keptPoints} 个点
 *
 * 不要手改这个文件。
 */

export const WORLD_MAP_WIDTH = ${W};
export const WORLD_MAP_HEIGHT = ${H};
export const WORLD_VIEWBOX = "${VIEWBOX}";

/** 经纬度 → 地图坐标（与上面的投影一致） */
export function projectToMap(lon: number, lat: number): [number, number] {
  return [((lon + 180) / 360) * WORLD_MAP_WIDTH, ((90 - lat) / 180) * WORLD_MAP_HEIGHT];
}

export const WORLD_LAND_PATH =
  ${JSON.stringify(path)};

export const WORLD_HIGHLIGHT_PATH =
  ${JSON.stringify(highlightPath)};
`;

writeFileSync(new URL("../src/lib/world-land.ts", import.meta.url), output);

console.log(
  "ok: " + ringCount + " rings, " + rawPoints + " → " + keptPoints +
  " points, base " + (path.length / 1024).toFixed(1) + "KB, highlight " +
  (highlightPath.length / 1024).toFixed(1) + "KB"
);
