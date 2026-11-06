import Image from "next/image";
import Link from "next/link";

/**
 * 图片跑马灯：多行图片带向左无限滚动，鼠标悬停整块暂停、移出继续。
 * - 纯 CSS 动画（无 JS 计时器），SSR 友好，不产生 hydration 差异
 * - 每行内容渲染两遍、轨道位移 -50%，实现无缝循环
 * - 满幅贴边排布，无间隙，对齐 Primesource 的图墙观感
 * - 每个格子可携带 href：整格可点（跳产品详情页），悬停单格放大
 */

export interface MarqueeTile {
  src: string;
  /** 有值时整格渲染为链接，通常指向 /products/[slug] */
  href?: string;
  /** 图片替代文本，缺省时按行号自动生成 */
  alt?: string;
}

export interface MarqueeRow {
  /** 支持纯字符串，或带链接的格子对象 */
  images: readonly (string | MarqueeTile)[];
  /** 单圈时长（秒），越大越慢；两行给不同值可避免整齐划一 */
  duration?: number;
}

/**
 * 单圈轨道至少要铺满视口，否则位移 -50% 回到起点时会露出空白。
 *
 * 格子宽度改成「由图片自身宽高比决定」之后就不能再按固定格数算：
 * 竖图窄、横图宽，6 格可能只有 1000px。改成按**估算总宽度**补轮次，
 * 4000px 保守覆盖到 2560 宽屏（按 260px ≈ 28vh@900 高、1:1 图估算）。
 * 这是纯 SSR 计算，不引入客户端测量，也就不存在 hydration 抖动。
 */
const MIN_LOOP_WIDTH = 4000;
const EST_TILE_WIDTH = 260;

function toTile(item: string | MarqueeTile): MarqueeTile {
  return typeof item === "string" ? { src: item } : item;
}

/** 图片总宽不足一屏时整轮重复，保证轨道铺满 */
function fillLoop(tiles: MarqueeTile[]): MarqueeTile[] {
  if (tiles.length === 0) return tiles;
  const rounds = Math.max(
    1,
    Math.ceil(MIN_LOOP_WIDTH / (tiles.length * EST_TILE_WIDTH))
  );
  return Array.from({ length: rounds }, () => tiles).flat();
}

export default function ImageMarquee({
  rows,
  label = "Marquee",
}: {
  rows: readonly MarqueeRow[];
  /** 无障碍标签前缀，用于生成每张图的 alt */
  label?: string;
}) {
  return (
    /* scroll-mt 避开 fixed 导航：用 #home-marquee 定位/验收时不会被 header 盖住 */
    <section
      id="home-marquee"
      className="w-full scroll-mt-20"
      aria-label="Product gallery"
    >
      {rows.map((row, rowIndex) => {
        const duration = row.duration ?? 60;
        /** 真实图片数（a11y 只播报这批，填充与副本不重复播报） */
        const rawCount = row.images.length;
        const tiles = fillLoop(row.images.map(toTile));
        // 轨道内容重复两遍，动画位移 -50% 时首尾衔接
        const loop = [...tiles, ...tiles];

        return (
          <div key={`marquee-row-${rowIndex}`} className="marquee-viewport">
            <div
              className="marquee-track"
              style={{ animationDuration: `${duration}s` }}
            >
              {loop.map((tile, i) => {
                const isRepeat = i >= rawCount;
                const alt = isRepeat
                  ? ""
                  : (tile.alt ?? `${label} look ${i + 1}, row ${rowIndex + 1}`);

                /*
                 * 不用 fill：fill 会注入 position:absolute + width:100%，
                 * 而格子宽度现在要由图片撑开，两者互相依赖就塌成 0。
                 * 改用 width/height 属性提供初始比例（SSR 预留，不抖），
                 * 浏览器加载后按图片 natural ratio 自动算出实际宽度。
                 * 于是：横图格子宽、竖图格子窄，图片完整不裁切。
                 */
                const media = (
                  <Image
                    src={tile.src}
                    alt={alt}
                    width={800}
                    height={800}
                    sizes="(max-width: 768px) 60vw, 400px"
                    style={{
                      display: "block",
                      height: "100%",
                      width: "auto",
                      maxWidth: "none",
                      objectFit: "contain",
                    }}
                  />
                );

                return (
                  <div
                    key={`${tile.src}-${i}`}
                    /* marquee-cell--static：没有链接的格子不加悬停反馈。
                       纯展示的图做交互暗示反而像可点、点下去没反应。 */
                    className={`marquee-cell${tile.href ? "" : " marquee-cell--static"}`}
                    /* 重复的格子对辅助技术隐藏，避免重复播报 */
                    aria-hidden={isRepeat}
                  >
                    {tile.href ? (
                      <Link
                        href={tile.href}
                        className="marquee-link"
                        /* 重复格子同样可点，但不进 Tab 序列，避免重复焦点 */
                        tabIndex={isRepeat ? -1 : undefined}
                      >
                        {media}
                      </Link>
                    ) : (
                      media
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}
