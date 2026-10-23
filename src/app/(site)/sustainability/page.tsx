import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import OffsetHero from "@/components/site/heroes/OffsetHero";
import Reveal from "@/components/site/Reveal";
import { CERTIFICATION_WALL } from "@/lib/site-data";
import JsonLd from "@/components/site/JsonLd";
import { breadcrumb } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Sustainability",
  description:
    "A green industrial chain built from raw material to shipment: PFC-free finishing, waterless dyeing, ZDHC compliance and SBTi-verified greenhouse gas targets.",
  alternates: { canonical: "/sustainability" },
};

/**
 * 可持续发展页（2026-10-23 重写）
 *
 * 内容来自公司介绍册（2026-02 版）第 4–7 页，**不再走后台 CMS**。
 * 五根支柱、三项环保工艺、SBTi / ZDHC 的口径都是册子原话，
 * 没有添加任何册子里没有的承诺（例如没有写"碳中和年份"这种数字）。
 */

/** 绿色产业链的五根支柱（册子第 5 页原结构） */
const PILLARS = [
  {
    index: "01",
    title: "Raw materials",
    points: [
      "Natural and responsible fibres — member of the China Association for the Promotion of International Agricultural Cooperation, and of ICCAW, the International Cooperation Committee of Animal Welfare.",
      "Innovative man-made fibres through Haili Environmental Protection — a National High-Tech Enterprise and a National-Level Green Factory.",
    ],
  },
  {
    index: "02",
    title: "Fabric & yarn innovation",
    points: [
      "Recycled Fabric Research Institute.",
      "Sustainable Yarn Innovation Center.",
    ],
  },
  {
    index: "03",
    title: "Responsible manufacturing",
    points: [
      "Non-damaging cashmere fibre combing.",
      "Low-carbon dyeing process.",
      "ZDHC compliance — zero discharge of hazardous chemicals.",
    ],
  },
  {
    index: "04",
    title: "Product responsibility",
    points: [
      "Performance-driven design: the garment earns its place by lasting.",
      "Designed for circularity — mono-material where the construction allows.",
    ],
  },
  {
    index: "05",
    title: "Certification",
    points: [
      "SGS as strategic quality assurance partner.",
      "Committed to the Science Based Targets initiative (SBTi).",
      "GHG emission reduction targets verified by SBTi.",
    ],
  },
] as const;

/** 册子第 7 页的三项环保工艺 */
const TECH = [
  {
    title: "WR / WP without PFCs",
    body: "Water repellency and water proofing without fluorochemicals — the finish most outerwear programmes still default to.",
  },
  {
    title: "Dye without water",
    body: "Waterless dyeing for the fibres that accept it, cutting both the water draw and the effluent load of a dye lot.",
  },
  {
    title: "ZDHC eco-friendly dye",
    body: "Dye selection screened against the ZDHC Manufacturing Restricted Substances List, with the collection documented per lot.",
  },
] as const;

export default function SustainabilityPage() {
  const certLogos = CERTIFICATION_WALL.groups.flatMap((g) => g.items);

  return (
    <>
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "Sustainability", path: "/sustainability" },
        ])}
      />
      <OffsetHero
        eyebrow="Sustainability"
        title="Green is not a claim. It is a chain."
        subtitle="We started before it was expected, and we have kept going for over a decade — from the fibre we buy to the water we do not discharge."
        image="/media/sustainability/hero-coast.jpg"
      />

      {/* 开场 */}
      <section className="container-site section-pad">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center lg:gap-20">
          <Reveal>
            <div>
              <p className="eyebrow">At our core</p>
              <h2 className="display-md mt-5 max-w-xl">
                An early adopter in China, on purpose.
              </h2>
              <div className="mt-7 space-y-5 text-base leading-[1.85] text-ink-600">
                <p>
                  SYS GROUP is one of the pioneers in China to embrace green and
                  sustainable development. We have been committed to this path
                  for over a decade — long enough that it is now a way of
                  building a factory rather than a policy on a wall.
                </p>
                <p>
                  By 2022 the green industrial chain was in place across the
                  group: raw materials, manufacturing, production management,
                  environment and chemical management, each with an owner and
                  each with an audit behind it.
                </p>
                <p>
                  The practical reason is simple. A brand that has to report on
                  its supply chain cannot do that from a certificate alone — it
                  needs a mill that can say which lot, which dye and which water
                  treatment the fabric came through.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={70}>
            <div>
              {/* 这张是册子里的 PET 循环标识，原图黑底，已经抠成透明 PNG；
                  用 object-contain 摆在小方框里，不铺满，避免像个黑方块 */}
              <div className="relative mx-auto aspect-square w-full max-w-[420px]">
                <Image
                  src="/media/sustainability/recycled-pet.png"
                  alt="Recycled PET symbol made of bottles"
                  fill
                  sizes="(min-width: 1024px) 420px, 80vw"
                  className="object-contain"
                />
              </div>
              <p className="mt-6 text-center text-[11px] text-ink-400">
                Recycled polyester, traced from bottle flake to yarn — GRS and
                RCS certified.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 五根支柱 */}
      <section className="w-full border-t hairline bg-paper">
        <div className="container-site section-pad">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow">The chain</p>
                <h2 className="display-md mt-5 max-w-2xl">
                  Five links, and none of them optional.
                </h2>
              </div>
              <p className="max-w-sm text-[13px] leading-relaxed text-ink-500">
                A green claim only holds if it survives the handover between
                these five. We staff each one separately.
              </p>
            </div>
          </Reveal>

          {/* 大编号 + 横排：和工厂页的"横向滑动带"、责任页的"照片墙"区分开，
              这一页用编辑式的长条目，编号本身就是版面的主角 */}
          <div className="mt-12 border-t hairline">
            {PILLARS.map((p, i) => (
              <Reveal key={p.index} delay={Math.min(i * 40, 200)}>
                <div className="group grid gap-3 border-b hairline py-8 md:grid-cols-[5rem_minmax(10rem,15rem)_minmax(0,1fr)] md:items-baseline md:gap-10 md:py-10">
                  <span className="text-4xl font-medium tabular-nums tracking-tight text-ink-950/25 transition-colors duration-500 group-hover:text-accent-600 md:text-5xl">
                    {p.index}
                  </span>
                  <h3 className="text-xl font-medium tracking-tight text-ink-950 md:text-2xl">
                    {p.title}
                  </h3>
                  <ul className="space-y-2.5">
                    {p.points.map((point) => (
                      <li
                        key={point}
                        className="flex gap-2.5 text-[13px] leading-[1.75] text-ink-600"
                      >
                        <span
                          aria-hidden
                          className="mt-[0.6em] h-[3px] w-[3px] shrink-0 bg-accent-500"
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 环保工艺：近黑带 */}
      <section className="band-dark w-full">
        <div className="container-site section-pad">
          <Reveal>
            <p className="flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-white/55">
              <span aria-hidden className="h-[2px] w-5 bg-white/60" />
              Environmental technology
            </p>
            <h2 className="mt-5 max-w-2xl text-2xl font-medium tracking-tight text-white md:text-3xl">
              Three changes that show up in the bill of materials.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-3">
            {TECH.map((t, i) => (
              <Reveal key={t.title} delay={i * 60}>
                <div className="border-t border-white/15 pt-6">
                  <h3 className="text-base font-medium tracking-tight text-white md:text-lg">
                    {t.title}
                  </h3>
                  <p className="mt-3 text-[13px] leading-[1.8] text-white/55">
                    {t.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 认证 */}
      <section className="container-site section-pad">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Certification</p>
              <h2 className="display-md mt-5 max-w-2xl">
                Audited, tested, traceable.
              </h2>
            </div>
            <p className="max-w-sm text-[13px] leading-relaxed text-ink-500">
              Certificate numbers and audit reports are available on request —
              we would rather send the paperwork than describe it.
            </p>
          </div>
        </Reveal>

        {/* 认证标识：慢速跑马灯。二十多个标识静态排开太像规格表，
            横向滚起来反而像"这些是常年挂着的"。按项目约定不在 reduced-motion
            下禁用（标识本身就是展示主体），只把速度压慢。 */}
        <div className="mt-12 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_7%,#000_93%,transparent)]">
          <ul className="flex w-max animate-[marquee-left_46s_linear_infinite] items-center gap-14 pr-14">
            {[...certLogos, ...certLogos].map((cert, i) => (
              <li
                key={`${cert.name}-${i}`}
                className="flex h-10 shrink-0 items-center opacity-80 transition-opacity duration-300 hover:opacity-100"
                aria-hidden={i >= certLogos.length}
              >
                {cert.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cert.logo}
                    alt={cert.name}
                    title={cert.note ?? cert.name}
                    loading="lazy"
                    className="h-9 w-auto max-w-none object-contain"
                  />
                ) : (
                  <span className="whitespace-nowrap text-xs font-medium text-ink-950">
                    {cert.name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <Reveal delay={100}>
          <div className="mt-14 flex flex-wrap items-center gap-4 border-t hairline pt-8">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center bg-ink-950 px-7 py-3.5 text-sm font-medium tracking-wide text-white transition-colors duration-300 hover:bg-accent-600"
            >
              Ask for the sustainability pack
            </Link>
            <Link
              href="/factory"
              className="inline-flex items-center gap-2 text-sm font-medium text-ink-950 transition-colors duration-200 hover:text-accent-600"
            >
              Where this happens: our two factories
              <span aria-hidden>→</span>
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
