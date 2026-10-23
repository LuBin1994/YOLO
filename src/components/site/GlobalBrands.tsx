import type { CSSProperties } from "react";
import Link from "next/link";
import Reveal from "./Reveal";
import { PARTNERS_INTRO, PARTNER_BRANDS } from "@/lib/site-data";

/**
 * 合作品牌墙（2026-10-22 改版，参考 Primesource 的 Global Brands 板块）。
 *
 * 【为什么从信任带里拆出来，单独成为一整屏深色】
 * 原来这 20 个标识是信任带的第三小节，裸排在珍珠白上、没有边框。
 * 客户给的目标版式是：左侧一栏文案 + 右侧四列标识墙，整块**黑底**。
 * 黑底不可能塞在信任带白色的容器里（要么整段变黑，要么用负边距去
 * 逃出 container-site，两种都更脏），所以拆成独立 section。
 * 代价是多一个 section，收益是页面在"证据区"的末尾得到一个真正的重音——
 * 认证是灰白的贴图墙，品牌是黑底白标，两者不会互相削弱。
 *
 * 【标识为什么统一变白，而不是另找白色版本】
 * 手上的 20 个标识是黑/彩色墨迹 + 透明底（Nike 黑、Lacoste 绿、Levi's 红）。
 * 直接放黑底上等于全部消失。这里用 `brightness(0) invert(1)` 把任意墨色
 * 压成纯白：透明像素 alpha 为 0，不会被这条滤镜"染色"，所以边缘仍然干净。
 * 副作用是 Levi's 那个红底块里的白噪点也一并被抹平了——本来是要等客户
 * 给原始文件才能解决的问题，这里顺手没了。
 *
 * 【版式细节】
 * - 四列、左对齐（不是居中）：标识宽度差异很大，居中会让左边缘参差，
 *   左对齐才有一堵墙的感觉；
 * - 不画任何格子、不加 hover 底色：留白本身就是分隔；
 * - 尺寸仍用 BRAND_WIDTH / BRAND_FIXED_HEIGHT 做视觉配平，
 *   否则方框标（Nike / Jordan）会缩成一小块。
 */

/**
 * 品牌标识的包围盒宽度。只限高度不行——方框 SVG（Nike / Jordan /
 * Under Armour）在 viewBox 里四周都有留白，只给 max-height 的话，
 * 图形本体只剩三分之一大。所以以**宽度**为主控，再用 max-height 兜住
 * 高瘦的字标。数值是视觉体量配平后的结果，新增品牌不用补，缺省 120。
 */
const BRAND_WIDTH: Record<string, number> = {
  Nike: 125,
  Zara: 135,
  Costco: 140,
  "Levi's": 114,
  "Under Armour": 70,
  Mango: 135,
  Lacoste: 161,
  "Abercrombie & Fitch": 161,
  Jordan: 60,
  Converse: 101,
  "Max&Co.": 140,
  "Weekend MaxMara": 156,
  Marella: 135,
  Pennyblack: 146,
  iBlues: 125,
  "Gaudì": 120,
  Ellesse: 107,
  "U.S. Polo Assn.": 114,
  Springfield: 114,
  Stanley: 120,
};

/**
 * 少数**竖式组合标**（图形在上、字标在下）不能按宽度给——
 * 它们的长边是高度，卡宽度等于卡死高度，最后会缩成一个拇指大的方块。
 * 这几个直接给定高。
 */
const BRAND_FIXED_HEIGHT: Record<string, number> = {
  "U.S. Polo Assn.": 54,
};

/** 把任意墨色的标识压成纯白；透明底不受影响 */
const TO_WHITE = { filter: "brightness(0) invert(1)" } as const;

/**
 * 这两个**保留原色**，不压白。
 *
 * 它们的标识本身就是"一块实心底 + 反白字"的结构（Levi's 红标、Costco 白色
 * 圆角块），不是透明的墨线。`brightness(0) invert(1)` 会把底和字一起压成
 * 同一种白，最后只剩一个纯白方块，辨识度归零。
 * 保留原色放在暖炭底上反而正好：红标、白牌都读得清清楚楚。
 *
 * 等客户给了官方单色反白版（white-on-transparent）再把这两个从名单里删掉。
 */
const KEEP_COLOR = new Set(["Levi's", "Costco"]);

export default function GlobalBrands() {
  return (
    <section className="w-full bg-ink-950 text-white">
      <div className="container-site py-20 md:py-28">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,28%)_1fr] lg:gap-20">
          {/* 左栏：说明 + 入口 */}
          <Reveal>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/50">
                {PARTNERS_INTRO.eyebrow}
              </p>
              <h2 className="display-md mt-6 text-white">
                {PARTNERS_INTRO.title}
              </h2>

              <p className="mt-7 text-[13px] leading-[1.85] text-white/70">
                {PARTNERS_INTRO.lead}
              </p>
              <p className="mt-4 text-[13px] leading-[1.85] text-white/70">
                {PARTNERS_INTRO.body}
              </p>

              {/* 参考页的按钮：方框 + 右侧独立的箭头格。
                  箭头单独一格而不是跟在文字后面，是这块版式里唯一的手工感。 */}
              <Link
                href={PARTNERS_INTRO.cta.href}
                className="group mt-9 inline-flex items-stretch border border-white/25 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/85 transition-colors duration-300 hover:border-white/60 hover:text-white"
              >
                <span className="px-5 py-3">{PARTNERS_INTRO.cta.label}</span>
                <span
                  aria-hidden
                  className="flex w-11 items-center justify-center border-l border-white/25 transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </div>
          </Reveal>

          {/* 右栏：四列标识墙 */}
          <Reveal>
            <ul className="grid grid-cols-2 items-center gap-x-6 gap-y-9 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-4 lg:gap-x-10 lg:gap-y-11">
              {PARTNER_BRANDS.map((brand) => {
                const fixedHeight = BRAND_FIXED_HEIGHT[brand.name];
                /* 宽度上限走 CSS 变量，而不是内联 maxWidth：
                   内联 maxWidth 会盖掉类名里的 max-w-full，窄屏下标识
                   会冲出格子（161px 宽的字标塞进 159px 的列）。 */
                const style: CSSProperties = fixedHeight
                  ? { height: `${fixedHeight}px` }
                  : ({
                      "--brand-w": `${BRAND_WIDTH[brand.name] ?? 120}px`,
                    } as CSSProperties);
                if (!KEEP_COLOR.has(brand.name)) Object.assign(style, TO_WHITE);

                return (
                  <li key={brand.name} className="flex h-14 items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      title={brand.name}
                      loading="lazy"
                      style={style}
                      className={
                        fixedHeight
                          ? "w-auto max-w-full object-contain"
                          : "h-auto max-h-12 w-auto max-w-[min(100%,var(--brand-w))] object-contain"
                      }
                    />
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
