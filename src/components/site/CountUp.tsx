"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 数字滚动：进入视口后从 0 数到目标值。
 *
 * 只在四个内容页的"数字"上用，别处不要滥用——同一屏里出现两三个就够，
 * 再多会变成仪表盘。
 *
 * 实现：IntersectionObserver 触发一次，rAF 补间 1100ms，缓动 easeOutExpo。
 * 2026-11-20：不再按 prefers-reduced-motion 直接落位 —— 客户机命中该偏好时
 * 数字一个都不滚，视觉上等于没做。按客户要求常开。
 */
export default function CountUp({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1100,
  className = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      /* 用 rAF 落到下一帧再赋值：既避开"在 effect 里同步 setState"的级联渲染，
         也保证首帧仍然渲染 0（与 SSR 输出一致，不会 hydration 不匹配） */
      const raf = requestAnimationFrame(() => setShown(value));
      return () => cancelAnimationFrame(raf);
    }

    let raf = 0;
    let start = 0;

    const run = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / duration);
      /* easeOutExpo：前段快、末段稳稳停住，比线性更像"数出来" */
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setShown(value * eased);
      if (t < 1) raf = requestAnimationFrame(run);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          raf = requestAnimationFrame(run);
        }
      },
      { threshold: 0, rootMargin: "0px 0px -12% 0px" }
    );

    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`.trim()}>
      {prefix}
      {shown.toFixed(decimals)}
      {suffix}
    </span>
  );
}
