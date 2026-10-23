"use client";

import { useState } from "react";
import {
  WORLD_LAND_PATH,
  WORLD_MAP_HEIGHT,
  WORLD_MAP_WIDTH,
  WORLD_VIEWBOX,
  projectToMap,
} from "@/lib/world-land";
import type { OfficeNode, OfficeRole } from "@/lib/site-data";

/**
 * 点阵世界地图 + 呼吸点位 + 悬停信息卡。
 *
 * 【2026-10-22 改版二：点位换成绿色坐标图钉】
 * 最初参考万华化学做了「脉冲环 + 形状点」，客户看过之后要求：
 * 每个点直接做成绿色的坐标图标（地图图钉），黑点和扩散圈都不要。
 * 现在的形态：SVG 泪滴图钉（森林绿），钉尖落在真实坐标上，
 * 角色区分靠**深浅 + 大小**——总部最大最深（accent-600）、
 * 设计中心浅一档（accent-400）、销售/生产用 accent-500、
 * 生产整体小一号。悬停/点击信息卡的交互不变。
 *
 * 【中国生产簇为什么仍是虚线圈】
 * 四个省在这个地图尺度下分不开，圈住「这一片」比四枚重叠的
 * 图钉更诚实；杭州总部的钉恰好落在圈内，圈里已经有绿了。
 * 圈整块做成按钮，悬停/点击弹「China · 4 provinces」卡片。
 * 圈的 z 层压在图钉下面——否则悬停总部会被圈截走。
 *
 * 【点位为什么是 HTML 而不是 SVG 元素】
 * 卡片里要放标题、说明、多角色标签，塞进 <foreignObject> 既难排版、
 * 又在部分浏览器里字号不跟随缩放。这里让 SVG 只画陆地与点阵，
 * 点位和卡片都是 HTML，叠在同一个 relative 容器上——按钮天然可聚焦、
 * 可点击、可 hover，卡片也就能用正常的 Tailwind 排版。
 *
 * 【坐标换算】
 * 投影给出 0..1000 / 0..500，但 viewBox 是 "0 16 1000 410"。
 * 换算百分比时必须扣掉 y 的 16 偏移，并且除以 410 而不是 500，
 * 否则所有点位会整体偏下约 20px（地图越宽偏得越多）。
 */

const DOT_ID = "wf-land-dots";
const CLIP_ID = "wf-land-clip";

const INK_950 = "var(--color-ink-950)";
const INK_900 = "var(--color-ink-900)";
const PAPER = "var(--color-paper)";

/* viewBox 的可视区域（与 WORLD_VIEWBOX 一致，改那边要同步改这里） */
const VB_TOP = 16;
const VB_HEIGHT = 410;

function toPercent(office: OfficeNode) {
  const [x, y] = projectToMap(office.lon, office.lat);
  return {
    left: (x / WORLD_MAP_WIDTH) * 100,
    top: ((y - VB_TOP) / VB_HEIGHT) * 100,
  };
}

const ROLE_LABEL: Record<OfficeRole, string> = {
  hq: "Headquarters",
  design: "Design studio",
  sales: "Sales centre",
  production: "Production",
};

/**
 * 卡片相对点位的偏移。
 *
 * - 靠北的点（丹麦 19%）卡片放不下上方，改放下方；
 * - 贴左右边缘时改对齐方向，避免小屏上卡片被裁掉一半。
 */
function cardTransform(left: number, top: number) {
  /* 上方偏移 36px：图钉从坐标向上长高约 28px，卡片必须整体让开钉身 */
  const vertical = top < 30 ? "20px" : "calc(-100% - 36px)";
  const horizontal = left < 18 ? "0px" : left > 82 ? "-100%" : "-50%";
  return `translate(${horizontal}, ${vertical})`;
}

/** 图钉配色：总部最深、设计中心最浅，销售与生产同色 */
const PIN_FILL: Record<OfficeRole, string> = {
  hq: "var(--color-accent-600)",
  design: "var(--color-accent-400)",
  sales: "var(--color-accent-500)",
  production: "var(--color-accent-500)",
};

/**
 * 绿色坐标图钉（泪滴形）。钉尖在 SVG 的 (12,22)——容器底边对齐后
 * 钉尖正好落在按钮中心（即真实坐标）。总部多一圈白环，加深"主点"印象。
 */
function MapPin({ role }: { role: OfficeRole }) {
  const size =
    role === "hq" ? "h-9 w-9" : role === "production" ? "h-6 w-6" : "h-7 w-7";
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`${size} drop-shadow-[0_3px_5px_rgba(27,26,23,0.3)]`}
    >
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill={PIN_FILL[role]}
      />
      <circle cx="12" cy="9" r="2.6" fill="#fff" />
      {role === "hq" ? (
        <circle
          cx="12"
          cy="9"
          r="4.3"
          fill="none"
          stroke="#fff"
          strokeOpacity="0.65"
          strokeWidth="1.1"
        />
      ) : null}
    </svg>
  );
}

function Label({
  office,
  opacity,
}: {
  office: OfficeNode;
  opacity: number;
}) {
  const [x, y] = projectToMap(office.lon, office.lat);

  return (
    <text
      x={x + (office.labelDx ?? 0)}
      y={y + (office.labelDy ?? 0)}
      textAnchor={office.labelAnchor ?? "start"}
      dominantBaseline="middle"
      fontSize="10"
      fontWeight="500"
      letterSpacing="0.02em"
      fill={INK_950}
      fillOpacity={opacity}
      paintOrder="stroke"
      stroke={PAPER}
      strokeWidth="3"
      strokeLinejoin="round"
      className="transition-opacity duration-200"
    >
      {office.label}
    </text>
  );
}

export default function WorldMap({
  offices,
  className = "",
}: {
  offices: readonly OfficeNode[];
  className?: string;
}) {
  /** 同一时刻只允许一个点位处于展开态——欧洲三点只差几度经度，
   *  卡片宽 208px，同时展开必然互相压住。 */
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = offices.find((office) => office.id === activeId) ?? null;
  const activePos = active ? toPercent(active) : null;

  return (
    <div
      className={`relative w-full ${className}`}
      onKeyDown={(event) => {
        if (event.key === "Escape") setActiveId(null);
      }}
    >
      {/* 地图本体：纯装饰，语义与可操作元素都在上面的点位层 */}
      <svg
        viewBox={WORLD_VIEWBOX}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="h-auto w-full"
      >
        <defs>
          <pattern id={DOT_ID} width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.2" fill={INK_900} fillOpacity="0.4" />
          </pattern>
          <clipPath id={CLIP_ID}>
            <path d={WORLD_LAND_PATH} />
          </clipPath>
        </defs>

        <rect
          x="0"
          y="0"
          width={WORLD_MAP_WIDTH}
          height={WORLD_MAP_HEIGHT}
          fill={`url(#${DOT_ID})`}
          clipPath={`url(#${CLIP_ID})`}
        />

        {/* 小屏地图只做概览，标签隐藏，避免糊成一团 */}
        <g className="hidden md:block">
          {offices.map((office) => (
            <Label
              key={office.id}
              office={office}
              /* 展开的那一个直接把标签隐掉——卡片就落在它的正上方，
                 留着半个字从卡片边缘探出来比盖住更难看。 */
              opacity={
                activeId === null ? 1 : activeId === office.id ? 0 : 0.35
              }
            />
          ))}
        </g>
      </svg>

      {/* 点位层：8 枚图钉 + 1 个虚线圈按钮，键盘可 Tab、触屏可点、鼠标可悬停 */}
      {offices.map((office) => {
        const { left, top } = toPercent(office);
        const primary: OfficeRole = office.roles[0] ?? "sales";
        const roleText = office.roles.map((role) => ROLE_LABEL[role]).join(" · ");
        const isActive = activeId === office.id;

        /* 中国生产簇：整块虚线圈就是按钮。
           z-10 故意压在图钉层（z-20）下面——杭州总部钉落在圈内，
           若圈在上层，悬停总部会先被圈截走。 */
        if (office.clusterRadius) {
          const diameter =
            ((office.clusterRadius * 2) / WORLD_MAP_WIDTH) * 100;
          return (
            <button
              key={office.id}
              type="button"
              aria-label={`${office.name} — ${roleText}`}
              aria-describedby={isActive ? `map-tip-${office.id}` : undefined}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setActiveId(office.id);
              }}
              onPointerLeave={(event) => {
                if (event.pointerType === "mouse") setActiveId(null);
              }}
              onClick={() => setActiveId(isActive ? null : office.id)}
              onFocus={() => setActiveId(office.id)}
              onBlur={() => setActiveId(null)}
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${diameter}%`,
                aspectRatio: "1 / 1",
              }}
              className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-950"
            >
              <span
                aria-hidden
                className="absolute inset-0 rounded-full border border-dashed border-ink-900/30 transition-colors duration-200 group-hover:border-accent-500/55 group-focus-visible:border-accent-500/55"
              />
            </button>
          );
        }

        return (
          <button
            key={office.id}
            type="button"
            aria-label={`${office.name} — ${roleText}`}
            aria-describedby={isActive ? `map-tip-${office.id}` : undefined}
            /* 鼠标悬停展开，触屏点击切换。
               必须判断 pointerType：iOS 上 tap 会先发 pointerenter 再发 click，
               不判断的话"打开"会立刻被 click 的 toggle 关掉。 */
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") setActiveId(office.id);
            }}
            onPointerLeave={(event) => {
              if (event.pointerType === "mouse") setActiveId(null);
            }}
            onClick={() => setActiveId(isActive ? null : office.id)}
            onFocus={() => setActiveId(office.id)}
            onBlur={() => setActiveId(null)}
            style={{ left: `${left}%`, top: `${top}%` }}
            className="group absolute z-20 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-950 md:h-9 md:w-9"
          >
            {/* 手机端整体缩到 0.72：地图只有 140px 高，
                36px 的钉子会互相叠成一排锚，桌面端同尺寸正合适。 */}
            <span
              aria-hidden
              className="absolute inset-0 scale-[0.72] md:scale-100"
            >
              {/* 钉身垂直居中于坐标点：bottom-1/2 让钉底边贴在按钮中心，
                  再用 origin-bottom 保证 hover 放大时钉尖原地不动。 */}
              <span className="absolute bottom-1/2 left-1/2 -translate-x-1/2 origin-bottom transition-transform duration-300 ease-out group-hover:scale-110 group-focus-visible:scale-110">
                <MapPin role={primary} />
              </span>
            </span>
          </button>
        );
      })}

      {/* 信息卡：只渲染一张，跟着 active 点位走 */}
      {active && activePos ? (
        <div
          id={`map-tip-${active.id}`}
          role="tooltip"
          style={{
            left: `${activePos.left}%`,
            top: `${activePos.top}%`,
            transform: cardTransform(activePos.left, activePos.top),
          }}
          className="pointer-events-none absolute z-30 w-56 border border-ink-900/12 bg-white p-4 shadow-[0_18px_44px_-24px_rgba(27,26,23,0.5)] md:w-64"
        >
          <p className="text-[10px] uppercase tracking-[0.13em] text-ink-400">
            {active.roles.map((role) => ROLE_LABEL[role]).join(" · ")}
          </p>
          <p className="mt-1.5 text-sm font-medium leading-snug tracking-tight text-ink-950">
            {active.name}
          </p>
          {active.note ? (
            <p className="mt-1 text-[11px] leading-relaxed text-ink-600">
              {active.note}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
