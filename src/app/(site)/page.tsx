import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/site/Hero";
import ProductCard from "@/components/site/ProductCard";
import { getProducts } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Apparel Manufacturing in Southeast Asia",
  description:
    "Vertically integrated apparel manufacturer with own factories in Southeast Asia. Sustainable materials, full supply chain control, B2B programs.",
};

const ADVANTAGES = [
  {
    index: "01",
    title: "Vertical Integration",
    body: "Fabric sourcing, dyeing, cutting, sewing and QC under one roof. Unmatched control over quality and lead time.",
  },
  {
    index: "02",
    title: "Sustainable Materials",
    body: "GOTS organic cotton, recycled polyester and Tencel. Oeko-Tex certified, traceable from fiber to garment.",
  },
  {
    index: "03",
    title: "Production Capacity",
    body: "1.2M+ pieces monthly across six lines. Programs from 300 to 100,000+ units with reliable scheduling.",
  },
  {
    index: "04",
    title: "Quality Assurance",
    body: "AQL 2.5 inspection, in-line and final audits, plus third-party certification support for every order.",
  },
];

export default async function HomePage() {
  const products = await getProducts();
  const featured = products.filter((p) => p.featured).slice(0, 4);

  return (
    <>
      <Hero />

      {/* 核心优势 */}
      <section className="section-pad container-site">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="display-lg max-w-2xl">
            Built on a fully owned supply chain.
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-ink-600 md:pb-2">
            No trading middlemen. Your production runs in our factories, under
            our quality systems, from first sample to final shipment.
          </p>
        </div>

        <div className="mt-16 grid gap-x-12 gap-y-16 md:grid-cols-2">
          {ADVANTAGES.map((a) => (
            <div
              key={a.index}
              className="border-t border-ink-900/10 pt-8"
            >
              <p className="text-xs tracking-[0.2em] text-forest-600">
                {a.index}
              </p>
              <h3 className="mt-3 text-xl font-semibold tracking-tight md:text-2xl">
                {a.title}
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-600">
                {a.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 精选产品 */}
      <section className="border-t hairline bg-sand-100/50">
        <div className="container-site section-pad">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-forest-600">
                Featured Styles
              </p>
              <h2 className="display-lg mt-4">Seasonal collection</h2>
            </div>
            <Link
              href="/products"
              className="btn-ghost hidden shrink-0 pb-2 text-sm md:inline-flex"
            >
              View all products
            </Link>
          </div>

          <div className="mt-14 grid gap-x-8 gap-y-16 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA 区块 */}
      <section className="relative overflow-hidden bg-forest-900">
        <div className="container-site py-24 md:py-32 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-moss-300">
            Start a Program
          </p>
          <h2 className="display-lg mx-auto mt-6 max-w-3xl text-sand-50">
            Your next collection, manufactured with care.
          </h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center bg-sand-50 px-8 py-4 text-sm font-medium tracking-wide text-forest-950 transition-colors hover:bg-white"
            >
              Request a Quote
            </Link>
            <Link
              href="/sustainability"
              className="inline-flex items-center justify-center border border-sand-50/40 px-8 py-4 text-sm font-medium tracking-wide text-sand-50 transition-colors hover:border-sand-50 hover:bg-sand-50/10"
            >
              Our Green Commitment
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
