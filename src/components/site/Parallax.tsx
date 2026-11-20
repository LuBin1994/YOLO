"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * 视差滚动：元素随页面滚动产生位移差，营造"前景/背景"的层次。
 *
 * 【为什么用 rAF + CSS 变量，不用 React state】
 * 滚动事件每秒触发几十次，如果每次 setState 都会触发 React 重渲染，
 * 16ms 预算根本不够。这里把偏移量写进 CSS 变量 --parallax-y，
 * 元素 transform 直接读变量，React 完全不参与滚动帧更新。
 *
 * 【speed 语义】
 * - 0：跟普通元素一样，无视差
 * - 正数：比滚动慢（背景感），0.3 = 滚动 100px 只移动 30px
 * - 负数：比滚动快（前景感），-0.2 = 滚动 100px 反向移动 20px
 * 绝对值建议控制在 0.1–0.4，大了会出戏。
 *
 * 【reduced-motion】
 * CSS 里已禁用 transform，这里不再额外判断。
 */

interface ParallaxProps {
  children: ReactNode;
  /** 速度系数：0.2 = 慢速背景，-0.15 = 快速前景 */
  speed?: number;
  className?: string;
}

export default function Parallax({
  children,
  speed = 0.2,
  className = "",
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let ticking = false;

    const update = () => {
      ticking = false;
      const rect = el.getBoundingClientRect();
      /* 元素中心到视口中心的距离 */
      const centerOffset =
        rect.top + rect.height / 2 - window.innerHeight / 2;
      /* 偏移 = 距离 × speed，反向（负号）让慢速元素"拖后" */
      const y = -centerOffset * speed;
      el.style.setProperty("--parallax-y", `${y.toFixed(1)}px`);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    /* 初始也跑一次，否则页面加载时元素位置不对 */
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed]);

  return (
    <div ref={ref} data-parallax className={className}>
      {children}
    </div>
  );
}
