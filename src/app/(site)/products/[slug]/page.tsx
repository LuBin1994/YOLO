import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/site/JsonLd";
import { breadcrumb } from "@/lib/seo";
import { getCategories, getProductBySlug } from "@/lib/site-data";
import { categoryPathOf, getCategoryIndex } from "@/lib/categories";
import { absoluteUrl } from "@/lib/site-url";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.title,
    description: product.description ?? undefined,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "article",
      title: product.title,
      description: product.description ?? undefined,
      url: `/products/${product.slug}`,
      images: product.cover_image
        ? [{ url: product.cover_image, alt: product.title }]
        : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  /* 分类路径从库里取（英文名）；读不到库或分类被删时 categoryPathOf 会把
     slug 可读化，不会在页面上露出 `kids-jacket` 这种内部标识。 */
  const categories = await getCategories();
  const categoryPath = categoryPathOf(
    getCategoryIndex(categories),
    product.category,
    "en",
    " / "
  );

  const gallery = product.images.length > 0 ? product.images : [product.cover_image];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description ?? undefined,
    image: gallery
      .filter((src): src is string => Boolean(src))
      .map((src) => absoluteUrl(src)),
    category: "Apparel",
    url: absoluteUrl(`/products/${product.slug}`),
    manufacturer: { "@id": `${absoluteUrl("/")}#organization` },
  };

  return (
    <div className="pt-24 md:pt-28">
      <JsonLd
        data={[
          productJsonLd,
          breadcrumb([
            { name: "Home", path: "/" },
            { name: "Products", path: "/products" },
            { name: product.title, path: `/products/${product.slug}` },
          ]),
        ]}
      />
      {/* 两列等宽 + 各限 520px：原来图片列是 1.2fr（1440 屏约 700px），
          4:5 就是 875px 高 —— 单图产品会撑出整整一屏，右边信息只有一半高度，
          看起来左边空荡。现在图片最高 520×650，首屏基本能看完，
          图片靠右、信息靠左，中间自然形成间距。 */}
      <div className="container-site grid gap-14 pb-24 md:pt-8 lg:grid-cols-2 lg:gap-10">
        {/* 图片画廊 */}
        <div className="space-y-6 lg:flex lg:flex-col lg:items-end">
          {gallery.map((src, i) =>
            src ? (
              <div
                key={src}
                className="frame aspect-[4/5] w-full lg:max-w-[520px]"
              >
                <Image
                  src={src}
                  alt={`${product.title} — view ${i + 1}`}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            ) : null
          )}
        </div>

        {/* 信息区 */}
        <div className="lg:sticky lg:top-28 lg:max-w-[520px] lg:self-start">
          <Link
            href="/products"
            className="text-[13px] tracking-wide text-ink-400 transition-colors hover:text-ink-950"
          >
            ← All products
          </Link>

          <p className="mt-8 text-[12px] font-medium uppercase tracking-[0.3em] text-ink-400">
            {categoryPath}
          </p>
          <h1 className="mt-3 text-4xl font-medium tracking-tight text-ink-950 md:text-5xl">
            {product.title}
          </h1>

          {product.price_range ? (
            <p className="mt-5 text-lg font-medium text-ink-950">
              {product.price_range}
            </p>
          ) : null}

          {product.description ? (
            <p className="mt-8 text-[15px] leading-relaxed text-ink-600">
              {product.description}
            </p>
          ) : null}

          {/* 参数表 */}
          <dl className="mt-10 space-y-0 border-t hairline">
            {product.materials.length > 0 ? (
              <div className="flex gap-6 border-b hairline py-4">
                <dt className="w-32 shrink-0 text-[12px] uppercase tracking-[0.2em] text-ink-400">
                  Materials
                </dt>
                <dd className="text-[15px] text-ink-950">
                  {product.materials.join(" · ")}
                </dd>
              </div>
            ) : null}
            {product.moq ? (
              <div className="flex gap-6 border-b hairline py-4">
                <dt className="w-32 shrink-0 text-[12px] uppercase tracking-[0.2em] text-ink-400">
                  MOQ
                </dt>
                <dd className="text-[15px] text-ink-950">
                  {product.moq.toLocaleString()} pcs / colorway
                </dd>
              </div>
            ) : null}
            <div className="flex gap-6 border-b hairline py-4">
              <dt className="w-32 shrink-0 text-[12px] uppercase tracking-[0.2em] text-ink-400">
                Customization
              </dt>
              <dd className="text-[15px] text-ink-950">
                Fabric · trims · labels · packaging
              </dd>
            </div>
          </dl>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/contact?product=${product.slug}`}
              className="btn-primary"
            >
              Request a Quote
            </Link>
            <Link href="/factory" className="btn-outline">
              About Our Factory
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
