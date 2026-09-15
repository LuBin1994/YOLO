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
 * 最窄断点（lg）下每格 17vw，故最少 6 格。
 */
const MIN_TILES_PER_LOOP = 6;

function toTile(item: string | MarqueeTile): MarqueeTile {
  return typeof item === "string" ? { src: item } : item;
}

/** 图片张数不足一屏时整体重复若干轮，保证轨道铺满 */
function fillLoop(tiles: MarqueeTile[]): MarqueeTile[] {
  if (tiles.length === 0) return tiles;
  const rounds = Math.ceil(MIN_TILES_PER_LOOP / tiles.length);
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
    <section className="w-full" aria-label="Product gallery">
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

                const media = (
                  <Image
                    src={tile.src}
                    alt={alt}
                    fill
                    sizes="(max-width: 768px) 48vw, (max-width: 1024px) 22vw, 17vw"
                    className="object-cover"
                  />
                );

                return (
                  <div
                    key={`${tile.src}-${i}`}
                    className="marquee-cell"
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
