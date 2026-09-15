"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * 风格影片墙：四列竖版循环短片，满宽贴边、无间隙。
 * - 进入视口才挂载 <video>，避免首屏一次性拉满四段视频
 * - 每格先渲染 poster 静态图，等视频可以播放（canplay）后再淡入替换：
 *   视频未就绪时 <video> 保持 opacity-0 且不带 poster 属性，下面那张图自然透出来
 * - muted + playsInline + autoPlay + loop：满足各浏览器自动播放策略
 * - 窄屏退化为两列两行，仍保持竖版比例
 */
export interface FilmClip {
  /** 竖版短片路径（放 public/media，或远程直链）；留空则只渲染 poster */
  video?: string;
  /** 首帧静态图：视频就绪前的占位，也是视频缺失/加载失败时的降级画面 */
  poster?: string;
  /** 无障碍描述 */
  label: string;
}

export default function VideoWall({
  clips,
}: {
  clips: readonly FilmClip[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="w-full" aria-label="Style films">
      <div className="grid grid-cols-2 md:grid-cols-4">
        {clips.map((clip, i) => (
          <FilmCell key={`film-${i}`} clip={clip} load={inView} />
        ))}
      </div>
    </section>
  );
}

function FilmCell({ clip, load }: { clip: FilmClip; load: boolean }) {
  const [ready, setReady] = useState(false);

  return (
    <div className="relative aspect-[3/4] overflow-hidden bg-sand-200">
      {clip.poster ? (
        <Image
          src={clip.poster}
          alt={clip.label}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover"
        />
      ) : null}

      {load && clip.video ? (
        <video
          /* 就绪前透明，让下层静态图透出来；不加 poster 属性以免两层封面重叠 */
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out ${
            ready ? "opacity-100" : "opacity-0"
          }`}
          src={clip.video}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => setReady(true)}
          /* 描述由图层的 alt 承担，视频本身只是视觉增强，避免读屏重复播报 */
          aria-hidden
        />
      ) : null}
    </div>
  );
}
