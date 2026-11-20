"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ReelClip, ReelIntro } from "@/lib/site-data";

/**
 * 首页 Hero · 杂志拼版式（2026-11-19 原型，替代满屏九宫格/满屏轮换）
 *
 * 【为什么不再是满屏视频】
 * 满屏九宫格 = 九份注意力同时抢 + 整屏压暗发闷；满屏轮换 = 只剩一段，
 * 其余八段的存在感归零。客户两个都否了。这一版的取舍：
 * **九段视频全部保留输出，但从"铺满整屏"改为"嵌在版面里的影像窗口"**，
 * 让出一半首屏给主张、正文、CTA 和关键数字 —— 画面负责"证明"，排版负责"说服"。
 *
 * 【版面构成】
 * - 白底（paper），首屏第一次不是深色块 —— 与下方各区块同底，
 *   靠"影像窗口"这个唯一的深色浮层制造对比，而不是整屏翻转明暗。
 * - 左栏 5 列：eyebrow → display-xl 主张（全站唯一的大字号）→ 正文 →
 *   CTA → 底部三个关键数字（16+ 工厂 / 5 生产国 / 4 设计中心）。
 * - 右栏 7 列：九段视频缩进一个带 hairline 边框的窗口，按原九宫格坐标
 *   小尺寸排布；窗口左缘向左出血 96px 压到内容栏底下（xl 以上），
 *   白底上两层错位重叠，是这块版面唯一"不老实"的地方。
 * - 窗口右上角标 "REEL / 09"：给九格一个整体身份，读起来像一本
 *   型录的编号页，而不是九段素材的临时堆放。
 *
 * 【交互】
 * 沿用九宫格的 hover 播放：鼠标悬停某格 → 该格播放、其余保持静帧；
 * 移开暂停、不回第 0 帧。格子 hover 时左下角浮出序号 + 名称标签。
 * 点击弹层暂不移植（原型阶段先看版面，验收后从 VideoMosaic 搬）。
 *
 * 【接入首页的 Header 处理】
 * 本组件首屏是白底（paper），Header 在首页到顶不能再是透明反白态
 * （白字压白纸看不见）。2026-11-19 接入时，Header 的"首页透明"已关闭，
 * 全站导航到顶即实底 —— 白底首屏配墨字导航，反而比"透明压影像"更干净。
 */

/* 九格落位：与 VideoMosaic 同一套 12 列 × 10 行坐标，从满屏缩进窗口后
   比例关系不变，素材的横竖构图分配（全景给宽格、竖构图给窄条）依然成立。 */
const LAYOUT: Record<string, string> = {
  development: "col-span-2 md:col-span-5 md:col-start-1 md:row-span-4 md:row-start-1",
  measuring: "md:col-span-3 md:col-start-6 md:row-span-3 md:row-start-1",
  collection: "md:col-span-4 md:col-start-9 md:row-span-5 md:row-start-1",
  sketch: "md:col-span-3 md:col-start-3 md:row-span-3 md:row-start-8",
  stitching: "md:col-span-5 md:col-start-1 md:row-span-3 md:row-start-5",
  corridor: "md:col-span-3 md:col-start-6 md:row-span-4 md:row-start-7",
  team: "md:col-span-4 md:col-start-9 md:row-span-5 md:row-start-6",
  cutting: "md:col-span-2 md:col-start-1 md:row-span-3 md:row-start-8",
  sewing: "md:col-span-3 md:col-start-6 md:row-span-3 md:row-start-4",
};

/** 左栏底部三个关键数字：只写资料里有的口径，与工厂页一致 */
const HERO_STATS = [
  { value: "16+", label: "Own factories" },
  { value: "5", label: "Production countries" },
  { value: "4", label: "Design centres" },
] as const;

export default function HeroEditorial({
  clips,
  intro,
  className = "",
}: {
  clips: readonly ReelClip[];
  intro: ReelIntro;
  className?: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const videos = useRef(new Map<string, HTMLVideoElement>());

  /* 悬停播放：同一时刻只有一格在播，其余保持 poster 静帧 */
  useEffect(() => {
    videos.current.forEach((node, id) => {
      if (id !== hovered) {
        node.pause();
        return;
      }
      const played = node.play();
      /* 浏览器可能因解码或策略拒绝播放：失败时 poster 还在，
         视觉上只是"没动"，不是错误态 */
      if (played) played.catch(() => {});
    });
  }, [hovered]);

  return (
    <section
      aria-label="Introduction — YOLO Apparel"
      className={`relative w-full bg-paper ${className}`}
    >
      <div className="container-site grid min-h-[100svh] grid-cols-1 items-center gap-10 pb-16 pt-28 md:pt-32 lg:grid-cols-12 lg:gap-0 lg:pb-0 lg:pt-24">
        {/* ---------- 左栏：主张 + 正文 + CTA + 数字 ---------- */}
        <div className="relative z-10 lg:col-span-5 lg:pr-16">
          <p className="eyebrow flex items-center gap-3">
            <span aria-hidden className="h-[3px] w-6 bg-accent-500" />
            {intro.eyebrow}
          </p>

          {/* 全站唯一的 display-xl：首屏主张收回到排版里，
              不再压在视频带上（26px 的"首屏 h1 还没有区块标题大"随之消解） */}
          <h1 className="display-xl mt-7 text-ink-950">
            {intro.headline}
          </h1>

          <p className="mt-7 max-w-[30rem] text-[15px] leading-[1.85] text-ink-600 md:text-base">
            {intro.body}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            {intro.links.map((link, i) =>
              i === 0 ? (
                <Link key={link.href} href={link.href} className="btn-primary">
                  {link.label}
                </Link>
              ) : (
                <Link key={link.href} href={link.href} className="btn-outline">
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* 关键数字：左栏的"证据脚"，与工厂页同一组口径 */}
          <dl className="mt-14 grid grid-cols-3 gap-6 border-t border-ink-900/12 pt-7">
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse">
                <dt className="mt-2 text-[11px] uppercase leading-snug tracking-[0.14em] text-ink-400">
                  {stat.label}
                </dt>
                <dd className="text-3xl font-medium tabular-nums tracking-tight text-ink-950 md:text-4xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ---------- 右栏：九格影像窗口 ---------- */}
        <div className="relative lg:col-span-7">
          {/* 窗口：hairline 边框 + 轻投影，浮在纸面上。
              xl 以上左缘出血 96px 压到内容栏底下 —— 两层错位重叠，
              是这块白底版面唯一的"不老实"。 */}
          <div className="relative border border-ink-900/12 bg-ink-950 shadow-[0_32px_64px_-32px_rgba(42,49,43,0.35)] xl:-ml-24">
            {/* 角标：给九格一个整体身份，像型录的编号页 */}
            <p className="absolute right-4 top-3.5 z-10 text-[11px] font-medium uppercase tracking-[0.28em] text-white/70">
              Reel / 09
            </p>

            {/* 移动端两列五行、桌面 12×10，与满屏版同一套坐标 */}
            <div className="grid aspect-[4/5] grid-cols-2 grid-rows-5 gap-[3px] p-[3px] sm:aspect-auto sm:h-[62vh] md:grid-cols-12 md:grid-rows-10 md:gap-1.5 md:p-1.5 lg:h-[68vh]">
              {clips.map((clip, i) => (
                <div
                  key={clip.id}
                  onPointerEnter={(event) => {
                    /* 触屏的 pointerenter 会在 tap 时先触发一次，
                       不判断的话手机上一碰就"播一下" */
                    if (event.pointerType === "mouse") setHovered(clip.id);
                  }}
                  onPointerLeave={(event) => {
                    if (event.pointerType === "mouse") {
                      setHovered((current) => (current === clip.id ? null : current));
                    }
                  }}
                  className={`group relative overflow-hidden bg-ink-900 ${LAYOUT[clip.id] ?? ""}`}
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
                    preload="none"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                  />

                  {/* 静止时轻压暗，hover 掀开 —— 沿用九宫格"点亮"的语言，
                      但幅度减半（窗口已经有深色底托着，不用再压那么重） */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-ink-950/16 transition-colors duration-500 group-hover:bg-ink-950/0"
                  />

                  {/* hover 浮出的序号 + 名称标签 */}
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute bottom-2 left-2 flex items-baseline gap-1.5 transition-all duration-300 ${
                      hovered === clip.id
                        ? "translate-y-0 opacity-100"
                        : "translate-y-1 opacity-0"
                    }`}
                  >
                    <span className="text-[10px] font-medium tabular-nums tracking-[0.1em] text-accent-400">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[11px] font-medium tracking-tight text-white">
                      {clip.label}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 窗口下方的图注行：交代这九格拍的是什么 */}
          <p className="mt-4 flex items-baseline gap-2.5 text-[11.5px] leading-relaxed text-ink-400 xl:-ml-24">
            <span aria-hidden className="h-px w-4 shrink-0 translate-y-[-3px] bg-ink-900/25" />
            Nine stations from our own production lines — hover any frame to play.
          </p>
        </div>
      </div>
    </section>
  );
}
