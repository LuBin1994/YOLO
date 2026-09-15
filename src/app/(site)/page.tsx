import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import SplitBanner from "@/components/site/SplitBanner";
import DarkBand from "@/components/site/DarkBand";
import ProductCard from "@/components/site/ProductCard";
import VideoWall from "@/components/site/VideoWall";
import {
  CERTIFICATIONS,
  HOME_BANNERS,
  HOME_CATEGORIES,
  HOME_STYLE_FILM,
  HOME_WELCOME,
  getProducts,
} from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Apparel Manufacturing in Southeast Asia",
  description:
    "Vertically integrated apparel manufacturer with own factories in Southeast Asia. Sustainable materials, full supply chain control, B2B programs.",
};

export default async function HomePage() {
  const products = await getProducts();
  const featured = products.filter((p) => p.featured).slice(0, 6);

  return (
    <>
      {/* ① 双拼 Banner + 黑色胶囊横条 */}
      <SplitBanner items={HOME_BANNERS} />

      {/* ② Welcome 深色带：左窄右宽，右栏把能力清单当图形 */}
      <DarkBand
        heading={HOME_WELCOME.heading}
        body={HOME_WELCOME.body}
        lead={HOME_WELCOME.lead}
      />

      {/* ③ 风格影片墙：四列竖版循环短片，满宽贴边 */}
      <VideoWall clips={HOME_STYLE_FILM} />

      {/* ④ 品类卡片组：等宽三列，两行共六项 */}
      <section className="container-site section-pad">
        <div className="flex flex-col gap-4 md:flex-row md:items-baseline md:justify-between">
          <h2 className="display-lg max-w-2xl">What we manufacture.</h2>
          <Link href="/products" className="btn-ghost shrink-0 text-sm md:pb-2">
            View full catalog
          </Link>
        </div>

        <div className="card-grid-3 mt-14">
          {HOME_CATEGORIES.map((c) => (
            <article key={c.name} className="group">
              <div className="card-media">
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              </div>
              <h3 className="mt-5 text-lg font-medium tracking-tight text-ink-900">
                {c.name}
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-600">
                {c.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ⑤ 精选产品 */}
      <section className="border-t hairline bg-sand-100/60">
        <div className="container-site section-pad">
          <div className="flex flex-col gap-4 md:flex-row md:items-baseline md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-forest-600">
                Featured Styles
              </p>
              <h2 className="display-lg mt-4">Seasonal collection</h2>
            </div>
            <Link
              href="/products"
              className="btn-ghost shrink-0 text-sm md:pb-2"
            >
              View all products
            </Link>
          </div>

          <div className="card-grid-3 mt-14">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ⑥ 资质条 */}
      <section className="border-y hairline">
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

      {/* ⑦ 深色 CTA 带 */}
      <section className="band-dark w-full">
        <div className="container-site py-24 text-center md:py-32">
          <p className="text-[11px] uppercase tracking-[0.3em] text-forest-300">
            Start a Program
          </p>
          <h2 className="display-lg mx-auto mt-6 max-w-3xl text-sand-50">
            Your next collection, manufactured with care.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-sand-100/60">
            Tell us your product type, target quantity and market. Our export
            sales team responds within 24 hours on business days.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center bg-sand-50 px-8 py-4 text-sm font-medium tracking-wide text-forest-950 transition-colors hover:bg-white"
            >
              Request a Quote
            </Link>
            <Link
              href="/factory"
              className="inline-flex items-center justify-center border border-sand-50/40 px-8 py-4 text-sm font-medium tracking-wide text-sand-50 transition-colors hover:border-sand-50 hover:bg-sand-50/10"
            >
              Visit Our Factory
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
