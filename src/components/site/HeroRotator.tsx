"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReelClip, ReelIntro } from "@/lib/site-data";

/**
 * 首页 Hero · 主画面轮换版（2026-11-19 原型）
 *
 * 【为什么不是九宫格】
 * 九段视频同墙 = 九份注意力同时抢，且每格都压暗 28%，整屏发闷。
 * 这一版同一时刻只播**一段**，满屏呈现；其余八段退到底部索引条。
 * 画面大了、文字有地方放了、切换本身成为"设计感"的来源。
 *
 * 【切换：斜切擦入】
 * 下一段从右侧以斜角 clip-path 推入，不是普通淡入淡出。
 * 斜线有方向感和速度感，比"十字淡"更符合"制造业+节拍"的语境。
 * 方向只往右走（01→02→…→09→01），不来回倒带——轮换器的"前进感"必须稳定。
 *
 * 【自动轮换】
 * 每段驻留 7 秒（足够看清一段工序的节奏），底部索引条同步进度。
 * hover 索引卡 → 立即跳段；hover 主画面不暂停（暂停会打乱"节拍"）。
 *
 * 【性能】
 * 九段视频都常驻 DOM（避免重挂载导致 currentTime 归零），
 * 但非当前段 pause() + preload="none"，只有当前段在解码。
 * 首屏 LCP 是当前段的 poster（jpg，本地托管）。
 *
 * 【活泼感的来源】
 * - 左侧超大编号（01–09），与标题形成 5 倍字号落差
 * - 底部索引条的当前段有一条 accent 进度条，肉眼可见"在走"
 * - 切换时的斜切动效本身就是节奏
 * 不靠高饱和色、不靠花哨图形。
 */

/** 每段驻留时长（毫秒）。7s 是"看清一段工序"的最低时长，再短就成走马灯。 */
const DWELL_MS = 7000;

/** 斜切角度（度）。15° 是"看得出斜"与"不穿帮"的平衡点，再大会在窄屏上露馅。 */
const SLANT_DEG = 15;

interface HeroRotatorProps {
  clips: readonly ReelClip[];
  intro: ReelIntro;
  className?: string;
}

export default function HeroRotator({
  clips,
  intro,
  className = "",
}: HeroRotatorProps) {
  const [index, setIndex] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const videos = useRef(new Map<string, HTMLVideoElement>());
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const current = clips[index];

  /* 切换到指定段：记录上一段索引（用于斜切擦出），重置进度 */
  const goTo = useCallback(
    (next: number) => {
      if (next === index) return;
      setPrevious(index);
      setIndex(next);
      setProgress(0);
      startTimeRef.current = Date.now();
    },
    [index]
  );

  /* 自动轮换：rAF 驱动进度条，到点切下一段 */
  useEffect(() => {
    startTimeRef.current = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const p = Math.min(elapsed / DWELL_MS, 1);
      setProgress(p);

      if (p >= 1) {
        goTo((index + 1) % clips.length);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [index, clips.length, goTo]);

  /* 播放控制：当前段 play()，其余 pause() */
  useEffect(() => {
    videos.current.forEach((node, id) => {
      if (id === current.id) {
        const played = node.play();
        if (played) played.catch(() => {});
      } else {
        node.pause();
      }
    });
  }, [current.id]);

  /* 清理 rAF */
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section
      aria-label="Hero — production highlights"
      className={`relative h-[100svh] w-full overflow-hidden bg-ink-950 ${className}`}
    >
      {/* ---------- 视频层：九段常驻，只播当前 ---------- */}
      {clips.map((clip, i) => {
        const isCurrent = i === index;
        const isPrevious = i === previous;

        return (
          <div
            key={clip.id}
            aria-hidden={!isCurrent}
            className="absolute inset-0"
            style={{
              zIndex: isCurrent ? 10 : isPrevious ? 5 : 0,
              opacity: isCurrent || isPrevious ? 1 : 0,
              clipPath: isCurrent
                ? `polygon(${SLANT_DEG}% 0, 100% 0, 100% 100%, 0 100%, 0 ${SLANT_DEG}%)`
                : undefined,
              transition: isCurrent
                ? "clip-path 900ms cubic-bezier(0.65, 0, 0.35, 1)"
                : undefined,
            }}
          >
            <video
              ref={(node) => {
                if (node) videos.current.set(clip.id, node);
                else videos.current.delete(clip.id);
              }}
              src={clip.src}
              poster={clip.poster}
              muted
              loop
              playsInline
              preload={isCurrent ? "auto" : "none"}
              className="h-full w-full object-cover"
            />
          </div>
        );
      })}

      {/* ---------- 压暗层：左侧文字区 ---------- */}
      <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-r from-ink-950/85 via-ink-950/40 to-transparent" />

      {/* ---------- 顶部压暗：给透明导航兜底 ---------- */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-32 bg-gradient-to-b from-ink-950/78 via-ink-950/30 to-transparent md:h-40" />

      {/* ---------- 左侧文字块 ---------- */}
      <div className="absolute inset-y-0 left-0 z-30 flex items-center">
        <div className="container-site">
          <div className="max-w-[38rem]">
            {/* 超大编号：与标题形成 5 倍落差，是"活泼"的核心 */}
            <p
              aria-hidden
              className="text-[120px] font-medium leading-none tracking-tighter text-white/12 md:text-[180px] lg:text-[220px]"
            >
              {String(index + 1).padStart(2, "0")}
            </p>

            {/* 主题小标 */}
            <p className="mt-6 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.28em] text-white/70 md:text-[12px]">
              <span aria-hidden className="h-[3px] w-6 bg-accent-400" />
              {current.theme}
            </p>

            {/* 主标题 */}
            <h1 className="mt-5 text-[42px] font-medium leading-[1.05] tracking-tight text-white md:text-[56px] lg:text-[64px]">
              {current.label}
            </h1>

            {/* 支撑句 */}
            <p className="mt-6 max-w-[30rem] text-[15px] leading-[1.75] text-white/75 md:text-base">
              {intro.body}
            </p>

            {/* CTA */}
            <div className="mt-10 flex flex-wrap gap-4">
              {intro.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="btn-hero"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- 底部索引条 ---------- */}
      <div className="absolute inset-x-0 bottom-0 z-30 border-t border-white/10 bg-ink-950/60 backdrop-blur-sm">
        <div className="container-site">
          <div className="flex items-center gap-1 overflow-x-auto py-4 md:gap-2 md:py-5">
            {clips.map((clip, i) => {
              const isActive = i === index;
              return (
                <button
                  key={clip.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to ${clip.label}`}
                  aria-pressed={isActive}
                  className={`group relative shrink-0 px-3 py-2 text-left transition-colors duration-200 md:px-4 ${
                    isActive ? "text-white" : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {/* 序号 + 名称 */}
                  <span className="block text-[11px] font-medium uppercase tracking-[0.14em]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-1 block text-[12px] font-medium tracking-tight md:text-[13px]">
                    {clip.label}
                  </span>

                  {/* 进度条：当前段有一条 accent 进度线，其余是静态细线 */}
                  <span className="absolute inset-x-3 bottom-0 h-[2px] bg-white/15 md:inset-x-4">
                    {isActive && (
                      <span
                        className="block h-full bg-accent-400 transition-none"
                        style={{ width: `${progress * 100}%` }}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
