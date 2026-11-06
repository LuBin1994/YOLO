import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/site/PageHero";
import ProductBrowser from "@/components/site/ProductBrowser";
import SectionAction from "@/components/site/SectionAction";
import Reveal from "@/components/site/Reveal";
import JsonLd from "@/components/site/JsonLd";
import { breadcrumb } from "@/lib/seo";
import {
  CERT_HIGHLIGHTS,
  FACTORY_STATS,
  PRODUCT_CAPABILITIES,
  getCategories,
  getProducts,
} from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Explore our apparel styles — organic cotton basics, knitwear, denim, woven shirts and performance outerwear. Customization and private label available.",
  alternates: { canonical: "/products" },
};

/**
 * 首屏头图（2026-11-05 换客户实拍：服装展示厅挂满成品的衣架）。
 *
 * 【为什么用本地图不用 Unsplash】客户 2026-11-05 指定要这张自有素材
 * （微信图片_20261026102306_1370_72.jpg）。远程图既不可控也会拖慢首屏。
 *
 * 【原图 4:3，hero 容器约 2.29:1】`object-cover` 居中裁切，上下各切掉约 21% ——
 * 顶部切掉的是天花板与灯轨，底部切掉的是地板，衣架主体完整。
 * 若哪天改 hero 高度比例，要重新看这张图的裁切（顶对齐会切到衣服下摆）。
 *
 * 【为什么放在 /media/site/ 而不是 /media/products/】
 * 2026-11-06 商品图已全部迁到 Supabase Storage 的 yolo 桶，
 * 本地 public/media/products/ 整目录删除。这张是**页面首屏头图**不是商品图，
 * 所以单独挪到 site/ 下，避免和"商品图"混在一起被一起清掉。
 */
const HERO_IMAGE = "/media/site/hero-showroom.jpg";

/* 首屏标题。2026-11-05 起内容管理模块已下线，这里是唯一来源 ——
   改文案直接改这一行，不再走数据库。 */
const HERO_TITLE = "Styles built for programs.";

export default async function ProductsPage() {
  /* 分类与产品并发取：分类只有十几个节点，但它是筛选器的骨架，不能等产品回来再取 */
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
        ])}
      />
      {/* ① 全宽首屏头图，与首页和工厂页共用同一版式语言 */}
      <PageHero
        eyebrow="Product Catalog"
        title={HERO_TITLE}
        subtitle="Every style can be customized — fabric, trims, labels and packaging. Minimums from 300 pieces per colorway."
        image={HERO_IMAGE}
      />

      {/* ② 关键数字条 */}
      <section className="border-b hairline bg-sand-50">
        <div className="container-site grid grid-cols-2 gap-y-8 py-10 md:grid-cols-4">
          {FACTORY_STATS.map((s) => (
            <div key={s.label}>
              <p className="text-[12px] uppercase tracking-[0.24em] text-ink-400">
                {s.label}
              </p>
              <p className="mt-2 text-3xl font-medium tracking-tight text-ink-950 md:text-4xl">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ③ 目录主体：分类筛选 + 网格/列表切换 */}
      <section className="container-site pt-16 pb-24 md:pt-20 md:pb-32">
        <ProductBrowser products={products} categories={categories} />
      </section>

      {/* ④ 生产品类：等宽三列，作为目录的延伸说明 */}
      <section className="border-t hairline bg-sand-50">
        <div className="container-site section-pad">
          <SectionAction
            title="What we manufacture"
            href="/factory"
            label="See our factory"
          />

          <div className="card-grid-3 mt-16">
            {PRODUCT_CAPABILITIES.map((c, i) => (
              <Reveal key={c.name} delay={i * 70}>
                <article>
                  <p className="text-2xl font-medium tracking-tight text-ink-950/20">
                    {c.index}
                  </p>
                  <h3 className="mt-3 text-xl font-medium tracking-tight text-ink-950 md:text-2xl">
                    {c.name}
                  </h3>
                  <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-ink-600">
                    {c.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ⑤ 资质条 */}
      <section className="border-y hairline">
        <div className="container-site flex flex-wrap items-center justify-center gap-x-12 gap-y-4 py-8">
          {CERT_HIGHLIGHTS.map((c) => (
            <span
              key={c}
              className="text-[12px] font-medium uppercase tracking-[0.24em] text-ink-400"
            >
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* ⑥ 活力 CTA 带（与首页 / 工厂页一致） */}
      <section className="band-accent w-full">
        <div className="container-site py-24 text-center md:py-28">
          <Reveal>
            <h2 className="display-lg mx-auto max-w-3xl text-ink-950">
              Have a style in mind?
            </h2>
            <p className="mx-auto mt-7 max-w-xl text-[15px] leading-relaxed text-ink-600">
              Send us your tech pack, reference sample or a sketch. We will come
              back with fabric options, counter samples and a costed quotation.
            </p>
            <div className="mt-11 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center bg-ink-950 px-8 py-4 text-[15px] font-medium tracking-wide text-white transition-colors duration-300 hover:bg-white hover:text-ink-950"
              >
                Request a Quote
              </Link>
              <Link
                href="/sustainability"
                className="inline-flex items-center justify-center border border-ink-950/35 px-8 py-4 text-[15px] font-medium tracking-wide text-ink-950 transition-colors duration-300 hover:border-ink-950 hover:bg-ink-950 hover:text-white"
              >
                Our Materials
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
