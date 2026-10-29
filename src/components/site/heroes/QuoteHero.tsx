import Image from "next/image";
import CountUp from "@/components/site/CountUp";

/**
 * 责任页首屏：不谈业务，先把"人"用一句话说完。
 *
 * 另外三页的首屏都是标题 + 说明，这一页改成**一句大引言**压在合影上，
 * 数字（70% 女性、1,400 人）直接写进引言里并带滚动计数——
 * 因为这一页的说服力本来就来自人，而不是来自产能。
 */
export default function QuoteHero({
  eyebrow,
  quote,
  image,
  meta,
  stats,
}: {
  eyebrow: string;
  quote: string;
  image: string;
  meta: readonly string[];
  stats: readonly {
    value: number;
    suffix?: string;
    prefix?: string;
    label: string;
  }[];
}) {
  return (
    <section className="relative flex min-h-[88svh] flex-col justify-end overflow-hidden bg-ink-950">
      <Image
        src={image}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_35%] opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/45 to-ink-950/15" />

      <div className="container-site relative z-10 pb-12 pt-40 md:pb-16">
        <p className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.3em] text-white/60">
          <span aria-hidden className="h-[2px] w-6 bg-accent-400" />
          {eyebrow}
        </p>

        <h1 className="mt-6 max-w-[22ch] text-[clamp(30px,4.6vw,64px)] font-medium leading-[1.02] tracking-tight text-white">
          {quote}
        </h1>

        <dl className="mt-8 grid grid-cols-3 gap-x-4 gap-y-4 border-t border-white/20 pt-5 md:mt-10 md:flex md:flex-wrap md:gap-x-14 md:gap-y-6 md:pt-6">
          {stats.map((s) => (
            <div key={s.label}>
              <dd className="text-xl font-medium tracking-tight text-white md:text-3xl">
                <CountUp
                  value={s.value}
                  prefix={s.prefix}
                  suffix={s.suffix}
                />
              </dd>
              <dt className="mt-1 text-[11px] uppercase leading-tight tracking-[0.12em] text-white/45 md:text-[11px]">
                {s.label}
              </dt>
            </div>
          ))}
        </dl>

        <p className="mt-8 flex flex-wrap gap-x-5 gap-y-1 text-[11px] uppercase tracking-[0.18em] text-white/40">
          {meta.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </p>
      </div>
    </section>
  );
}
