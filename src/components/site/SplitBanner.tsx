import Image from "next/image";
import Link from "next/link";

interface BannerItem {
  eyebrow: string;
  title: string;
  cta: { label: string; href: string };
  image: string;
  strip: string;
  /** 主按钮填充色，缺省为活力青柠 */
  tone?: string;
}

/**
 * 双拼 Banner：满宽零间隙左右两栏，每栏「小标 + 大字 + 实心按钮」，
 * 下方压一条近黑横条。
 * 遮罩由深绿改近黑，标题放大一档，CTA 用青柠点睛——整块只保留一个高饱和点。
 */
export default function SplitBanner({ items }: { items: readonly BannerItem[] }) {
  return (
    <section className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.title}
            href={item.cta.href}
            className="group relative flex h-[52vh] items-center justify-center overflow-hidden bg-ink-950 md:h-[78vh]"
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover opacity-70 transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
            />
            {/* 近黑遮罩：比深绿更中性，图片色彩更干净 */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/65" />

            <div className="relative z-10 flex flex-col items-center px-6 text-center">
              <p className="overlay-eyebrow uppercase">{item.eyebrow}</p>
              <h2 className="overlay-title mt-4 text-5xl uppercase text-white md:text-7xl">
                {item.title}
              </h2>
              <span
                className="btn-solid-sm mt-8 hover:bg-white"
                style={{
                  backgroundColor: item.tone ?? "#d6f94b",
                  color: item.tone ? "#ffffff" : "#0a0a0a",
                }}
              >
                {item.cta.label}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* 近黑横条 */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {items.map((item) => (
          <p key={`strip-${item.title}`} className="banner-strip">
            {item.strip}
          </p>
        ))}
      </div>
    </section>
  );
}
