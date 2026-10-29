"use client";

import { useRef, useState } from "react";
import {
  WORLD_LAND_PATH,
  WORLD_MAP_HEIGHT,
  WORLD_MAP_WIDTH,
  WORLD_VIEWBOX,
  projectToMap,
} from "@/lib/world-land";
import type { OfficeNode, OfficeRole } from "@/lib/site-data";

/**
 * 点阵世界地图 + 十字准星 + 仪表读数条（技术图纸版式）。
 *
 * 【2026-10-29 改版：图钉 → 准星】
 * 上一版是九枚森林绿泪滴图钉（客户 2026-10-22 提的"绿色坐标图标"）。
 * 客户看过首页截图后判定"设计效果太差"，原型对比后选定"技术图纸"方向：
 * 图钉是地图插件的语汇，而这里要卖的是制造能力，图纸语汇更对味。
 * 具体做了四件事：
 *   1. 加 30° 经纬网 + 边缘经纬刻度，地图从"底色"变成"图纸"；
 *   2. 图钉换成十字准星，钉心落在真实坐标上；
 *   3. 悬停改由左下角固定读数条呈现（名称/角色/经纬/分区），
 *      不再让浮层卡片在地图上乱飞——卡片会压住南美西岸和欧洲；
 *   4. 中国四点仍用虚线圈标出"一个点代表四省"，圈径取数据里的
 *      clusterRadius，不再手写死值。
 *
 * 【为什么点位/标签是 HTML 而经纬网是 SVG】
 * SVG 只画不需要交互的图形（网、陆地点阵、准星）。文字标签如果留在 SVG 里，
 * 字号的用户单位会随容器宽度缩放：md 断点地图只有约 690px 宽时，
 * 10 单位的标签算下来不到 7px，直接糊掉。所以标签和可聚焦的按钮都是 HTML，
 * 字号锁死 11px。偏移量按"地图单位 → 百分比"换算，两端比例一致不会错位：
 *   横向 1 单位 = 1/1000 宽 = 0.1% 宽
 *   纵向 1 单位 = 1/410 高（viewBox 高 410）
 *
 * 【坐标换算】
 * 投影给出 0..1000 / 0..500，但 viewBox 是 "0 16 1000 410"。
 * 换算百分比时必须扣掉 y 的 16 偏移、除以 410 而不是 500，
 * 否则所有点位整体偏下约 20px（地图越宽偏得越多）。
 */

const DOT_ID = "wf-land-dots";
const CLIP_ID = "wf-land-clip";

const INK_950 = "var(--color-ink-950)";
const INK_900 = "var(--color-ink-900)";
const ACCENT_600 = "var(--color-accent-600)";
const ACCENT_400 = "var(--color-accent-400)";

/* viewBox 的可视区域（与 WORLD_VIEWBOX 一致，改那边要同步改这里） */
const VB_TOP = 16;
const VB_HEIGHT = 410;

/**
 * 30° 经纬网。经线 13 条（-180..180）、纬线 4 条（60N / 30N / 赤道 / 30S）。
 * 再密就成网格纸了，点阵陆地会被压掉；再疏又撑不起"图纸"的感觉。
 */
const MERIDIANS = Array.from({ length: 13 }, (_, i) => -180 + i * 30);
const PARALLELS = [60, 30, 0, -30];

const ROLE_LABEL: Record<OfficeRole, string> = {
  hq: "Headquarters",
  design: "Design studio",
  sales: "Sales centre",
  production: "Production",
};

function toPercent(office: OfficeNode) {
  const [x, y] = projectToMap(office.lon, office.lat);
  return {
    left: (x / WORLD_MAP_WIDTH) * 100,
    top: ((y - VB_TOP) / VB_HEIGHT) * 100,
  };
}

/** 地图单位 → 相对地图框的百分比（横纵基准不同，别混用） */
function labelShift(office: OfficeNode) {
  return {
    dx: (office.labelDx ?? 0) / (WORLD_MAP_WIDTH / 100),
    dy: ((office.labelDy ?? 0) / VB_HEIGHT) * 100,
  };
}

/** 经纬度格式化成 WGS-84 读数：48.86°N 2.35°E */
function formatCoord(lat: number, lon: number) {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(2)}°${ns} ${Math.abs(lon).toFixed(2)}°${ew}`;
}

/**
 * 准星几何（地图单位）。
 * 臂留出 5 单位空隙让中心和四臂分离，才像瞄准线而不是十字贴纸；
 * 光晕圈固定 r=11 常驻渲染，靠透明度淡入淡出——
 * 改 r 做动效在 Safari 上不可靠（r 作 CSS 属性支持较晚）。
 */
const ARM_INNER = 5;
const ARM_OUTER = 12;
const RING_R = 3.8;
const DOT_R = 1.3;
const HALO_R = 11;

/**
 * 命中半径（CSS 像素）。
 *
 * 【为什么不用"每个点位一个按钮"做命中】
 * 东南亚三点在 1000 单位的地图上只差 8–9 单位：地图 1296px 宽时是 10px，
 * 390px 手机上是 8px。而触摸目标最小 32px——三个 32px 的方框互相完全覆盖，
 * 谁在 DOM 后面谁赢。实测点柬埔寨的中心会激活缅甸，柬埔寨永远点不到。
 * 所以指针命中改成**最近点**：一次 pointermove 算九个点的距离取最小，
 * 距离超过阈值才判定为"点空白"。这样密集区也能稳定选中离手指最近的那个。
 *
 * 按钮仍保留，但改成 pointer-events-none，只服务键盘 Tab——
 * 聚焦时准星亮光晕 + 读数条同步，视觉焦点落在地图上而不是按钮边框。
 */
const HIT_RADIUS = 26;

export default function WorldMap({
  offices,
  className = "",
}: {
  offices: readonly OfficeNode[];
  className?: string;
}) {
  /** 同一时刻只允许一个点位处于激活态：左下角读数条只有一块。 */
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = offices.find((office) => office.id === activeId) ?? null;
  const activeIndex = active ? offices.findIndex((o) => o.id === active.id) : -1;

  /** 指针停留的位置，用最近点法反解出该选哪个点位（见 HIT_RADIUS 注释） */
  const frameRef = useRef<HTMLDivElement>(null);

  const pickNearest = (clientX: number, clientY: number) => {
    const frame = frameRef.current;
    if (!frame) return null;

    const rect = frame.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;

    let bestId: string | null = null;
    let bestDist = Infinity;

    for (const office of offices) {
      const { left, top } = toPercent(office);
      const cx = rect.left + (left / 100) * rect.width;
      const cy = rect.top + (top / 100) * rect.height;
      const dist = Math.hypot(clientX - cx, clientY - cy);
      if (dist < bestDist) {
        bestDist = dist;
        bestId = office.id;
      }
    }

    return bestDist <= HIT_RADIUS ? bestId : null;
  };

  const total = String(offices.length).padStart(2, "0");
  const roleText = active
    ? active.roles.map((role) => ROLE_LABEL[role]).join(" · ")
    : "—";

  return (
    <div
      className={`relative w-full ${className}`}
      onKeyDown={(event) => {
        if (event.key === "Escape") setActiveId(null);
      }}
    >
      {/* 图纸框：细边框界定"这是图"，不是页面背景上的浮点。
          ref 挂在这里，但计算命中用的 rect 必须是**地图本体**那层——
          移动端读数条在框内、参与布局，框高 ≠ 地图高，用框的 rect 会让
          百分比定位的点位和数据层对不上（点位整体上移）。 */}
      <div className="relative w-full border border-ink-900/12 bg-paper">
        <div
          ref={frameRef}
          className="relative w-full select-none overflow-hidden"
          /* 指针事件挂在整个图面，而不是逐个点位：
             密集点位用逐元素命中必然互相抢，见 HIT_RADIUS 注释。 */
          onPointerMove={(event) => {
            if (event.pointerType !== "mouse") return;
            setActiveId(pickNearest(event.clientX, event.clientY));
          }}
          onPointerLeave={(event) => {
            if (event.pointerType !== "mouse") return;
            setActiveId(null);
          }}
          onClick={(event) => {
            /* 触屏没有 hover，用点击切换；命中同样走最近点 */
            const id = pickNearest(event.clientX, event.clientY);
            if (id === null) {
              setActiveId(null);
              return;
            }
            setActiveId((current) => (current === id ? null : id));
          }}
        >
        {/* 地图本体：经纬网 / 陆地 / 准星纯装饰，语义与可操作元素都在 HTML 层 */}
        <svg
          viewBox={WORLD_VIEWBOX}
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="block h-auto w-full"
        >
          <defs>
            <pattern
              id={DOT_ID}
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="1.5"
                cy="1.5"
                r="1.2"
                fill={INK_900}
                fillOpacity="0.42"
              />
            </pattern>
            <clipPath id={CLIP_ID}>
              <path d={WORLD_LAND_PATH} />
            </clipPath>
          </defs>

          {/* ---- 经纬网：先画网，陆地压在上面 ---- */}
          <g>
            {MERIDIANS.map((lon) => {
              const x = ((lon + 180) / 360) * WORLD_MAP_WIDTH;
              const isAxis = lon === 0;
              return (
                <line
                  key={`m-${lon}`}
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={WORLD_MAP_HEIGHT}
                  stroke={INK_950}
                  strokeOpacity={isAxis ? 0.16 : 0.07}
                  strokeWidth="0.7"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
            {PARALLELS.map((lat) => {
              const y = ((90 - lat) / 180) * WORLD_MAP_HEIGHT;
              const isAxis = lat === 0;
              return (
                <line
                  key={`p-${lat}`}
                  x1={0}
                  y1={y}
                  x2={WORLD_MAP_WIDTH}
                  y2={y}
                  stroke={INK_950}
                  strokeOpacity={isAxis ? 0.16 : 0.07}
                  strokeWidth="0.7"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </g>

          {/* ---- 陆地点阵 ---- */}
          <rect
            x="0"
            y="0"
            width={WORLD_MAP_WIDTH}
            height={WORLD_MAP_HEIGHT}
            fill={`url(#${DOT_ID})`}
            clipPath={`url(#${CLIP_ID})`}
          />

          {/* ---- 经纬刻度：纯标注，小屏关掉（字号会随缩放糊成一团） ---- */}
          <g className="hidden lg:block">
            {PARALLELS.map((lat) => {
              const y = ((90 - lat) / 180) * WORLD_MAP_HEIGHT;
              const text =
                lat === 0 ? "0°" : `${Math.abs(lat)}°${lat > 0 ? "N" : "S"}`;
              return (
                <text
                  key={`pl-${lat}`}
                  x={6}
                  y={y - 3.5}
                  fontSize="9"
                  letterSpacing="0.06em"
                  fill="var(--color-ink-400)"
                >
                  {text}
                </text>
              );
            })}
            {MERIDIANS.map((lon) => {
              const x = ((lon + 180) / 360) * WORLD_MAP_WIDTH;
              /* 两端刻度会顶出画框，直接不画 */
              if (x < 24 || x > WORLD_MAP_WIDTH - 24) return null;
              const text =
                lon === 0 ? "0°" : `${Math.abs(lon)}°${lon > 0 ? "E" : "W"}`;
              return (
                <text
                  key={`ml-${lon}`}
                  x={x}
                  y={422}
                  textAnchor="middle"
                  fontSize="9"
                  letterSpacing="0.06em"
                  fill="var(--color-ink-400)"
                >
                  {text}
                </text>
              );
            })}
          </g>

          {/* ---- 准星 + 分区框 ---- */}
          {offices.map((office) => {
            const [x, y] = projectToMap(office.lon, office.lat);
            const isActive = activeId === office.id;

            return (
              <g key={`cross-${office.id}`}>
                {/* 中国四省：虚线圈 = "这一个点代表四个省"，
                    圈径取数据里的 clusterRadius，不手写死值 */}
                {office.clusterRadius ? (
                  <circle
                    cx={x}
                    cy={y}
                    r={office.clusterRadius}
                    fill="none"
                    stroke={ACCENT_600}
                    strokeOpacity="0.42"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    vectorEffect="non-scaling-stroke"
                  />
                ) : null}

                {/* 激活光晕：常驻渲染，只切透明度 */}
                <circle
                  cx={x}
                  cy={y}
                  r={HALO_R}
                  fill="none"
                  stroke={ACCENT_400}
                  strokeWidth="1.2"
                  vectorEffect="non-scaling-stroke"
                  className="transition-opacity duration-200"
                  opacity={isActive ? 0.95 : 0}
                />

                <path
                  d={
                    `M${x - ARM_OUTER},${y} H${x - ARM_INNER} ` +
                    `M${x + ARM_INNER},${y} H${x + ARM_OUTER} ` +
                    `M${x},${y - ARM_OUTER} V${y - ARM_INNER} ` +
                    `M${x},${y + ARM_INNER} V${y + ARM_OUTER}`
                  }
                  stroke={ACCENT_600}
                  strokeWidth="1.15"
                  vectorEffect="non-scaling-stroke"
                  fill="none"
                  className="transition-opacity duration-200"
                  opacity={activeId === null || isActive ? 1 : 0.45}
                />

                <circle
                  cx={x}
                  cy={y}
                  r={RING_R}
                  fill="none"
                  stroke={ACCENT_600}
                  strokeWidth="1.15"
                  vectorEffect="non-scaling-stroke"
                  className="transition-opacity duration-200"
                  opacity={activeId === null || isActive ? 1 : 0.45}
                />

                <circle cx={x} cy={y} r={DOT_R} fill={ACCENT_600} />
              </g>
            );
          })}
        </svg>

        {/* ---- 文字标签（HTML，字号锁 11px） ---- */}
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
          {offices.map((office) => {
            const { left, top } = toPercent(office);
            const { dx, dy } = labelShift(office);
            const anchor = office.labelAnchor ?? "start";
            const dim = activeId !== null && activeId !== office.id;

            return (
              <span
                key={`label-${office.id}`}
                className={`map-label absolute ${dim ? "opacity-35" : "opacity-100"}`}
                style={{
                  left: `calc(${left}% + ${dx}%)`,
                  top: `calc(${top}% + ${dy}%)`,
                  transform: `translate(${
                    anchor === "start" ? "0" : anchor === "end" ? "-100%" : "-50%"
                  }, -50%)`,
                }}
              >
                {office.label}
              </span>
            );
          })}
        </div>

        {/* ---- 键盘入口：按钮只服务 Tab/Enter，不参与指针命中 ---- */}
        {offices.map((office) => {
          const { left, top } = toPercent(office);
          const isActive = activeId === office.id;

          return (
            <button
              key={`hit-${office.id}`}
              type="button"
              aria-label={`${office.name} — ${office.roles
                .map((role) => ROLE_LABEL[role])
                .join(" · ")}`}
              aria-describedby={isActive ? "map-readout" : undefined}
              /* pointer-events-none 不能去掉：命中交给图框的最近点算法。
                 留着可点会把东南亚三点互相盖住的那个老问题带回来。
                 Tab 聚焦不受 pointer-events 影响，键盘仍可达。 */
              onFocus={() => setActiveId(office.id)}
              onBlur={() => setActiveId(null)}
              style={{ left: `${left}%`, top: `${top}%` }}
              className="pointer-events-none absolute z-20 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-950"
            />
          );
        })}
      </div>

      {/* ---- 读数条 ----
          必须放在 frameRef **外面**：移动端它是流内元素（图下方一行），
          留在里面会把 frameRef 撑高（地图 139 + 读数条 41 = 180），
          而点位按 frameRef 高的百分比定位，基准一变点位就整体偏上。
          桌面端它是 absolute bottom-4 left-4，外层框高度＝地图高度，
          定位基准与截图一致，不受影响。

          桌面：固定在地图左下角，三行等宽读数。
          移动端：地图只有 140px 高，压一块三行读数会盖掉半个东南亚；
                  改成图下方**常驻**单行摘要。常驻是为了不跳版——
                  若用 hidden 切换，点一下会把下面整块内容往下推 90px。
          pointer-events-none：读数条纯展示。若可命中，指针从准星移到条上时
          图框的 pointermove 会把它当成"点到空白"，读数条立刻自己消失。 */}
      <div
        id="map-readout"
        role="tooltip"
        className="pointer-events-none z-30 w-full border-t border-ink-900/12 bg-paper/92 px-4 py-2.5 backdrop-blur-sm md:absolute md:bottom-4 md:left-4 md:w-[236px] md:border md:border-ink-900/16 md:py-3.5"
      >
          {/* 移动端：单行摘要，高度恒定 */}
          <div className="flex items-baseline justify-between gap-3 md:hidden">
            <span className="font-mono text-[10px] tabular-nums tracking-[0.08em] text-ink-400">
              {active ? `${String(activeIndex + 1).padStart(2, "0")}/${total}` : `—/${total}`}
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium tracking-tight text-ink-950">
              {active ? active.name : "Tap a site"}
            </span>
            <span className="shrink-0 font-mono text-[9px] tabular-nums tracking-[0.04em] text-ink-400">
              {active ? formatCoord(active.lat, active.lon) : ""}
            </span>
          </div>

          {/* 桌面端：完整读数 */}
          <div className="hidden md:block">
            <div className="flex items-baseline justify-between gap-3 border-b border-ink-900/14 pb-1.5">
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-400">
                Site readout
              </span>
              <span className="font-mono text-[9px] tabular-nums tracking-[0.1em] text-ink-400">
                {active ? `${String(activeIndex + 1).padStart(2, "0")}/${total}` : `—/${total}`}
              </span>
            </div>

            <p className="mt-2 text-[14px] font-medium leading-snug tracking-tight text-ink-950">
              {active ? active.name : "Select a site"}
            </p>

            <dl className="mt-1.5 space-y-0.5 font-mono text-[10px] leading-[1.7]">
              <div className="flex justify-between gap-3">
                <dt className="shrink-0 tracking-[0.08em] text-ink-400">ROLE</dt>
                <dd className="text-right text-ink-600">{roleText}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="shrink-0 tracking-[0.08em] text-ink-400">COORD</dt>
                <dd className="whitespace-nowrap text-right text-ink-600">
                  {active ? formatCoord(active.lat, active.lon) : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="shrink-0 tracking-[0.08em] text-ink-400">REGION</dt>
                <dd className="text-right text-ink-600">{active?.region ?? "—"}</dd>
              </div>
            </dl>

            {/* 分区说明只在中国点上有（四省名单），其余点位不出这一行 */}
            {active?.note ? (
              <p className="mt-1.5 border-t border-ink-900/10 pt-1.5 text-[11px] leading-snug text-ink-400">
                {active.note}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* 图脚：图纸的署名栏，顺带把编号规则说清（读数条的 03/09 对得上） */}
      <div className="mt-2.5 flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-400">
        <span>Equirectangular · WGS-84</span>
        <span>Sites 01–{total}</span>
      </div>
    </div>
  );
}
