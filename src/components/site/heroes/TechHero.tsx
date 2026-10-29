import Image from "next/image";

/**
 * R&D 首屏：深底 + 技术网格 + 等宽字标。
 *
 * 另外三页用的是"影像叙事"（大图、人、自然），这一页反过来用**图纸感**：
 * 背景是一层极淡的坐标网格，左上角挂一行等宽小字（编号 / 科目），
 * 数字用规格表的方式排在标题下面。读起来像实验室的封页，而不是宣传页。
 */
export default function TechHero({
  eyebrow,
  fileNo,
  title,
  subtitle,
  image,
  facts,
}: {
  eyebrow: string;
  fileNo: string;
  title: string;
  subtitle?: string;
  image: string;
  facts: readonly { label: string; value: string }[];
}) {
  return (
    <section className="relative overflow-hidden bg-ink-950">
      {/* 坐标网格：12px 一格，极低对比，只在深底上隐约可见 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.35) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(120% 90% at 20% 0%, #000 30%, transparent 75%)",
        }}
      />

      <div className="container-site relative z-10 grid gap-12 pb-14 pt-28 md:pt-32 lg:grid-cols-[minmax(0,1fr)_minmax(0,38%)] lg:items-end lg:gap-16 lg:pb-20">
        <div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.24em] text-white/40">
            <span className="text-accent-400">{fileNo}</span>
            <span aria-hidden className="h-px w-8 bg-white/25" />
            <span>{eyebrow}</span>
          </div>

          <h1 className="mt-7 max-w-[18ch] text-[clamp(32px,4.6vw,60px)] font-medium leading-[1.03] tracking-tight text-white">
            {title}
          </h1>

          {subtitle ? (
            <p className="mt-6 max-w-md text-[15px] leading-[1.8] text-white/55">
              {subtitle}
            </p>
          ) : null}

          <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-white/15 pt-6 sm:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label}>
                <dd className="text-lg font-medium tabular-nums tracking-tight text-white md:text-xl">
                  {f.value}
                </dd>
                <dt className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/40">
                  {f.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>

        <figure className="relative aspect-[4/5] overflow-hidden bg-white/5 lg:aspect-[3/4]">
          <Image
            src={image}
            alt="Vintage sewing machines displayed on a workshop wall above a pile of coloured cushions"
            fill
            priority
            sizes="(min-width: 1024px) 38vw, 100vw"
            className="object-cover opacity-90"
          />
          {/* 图上压一行小字，像样张背面的标注 */}
          <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-ink-950/85 to-transparent px-4 pb-3 pt-10 font-mono text-[11px] uppercase tracking-[0.18em] text-white/55">
            <span>Studio wall</span>
            <span>Hangzhou</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
