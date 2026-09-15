import Image from "next/image";
import Link from "next/link";

interface BannerItem {
  eyebrow: string;
  title: string;
  cta: { label: string; href: string };
  image: string;
  strip: string;
  /** 主按钮填充色，缺省为品牌绿 */
  tone?: string;
}

/**
 * 双拼 Banner：满宽零间隙左右两栏，每栏「小标 + 大字 + 实心按钮」，
 * 下方压一条黑色胶囊横条。整块高度约 78vh，按 Primesource 版式复刻。
 */
export default function SplitBanner({ items }: { items: readonly BannerItem[] }) {
  return (
    <section className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.title}
            href={item.cta.href}
            className="group relative flex h-[52vh] items-center justify-center overflow-hidden bg-forest-950 md:h-[78vh]"
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover opacity-60 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-forest-950/50 via-forest-950/20 to-forest-950/60" />

            <div className="relative z-10 flex flex-col items-center px-6 text-center">
              <p className="overlay-eyebrow uppercase">{item.eyebrow}</p>
              <h2 className="overlay-title mt-4 text-4xl uppercase text-sand-50 md:text-6xl">
                {item.title}
              </h2>
              <span
                className="btn-solid-sm mt-7"
                style={{ backgroundColor: item.tone ?? "#2f5c4a" }}
              >
                {item.cta.label}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* 黑色胶囊横条 */}
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
