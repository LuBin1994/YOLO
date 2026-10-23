import Image from "next/image";
import type { ShowcaseShot } from "@/lib/site-data";

/**
 * 案例图墙：三列流式图片 + 钉在视口中央的大字。
 *
 * 【文字用 mix-blend-mode: difference】
 * 白色文字叠在整段图墙之上，靠混合模式让**底色决定字的明暗**：
 *   - 落在珍珠白纸面上：白字与浅底相减 → 接近黑色（#f8f6f0 反相 ≈ #07090f，
 *     和站点自己的 ink-950 几乎分不出来）；
 *   - 落在图片上：白色的反相 = 图片颜色的负片，暗处变亮、亮处变暗，
 *     字的轮郭始终是"反着画面走"的，所以任何明暗的图上都读得清。
 *
 * 这个做法比"做两层、白字裁进图框"轻得多：不需要克隆一层文字，
 * 也不需要图墙比文字窄，交界完全由像素决定，字落在哪张图上就自动变色。
 *
 * 【为什么必须 isolate】
 * mix-blend-mode 只跟**同一个隔离组**内的底色混合，否则会一直混到页面最底层。
 * 所以 section 上写 `isolate`，把混合范围锁在这一段里（纸底 + 图片）。
 * 中间任何一层如果建了新的堆叠上下文（z-index / transform / opacity / filter），
 * 都会把文字隔离出来、混合失效——所以文字层的祖先尽量保持"干净"。
 *
 * 【为什么用 sticky 而不是 fixed】
 * sticky 的"钉住"范围由父元素决定：父层铺满图墙高度，于是文字在图墙进入视口
 * 时钉住、滚完自动松开，不会像 fixed 那样在图墙离开后还赖在屏幕上。
 *
 * 【图为什么都写死比例】
 * 三列流式（CSS columns）的高度由内容撑开。图片不给比例的话，加载过程中
 * 列高会跳，正在钉住的大字会跟着上下抖。
 */
export default function ShowcaseWall({
  shots,
  headline,
  className = "",
}: {
  shots: readonly ShowcaseShot[];
  headline: readonly string[];
  className?: string;
}) {
  return (
    <section
      aria-labelledby="showcase-headline"
      className={`relative isolate overflow-clip bg-paper py-16 md:py-24 ${className}`}
    >
      {/* 图墙：三列流式，比页面窄一点，两侧留出纸面给黑字落脚 */}
      <div className="relative px-6 md:px-10">
        <div className="mx-auto w-full max-w-[64rem] md:w-[76%]">
          <div className="columns-2 gap-[3px] md:columns-3">
            {shots.map((shot, index) => (
              <figure
                key={`${shot.src}-${index}`}
                className="relative mb-[3px] w-full break-inside-avoid bg-sand-100"
                style={{ aspectRatio: shot.ratio }}
              >
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  sizes="(min-width: 768px) 33vw, 50vw"
                  className="object-cover"
                />
              </figure>
            ))}
          </div>
        </div>
      </div>

      {/* 文字层：铺满图墙高度，白色 + difference，落在纸面上自然变黑。
          不加 z-index / transform / opacity，避免自建隔离组把混合切断。 */}
      <div className="pointer-events-none absolute inset-0">
        <h2
          id="showcase-headline"
          className="sticky top-0 flex h-[100svh] w-screen flex-col items-center justify-center px-5 text-center text-[clamp(24px,5.3vw,76px)] font-medium leading-[1.06] tracking-tight text-white mix-blend-difference md:px-8"
        >
          {headline.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h2>
      </div>
    </section>
  );
}
