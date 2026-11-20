"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReelClip, ReelIntro } from "@/lib/site-data";

/**
 * 首页 Hero · 随机散落式（2026-11-20，参照 Stridr 首屏）
 *
 * 【灵感来源】Stridr 首屏：
 *   高饱和橙底 + 中央超大标题 + 四周卡片**随机散落**（不是规则环绕），
 *   卡片大小不一、有重叠，但中央文字区域是"安全区"不压字。
 *   鼠标移动时卡片按深度系数视差偏移，滑到哪张哪张放大。
 *
 * 【YOLO 化改造】
 *   - 背景：纸底（paper），不用高饱和橙。
 *   - 中央标题：display-xl 超大 + 正文 + 双 CTA，文字区域干净。
 *   - 21 张卡片（9 视频 + 12 图片）**随机散落**在首屏四周：
 *     位置手写，避开中央文字区（约 30%–70% 水平、35%–65% 垂直的矩形）。
 *   - 卡片大小差异大：视频卡 280/220/180，图片卡 200/160/140，
 *     最大的视频卡（development）接近 300px，最小的图片卡 140px。
 *   - 鼠标滑到卡片附近 → 该卡放大 1.2 倍；点击 → FLIP 滑到中央播放。
 *
 * 【层级】
 *   - 卡片 z-10（底层）
 *   - 中央标题区 z-30（上层，卡片不压文字）
 *   - 展开弹层 z-70/80
 *
 * 【reduced-motion】
 *   视差与放大禁用，卡片静止；点击展开仍可用。
 */

/* 元素类型：视频 or 图片 */
type CollageItem =
  | { kind: "video"; clip: ReelClip }
  | { kind: "image"; src: string; alt: string; label: string };

/* 21 个元素以屏幕中心为原点，按极坐标向外辐射。
   angle：0 = 正右方，90 = 正下方，逆时针。
   radius：相对屏幕中心的距离（百分比，0–50），数值越大离中心越远。
   depth：视差深度系数（0.06–0.18）。
   size：卡片宽度（px），视频卡 320–160，图片卡 220–120。
   不用手写 x/y，由 polarToXY 换算，任何屏幕尺寸自动居中。 */
const ITEMS: {
  id: string;
  kind: "video" | "image";
  angle: number;
  radius: number;
  depth: number;
  size: number;
  src?: string;
  alt?: string;
  label?: string;
}[] = [
  /* ---------- 视频卡片（9 个）---------- */
  { id: "development", kind: "video", angle: -30, radius: 38, depth: 0.18, size: 320 },
  { id: "collection", kind: "video", angle: 10, radius: 42, depth: 0.14, size: 280 },
  { id: "stitching", kind: "video", angle: 50, radius: 36, depth: 0.10, size: 180 },
  { id: "corridor", kind: "video", angle: 90, radius: 40, depth: 0.12, size: 220 },
  { id: "sewing", kind: "video", angle: 130, radius: 38, depth: 0.15, size: 280 },
  { id: "team", kind: "video", angle: 170, radius: 42, depth: 0.11, size: 300 },
  { id: "sketch", kind: "video", angle: 210, radius: 36, depth: 0.16, size: 240 },
  { id: "measuring", kind: "video", angle: 250, radius: 38, depth: 0.09, size: 200 },
  { id: "cutting", kind: "video", angle: 270, radius: 44, depth: 0.07, size: 160 },

  /* ---------- 图片卡片（12 个，填缝隙）---------- */
  { id: "img-01", kind: "image", angle: -15, radius: 30, depth: 0.08, size: 200,
    src: "/media/home/showcase/wall-01.jpg", alt: "Showroom interior with garment rails", label: "Showroom" },
  { id: "img-02", kind: "image", angle: 25, radius: 28, depth: 0.10, size: 140,
    src: "/media/home/showcase/wall-02.jpg", alt: "Hands guiding quilted fabric", label: "Quilting" },
  { id: "img-03", kind: "image", angle: 65, radius: 32, depth: 0.09, size: 220,
    src: "/media/home/showcase/wall-03.jpg", alt: "Meeting area with illustrated panels", label: "Design review" },
  { id: "img-04", kind: "image", angle: 105, radius: 34, depth: 0.07, size: 160,
    src: "/media/home/showcase/wall-04.jpg", alt: "Packed cartons in dispatch area", label: "Dispatch" },
  { id: "img-05", kind: "image", angle: 290, radius: 30, depth: 0.08, size: 180,
    src: "/media/home/showcase/wall-05.jpg", alt: "Showroom seating area", label: "Lounge" },
  { id: "img-06", kind: "image", angle: 170, radius: 35, depth: 0.06, size: 140,
    src: "/media/home/showcase/wall-06.jpg", alt: "Design wall with illustrations", label: "Studio" },
  { id: "img-07", kind: "image", angle: 225, radius: 32, depth: 0.09, size: 200,
    src: "/media/home/showcase/wall-07.jpg", alt: "Model in striped knit top", label: "Lookbook" },
  { id: "img-08", kind: "image", angle: 265, radius: 34, depth: 0.08, size: 160,
    src: "/media/home/showcase/wall-08.jpg", alt: "Colour swatch discs", label: "Swatches" },
  { id: "img-09", kind: "image", angle: 305, radius: 30, depth: 0.10, size: 120,
    src: "/media/home/showcase/wall-09.jpg", alt: "Brand label inside coat collar", label: "Detail" },
  { id: "img-10", kind: "image", angle: 330, radius: 26, depth: 0.07, size: 180,
    src: "/media/home/showcase/wall-10.jpg", alt: "Company sign wall", label: "HQ" },
  { id: "img-11", kind: "image", angle: 120, radius: 32, depth: 0.09, size: 200,
    src: "/media/home/showcase/wall-11.jpg", alt: "Colourful padded jackets", label: "Collection" },
  { id: "img-12", kind: "image", angle: 300, radius: 40, depth: 0.08, size: 140,
    src: "/media/home/showcase/wall-12.jpg", alt: "Beige trench coat on display", label: "Trench" },
];

/** 缓动系数：0.08 = 每帧追上目标 8%，鼠标停下后约 0.3 秒回正 */
const LERP = 0.08;

/** 展开/收起的时长与缓动 */
const ANIM_MS = 560;
const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export default function HeroCollage({
  clips,
  intro,
  className = "",
}: {
  clips: readonly ReelClip[];
  intro: ReelIntro;
  className?: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<{ item: CollageItem; from: Rect } | null>(null);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const videos = useRef(new Map<string, HTMLVideoElement>());
  const sectionRef = useRef<HTMLElement>(null);

  /* 每张卡片的当前偏移量与缩放（lerp 中间态） */
  const offsets = useRef(new Map<string, { x: number; y: number }>());
  const scales = useRef(new Map<string, number>());
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mousePixel = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const timerRef = useRef<number | null>(null);

  /* 悬停播放：同一时刻只有一格在播 */
  useEffect(() => {
    videos.current.forEach((node, id) => {
      if (id !== hovered) {
        node.pause();
        return;
      }
      const played = node.play();
      if (played) played.catch(() => {});
    });
  }, [hovered]);

  /* 鼠标视差 + 距离放大：rAF 驱动 */
  useEffect(() => {
    // const forceParallax = new URLSearchParams(window.location.search).get("parallax") === "force";
    // const reduced = !forceParallax && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // if (reduced) {
    //   console.log("[HeroCollage] reduced-motion detected, parallax disabled");
    //   return;
    // }

    const cardElements = document.querySelectorAll<HTMLElement>("[data-card]");
    if (cardElements.length === 0) return;

    ITEMS.forEach((c) => {
      offsets.current.set(c.id, { x: 0, y: 0 });
      scales.current.set(c.id, 1);
    });

    const onMouseMove = (e: MouseEvent) => {
      mouseTarget.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseTarget.current.y = (e.clientY / window.innerHeight) * 2 - 1;
      mousePixel.current.x = e.clientX;
      mousePixel.current.y = e.clientY;
    };

    const tick = () => {
      const { x: tx, y: ty } = mouseTarget.current;
      const { x: mx, y: my } = mousePixel.current;
      const maxShift = 400;
      const scaleRadius = 300;
      const maxScale = 1.2;

      cardElements.forEach((el) => {
        const cardId = el.getAttribute("data-card");
        const card = ITEMS.find((c) => c.id === cardId);
        if (!card) return;

        /* 视差位移 */
        const offset = offsets.current.get(card.id);
        if (!offset) return;

        const targetX = -tx * card.depth * maxShift;
        const targetY = -ty * card.depth * maxShift;

        offset.x += (targetX - offset.x) * LERP;
        offset.y += (targetY - offset.y) * LERP;

        el.style.setProperty("--card-x", `${offset.x.toFixed(1)}px`);
        el.style.setProperty("--card-y", `${offset.y.toFixed(1)}px`);

        /* 距离放大 */
        const rect = el.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;
        const dist = Math.hypot(mx - cardCenterX, my - cardCenterY);

        const targetScale = dist < scaleRadius
          ? 1 + (1 - dist / scaleRadius) * (maxScale - 1)
          : 1;

        let scale = scales.current.get(card.id) ?? 1;
        scale += (targetScale - scale) * LERP;
        scales.current.set(card.id, scale);

        el.style.setProperty("--card-scale", scale.toFixed(3));
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /* 点击卡片 → 展开 */
  const open = useCallback((item: CollageItem, el: HTMLElement) => {
    const from = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let width: number;
    let height: number;
    if (item.kind === "video") {
      const ratio = 16 / 9;
      width = Math.min(vw * 0.86, 1180);
      height = width / ratio;
      if (height > vh * 0.78) {
        height = vh * 0.78;
        width = height * ratio;
      }
    } else {
      width = Math.min(vw * 0.8, 800);
      height = width * 1.25;
      if (height > vh * 0.85) {
        height = vh * 0.85;
        width = height / 1.25;
      }
    }

    triggerRef.current = el;

    setExpanded({ item, from: { left: from.left, top: from.top, width: from.width, height: from.height } });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTargetRect({
          left: (vw - width) / 2,
          top: (vh - height) / 2,
          width,
          height,
        });
        setIsExpanded(true);
      });
    });
  }, []);

  const close = useCallback(() => {
    setIsExpanded(false);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setExpanded(null);
      setTargetRect(null);
      triggerRef.current?.focus();
    }, ANIM_MS);
  }, []);

  /* Esc 收起 */
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded, close]);

  /* 锁定滚动 */
  useEffect(() => {
    if (!expanded) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [expanded]);

  /* 构建 CollageItem 数据 */
  const getItem = (item: (typeof ITEMS)[number]): CollageItem | null => {
    if (item.kind === "video") {
      const clip = clips.find((c) => c.id === item.id);
      return clip ? { kind: "video", clip } : null;
    }
    if (item.src && item.alt && item.label) {
      return { kind: "image", src: item.src, alt: item.alt, label: item.label };
    }
    return null;
  };

  const box = expanded ? (isExpanded && targetRect ? targetRect : expanded.from) : null;

  /* 极坐标转直角坐标：
     原点 = 屏幕中心（50%, 50%）
     x = 50 + radius * cos(angle) * 1.2（水平拉得比垂直开一点）
     y = 50 + radius * sin(angle) * 0.8
     这样宽屏上 x 方向拉得更开，窄屏上 y 方向更紧凑。 */
  const polarToXY = (angle: number, radius: number) => {
    const rad = (angle * Math.PI) / 180;
    const x = 50 + radius * Math.cos(rad) * 1.2;
    const y = 50 + radius * Math.sin(rad) * 0.8;
    return { x, y };
  };

  return (
    <>
      <section
        ref={sectionRef}
        aria-label="Introduction — YOLO Apparel"
        className={`relative w-full overflow-hidden bg-paper ${className}`}
        style={{ minHeight: "100svh" }}
      >
        {/* ---------- 21 个散落卡片（9 视频 + 12 图片）----------
            随机散落，避开中央文字区（约 30%–70% 水平、35%–65% 垂直）。
            卡片 z-10，中央标题区 z-30，卡片不压文字。 */}
        {ITEMS.map((item) => {
          const data = getItem(item);
          if (!data) return null;

          const isHovered = hovered === item.id;
          const isLifted = expanded !== null &&
            ((data.kind === "video" && expanded.item.kind === "video" && expanded.item.clip.id === item.id) ||
             (data.kind === "image" && expanded.item.kind === "image" && expanded.item.src === item.src));

          const { x, y } = polarToXY(item.angle, item.radius);

          return (
            <div
              key={item.id}
              data-card={item.id}
              className="absolute z-10"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: item.size,
                /* 居中对齐：把卡片中心对准极坐标点，
                   再叠加视差偏移、随机倾斜（由角度派生）、距离缩放 */
                transform: `translate(-50%, -50%) translate3d(var(--card-x, 0px), var(--card-y, 0px), 0) rotate(${(item.angle % 10) - 5}deg) scale(var(--card-scale, 1))`,
                opacity: isLifted ? 0 : 1,
                transition: isLifted ? `opacity ${ANIM_MS}ms ${EASE}` : undefined,
              }}
            >
              <button
                type="button"
                aria-label={data.kind === "video" ? `${data.clip.label} — play video` : `${data.label} — view image`}
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") setHovered(item.id);
                }}
                onPointerLeave={(e) => {
                  if (e.pointerType === "mouse") {
                    setHovered((c) => (c === item.id ? null : c));
                  }
                }}
                onClick={(e) => {
                  console.log("[HeroCollage] click on", item.id);
                  open(data, e.currentTarget);
                }}
                className="group block w-full cursor-pointer overflow-hidden rounded-xl bg-ink-950 shadow-[0_16px_40px_-16px_rgba(42,49,43,0.4)] transition-shadow duration-300 hover:shadow-[0_24px_56px_-16px_rgba(42,49,43,0.45)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-500"
              >
                {/* 内容：视频或图片 */}
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl">
                  {data.kind === "video" ? (
                    <video
                      ref={(node) => {
                        if (node) videos.current.set(item.id, node);
                        else videos.current.delete(item.id);
                      }}
                      src={data.clip.src}
                      poster={data.clip.poster}
                      muted
                      loop
                      playsInline
                      preload="none"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Image
                      src={data.src}
                      alt={data.alt}
                      fill
                      sizes="(max-width: 768px) 160px, 280px"
                      className="object-cover"
                    />
                  )}

                  {/* 静止时轻压暗，hover 掀开 */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-xl bg-ink-950/20 transition-colors duration-500 group-hover:bg-ink-950/0"
                  />

                  {/* hover 浮出的播放/查看按钮 */}
                  <span
                    aria-hidden
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                      isHovered ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg">
                      {data.kind === "video" ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M8 5v14l11-7z" fill="currentColor" className="text-ink-950" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-950">
                          <circle cx="11" cy="11" r="8" />
                          <path d="M21 21l-4.35-4.35" />
                        </svg>
                      )}
                    </span>
                  </span>
                </div>
              </button>
            </div>
          );
        })}

        {/* ---------- 中央标题区（z-30，在卡片之上）----------
            文字和按钮带入场动画：eyebrow → 标题 → 正文 → CTA 逐行淡入上移。
            按钮加 pointer-events-auto，确保可点击。 */}
        <div className="pointer-events-none relative z-30 flex min-h-[100svh] items-center justify-center px-6">
          <div className="max-w-[52rem] text-center">
            <p className="hero-text-enter hero-delay-0 eyebrow flex items-center justify-center gap-3">
              <span aria-hidden className="h-[3px] w-6 bg-accent-500" />
              {intro.eyebrow}
              <span aria-hidden className="h-[3px] w-6 bg-accent-500" />
            </p>

            <h1 className="hero-text-enter hero-delay-1 display-xl mt-8 text-ink-950">
              {intro.headline}
            </h1>

            <p className="hero-text-enter hero-delay-2 mx-auto mt-7 max-w-[32rem] text-[15px] leading-[1.85] text-ink-600 md:text-base">
              {intro.body}
            </p>

            <div className="hero-text-enter hero-delay-3 mt-10 flex flex-wrap justify-center gap-4">
              {intro.links.map((link) => (
                <Link key={link.href} href={link.href} className="btn-primary pointer-events-auto">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- 展开弹层：视频播放或图片放大 ---------- */}
      {expanded && box ? (
        <div className="fixed inset-0 z-[70]">
          {/* mask */}
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className={`absolute inset-0 h-full w-full bg-ink-950/80 backdrop-blur-sm transition-opacity duration-300 ${
              isExpanded ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* 展开面板：从卡片原位补间到中央 */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label={expanded.item.kind === "video" ? expanded.item.clip.label : expanded.item.label}
            style={{
              left: box.left,
              top: box.top,
              width: box.width,
              height: box.height,
              transitionProperty: "left, top, width, height",
              transitionDuration: `${ANIM_MS}ms`,
              transitionTimingFunction: EASE,
            }}
            className="absolute z-[80] overflow-hidden rounded-xl bg-ink-950 shadow-2xl"
          >
            {expanded.item.kind === "video" ? (
              <video
                key={expanded.item.clip.id}
                src={expanded.item.clip.src}
                poster={expanded.item.clip.poster}
                muted
                loop
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                src={expanded.item.src}
                alt={expanded.item.alt}
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover"
              />
            )}

            {/* 底部信息条 */}
            <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/90 to-transparent px-5 pb-5 pt-12 transition-opacity duration-300 ${
              isExpanded ? "opacity-100" : "opacity-0"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                    {expanded.item.kind === "video" ? expanded.item.clip.theme : "Gallery"}
                  </p>
                  <p className="mt-1 text-[15px] font-medium tracking-tight text-white">
                    {expanded.item.kind === "video" ? expanded.item.clip.label : expanded.item.label}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-300 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
