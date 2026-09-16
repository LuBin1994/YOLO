"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * 滚动揭示：元素进入视口后淡入并上移到位。
 * - 只用 IntersectionObserver + CSS transition，不引入动画库
 * - 命中一次即断开观察，不反复触发，避免长页面上的持续开销
 * - 降级安全：无法观察时直接显示；reduced-motion 下由 CSS 直接显示内容
 *   （与跑马灯不同，这里的降级只是"不做入场动画"，内容始终可见）
 */
export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  /** 入场延迟（毫秒），用于同组元素错峰出现 */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;

    /* 无 IntersectionObserver：直接显示，不做动画 */
    if (!el || typeof IntersectionObserver === "undefined") {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      /* threshold 用 0：超高区块（整屏带）也能在刚露头时触发 */
      { rootMargin: "0px 0px -8% 0px", threshold: 0 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
