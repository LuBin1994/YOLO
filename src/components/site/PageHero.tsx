import Image from "next/image";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  image?: string | null;
  /** 图上方的分类小标，呼应 Primesource 的 eyebrow 用法 */
  eyebrow?: string;
}

/**
 * 内页首屏：全宽大图 + 底部叠印标题。
 * 采用 Primesource 式深色渐变压底，标题居中偏左、字重克制。
 */
export default function PageHero({
  title,
  subtitle,
  image,
  eyebrow,
}: PageHeroProps) {
  return (
    <section className="relative flex min-h-[62vh] items-end overflow-hidden bg-forest-950 pt-24 md:min-h-[70vh]">
      {image ? (
        <Image
          src={image}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-65"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/45 to-forest-950/15" />

      <div className="container-site relative z-10 pb-16 md:pb-24">
        {eyebrow ? (
          <p className="text-[11px] uppercase tracking-[0.3em] text-sand-200/80">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="display-lg mt-4 max-w-4xl text-sand-50">{title}</h1>
        {subtitle ? (
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-sand-100/80 md:text-lg">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}
