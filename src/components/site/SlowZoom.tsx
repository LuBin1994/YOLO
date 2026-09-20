"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * 缓慢推近：图片进入视口后由 scale(1.06) 缓慢回到 scale(1)。
 *
 * 与 Reveal 的「淡入 + 上移」刻意区分——全站只有一种动效会读起来像模板，
 * 而"影像缓慢推近"是编辑式影像里最常用的一种呼吸感。
 *
 * 实现取舍：
 * - 用 IntersectionObserver + 纯 CSS transition，不引动画库
 * - 【不做】逐帧跟随滚动的视差。那需要滚动监听，移动端有掉帧风险，
 *   收益不抵复杂度；这里只做"进入时一次性推近"。
 * - 降级安全：无 IntersectionObserver 时直接显示；reduced-motion 下由
 *   CSS 取消 transform，图片保持完整可见（信息不丢失）。
 *
 * 用法：必须是 `relative overflow-hidden` 容器的直接子元素，
 * 内部放 next/image 的 fill 图片。
 *   <div className="relative h-[70vh] overflow-hidden">
 *     <SlowZoom><Image src={...} fill alt="" className="object-cover" /></SlowZoom>
 *   </div>
 */
export default function SlowZoom({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;

    /* 无 IntersectionObserver：直接落到终态，不做推近 */
    if (!el || typeof IntersectionObserver === "undefined") {
      el?.classList.add("is-visible");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          /* 在下一帧再加 class，确保初始 scale(1.06) 先被应用，避免跳变 */
          requestAnimationFrame(() => el.classList.add("is-visible"));
          io.disconnect();
        }
      },
      /* threshold 0：满幅区块刚露头即触发 */
      { rootMargin: "0px 0px -10% 0px", threshold: 0 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`slow-zoom absolute inset-0 ${className}`.trim()}>
      {children}
    </div>
  );
}
