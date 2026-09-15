import Image from "next/image";

/**
 * 图片跑马灯：多行图片带向左无限滚动，鼠标悬停整块暂停、移出继续。
 * - 纯 CSS 动画（无 JS 计时器），SSR 友好，不产生 hydration 差异
 * - 每行内容渲染两遍、轨道位移 -50%，实现无缝循环
 * - 满幅贴边排布，无间隙，对齐 Primesource 的图墙观感
 */

export interface MarqueeRow {
  images: readonly string[];
  /** 单圈时长（秒），越大越慢；两行给不同值可避免整齐划一 */
  duration?: number;
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
        // 轨道内容重复两遍，动画位移 -50% 时首尾衔接
        const loop = [...row.images, ...row.images];

        return (
          <div key={`marquee-row-${rowIndex}`} className="marquee-viewport">
            <div
              className="marquee-track"
              style={{ animationDuration: `${duration}s` }}
            >
              {loop.map((src, i) => (
                <div
                  key={`${src}-${i}`}
                  className="marquee-cell"
                  /* 第二遍副本对辅助技术隐藏，避免重复播报 */
                  aria-hidden={i >= row.images.length}
                >
                  <Image
                    src={src}
                    alt={
                      i >= row.images.length
                        ? ""
                        : `${label} look ${i + 1}, row ${rowIndex + 1}`
                    }
                    fill
                    sizes="(max-width: 768px) 48vw, (max-width: 1024px) 22vw, 17vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
