import Image from "next/image";

/**
 * 可持续页首屏：满幅影像 + 一张"压在图上的纸卡片"。
 *
 * 与工厂页的左右分栏刻意反过来：图片先满出来，文字后压上去，
 * 而且卡片是纸底黑字（其余三页首屏都是深底白字）。
 * 这一页讲的是材料与自然，用"纸上写着的一段话"比用深色工业块更贴题。
 */
export default function OffsetHero({
  eyebrow,
  title,
  subtitle,
  image,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  image: string;
}) {
  return (
    <section className="relative bg-paper">
      <div className="relative h-[58svh] w-full overflow-hidden md:h-[74svh]">
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* 只压底部，让上半幅的影像完整露出 */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink-950/55 to-transparent" />
      </div>

      <div className="container-site relative z-10 -mt-20 md:-mt-28">
        <div className="max-w-[42rem] bg-paper px-6 py-8 md:px-10 md:py-10">
          <p className="flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.3em] text-ink-400">
            <span aria-hidden className="h-[3px] w-6 bg-accent-500" />
            {eyebrow}
          </p>
          <h1 className="mt-5 text-[clamp(30px,3.8vw,54px)] font-medium leading-[1.06] tracking-tight text-ink-950">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-5 max-w-md text-[15px] leading-[1.8] text-ink-600">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
