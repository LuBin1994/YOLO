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

const SOURCE =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson";

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
const parts = [];

for (const feature of geo.features) {
  for (const rawRing of ringsOf(feature.geometry)) {
    rawPoints += rawRing.length;
    const ring = rawRing.map(project);
    if (bboxSize(ring) < MIN_RING_PX) continue;

    const simplified = simplifyRing(ring, TOLERANCE_PX);
    if (simplified.length < 4) continue;

    keptPoints += simplified.length;
    ringCount += 1;
    parts.push(
      "M" +
        simplified
          .map(([x, y]) => `${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`)
          .join("L") +
        "Z"
    );
  }
}

const path = parts.join("");

const output = `/**
 * 世界陆地轮廓（简化后），仅用于首页点阵地图的遮罩。
 *
 * 来源：Natural Earth 1:110m land（public domain）
 *   https://github.com/nvkelso/natural-earth-vector
 * 生成：node scripts/build-world-land.mjs
 *   —— 产物已提交，构建时不依赖网络；需要更新底图时重跑脚本。
 * 投影：等距圆柱。lon -180..180 → x 0..${W}，lat 90..-90 → y 0..${H}
 * 视窗：viewBox="${VIEWBOX}"，裁掉南极与最北的空白。
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
`;

writeFileSync(new URL("../src/lib/world-land.ts", import.meta.url), output);

console.log(
  `ok: ${ringCount} rings, ${rawPoints} → ${keptPoints} points, path ${(path.length / 1024).toFixed(1)}KB`
);
