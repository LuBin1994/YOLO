"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReelClip, ReelIntro } from "@/lib/site-data";

/* 展开 / 收起的时长。CSS 过渡与"关闭后清场"的等待共用这个常量，
   避免动画没放完就把节点卸掉。
   缓动刻意用 ease-in-out 而不是纯 ease-out：纯 ease-out 在前 20% 就走完
   七成路程，肉眼看起来像"瞬移"，丢掉了"从这一格飞出去"的叙事。 */
const ANIM_MS = 560;
const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

/**
 * 每格的落位（12 列 × 10 行，桌面）。
 *
 * 九段视频，**故意不等分**：01 是开场大格，03 / 07 是右列上下两块大面，
 * 08 压成窄条（裁剪刀那种竖构图刚好），其余按 3×3 铺。
 * 全部写死 col-start / row-start，不用自动流——自动流会按阅读顺序
 * 一格一格填空，铺不出这种错落。
 *
 * 手机端不套这套坐标（视口只有 390 宽，12 列会碎成渣）：
 * 两列五行，01 通栏当封面，其余八格两两成对。
 */
const LAYOUT: Record<string, string> = {
  development:
    "col-span-2 md:col-span-5 md:col-start-1 md:row-span-4 md:row-start-1",
  measuring: "md:col-span-3 md:col-start-6 md:row-span-3 md:row-start-1",
  collection: "md:col-span-4 md:col-start-9 md:row-span-5 md:row-start-1",
  sketch: "md:col-span-3 md:col-start-6 md:row-span-3 md:row-start-4",
  stitching: "md:col-span-5 md:col-start-1 md:row-span-3 md:row-start-5",
  corridor: "md:col-span-3 md:col-start-6 md:row-span-4 md:row-start-7",
  team: "md:col-span-4 md:col-start-9 md:row-span-5 md:row-start-6",
  cutting: "md:col-span-2 md:col-start-1 md:row-span-3 md:row-start-8",
  sewing: "md:col-span-3 md:col-start-3 md:row-span-3 md:row-start-8",
};

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * 图墙底部的说明带（2026-10-23 二次改版）。
 *
 * 上一版把正中那格换成白底文案块，客户看了直说"太丑"——一块白板插在
 * 九宫格里，确实像有人往墙上贴了张纸。现在九段视频全部恢复，
 * 文案改为压在墙底的**渐变带**上：视频照旧铺满整屏，文字只是浮在暗部里，
 * 不占格、不加底色块，也不跟任何一格抢构图。
 *
 * 顺带把 h1 安顿好：全页唯一的 h1 就放在这条带上——可见、可读、
 * 不需要再塞一个 sr-only 的隐藏标题（隐藏 h1 对读屏用户等于没有）。
 */
function IntroBand({
  intro,
  recessed,
}: {
  intro: ReelIntro;
  /** 鼠标正在墙上的某一格时，说明带让位——否则它盖住的那两格既看不见画面也点不到 */
  recessed: boolean;
}) {
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-ink-950/88 via-ink-950/55 to-transparent pt-12 transition-opacity duration-300 md:pt-20 ${
        recessed ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="container-site flex flex-col gap-4 pb-5 md:flex-row md:items-end md:justify-between md:gap-12 md:pb-7">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white/60 md:text-[11px]">
            <span aria-hidden className="h-[2px] w-4 bg-accent-400 md:w-5" />
            {intro.eyebrow}
          </p>
          <h1 className="mt-2.5 max-w-[34rem] text-[19px] leading-[1.22] tracking-tight text-white md:mt-3 md:text-[26px]">
            {intro.headline}
          </h1>
          {/* 支撑句只在桌面出现：手机上这条带已经占了近三成屏高，
              再压一段正文会把视频挤没 */}
          <p className="mt-2.5 hidden max-w-[32rem] text-[12px] leading-[1.65] text-white/65 md:block">
            {intro.body}
          </p>
        </div>

        {/* 只有链接接管指针。带子其余部分全部 pointer-events-none，
            否则压在下面的格子永远收不到 hover / click。
            代价：点带子的空白处会落到后面的视频格上（视为"点中那格"）。 */}
        <div
          className={`flex flex-wrap items-center gap-x-6 gap-y-2 pr-[4rem] md:flex-col md:items-end md:gap-3 md:pr-[10rem] ${
            /* 带子淡出时链接也不接指针：避免在一个看不见的链接上误点 */
            recessed ? "pointer-events-none" : "pointer-events-auto"
          }`}
        >
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
            {intro.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group/link inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-white/85 transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:text-[12px]"
              >
                {link.label}
                <span
                  aria-hidden
                  className="transition-transform duration-200 group-hover/link:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            ))}
          </div>
          <p className="hidden text-[11px] uppercase tracking-[0.18em] text-white/45 md:block">
            Hover to preview · Click to open
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 首页「视频墙铺满整屏」。
 *
 * 交互三条（客户口径）：
 * 1. 鼠标悬浮某格 → 该段播放、其余全部暂停；移开 → 暂停。不回到第 0 帧，
 *    再悬停接着看，比每次重头自然。
 * 2. 点击某格 → 它从原位滑到视口中央播放，原位留空并压成灰色，
 *    背后盖一层灰色 mask。
 * 3. 点 mask（或 Esc / 右上角）→ 原路滑回原位。
 *
 * 【为什么弹层动画补间宽高，而不是 FLIP 的 scale 缩放】
 * FLIP 的 transform: scale 只有等比缩放才不失真，前提是"格子与目标同宽高比"。
 * 墙里 01 是 5:4、07 是 2:3、03 是 4:5，而播放面板必须是 16:9，
 * 比例根本对不上——强行 scale 会把画面拉扁。改成直接补间
 * left / top / width / height：外层盒子在变，内层视频始终 object-cover，
 * 一路只改变"取景窗口"，画面不会被拉伸。单节点补间，性能足够。
 *
 * 【为什么墙要铺到 y=0，还要在顶部加一道压暗】
 * 导航在首页是透明反白的（见 Header.tsx），它要求底下是影像而不是纸底。
 * 所以墙不再给头部让位，直接顶到 0，再用一道 `from-ink-950/78` 的渐变
 * 盖住顶部 128/160px——白字压在任何一段视频上都能读。
 *
 * 【视频为什么 preload="none"】
 * 九段视频走 Mixkit 远程直链，总量约 55MB。首屏只显示 poster（jpg，
 * 官方同帧缩略图），视频要等到第一次悬停（play()）才发起请求。之前用 "metadata"，
 * 虽然只取文件头，但九段加起来仍是九次额外请求，4G 下对 FCP 有可见影响。
 * 代价：首次悬停有约 200–400ms 的"画面还没动"，poster 仍在，不算错误态。
 *
 * 【为什么不做 reduced-motion 降级】
 * 这条位移是交互语义本身（内容从哪来、回哪去），
 * 禁用等于把功能变成"凭空出现"，信息是丢的。
 */
export default function VideoMosaic({
  clips,
  intro,
  className = "",
}: {
  clips: readonly ReelClip[];
  intro: ReelIntro;
  className?: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [active, setActive] = useState<{ clip: ReelClip; from: Rect } | null>(
    null
  );
  const [target, setTarget] = useState<Rect | null>(null);
  /** false = 停在格子原位，true = 已展开到居中位置 */
  const [expanded, setExpanded] = useState(false);

  const videos = useRef(new Map<string, HTMLVideoElement>());
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const dialogVideoRef = useRef<HTMLVideoElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const timerRef = useRef<number | null>(null);
  /** 点开那一刻源视频的进度，居中播放器接着这一帧往下走 */
  const resumeAt = useRef(0);

  /* 悬停播放：同一时刻只有一个在播。弹层打开时全部暂停，交给面板里的播放器 */
  useEffect(() => {
    videos.current.forEach((node, id) => {
      if (active || id !== hovered) {
        node.pause();
        return;
      }
      const played = node.play();
      /* 浏览器可能因解码或策略拒绝播放，这里吞掉即可——
         失败时 poster 还在，视觉上只是"没动"，不是错误态 */
      if (played) played.catch(() => {});
    });
  }, [hovered, active]);

  const close = useCallback(() => {
    setExpanded(false);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setActive(null);
      setTarget(null);
      triggerRef.current?.focus();
    }, ANIM_MS);
  }, []);

  /* 打开后等两帧再置 expanded：确保"停在格子原位"这一帧真画出来了，
     否则浏览器会把首末态合并，过渡直接不发生 */
  useEffect(() => {
    if (!active) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setExpanded(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [active]);

  /* 打开期间锁滚动（否则量好的格子坐标会失效，滑回去会落错位）+ Esc + 焦点 */
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    closeBtnRef.current?.focus();

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [active, close]);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    []
  );

  function open(clip: ReelClip, el: HTMLButtonElement) {
    const from = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    /* 播放面板按视频原生 16:9 给，不沿用格子比例：
       07 是竖条，若沿用格子比例，居中后会变成一根细长的竖屏。 */
    const ratio = 16 / 9;
    let width = Math.min(vw * 0.86, 1180);
    let height = width / ratio;
    if (height > vh * 0.78) {
      height = vh * 0.78;
      width = height * ratio;
    }

    const source = videos.current.get(clip.id);
    resumeAt.current = source ? source.currentTime : 0;

    triggerRef.current = el;
    setTarget({
      left: (vw - width) / 2,
      top: (vh - height) / 2,
      width,
      height,
    });
    setActive({
      clip,
      from: {
        left: from.left,
        top: from.top,
        width: from.width,
        height: from.height,
      },
    });
    setExpanded(false);
  }

  /* Tab 只在弹层内循环 */
  function trapTab(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;
    const root = overlayRef.current;
    if (!root) return;
    const nodes = Array.from(
      root.querySelectorAll<HTMLElement>(
        'button:not([tabindex="-1"]), video[controls], a[href]'
      )
    ).filter((el) => !el.hasAttribute("disabled"));
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* 单格渲染抽成函数：主介绍要插在中间，map 一次只吐一个元素。 */
  const renderClip = (clip: ReelClip) => {
    const lifted = active?.clip.id === clip.id;
    /* 悬停某格时把其余压暗，注意力只落在正在播的那一块 */
    const dimmed = hovered !== null && hovered !== clip.id && !active;
    /* 第一排的编号要让开透明导航，否则永远被压在导航底下 */

    return (
      <button
        key={clip.id}
        type="button"
        aria-label={`${clip.label} — open video`}
        onPointerEnter={(event) => {
          /* 触屏的 pointerenter 会在 tap 时先触发一次，
             不判断的话手机上一碰就"播一下"再被弹层打断 */
          if (event.pointerType === "mouse") setHovered(clip.id);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") {
            setHovered((current) => (current === clip.id ? null : current));
          }
        }}
        onClick={(event) => open(clip, event.currentTarget)}
        onFocus={() => setHovered(clip.id)}
        onBlur={() => setHovered(null)}
        className={`group relative cursor-zoom-in overflow-hidden bg-ink-900 outline-none focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white ${
          LAYOUT[clip.id] ?? ""
        }`}
      >
        {/* 原位留空用的灰块：弹层飞走后这里只剩一块灰，
            让人看得见"是这一格出去了" */}
        <span
          aria-hidden
          className={`absolute inset-0 bg-ink-900/60 transition-opacity duration-200 ${
            lifted ? "opacity-100" : "opacity-0"
          }`}
        />

        <span
          aria-hidden
          className={`absolute inset-0 transition-opacity duration-200 ${
            lifted ? "opacity-0" : "opacity-100"
          }`}
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

          {/* 压暗层：静止时把温度压下去，悬停时掀开——画面像被点亮 */}
          <span className="absolute inset-0 bg-ink-950/28 transition-colors duration-500 group-hover:bg-ink-950/0" />

          {/* 悬停时的播放徽标：只给一个"可以点开"的信号。
              原来这里的标签与主题文字会跟底部说明带撞在一起，整体拿掉——
              具体是哪个工序，点开后的播放面板里有。 */}
          <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/55 bg-ink-950/35 backdrop-blur-[2px]">
              <svg
                width="11"
                height="13"
                viewBox="0 0 12 14"
                fill="currentColor"
                className="ml-0.5 text-white"
                aria-hidden
              >
                <path d="M0 0l12 7-12 7z" />
              </svg>
            </span>
          </span>
        </span>

        {/* 压暗其余格：用**深色遮罩**而不是降低不透明度。
            浅底上降 opacity 会朝白色雾化，看起来像褪色而不是失焦；
            盖一层暖炭才是"聚光灯"该有的方向。 */}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 bg-ink-950 transition-opacity duration-500 ${
            dimmed ? "opacity-45" : "opacity-0"
          }`}
        />
      </button>
    );
  };

  const box = active ? (expanded && target ? target : active.from) : null;

  return (
    <>
      <section
        aria-label="Inside the work — film wall"
        className={`relative w-full bg-ink-950 ${className}`}
      >
        <div className="grid h-[100svh] w-full grid-cols-2 grid-rows-5 gap-[3px] md:grid-cols-12 md:grid-rows-10 md:gap-2">
          {clips.map(renderClip)}
        </div>

        {/* 顶部压暗：透明导航的白字压在任意一段视频上都要读得清。
            pointer-events-none，不吃格子的点击。 */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink-950/78 via-ink-950/30 to-transparent md:h-40"
        />

        {/* 底部说明带：全页唯一的 h1 在这里。
            只有悬停到「被它压住的那两格」（从第 8 行起、中心正好落在带子里）
            时才淡出到 25%，好让画面和播放徽标露出来；悬停别的格子时保持原样，
            否则鼠标一动、首屏那句话就淡没了。 */}
        <IntroBand
          intro={intro}
          recessed={
            hovered !== null &&
            (LAYOUT[hovered] ?? "").includes("md:row-start-8")
          }
        />
      </section>

      {/* 弹层：灰色 mask + 居中的播放面板 */}
      {active && box ? (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[65]"
          onKeyDown={trapTab}
        >
          <button
            type="button"
            onClick={close}
            tabIndex={-1}
            aria-label="Close"
            className={`absolute inset-0 h-full w-full cursor-zoom-out bg-ink-950/72 transition-opacity duration-300 ${
              expanded ? "opacity-100" : "opacity-0"
            }`}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label={active.clip.label}
            style={{
              left: box.left,
              top: box.top,
              width: box.width,
              height: box.height,
              transitionProperty: "left, top, width, height",
              transitionDuration: `${ANIM_MS}ms`,
              transitionTimingFunction: EASE,
            }}
            className="absolute z-[70] overflow-hidden bg-ink-950"
          >
            <video
              ref={dialogVideoRef}
              key={active.clip.id}
              src={active.clip.src}
              poster={active.clip.poster}
              muted
              loop
              autoPlay
              playsInline
              onLoadedMetadata={() => {
                const node = dialogVideoRef.current;
                if (!node) return;
                if (resumeAt.current > 0 && resumeAt.current < node.duration) {
                  node.currentTime = resumeAt.current;
                }
              }}
              className="h-full w-full object-cover"
            />

            {/* 面板底部的信息条 + 关闭键：只在展开后淡入，
                飞行途中不跟着甩，画面干净 */}
            <span
              className={`pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/80 to-transparent px-4 pb-4 pt-12 transition-opacity duration-300 md:px-5 md:pb-5 ${
                expanded ? "opacity-100" : "opacity-0"
              }`}
            >
              <span className="block text-[11px] uppercase tracking-[0.2em] text-white/60">
                {active.clip.theme}
              </span>
              <span className="mt-1 block text-[15px] font-medium tracking-tight text-white">
                {active.clip.label}
              </span>
            </span>

            <button
              ref={closeBtnRef}
              type="button"
              onClick={close}
              aria-label="Close"
              className={`absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink-950/60 text-white transition-all duration-300 hover:bg-ink-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                expanded ? "opacity-100" : "opacity-0"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
