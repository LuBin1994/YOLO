"use client";

import { useId, useState } from "react";
import {
  CHINA_ANCHORS,
  CHINA_JD_HEIGHT,
  CHINA_JD_LAND,
  CHINA_JD_PATH,
  CHINA_JD_WIDTH,
  CHINA_MAP_HEIGHT,
  CHINA_MAP_WIDTH,
  CHINA_PROVINCES,
} from "@/lib/china-map";

/**
 * 中国合作省份地图（2026-11-06）
 *
 * 【为什么不接 ECharts / 地图 SDK】
 * 客户要求站点部署在海外，且明确否掉所有地图 SDK —— 腾讯/高德/百度的 JS 与瓦片
 * 都走境内 CDN，海外访客要多等一跳，还要长期养 key 与 Referer 白名单。
 * ECharts 的 map 系列本身只是一层渲染器，它同样得配一份省级边界 GeoJSON，
 * 压缩后仍要多背 300KB+ 运行时；而这里要的是一张不会变的静态图。
 *
 * 所以：把 GeoJSON 在生成阶段编译成内联 SVG 路径（`src/lib/china-map.ts`，43KB），
 * 页面直接吐 <path> —— 运行时零请求、零依赖，且**服务端就渲出来**，
 * 不靠 JS 水合才出图（ECharts 方案首屏会先空一块再画）。
 * 要改配色、加省份只动数据，不碰渲染逻辑。
 *
 * 【合规】
 * 底图来自阿里云 DataV.GeoAtlas 中国省级边界：34 个省级要素（含台湾省、港澳）
 * 加一条南海诸岛九段线要素，与国家标准地图的表示一致；九段线单独做右下角标，
 * 这是标准地图的常规做法，不是自绘边界。**不要为了"好看"删掉角标或台湾省。**
 */

export interface ProvinceNode {
  /** 与 src/lib/china-map.ts 的 adcode 对应，地图按它找省份 */
  adcode: number;
  /** 编号，列表与图上徽标同一套 */
  index: string;
  en: string;
  zh: string;
  city: string;
  /** 该省在我们的供应链里承担什么 */
  role: string;
}

/** 高亮省份（accent-600）/ hover（accent-500）/ 常规省份（sand-100） */
const FILL_ON = "#2f5c4a";
const FILL_HOVER = "#3f735d";
const FILL_OFF = "#efeae0";

/** 南海诸岛角标在主图里的落点：右下角海面，标准地图的常规位置。
 *  左边离台湾岛东岸（约 x=785）留 39，右边离画布留 26（150+824=974），
 *  下边离画布留 12（258+452=710，画布 1000 × 722）—— 不要贴边，会被读成出血。 */
const JD_ORIGIN = { x: 824, y: 452 };

export default function ChinaNetwork({
  nodes,
  caption,
}: {
  nodes: readonly ProvinceNode[];
  caption: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  /** clipPath 的 id 必须全局唯一：写成常量，一旦这个区块被复用两次，
      第二个角标会引用第一个的裁剪区，画出来就是错位的。 */
  const clipId = `china-jd-clip-${useId().replace(/:/g, "")}`;
  const highlighted = new Map(nodes.map((n) => [n.adcode, n]));

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
      <div>
        <svg
          viewBox={`0 0 ${CHINA_MAP_WIDTH} ${CHINA_MAP_HEIGHT}`}
          className="h-auto w-full"
          role="img"
          aria-label="Map of China with Hebei, Shandong, Jiangsu, Anhui and Zhejiang highlighted"
        >
          {CHINA_PROVINCES.map((province) => {
            const node = highlighted.get(province.adcode);
            const isActive = node ? active === node.index : false;
            return (
              <path
                key={province.adcode}
                d={province.d}
                fill={!node ? FILL_OFF : isActive ? FILL_HOVER : FILL_ON}
                stroke="#ffffff"
                strokeWidth={1.2}
                strokeLinejoin="round"
                className={
                  node
                    ? "cursor-pointer transition-[fill] duration-200"
                    : "transition-[fill] duration-200"
                }
                /* 图 → 列表的反向联动：hover 省份时右侧对应行也亮。
                   这层是增强，不是唯一入口 —— 列表本身就是完整的文本。 */
                onMouseEnter={node ? () => setActive(node.index) : undefined}
                onMouseLeave={node ? () => setActive(null) : undefined}
              />
            );
          })}

          {/* 南海诸岛角标。九段线在原数据里是极细的闭合条带，纯填充在这个尺寸下
              会淡到看不见，所以补一层同色描边把它提回可读的粗细；
              下面再垫一层同窗口的陆地，否则十条短划悬在空白框里认不出是哪儿。 */}
          <g transform={`translate(${JD_ORIGIN.x} ${JD_ORIGIN.y})`}>
            <rect
              width={CHINA_JD_WIDTH}
              height={CHINA_JD_HEIGHT}
              fill="#ffffff"
              stroke="rgba(27,26,23,0.2)"
              strokeWidth={1}
            />
            <clipPath id={clipId}>
              <rect width={CHINA_JD_WIDTH} height={CHINA_JD_HEIGHT} />
            </clipPath>
            <g clipPath={`url(#${clipId})`}>
              <path d={CHINA_JD_LAND} fill={FILL_OFF} />
              <path
                d={CHINA_JD_PATH}
                fill="#1b1a17"
                fillOpacity={0.9}
                stroke="#1b1a17"
                strokeWidth={0.9}
                strokeLinejoin="round"
              />
            </g>
            <rect
              width={CHINA_JD_WIDTH}
              height={CHINA_JD_HEIGHT}
              fill="none"
              stroke="rgba(27,26,23,0.2)"
              strokeWidth={1}
            />
          </g>

          {/* 编号徽标：图上只放编号 —— 五省挤在东部，直接摆省名必然互相压字。
              手机上不画：viewBox 缩到 342px 宽时，13 单位的圆只剩 4px，编号根本看不清，
              五个圆还会互相叠。窄屏靠高亮色块 + 下方编号列表对应，比塞进图里清楚。 */}
          {nodes.map((node) => {
            const anchor = CHINA_ANCHORS[node.adcode];
            if (!anchor) return null;
            const isActive = active === node.index;
            return (
              <g
                key={node.adcode}
                transform={`translate(${anchor[0]} ${anchor[1]})`}
                className="hidden sm:block"
              >
                <circle
                  r={isActive ? 16 : 13}
                  fill="#ffffff"
                  stroke={isActive ? FILL_ON : "transparent"}
                  strokeWidth={1.5}
                  className="transition-all duration-200"
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={13}
                  fontWeight={600}
                  fill={FILL_ON}
                >
                  {node.index}
                </text>
              </g>
            );
          })}
        </svg>

        <p className="mt-5 max-w-2xl text-[12px] leading-relaxed text-ink-400">
          {caption}
        </p>
      </div>

      {/* 图例：也是这张图的无障碍正文入口（地图本身只有编号） */}
      <ol className="border-t hairline">
        {nodes.map((node) => {
          const isActive = active === node.index;
          return (
            <li
              key={node.adcode}
              onMouseEnter={() => setActive(node.index)}
              onMouseLeave={() => setActive(null)}
              className={`grid grid-cols-[2.25rem_minmax(0,1fr)] items-baseline gap-x-4 gap-y-1.5 border-b hairline px-2 py-5 transition-colors duration-200 ${
                isActive ? "bg-sand-50" : ""
              }`}
            >
              <span className="text-[11px] tabular-nums tracking-[0.14em] text-ink-400">
                {node.index}
              </span>
              <span className="text-[16px] font-medium text-ink-950">
                {node.en}
                <span className="ml-2 text-[13px] font-normal text-ink-400">
                  {node.zh}
                </span>
              </span>
              <span className="col-start-2 text-[14px] leading-relaxed text-ink-600">
                <span className="text-ink-950">{node.city}</span>
                <span className="mx-1.5 text-ink-400">·</span>
                {node.role}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
