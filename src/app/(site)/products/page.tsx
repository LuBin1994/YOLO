import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/site/PageHero";
import ImageMarquee from "@/components/site/ImageMarquee";
import ProductBrowser from "@/components/site/ProductBrowser";
import SectionAction from "@/components/site/SectionAction";
import {
  CERTIFICATIONS,
  FACTORY_STATS,
  PRODUCT_CAPABILITIES,
  buildProductMarquee,
  getPage,
  getProducts,
} from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Explore our apparel styles — organic cotton basics, knitwear, denim, woven shirts and performance outerwear. Customization and private label available.",
};

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2400&auto=format";

export default async function ProductsPage() {
  const [products, page] = await Promise.all([
    getProducts(),
    getPage("products"),
  ]);

  // 图墙图源即产品图片，每格点击进入对应产品详情页
  const marqueeRows = buildProductMarquee(products);

  return (
    <>
      {/* ① 全宽首屏头图，与首页和工厂页共用同一版式语言 */}
      <PageHero
        eyebrow="Product Catalog"
        title={page?.title ?? "Styles built for programs."}
        subtitle="Every style can be customized — fabric, trims, labels and packaging. Minimums from 300 pieces per colorway."
        image={page?.hero_image ?? HERO_IMAGE}
      />

      {/* ② 关键数字条 */}
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

      {/* ③ 图片跑马灯：两行滚动，悬停暂停；图源=产品图片，悬停放大、点击进详情页 */}
      {marqueeRows.length > 0 ? (
        <ImageMarquee rows={marqueeRows} label="YOLO Apparel style" />
      ) : null}

      {/* ④ 目录主体：分类筛选 + 网格/列表切换 */}
      <section className="container-site pt-16 pb-24 md:pt-20 md:pb-32">
        <ProductBrowser products={products} />
      </section>

      {/* ⑤ 生产品类：等宽三列，作为目录的延伸说明 */}
      <section className="border-t hairline bg-sand-100/60">
        <div className="container-site section-pad">
          <SectionAction
            title="What we manufacture"
            href="/factory"
            label="See our factory"
          />

          <div className="card-grid-3 mt-14">
            {PRODUCT_CAPABILITIES.map((c) => (
              <article key={c.name}>
                <p className="text-xs tracking-[0.22em] text-forest-600">
                  {c.index}
                </p>
                <h3 className="mt-3 text-xl font-medium tracking-tight text-ink-900 md:text-2xl">
                  {c.name}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-600">
                  {c.body}
                </p>
              </article>
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
        <div className="container-site py-24 text-center md:py-28">
          <h2 className="display-lg mx-auto max-w-3xl text-sand-50">
            Have a style in mind?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-sand-100/60">
            Send us your tech pack, reference sample or a sketch. We will come
            back with fabric options, counter samples and a costed quotation.
          </p>
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
              Our Materials
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
