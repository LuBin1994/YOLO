"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * 滚动揭示：元素进入视口后淡入并位移到位。
 * - 只用 IntersectionObserver + CSS transition，不引入动画库
 * - 命中一次即断开观察，不反复触发，避免长页面上的持续开销
 * - 降级安全：无法观察时直接显示
 * - 2026-11-20：不再按 prefers-reduced-motion 降级。客户机开着
 *   「减少动态效果」，命中后所有 reveal 从首帧就是终态、动效完全不可见，
 *   客户明确要求忽略该偏好，故由 CSS 侧移除降级分支。
 *
 * direction：
 *   - "up"（默认）：从下方 28px 淡入上移
 *   - "left"：从左侧 40px 滑入
 *   - "right"：从右侧 40px 滑入
 */
export default function Reveal({
  children,
  delay = 0,
  className = "",
  direction = "up",
}: {
  children: ReactNode;
  /** 入场延迟（毫秒），用于同组元素错峰出现 */
  delay?: number;
  className?: string;
  /** 入场方向：up / left / right */
  direction?: "up" | "left" | "right";
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

  /* 方向对应的类名 */
  const directionClass = {
    up: "reveal",
    left: "reveal-left",
    right: "reveal-right",
  }[direction];

  return (
    <div
      ref={ref}
      className={`${directionClass} ${visible ? "is-visible" : ""} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
