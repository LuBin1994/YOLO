import Image from "next/image";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  image?: string | null;
  /** 图上方的分类小标 */
  eyebrow?: string;
}

/**
 * 内页首屏：全宽大图 + 底部叠印标题。
 * 遮罩改近黑（原来用深绿，偏工业），标题放大一档，小标前加青柠点。
 */
export default function PageHero({
  title,
  subtitle,
  image,
  eyebrow,
}: PageHeroProps) {
  return (
    <section className="relative flex min-h-[62vh] items-end overflow-hidden bg-ink-950 pt-24 md:min-h-[70vh]">
      {image ? (
        <Image
          src={image}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />

      <div className="container-site relative z-10 pb-16 md:pb-24">
        {eyebrow ? (
          <p className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.3em] text-white/80">
            <span aria-hidden className="h-[3px] w-6 bg-volt-400" />
            {eyebrow}
          </p>
        ) : null}
        <h1 className="display-xl mt-5 max-w-4xl text-white">{title}</h1>
        {subtitle ? (
          <p className="mt-7 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}
