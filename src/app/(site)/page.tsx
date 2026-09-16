import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import SplitBanner from "@/components/site/SplitBanner";
import DarkBand from "@/components/site/DarkBand";
import ProductCard from "@/components/site/ProductCard";
import VideoWall from "@/components/site/VideoWall";
import Reveal from "@/components/site/Reveal";
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
      {/* ① 双拼 Banner + 近黑横条（首屏不做入场动画） */}
      <SplitBanner items={HOME_BANNERS} />

      {/* ② Welcome 近黑带：左窄右宽，右栏把能力清单当图形 */}
      <DarkBand
        heading={HOME_WELCOME.heading}
        body={HOME_WELCOME.body}
        lead={HOME_WELCOME.lead}
      />

      {/* ③ 风格影片墙：四列竖版循环短片，满宽贴边 */}
      <VideoWall clips={HOME_STYLE_FILM} />

      {/* ④ 品类卡片组：等宽三列，两行共六项 */}
      <section className="container-site section-pad">
        <Reveal>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Categories</p>
              <h2 className="display-lg mt-5 max-w-2xl">
                What we manufacture.
              </h2>
            </div>
            <Link
              href="/products"
              className="btn-ghost shrink-0 text-sm md:pb-2"
            >
              View full catalog
            </Link>
          </div>
        </Reveal>

        <div className="card-grid-3 mt-16">
          {HOME_CATEGORIES.map((c, i) => (
            <Reveal key={c.name} delay={i * 70}>
              <article className="group">
                <div className="card-media">
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
                  />
                </div>
                <h3 className="mt-5 text-lg font-medium tracking-tight text-ink-950 underline decoration-transparent decoration-2 underline-offset-[5px] transition-colors duration-300 group-hover:decoration-volt-500">
                  {c.name}
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-600">
                  {c.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ⑤ 精选产品 */}
      <section className="border-t hairline bg-sand-50">
        <div className="container-site section-pad">
          <Reveal>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="eyebrow">Featured Styles</p>
                <h2 className="display-lg mt-5">Seasonal collection</h2>
              </div>
              <Link
                href="/products"
                className="btn-ghost shrink-0 text-sm md:pb-2"
              >
                View all products
              </Link>
            </div>
          </Reveal>

          <div className="card-grid-3 mt-16">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 70}>
                <ProductCard product={p} />
              </Reveal>
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

      {/* ⑦ 近黑 CTA 带：全站唯一的超大排印收束点 */}
      <section className="band-dark w-full">
        <div className="container-site py-24 text-center md:py-32">
          <Reveal>
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-volt-400">
              Start a Program
            </p>
            <h2 className="display-xl mx-auto mt-7 max-w-4xl text-white">
              Your next collection, manufactured with care.
            </h2>
            <p className="mx-auto mt-7 max-w-xl text-sm leading-relaxed text-white/55">
              Tell us your product type, target quantity and market. Our export
              sales team responds within 24 hours on business days.
            </p>
            <div className="mt-11 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center bg-volt-400 px-8 py-4 text-sm font-medium tracking-wide text-ink-950 transition-colors duration-300 hover:bg-white"
              >
                Request a Quote
              </Link>
              <Link
                href="/factory"
                className="inline-flex items-center justify-center border border-white/30 px-8 py-4 text-sm font-medium tracking-wide text-white transition-colors duration-300 hover:border-white hover:bg-white hover:text-ink-950"
              >
                Visit Our Factory
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
