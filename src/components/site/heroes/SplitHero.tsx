import Image from "next/image";

/**
 * 工厂页首屏：左深色数据面板 + 右整幅车间图。
 *
 * 四个内容页此前共用同一个 PageHero（上图下字），看上去像同一张模板换了字。
 * 这里按"工厂 = 工业、数据靠前"的语义重做：标题左侧、图右侧、参数直接压在
 * 首屏里，让访客第一眼就看到面积/线数/人数，而不是先读一句形容词。
 */
export default function SplitHero({
  eyebrow,
  title,
  subtitle,
  image,
  specs,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  image: string;
  specs: readonly { label: string; value: string }[];
}) {
  return (
    <section className="relative grid min-h-[76svh] grid-cols-1 bg-ink-950 lg:grid-cols-[minmax(0,46%)_1fr]">
      {/* 右图：移动端排在上方，桌面端占右半幅 */}
      <div className="relative order-1 min-h-[42svh] lg:order-2 lg:min-h-0">
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 54vw, 100vw"
          className="object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/70 via-ink-950/10 to-transparent lg:from-ink-950/45" />
      </div>

      <div className="relative order-2 flex flex-col justify-center px-6 pb-16 pt-10 md:px-10 lg:order-1 lg:pb-24 lg:pt-32 lg:pl-16 lg:pr-12">
        <p className="flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.3em] text-white/55">
          <span aria-hidden className="h-[2px] w-6 bg-accent-400" />
          {eyebrow}
        </p>

        <h1 className="mt-6 max-w-[16ch] text-[clamp(32px,4.2vw,58px)] font-medium leading-[1.04] tracking-tight text-white">
          {title}
        </h1>

        {subtitle ? (
          <p className="mt-6 max-w-sm text-[15px] leading-[1.75] text-white/60">
            {subtitle}
          </p>
        ) : null}

        <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-white/15 pt-6">
          {specs.map((s) => (
            <div key={s.label}>
              <dd className="text-xl font-medium tabular-nums tracking-tight text-white md:text-2xl">
                {s.value}
              </dd>
              <dt className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/40">
                {s.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
