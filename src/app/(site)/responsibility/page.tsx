import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import QuoteHero from "@/components/site/heroes/QuoteHero";
import Reveal from "@/components/site/Reveal";
import JsonLd from "@/components/site/JsonLd";
import { breadcrumb } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Social responsibility",
  description:
    "1,400+ people across two Cambodian factories, 70% of them women — social audits, women's care, and the community programmes the group runs at home and abroad.",
  alternates: { canonical: "/responsibility" },
};

/**
 * 社会责任页（2026-10-23 重写）
 *
 * 内容来自公司介绍册（2026-02 版）第 31、36、37 页，**不再走后台 CMS**。
 * 只写册子里有的：
 * - 女性员工占 70%、"因此格外重视女性关怀"（p36 原话）
 * - 团队活动 / 技能竞赛 / 节日（p36 图）
 * - 2023 土耳其地震、2025 缅甸地震、WORLD LOVE PEACE（p37）
 * 没有写工资、宿舍、诊所这类册子里没有的承诺。
 */


const AUDITS = [
  {
    name: "SMETA 4-pillar",
    note: "Sedex Members Ethical Trade Audit — labour, health & safety, environment, business ethics.",
  },
  {
    name: "WRAP",
    note: "Worldwide Responsible Accredited Production, certified at plant level.",
  },
  {
    name: "SLCP",
    note: "Social & Labor Convergence Program — one verified assessment shared across buyers.",
  },
  {
    name: "GRS",
    note: "Global Recycled Standard, covering the recycled programmes run at both plants.",
  },
] as const;

const BRAND_AUDITS = [
  "Nike",
  "Levi's",
  "Under Armour",
  "Costco",
  "U.S. Polo Assn.",
  "Lacoste",
] as const;

const CARE = [
  {
    title: "Women's care",
    body: "Women make up 70% of the workforce, so the things that decide whether a shift is workable — feeding rooms, rest areas, shift patterns around school hours — are treated as production decisions, not welfare extras.",
  },
  {
    title: "Team work",
    body: "Skill competitions, team events and festival days sit on the factory calendar next to the production plan. They are also how supervisors spot who is ready for a harder style.",
  },
  {
    title: "Festivals & team events",
    body: "Khmer festival days, team events and skill competitions sit on the factory calendar next to the production plan — the same weeks, agreed with the same planners.",
  },
] as const;

const COMMUNITY = [
  {
    year: "2023",
    title: "Earthquake in Turkey",
    body: "The group organised an in-house collection and shipped relief supplies through the local coordination point.",
    image: "/media/responsibility/relief-03.jpg",
    alt: "Cartons of relief supplies collected for the 2023 earthquake in Turkey",
  },
  {
    year: "2025",
    title: "Earthquake in Myanmar",
    body: "Donations and supplies were gathered at the plants and passed to the relief teams on the border.",
    image: "/media/responsibility/relief-01.jpg",
    alt: "Employees packing donations for the 2025 earthquake in Myanmar",
  },
  {
    year: "Ongoing",
    title: "World · Love · Peace",
    body: "The group's standing community programme: donations, visits and support for children and families near the factories.",
    image: "/media/responsibility/relief-02.jpg",
    alt: "Volunteers at a community event held by the group",
  },
] as const;

export default function ResponsibilityPage() {
  return (
    <>
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "Responsibility", path: "/responsibility" },
        ])}
      />
      <QuoteHero
        eyebrow="Responsibility"
        quote="The people behind the orders — 70% of them women."
        image="/media/factory/team.jpg"
        stats={[
          { value: 1400, suffix: "+", label: "People on the floor" },
          { value: 70, suffix: "%", label: "Women in the workforce" },
          { value: 2, label: "Factories in Cambodia" },
        ]}
        meta={["SMETA 4-pillar", "WRAP", "SLCP", "GRS"]}
      />

      {/* 审核 */}
      <section className="container-site section-pad">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-20">
          <Reveal>
            <div>
              <p className="eyebrow">Audit & compliance</p>
              <h2 className="display-md mt-5 max-w-lg">
                We are audited, and we keep the file.
              </h2>
              <p className="mt-7 max-w-md text-base leading-[1.85] text-ink-600">
                Social compliance is not a badge we print on a page. Both plants
                run on a digital archive of every inspection, plus a tiered
                correction process, so a finding is closed before the next audit
                rather than after it.
              </p>

              <ul className="mt-10 space-y-5 border-t hairline pt-8">
                {AUDITS.map((a) => (
                  <li key={a.name} className="grid gap-1 sm:grid-cols-[9rem_1fr] sm:gap-4">
                    <p className="text-sm font-medium tracking-tight text-ink-950">
                      {a.name}
                    </p>
                    <p className="text-[13px] leading-[1.7] text-ink-600">
                      {a.note}
                    </p>
                  </li>
                ))}
              </ul>

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
                className="mt-9 inline-flex items-center gap-2 border-b border-ink-950/30 pb-1 text-sm font-medium text-ink-950 transition-colors duration-200 hover:border-ink-950"
              >
                Request the audit pack
                <span aria-hidden>→</span>
              </Link>
            </div>
          </Reveal>

          <Reveal delay={70}>
            <div className="grid grid-cols-2 gap-3">
              <figure className="relative col-span-2 aspect-[16/10] overflow-hidden bg-sand-100">
                <Image
                  src="/media/factory/sewing.jpg"
                  alt="Operators at a sewing line in the Kampot factory"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </figure>
              <figure className="relative aspect-[4/3] overflow-hidden bg-sand-100">
                <Image
                  src="/media/factory/qc.jpg"
                  alt="Inspection at the end of the line"
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </figure>
              <figure className="relative aspect-[4/3] overflow-hidden bg-sand-100">
                <Image
                  src="/media/factory/cutting-table.jpg"
                  alt="Cutting table at the Kampong Speu factory"
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </figure>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 大字引言带：这一页的"重音"，其余三页都没有这种整段引语 */}
      <section className="w-full bg-paper">
        <div className="container-site py-16 md:py-24">
          <Reveal>
            <p className="mx-auto max-w-4xl text-center text-[clamp(24px,3.4vw,46px)] font-medium leading-[1.15] tracking-tight text-ink-950">
              &ldquo;Seventy percent of the people who make your garment are
              women. That is not a statistic to us — it is who we schedule
              around.&rdquo;
            </p>
            <p className="mt-8 text-center text-[11px] uppercase tracking-[0.2em] text-ink-400">
              Human resources · both plants
            </p>
          </Reveal>
        </div>
      </section>

      {/* 人 */}
      <section className="w-full border-y hairline bg-sand-50">
        <div className="container-site section-pad">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow">People care</p>
                <h2 className="display-md mt-5 max-w-xl">
                  70% women, and a roster built around that.
                </h2>
              </div>
              <p className="max-w-sm text-[13px] leading-relaxed text-ink-500">
                Female employees account for 70% of the group&rsquo;s total
                workforce.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-3">
            {CARE.map((c, i) => (
              <Reveal key={c.title} delay={i * 60}>
                <div className="border-t hairline pt-6">
                  <h3 className="text-lg font-medium tracking-tight text-ink-950">
                    {c.title}
                  </h3>
                  <p className="mt-3 text-[13px] leading-[1.8] text-ink-600">
                    {c.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 社区 */}
      <section className="container-site section-pad">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Community</p>
              <h2 className="display-md mt-5 max-w-xl">
                What the group does outside the fence.
              </h2>
            </div>
            <p className="max-w-sm text-[13px] leading-relaxed text-ink-500">
              Disaster relief and a standing community programme — organised by
              the group, staffed by the same people who run the lines.
            </p>
          </div>
        </Reveal>

        {/* 不对称照片墙：第一张跨两列，制造版面重音；
            悬停时图片缓慢推近（.slow-zoom 之外的第二套节奏，只在这页用） */}
        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-3">
          {COMMUNITY.map((c, i) => (
            <Reveal
              key={c.title}
              delay={i * 80}
              className={i === 0 ? "md:col-span-2" : ""}
            >
              <article className="group">
                <figure
                  className={`relative overflow-hidden bg-sand-100 ${
                    i === 0 ? "aspect-[16/9]" : "aspect-[4/3]"
                  }`}
                >
                  <Image
                    src={c.image}
                    alt={c.alt}
                    fill
                    sizes={
                      i === 0
                        ? "(min-width: 768px) 66vw, 100vw"
                        : "(min-width: 768px) 33vw, 100vw"
                    }
                    className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                  />
                </figure>
                <p className="mt-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-ink-400">
                  {c.year}
                  <span
                    aria-hidden
                    className="h-px w-0 bg-accent-500 transition-all duration-500 group-hover:w-8"
                  />
                </p>
                <h3 className="mt-1.5 text-lg font-medium tracking-tight text-ink-950">
                  {c.title}
                </h3>
                <p className="mt-2 max-w-md text-[13px] leading-[1.75] text-ink-600">
                  {c.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="band-accent w-full">
        <div className="container-site py-24 text-center md:py-28">
          <Reveal>
            <h2 className="display-lg mx-auto max-w-3xl text-ink-950">
              Come and meet the team.
            </h2>
            <p className="mx-auto mt-7 max-w-xl text-sm leading-relaxed text-ink-600">
              Brand audits and factory visits are welcome. We will walk you
              through the lines, the audit file and the people who run them.
            </p>
            <div className="mt-11 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center bg-ink-950 px-8 py-4 text-sm font-medium tracking-wide text-white transition-colors duration-300 hover:bg-white hover:text-ink-950"
              >
                Arrange a visit
              </Link>
              <Link
                href="/factory"
                className="inline-flex items-center justify-center border border-ink-950/35 px-8 py-4 text-sm font-medium tracking-wide text-ink-950 transition-colors duration-300 hover:border-ink-950 hover:bg-ink-950 hover:text-white"
              >
                Inside our factories
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
