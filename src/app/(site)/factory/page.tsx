import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/site/PageHero";
import {
  CERTIFICATIONS,
  FACTORY_PROCESS,
  FACTORY_STATS,
  getPage,
} from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Our Factory",
  description:
    "Visit our vertically integrated factories across Southeast Asia — sewing floors, dye houses and QC labs under one roof.",
};

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2400&auto=format";

const FACILITY_IMAGE =
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2000&auto=format";

export default async function FactoryPage() {
  const page = await getPage("factory");

  return (
    <>
      <PageHero
        eyebrow="Manufacturing"
        title={page?.title ?? "Our Factory"}
        subtitle="Six production lines, 1,200 operators and a fully owned supply chain — from fabric sourcing and dyeing to final inspection and export."
        image={page?.hero_image ?? HERO_IMAGE}
      />

      {/* 产能数据条 */}
      <section className="border-b hairline bg-sand-100/70">
        <div className="container-site grid grid-cols-2 gap-y-8 py-10 md:grid-cols-4">
          {FACTORY_STATS.map((s) => (
            <div key={s.label}>
              <p className="text-[11px] uppercase tracking-[0.24em] text-ink-400">
                {s.label}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-ink-900 md:text-3xl">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 深色正文带：左窄右宽 + 宽幅配图 */}
      <section className="band-dark w-full">
        <div className="container-site section-pad">
          <div className="grid gap-12 lg:grid-cols-[1fr_2.1fr] lg:gap-20">
            <div>
              <h2 className="text-lg font-medium tracking-tight text-sand-50 md:text-xl">
                Vertical Integration
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-[1.85] text-sand-100/60">
                Our factories across Southeast Asia manage the full supply chain
                — fabric sourcing, dyeing, cutting, sewing, finishing and
                quality control. This vertical integration gives us unmatched
                control over quality, lead time and cost.
              </p>
            </div>

            <div>
              <div className="relative aspect-[16/9] overflow-hidden bg-forest-900">
                <Image
                  src={FACILITY_IMAGE}
                  alt="Production facility"
                  fill
                  sizes="(max-width: 1024px) 100vw, 900px"
                  className="object-cover opacity-85"
                />
              </div>
              <p className="mt-8 max-w-2xl text-sm leading-[1.85] text-sand-100/60">
                Monthly output exceeds 1.2 million pieces across six production
                lines. We specialise in medium to large-volume programs with
                full QC, packaging and logistics support — your production runs
                in our facilities, under our quality systems, from first sample
                to final shipment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 工艺流程 */}
      <section className="container-site section-pad">
        <h2 className="display-lg max-w-2xl">From fiber to finished garment.</h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-600">
          Every order moves through four controlled stages. Each stage has its
          own quality gate and reporting, so you always know where your
          production stands.
        </p>

        <div className="mt-14 grid gap-x-12 gap-y-14 md:grid-cols-2">
          {FACTORY_PROCESS.map((p) => (
            <div key={p.step} className="border-t hairline pt-8">
              <p className="text-xs tracking-[0.22em] text-forest-600">
                {p.step}
              </p>
              <h3 className="mt-3 text-xl font-medium tracking-tight text-ink-900 md:text-2xl">
                {p.title}
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-600">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 资质条 */}
      <section className="border-y hairline bg-sand-100/60">
        <div className="container-site flex flex-wrap items-center justify-center gap-x-12 gap-y-4 py-8">
          {CERTIFICATIONS.map((c) => (
            <span
              key={c}
              className="text-[11px] font-medium uppercase tracking-[0.24em] text-ink-400"
            >
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* 深色 CTA */}
      <section className="band-dark w-full">
        <div className="container-site py-24 text-center md:py-28">
          <h2 className="display-lg mx-auto max-w-3xl text-sand-50">
            Ready to visit, or ready to start?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-sand-100/60">
            We welcome factory audits and brand visits. Tell us your program and
            we will arrange a walkthrough of the relevant lines.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center bg-sand-50 px-8 py-4 text-sm font-medium tracking-wide text-forest-950 transition-colors hover:bg-white"
            >
              Request a Quote
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center border border-sand-50/40 px-8 py-4 text-sm font-medium tracking-wide text-sand-50 transition-colors hover:border-sand-50 hover:bg-sand-50/10"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
