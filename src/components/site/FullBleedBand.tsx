import Image from "next/image";
import Link from "next/link";
import SlowZoom from "./SlowZoom";

/**
 * 满幅图片带：整幅贴边的图片 + 文字退到左下角。
 *
 * 用法定位：在两个结构相同的网格之间打断节奏。本站此前图片从不接触视口边缘
 * （都在 .container-site 内），而唯一满幅的视频墙恰好是最有"时尚感"的板块——
 * 这条区块就是把这个已验证有效的做法固定下来。
 *
 * 遮罩只覆盖文字所在的下部，不做整体压暗：影像是主角，不是背景板。
 */
export default function FullBleedBand({
  eyebrow,
  title,
  body,
  cta,
  image,
  alt = "",
}: {
  eyebrow: string;
  title: string;
  body?: string;
  cta?: { label: string; href: string };
  image: string;
  alt?: string;
}) {
  return (
    <section className="relative h-[64vh] w-full overflow-hidden bg-ink-950 md:h-[78vh]">
      <SlowZoom>
        <Image
          src={image}
          alt={alt}
          fill
          sizes="100vw"
          className="object-cover"
        />
      </SlowZoom>

      {/* 仅覆盖文字所在的下部，保证可读性即可 */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
      />

      <div className="container-site relative flex h-full flex-col justify-end pb-12 md:pb-16">
        <p className="overlay-eyebrow uppercase">{eyebrow}</p>
        <h2 className="overlay-title mt-5 max-w-3xl text-4xl uppercase text-white md:text-6xl">
          {title}
        </h2>
        {body ? (
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/75">
            {body}
          </p>
        ) : null}
        {cta ? (
          <Link
            href={cta.href}
            className="mt-9 inline-flex w-fit items-center justify-center border border-white/35 px-8 py-4 text-sm font-medium tracking-wide text-white transition-colors duration-300 hover:border-white hover:bg-white hover:text-ink-950"
          >
            {cta.label}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
