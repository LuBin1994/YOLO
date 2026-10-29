import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import TechHero from "@/components/site/heroes/TechHero";
import CountUp from "@/components/site/CountUp";
import Reveal from "@/components/site/Reveal";
import JsonLd from "@/components/site/JsonLd";
import { breadcrumb } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Research & development",
  description:
    "Four design centres, a sampling room, a yarn and fabric research institute and an SGS laboratory — the R&D layer that sits between a tech pack and bulk production.",
  alternates: { canonical: "/rnd" },
};

/**
 * R&D 页（2026-10-23 新建）
 *
 * 内容来自公司介绍册第 9–18 页（Innovation through R&D 章节）+ SHCA 工厂册的
 * Sampling room 页。**静态内容，不走后台。**
 *
 * 三块按客户给的侧重写：
 * 1. Design —— 四个设计中心的全球分工（Hangzhou 以面料为核心、海外做趋势与款式）、
 *    3D 与 AI 工具。
 * 2. Sampling room —— 打样与工厂的衔接：模板机、Jack 找缝机、自制工装，
 *    每个都带可量化的效率数字（这些数字都是册子里写的）。
 * 3. Fabric development —— 纱线功能性研究；价格 / 创新 / 前沿三档的平衡。
 */

const HERO_FACTS = [
  { label: "Design centres", value: "4" },
  { label: "Samples a year", value: "5,000" },
  { label: "First-fit pass", value: "80%" },
  { label: "Own tooling", value: "+30%" },
] as const;

/** 设计中心分工（册子第 18 页） */
const CENTRES = [
  {
    city: "Hangzhou",
    role: "Core",
    note: "Projects run with fabric as the core — the studio sits next to the mill and the lab.",
  },
  {
    city: "Spain",
    role: "Trend",
    note: "Fashion trend forecast and range direction for the European labels.",
  },
  {
    city: "Paris",
    role: "Trend",
    note: "Trend input and garment design, close to the couture and premium market.",
  },
  {
    city: "New York",
    role: "Trend",
    note: "North American trend reading and design service for US accounts.",
  },
] as const;

/** 打样间的三套工具（册子第 17 页的 Achievement presentation） */
const TOOLING = [
  {
    title: "Zipper on a template machine",
    gain: "+30% output · −1 operator",
    body: "Setting the zipper on a template station lifts production efficiency by 30% and takes one person out of the operation. The fixture is patented.",
  },
  {
    title: "Upgraded seam machine",
    gain: "+30% output · no skilled operator",
    body: "A redeveloped seam machine raises efficiency by 30% and no longer needs an operator with sewing skills — with 3D-printed jigs added for the auxiliary steps.",
  },
  {
    title: "Template tooling",
    gain: "Fewer manual steps",
    body: "Tooling developed in-house to simplify the operation itself: if a step can be fixtured, it stops depending on who is on the station.",
  },
] as const;

/** 价格 / 创新 / 前沿：三档面料策略（客户要求的"均衡"） */
const LADDER = [
  {
    tier: "Commercial core",
    position: "Price-led",
    body: "High-volume qualities where the brief is cost, hand-feel and repeatability. We keep these on the same mills year after year so the price does not move with the season.",
  },
  {
    tier: "Performance",
    position: "Balanced",
    body: "Functional finishes and fibre blends that earn a premium without leaving the volume band — 30K/30K waterproof-breathable, recycled down alternatives, PFC-free repellency.",
  },
  {
    tier: "Frontier",
    position: "Innovation-led",
    body: "The fabrics we develop before a brand asks: photothermal linings, down-like synthetics, IP-rated specialities. Small runs, higher cost, first access for the brands we build them with.",
  },
] as const;

/** 实验室检测项（册子第 12 页） */
const LAB_TESTS = [
  "Dimensional stability to washing",
  "Tensile / pulling strength",
  "Colour fastness to washing",
  "Colour fastness to rubbing",
  "Single yarn strength",
  "Tear strength (ISO 139)",
  "Conditioning oven",
] as const;

export default function RndPage() {
  return (
    <>
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "R&D", path: "/rnd" },
        ])}
      />
      <TechHero
        fileNo="02 / R&D"
        eyebrow="Research & development"
        title="From a yarn idea to a sample that fits."
        subtitle="Four design centres, a sampling room, a yarn and fabric research institute and a laboratory — the layer between a tech pack and bulk production."
        image="/media/rnd/studio-wall-brand.jpg"
        facts={HERO_FACTS}
      />

      {/* 01 Design */}
      <section className="container-site section-pad" id="design">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-20">
          <Reveal>
            <div>
              <p className="eyebrow">Design</p>
              <h2 className="display-md mt-5 max-w-xl">
                Design, in four time zones.
              </h2>
              <div className="mt-7 space-y-5 text-base leading-[1.85] text-ink-600">
                <p>
                  Hangzhou runs the projects, and it runs them with fabric as the
                  core: the studio sits next to the mill, so a hand-feel decision
                  can be made by walking twenty metres. Spain, Paris and New York
                  read the market and feed trend and range direction back into
                  that studio.
                </p>
                <p>
                  That split is deliberate. A European label wants the trend call
                  made close to its own market, and the construction settled
                  where the fabric is made. Four centres means both can happen in
                  the same week.
                </p>
                <p>
                  On top of it sits a design service layer for brands that arrive
                  with a brief rather than a tech pack — trend forecast, range
                  planning, flat sketches and the first prototypes.
                </p>
              </div>

              <dl className="mt-10 grid gap-6 border-t hairline pt-8 sm:grid-cols-2">
                <div>
                  <dt className="text-[12px] uppercase tracking-[0.16em] text-ink-400">
                    3D sampling
                  </dt>
                  <dd className="mt-2 text-[15px] leading-relaxed text-ink-600">
                    Garments are built in 3D before a cutter touches fabric, so
                    fit and proportion are argued on screen instead of in
                    courier costs.
                  </dd>
                </div>
                <div>
                  <dt className="text-[12px] uppercase tracking-[0.16em] text-ink-400">
                    AI in the workflow
                  </dt>
                  <dd className="mt-2 text-[15px] leading-relaxed text-ink-600">
                    AI apps sit in the design loop — pattern variation, size-set
                    checking and the boring parts of tech-pack translation.
                  </dd>
                </div>
              </dl>
            </div>
          </Reveal>

          <Reveal delay={70}>
            <div className="grid grid-cols-2 gap-3">
              <figure className="relative col-span-2 aspect-[16/10] overflow-hidden bg-sand-100">
                <Image
                  src="/media/rnd/design-studio-wall.jpg"
                  alt="Season trend boards pinned on the studio wall above a rail of sample garments"
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover"
                />
              </figure>
              <figure className="relative aspect-[4/3] overflow-hidden bg-sand-100">
                <Image
                  src="/media/rnd/showroom-ny.jpg"
                  alt="New York studio with fitted mannequins"
                  fill
                  sizes="(min-width: 1024px) 27vw, 50vw"
                  className="object-cover"
                />
              </figure>
              {/* 四个中心做成一张小规格表：城市 / 角色 / 一句话职责，
                  比一行城市名更像"研发页"该有的信息密度 */}
              <dl className="border-t hairline">
                {CENTRES.map((c) => (
                  <div
                    key={c.city}
                    className="group grid grid-cols-[5.5rem_1fr] gap-x-4 gap-y-1 border-b hairline py-3"
                  >
                    <dt className="text-[15px] font-medium tracking-tight text-ink-950">
                      {c.city}
                      <span className="mt-0.5 block text-[11px] uppercase tracking-[0.14em] text-ink-400 transition-colors duration-300 group-hover:text-accent-600">
                        {c.role}
                      </span>
                    </dt>
                    <dd className="text-[12px] leading-[1.6] text-ink-600">
                      {c.note}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 02 Sampling room：近黑带，和前后浅底拉开 */}
      <section className="band-dark w-full" id="sampling">
        <div className="container-site section-pad">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center lg:gap-20">
            <Reveal>
              <div>
                <p className="flex items-center gap-3 text-[12px] uppercase tracking-[0.24em] text-white/55">
                  <span aria-hidden className="h-[2px] w-5 bg-white/60" />
                  Sampling room
                </p>
                <h2 className="mt-5 text-2xl font-medium tracking-tight text-white md:text-3xl">
                  Where the drawing meets the line.
                </h2>
                <div className="mt-6 space-y-4 text-[15px] leading-[1.85] text-white/60">
                  <p>
                    About 5,000 samples leave the room in a year, and four out of
                    five fit correctly the first time. That number is the point:
                    every re-fit costs a brand a week and costs us a line slot.
                  </p>
                  <p>
                    The room also sits in front of the factories. When a
                    construction is difficult, it is solved here — at the front
                    end — rather than discovered on a line of operators who are
                    already being paid to sew it.
                  </p>
                  <p>
                    It works both ways. A finding on the floor becomes a fixture
                    in the sampling room, and a fixture in the sampling room
                    becomes a faster line. Tooling, trade and research feed each
                    other; that loop is the actual product.
                  </p>

                <dl className="mt-9 flex flex-wrap gap-x-12 gap-y-5 border-t border-white/15 pt-6">
                  <div>
                    <dd className="text-2xl font-medium tracking-tight text-white md:text-3xl">
                      <CountUp value={5000} />
                    </dd>
                    <dt className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/40">
                      Samples a year
                    </dt>
                  </div>
                  <div>
                    <dd className="text-2xl font-medium tracking-tight text-white md:text-3xl">
                      <CountUp value={80} suffix="%" />
                    </dd>
                    <dt className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/40">
                      First-fit rate
                    </dt>
                  </div>
                </dl>
                </div>
              </div>
            </Reveal>

            <Reveal delay={70}>
              <figure className="relative aspect-[4/3] overflow-hidden bg-white/5">
                <Image
                  src="/media/rnd/template-machine.jpg"
                  alt="Template machine sewing a panel at the technology centre"
                  fill
                  sizes="(min-width: 1024px) 48vw, 100vw"
                  className="object-cover"
                />
              </figure>
            </Reveal>
          </div>

          <div className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-3">
            {TOOLING.map((t, i) => (
              <Reveal key={t.title} delay={i * 60}>
                <div className="border-t border-white/15 pt-6">
                  <p className="text-[12px] uppercase tracking-[0.16em] text-white/40">
                    {t.gain}
                  </p>
                  <h3 className="mt-2 text-base font-medium tracking-tight text-white md:text-lg">
                    {t.title}
                  </h3>
                  <p className="mt-2.5 text-[15px] leading-[1.8] text-white/55">
                    {t.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 03 Fabric development */}
      <section className="container-site section-pad" id="fabric">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start lg:gap-20">
          <Reveal>
            <div>
              <p className="eyebrow">Fabric development</p>
              <h2 className="display-md mt-5 max-w-xl">
                Yarn first, then the fabric, then the garment.
              </h2>
              <div className="mt-7 space-y-5 text-base leading-[1.85] text-ink-600">
                <p>
                  The Yarn &amp; Fabric Research Institute works upstream of
                  design. Cashmere — eco, functional and special — and an animal
                  fibre collection covering merino, mohair and alpaca, each
                  traceable through RWS, RMS, RAS, GRS, OCS and The Good Cashmere
                  Standard.
                </p>
                <p>
                  Function is developed against a target, not a brochure:
                  +30&nbsp;°C on a photothermal lining, 30K/30K
                  waterproof-breathable laminates, down-like synthetics that pass
                  a brand&rsquo;s own lab before they reach a range.
                </p>
              </div>

              {/* 价格 / 创新 / 前沿 三档 */}
              <div className="mt-12">
                <div className="flex items-baseline justify-between border-b hairline pb-3">
                  <p className="text-[12px] uppercase tracking-[0.18em] text-ink-400">
                    Price
                  </p>
                  <p className="text-[12px] uppercase tracking-[0.18em] text-ink-400">
                    Innovation
                  </p>
                </div>
                <div className="mt-6 space-y-6">
                  {LADDER.map((l) => (
                    <div key={l.tier} className="grid gap-2 sm:grid-cols-[10rem_1fr] sm:gap-6">
                      <div>
                        <p className="text-[15px] font-medium tracking-tight text-ink-950">
                          {l.tier}
                        </p>
                        <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-accent-600">
                          {l.position}
                        </p>
                      </div>
                      <p className="text-[15px] leading-[1.8] text-ink-600">
                        {l.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={70}>
            <div>
              <div className="grid grid-cols-2 gap-3">
                {/* 这张原图是横构图（夹克 + 升温曲线），按 16:9 放在上面，
                    竖着裁会把曲线图的标注切掉 */}
                <figure className="relative col-span-2 aspect-[16/9] overflow-hidden bg-sand-100">
                  <Image
                    src="/media/rnd/heating.jpg"
                    alt="Heated outerwear shown against a +30°C temperature curve"
                    fill
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="object-cover"
                  />
                </figure>
                <figure className="relative aspect-[4/5] overflow-hidden bg-sand-100">
                  <Image
                    src="/media/rnd/waterproof.jpg"
                    alt="Water beading off a waterproof down jacket"
                    fill
                    sizes="(min-width: 1024px) 22vw, 50vw"
                    className="object-cover"
                  />
                </figure>
                <div className="flex flex-col justify-end border-t hairline pt-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-ink-400">
                    Certified to
                  </p>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-950">
                    30K / 30K
                    <span className="block text-[12px] text-ink-400">
                      water proof rating / moisture vapour permeability
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-8 border-t hairline pt-6">
                <p className="text-[12px] uppercase tracking-[0.16em] text-ink-400">
                  In production now
                </p>
                <ul className="mt-3 space-y-3">
                  <li className="text-[15px] leading-relaxed text-ink-600">
                    <span className="font-medium text-ink-950">SYCORE-TEX</span>{" "}
                    — ISPO Textrends Best Product; 600,000+ metres ordered
                    through 2025.
                  </li>
                  <li className="text-[15px] leading-relaxed text-ink-600">
                    <span className="font-medium text-ink-950">Y-WARM</span> —
                    functional-group polymers; 700,000+ metres ordered through
                    2025.
                  </li>
                  <li className="text-[15px] leading-relaxed text-ink-600">
                    <span className="font-medium text-ink-950">ET down</span> —
                    down-like synthetic recognised by Max Mara Group for SS27
                    development.
                  </li>
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 04 Laboratory */}
      <section className="w-full border-y hairline bg-sand-50">
        <div className="container-site section-pad">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
            <Reveal>
              <div>
                <p className="eyebrow">Laboratory</p>
                <h2 className="display-md mt-5 max-w-lg">
                  Tested here before it is tested by the brand.
                </h2>
                <p className="mt-6 max-w-md text-base leading-[1.85] text-ink-600">
                  Our lab is run in partnership with SGS. Fabric and garment
                  tests happen in-house, so a quality argument is settled with a
                  number before the first bulk roll is cut.
                </p>
              </div>
            </Reveal>
            <Reveal delay={60}>
              <div>
                <figure className="relative aspect-[16/9] overflow-hidden bg-sand-100">
                  <Image
                    src="/media/rnd/lab.jpg"
                    alt="Technicians running fabric tests in the in-house laboratory"
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                </figure>

                <ul className="mt-8 grid grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2">
                  {LAB_TESTS.map((t) => (
                    <li
                      key={t}
                      className="flex items-baseline gap-3 border-b hairline pb-2.5 text-[15px] text-ink-600"
                    >
                      <span aria-hidden className="h-[3px] w-[3px] bg-accent-500" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="band-accent w-full">
        <div className="container-site py-24 text-center md:py-28">
          <Reveal>
            <h2 className="display-lg mx-auto max-w-3xl text-ink-950">
              Send us the tech pack.
            </h2>
            <p className="mx-auto mt-7 max-w-xl text-[15px] leading-relaxed text-ink-600">
              A sketch, a reference sample or a fabric you cannot source — the
              sampling room can turn any of them into a first fit in about two
              weeks.
            </p>
            <div className="mt-11 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center bg-ink-950 px-8 py-4 text-[15px] font-medium tracking-wide text-white transition-colors duration-300 hover:bg-white hover:text-ink-950"
              >
                Start a development
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center border border-ink-950/35 px-8 py-4 text-[15px] font-medium tracking-wide text-ink-950 transition-colors duration-300 hover:border-ink-950 hover:bg-ink-950 hover:text-white"
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
