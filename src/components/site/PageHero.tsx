import Image from "next/image";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  image?: string | null;
}

/**
 * 内页首屏：大图 + 标题叠印。
 */
export default function PageHero({ title, subtitle, image }: PageHeroProps) {
  return (
    <section className="relative flex min-h-[52vh] items-end overflow-hidden bg-forest-950 pt-24">
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
      <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/30 to-forest-950/10" />

      <div className="container-site relative z-10 pb-14 md:pb-20">
        <h1 className="display-lg max-w-4xl text-sand-50">{title}</h1>
        {subtitle ? (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-sand-100/85 md:text-lg">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}
