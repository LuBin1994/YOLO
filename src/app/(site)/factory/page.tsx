import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SplitHero from "@/components/site/heroes/SplitHero";
import CountUp from "@/components/site/CountUp";
import Reveal from "@/components/site/Reveal";
import JsonLd from "@/components/site/JsonLd";
import { breadcrumb } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Our factories",
  description:
    "Two company-owned garment factories in Cambodia — 25,044 m² of floor, 21 production lines and 1,400+ people making down, padded outerwear and jackets for international brands.",
  alternates: { canonical: "/factory" },
};

/**
 * 工厂页（2026-10-23 重写）
 *
 * 内容全部来自两份工厂资料（S-YOLO 2026.8.27 / CB-SHCA 3-24），
 * **不再从后台取数**：工厂是相对固定的资产，一年才动一次，
 * 放后台反而要维护一套表单；写成常量，改文案直接改这里。
 *
 * 两条口径写死在这里，防止后来人改错：
 * 1. 只有资料里写明的数字才上页面。S-YOLO 的"规划值"单独标 note，
 *    不混进合计——合计只算当前实有（9 + 12 = 21 条线，600 + 800 = 1,400+ 人）。
 * 2. 客户名只用资料里出现过的（Nike / Levi's / Under Armour / Costco /
 *    U.S. Polo Assn. / Lacoste），不额外添加。
 */

const HERO_SPECS = [
  { label: "Factories", value: "2" },
  { label: "Floor", value: "25,044 m²" },
  { label: "Lines", value: "21" },
] as const;

interface FactoryProfile {
  index: string;
  name: string;
  short: string;
  address: string;
  parent?: string;
  hero: string;
  detail: string;
  specs: readonly { label: string; value: string; note?: string }[];
  products: readonly string[];
  audits: readonly string[];
}

const FACTORIES: readonly FactoryProfile[] = [
  {
    index: "01",
    name: "S-YOLO (Cambodia) Garments Co., Ltd.",
    short: "S-YOLO",
    address:
      "Trapeang Skon village, Trapeang Reang commune, Chum Kiri district, Kampot province, Cambodia",
    hero: "/media/factory/sewing.jpg",
    detail: "/media/factory/warehouse.jpg",
    specs: [
      { label: "Manufacturing area", value: "12,564 m²" },
      { label: "Production lines", value: "9", note: "25 planned" },
      { label: "People", value: "600", note: "1,600 planned" },
      {
        label: "Capacity",
        value: "70,000 pcs",
        note: "per month · 180,000 planned",
      },
    ],
    products: ["Down jackets", "Padded outerwear", "Long coats"],
    audits: ["SMETA", "WRAP", "SLCP", "Nike"],
  },
  {
    index: "02",
    name: "SHCA Garment (Cambodia) Co., Ltd.",
    short: "SHCA",
    address:
      "Oleang Reul commune, Samraong Tong district, Kampong Speu province, Cambodia",
    parent:
      "Zhejiang Heyuan Apparel Manufacturing Co., Ltd. — office in Hangzhou, China",
    hero: "/media/factory/floor-b.jpg",
    detail: "/media/factory/cutting-table.jpg",
    specs: [
      { label: "Manufacturing area", value: "12,480 m²" },
      { label: "Production lines", value: "12" },
      { label: "People", value: "800+" },
      { label: "Capacity", value: "1,000,000 pcs", note: "per year" },
    ],
    products: ["Jackets", "Parkas", "Padded outerwear", "Knit & waffle"],
    audits: ["WRAP", "SMETA 4-pillar", "GRS"],
  },
];

/** 工序：两家工厂的 tour 章节是同一套顺序，合并成一条通用流程 */
const PROCESS = [
  {
    step: "01",
    title: "Fabric receiving",
    body: "Incoming rolls are checked against the lot card, then stored by shade so a cut is never mixed.",
  },
  {
    step: "02",
    title: "Cutting",
    body: "CAD markers are nested per size, then cut on straight-knife tables or the automatic cutter.",
  },
  {
    step: "03",
    title: "Templates",
    body: "Pockets, plackets and logos run on automatic template machines — the repeatable parts are the ones that drift.",
  },
  {
    step: "04",
    title: "Down filling",
    body: "Semi-automatic filling lines, each baffle weight-checked before it moves to sewing.",
  },
  {
    step: "05",
    title: "Sewing",
    body: "21 lines across the two plants: single-needle, overlock and coverstitch, set up by style.",
  },
  {
    step: "06",
    title: "Buttons & eyelets",
    body: "Electronic eyelet and buttonhole machines, placed against the approved sample.",
  },
  {
    step: "07",
    title: "Quality control",
    body: "In-line checks at the seam, then 100% final inspection and AQL on the finished lot.",
  },
  {
    step: "08",
    title: "Finishing & carton",
    body: "Pressing, thread trimming, dry room before packing, then cartons weighed and marked for export.",
  },
] as const;

/** 设备：取自 S-YOLO 的机器清单（截至 2026 年 5 月），只列有代表性的几类 */
const EQUIPMENT = [
  { value: "820", label: "Single-needle machines" },
  { value: "146", label: "Template & automatic stations" },
  { value: "64", label: "Overlock machines" },
  { value: "33", label: "Pressing stations" },
] as const;

const BRAND_AUDITS = [
  "Nike",
  "Levi's",
  "Under Armour",
  "Costco",
  "U.S. Polo Assn.",
  "Lacoste",
] as const;

const COMPLIANCE_LOGOS = [
  { src: "/media/certifications/smeta.png", alt: "SMETA" },
  { src: "/media/certifications/wrap.png", alt: "WRAP" },
  { src: "/media/certifications/grs.png", alt: "Global Recycled Standard" },
] as const;

export default function FactoryPage() {
  return (
    <>
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "Factory", path: "/factory" },
        ])}
      />
      <SplitHero
        eyebrow="Manufacturing"
        title="Two factories in Cambodia, one quality system."
        subtitle="Both plants are company-owned and run to the same process and audit standard — down, padded outerwear and jackets for international brands."
        image="/media/factory/hero-floor.jpg"
        specs={HERO_SPECS}
      />

      {/* 开场：左文右图 */}
      <section className="container-site section-pad">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start lg:gap-20">
          <Reveal>
            <div>
              <p className="eyebrow">Inside the plants</p>
              <h2 className="display-md mt-5 max-w-xl">
                We make where we can walk the floor every morning.
              </h2>
              <div className="mt-7 space-y-5 text-base leading-[1.85] text-ink-600">
                <p>
                  Both factories sit in Cambodia: one in Kampot province, one in
                  Kampong Speu. Together they give us 25,044 m² of floor, 21
                  production lines and a workforce of more than 1,400 — all on
                  our own payroll, not a subcontractor&rsquo;s.
                </p>
                <p>
                  That matters most in down and padded outerwear, where a
                  garment passes through filling, baffle stitching and pressing
                  before anyone can judge it. Keeping every step in the same
                  building is how the weight, the loft and the seam stay
                  consistent from the first sample to the last carton.
                </p>
              </div>

              <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 border-t hairline pt-8">
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.16em] text-ink-400">
                    Products made
                  </dt>
                  <dd className="mt-1.5 text-sm leading-snug text-ink-950">
                    Down jackets, padded outerwear, parkas, coats
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.16em] text-ink-400">
                    Audits held
                  </dt>
                  <dd className="mt-1.5 text-sm leading-snug text-ink-950">
                    SMETA, WRAP, SLCP, GRS
                  </dd>
                </div>
              </dl>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="grid grid-cols-2 gap-3">
              <figure className="relative col-span-2 aspect-[16/10] overflow-hidden bg-sand-100">
                <Image
                  src="/media/factory/floor-b.jpg"
                  alt="Sewing floor at the SHCA plant in Kampong Speu"
                  fill
                  sizes="(min-width: 1024px) 52vw, 100vw"
                  className="object-cover"
                />
              </figure>
              <figure className="relative aspect-[4/3] overflow-hidden bg-sand-100">
                <Image
                  src="/media/factory/cutting-cad.jpg"
                  alt="Automatic cutting machine cutting a nested marker"
                  fill
                  sizes="(min-width: 1024px) 26vw, 50vw"
                  className="object-cover"
                />
              </figure>
              <figure className="relative aspect-[4/3] overflow-hidden bg-sand-100">
                <Image
                  src="/media/factory/qc.jpg"
                  alt="Final inspection of a padded garment"
                  fill
                  sizes="(min-width: 1024px) 26vw, 50vw"
                  className="object-cover"
                />
              </figure>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 两家工厂 */}
      <section className="w-full border-t hairline">
        <div className="container-site section-pad">
          <Reveal>
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2 className="display-md max-w-xl">The two plants.</h2>
              <p className="text-[11px] uppercase tracking-[0.16em] text-ink-400">
                Cambodia · company-owned
              </p>
            </div>
          </Reveal>

          <div className="mt-14 space-y-16 md:space-y-24">
            {FACTORIES.map((factory, i) => (
              <Reveal key={factory.short} delay={i * 60}>
                <article className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
                  {/* 图 */}
                  <div
                    className={`grid grid-cols-2 gap-3 ${
                      i % 2 === 1 ? "lg:order-2" : ""
                    }`}
                  >
                    <figure className="relative col-span-2 aspect-[16/9] overflow-hidden bg-sand-100">
                      <Image
                        src={factory.hero}
                        alt={`Production floor at ${factory.short}`}
                        fill
                        sizes="(min-width: 1024px) 55vw, 100vw"
                        className="object-cover"
                      />
                    </figure>
                    <figure className="relative col-span-2 aspect-[16/7] overflow-hidden bg-sand-100">
                      <Image
                        src={factory.detail}
                        alt={`Production floor at ${factory.short}`}
                        fill
                        sizes="(min-width: 1024px) 55vw, 100vw"
                        className="object-cover"
                      />
                    </figure>
                  </div>

                  {/* 文 */}
                  <div>
                    <p className="flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-ink-400">
                      <span aria-hidden className="h-[2px] w-5 bg-accent-500" />
                      Factory {factory.index}
                    </p>
                    <h3 className="mt-4 text-xl font-medium tracking-tight text-ink-950 md:text-2xl">
                      {factory.short}
                    </h3>
                    <p className="mt-1 text-sm text-ink-600">{factory.name}</p>

                    <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-600">
                      {factory.address}
                      {factory.parent ? (
                        <>
                          <br />
                          <span className="text-ink-400">{factory.parent}</span>
                        </>
                      ) : null}
                    </p>

                    <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t hairline pt-6">
                      {factory.specs.map((s) => (
                        <div key={s.label}>
                          <dt className="text-[10px] uppercase tracking-[0.14em] text-ink-400">
                            {s.label}
                          </dt>
                          <dd className="mt-1 text-lg font-medium tabular-nums tracking-tight text-ink-950">
                            {s.value}
                          </dd>
                          {s.note ? (
                            <p className="mt-0.5 text-[11px] text-ink-400">
                              {s.note}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </dl>

                    <div className="mt-7 flex flex-wrap gap-x-2 gap-y-2">
                      {factory.products.map((p) => (
                        <span
                          key={p}
                          className="border hairline px-2.5 py-1 text-[11px] tracking-wide text-ink-600"
                        >
                          {p}
                        </span>
                      ))}
                    </div>

                    <p className="mt-6 text-[11px] uppercase tracking-[0.14em] text-ink-400">
                      Audited by
                    </p>
                    <p className="mt-1.5 text-sm text-ink-950">
                      {factory.audits.join(" · ")}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 流程：横向滑动带。
          八道工序排成一条可以左右拖的带子，而不是又一组竖排卡片——
          这一页前两块已经是"图 + 规格表"，流程换成横向节奏，读起来不再一顺到底。 */}
      <section className="band-dark w-full">
        <div className="container-site pt-20 md:pt-28">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-white/55">
                  <span aria-hidden className="h-[2px] w-5 bg-white/60" />
                  Process
                </p>
                <h2 className="mt-5 max-w-xl text-2xl font-medium tracking-tight text-white md:text-3xl">
                  Eight stages, and a check between each pair.
                </h2>
              </div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                Drag / scroll →
              </p>
            </div>
          </Reveal>
        </div>

        <div className="mt-10 flex gap-5 overflow-x-auto px-6 pb-20 md:px-10 md:pb-28 [scrollbar-width:thin]">
          {PROCESS.map((p, i) => (
            <Reveal
              key={p.step}
              delay={Math.min(i * 40, 240)}
              className="w-[78vw] shrink-0 sm:w-[44vw] lg:w-[24vw]"
            >
              <article className="group h-full border-t border-white/20 pt-5 transition-colors duration-300 hover:border-accent-400">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] tabular-nums tracking-[0.2em] text-white/35">
                    {p.step}
                  </span>
                  <span
                    aria-hidden
                    className="h-[2px] w-0 bg-accent-400 transition-all duration-500 group-hover:w-8"
                  />
                </div>
                <h3 className="mt-3 text-base font-medium tracking-tight text-white md:text-lg">
                  {p.title}
                </h3>
                <p className="mt-2.5 text-[13px] leading-[1.75] text-white/55">
                  {p.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 设备 + 合规 */}
      <section className="container-site section-pad">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <div>
              <p className="eyebrow">Equipment</p>
              <h2 className="display-md mt-5">What is on the floor.</h2>
              <p className="mt-6 max-w-md text-base leading-relaxed text-ink-600">
                The machine list is reviewed every season. Template stations
                matter more than raw machine count in padded outerwear — they
                are what keeps a pocket in the same place on piece 1 and piece
                10,000.
              </p>

              <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-8 border-t hairline pt-8">
                {EQUIPMENT.map((e) => (
                  <div key={e.label}>
                    <dd className="text-3xl font-medium tabular-nums tracking-tight text-ink-950 md:text-4xl">
                      {e.value}
                    </dd>
                    <dt className="mt-1.5 text-[11px] uppercase tracking-[0.14em] text-ink-400">
                      {e.label}
                    </dt>
                  </div>
                ))}
              </dl>
              <p className="mt-6 text-[11px] text-ink-400">
                Counts from the S-YOLO machine list, current to May 2026.
              </p>
            </div>
          </Reveal>

          <Reveal delay={70}>
            <div>
              <p className="eyebrow">Compliance</p>
              <h2 className="display-md mt-5">Audited, and we ask for it.</h2>
              <p className="mt-6 max-w-md text-base leading-relaxed text-ink-600">
                Both plants are audited on social compliance and chemical
                management. We keep a digital archive of every inspection and a
                tiered correction process, so a finding is closed before the next
                audit rather than after it.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-x-10 gap-y-6">
                {COMPLIANCE_LOGOS.map((logo) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={logo.src}
                    src={logo.src}
                    alt={logo.alt}
                    loading="lazy"
                    className="h-9 w-auto object-contain opacity-80"
                  />
                ))}
                <span className="text-[11px] uppercase tracking-[0.16em] text-ink-400">
                  + SLCP
                </span>
              </div>

              <p className="mt-9 text-[11px] uppercase tracking-[0.14em] text-ink-400">
                Customer audits completed
              </p>
              <ul className="mt-2.5 flex flex-wrap gap-x-5 gap-y-2">
                {BRAND_AUDITS.map((b) => (
                  <li key={b} className="text-sm text-ink-950">
                    {b}
                  </li>
                ))}
              </ul>

              <Link
                href="/contact"
                className="mt-10 inline-flex items-center gap-2 border-b border-ink-950/30 pb-1 text-sm font-medium text-ink-950 transition-colors duration-200 hover:border-ink-950"
              >
                Request the audit pack
                <span aria-hidden>→</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 人 */}
      <section className="w-full border-y hairline bg-sand-50">
        <div className="container-site grid gap-10 py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center lg:gap-16 lg:py-20">
          <Reveal>
            <div className="relative aspect-[16/10] overflow-hidden bg-sand-200">
              <Image
                src="/media/factory/team.jpg"
                alt="SHCA team gathered in front of the factory sign"
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={60}>
            <div>
              <p className="eyebrow">People</p>
              <h2 className="display-md mt-5">
                <CountUp value={1400} suffix="+" /> people, most of them from
                the next village.
              </h2>
              <p className="mt-6 max-w-md text-base leading-[1.85] text-ink-600">
                Both plants draw their workforce from the districts around them.
                Festival days and team events sit on the factory calendar
                alongside production, which is why a supervisor usually knows
                who is new, who is training and who is ready for a harder style.
              </p>
              <p className="mt-4 max-w-md text-base leading-[1.85] text-ink-600">
                Low turnover is the practical reason we can hold a line to the
                same standard across a season.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="band-accent w-full">
        <div className="container-site py-24 text-center md:py-28">
          <Reveal>
            <h2 className="display-lg mx-auto max-w-3xl text-ink-950">
              Come and walk the floor.
            </h2>
            <p className="mx-auto mt-7 max-w-xl text-sm leading-relaxed text-ink-600">
              We welcome brand audits and factory visits. Tell us which
              construction you are planning and we will book the line that runs
              it.
            </p>
            <div className="mt-11 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center bg-ink-950 px-8 py-4 text-sm font-medium tracking-wide text-white transition-colors duration-300 hover:bg-white hover:text-ink-950"
              >
                Arrange a visit
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center border border-ink-950/35 px-8 py-4 text-sm font-medium tracking-wide text-ink-950 transition-colors duration-300 hover:border-ink-950 hover:bg-ink-950 hover:text-white"
              >
                Browse products
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
